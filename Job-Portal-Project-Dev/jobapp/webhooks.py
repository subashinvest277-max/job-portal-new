import json
import razorpay
import logging

from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction

from .models import Payment, Subscription, Invoice
from .utils import calculate_gst, generate_invoice_number

logger = logging.getLogger(__name__)

client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY, settings.RAZORPAY_SECRET)
)


@csrf_exempt
def razorpay_webhook(request):
    body = request.body
    signature = request.headers.get("X-Razorpay-Signature")

    # -----------------------------
    # VERIFY WEBHOOK SIGNATURE
    # -----------------------------
    try:
        client.utility.verify_webhook_signature(
            body,
            signature,
            settings.RAZORPAY_WEBHOOK_SECRET
        )
    except Exception as e:
        logger.error(f"Webhook Signature Verification Failed: {str(e)}")
        return HttpResponse("Invalid signature", status=400)

    try:
        data = json.loads(body)
        event = data.get("event")

        # =============================
        # PAYMENT CAPTURED
        # =============================
        if event == "payment.captured":
            entity = data["payload"]["payment"]["entity"]

            order_id = entity.get("order_id")
            payment_id = entity.get("id")

            try:
                payment = Payment.objects.get(order_id=order_id)
            except Payment.DoesNotExist:
                logger.error(f"Payment not found for order_id={order_id}")
                return HttpResponse(status=404)

            # Idempotency Protection
            if payment.status == "success":
                logger.info(f"Duplicate webhook ignored for order_id={order_id}")
                return HttpResponse(status=200)

            with transaction.atomic():
                payment.status = "success"
                payment.payment_id = payment_id
                payment.payment_method = entity.get("method", "").upper()
                payment.razorpay_response = entity
                payment.save()

                user = payment.user
                plan = payment.plan

                # Cancel Existing Active Subscription
                Subscription.objects.filter(
                    user=user,
                    status="active"
                ).update(status="cancelled")

                # Create New Subscription
                sub = Subscription.objects.create(
                    user=user,
                    plan=plan,
                    status="active"
                )

                # Generate Invoice
                gst, total = calculate_gst(payment.amount)

                Invoice.objects.create(
                    user=user,
                    invoice_number=generate_invoice_number(),
                    company_name=user.username,
                    email=user.email,
                    payment_method=payment.payment_method,
                    transaction_id=payment_id,
                    payment_status="Paid",
                    subtotal=payment.amount,
                    gst=gst,
                    total=total,
                    plan_name=plan.name,
                    duration=f"{plan.duration_days} days",
                    start_date=sub.start_date,
                    end_date=sub.end_date
                )

            logger.info(f"Payment success processed for {order_id}")

        # =============================
        # PAYMENT FAILED
        # =============================
        elif event == "payment.failed":
            entity = data["payload"]["payment"]["entity"]

            order_id = entity.get("order_id")

            Payment.objects.filter(order_id=order_id).update(
                status="failed",
                failure_reason=entity.get("error_description", "Unknown Error"),
                razorpay_response=entity
            )

            logger.warning(f"Payment failed for order_id={order_id}")

        # =============================
        # PAYMENT REFUNDED (OPTIONAL)
        # =============================
        elif event == "refund.processed":
            refund_entity = data["payload"]["refund"]["entity"]

            payment_id = refund_entity.get("payment_id")

            Payment.objects.filter(payment_id=payment_id).update(
                status="refunded"
            )

            logger.info(f"Refund processed for payment_id={payment_id}")

        return HttpResponse(status=200)

    except Exception as e:
        logger.exception("Webhook Processing Error")
        return HttpResponse(
            f"Webhook processing failed: {str(e)}",
            status=500
        )