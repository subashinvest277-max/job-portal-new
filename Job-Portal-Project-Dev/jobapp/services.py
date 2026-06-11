import razorpay
from django.conf import settings

client = razorpay.Client(auth=(settings.RAZORPAY_KEY, settings.RAZORPAY_SECRET))


def create_order(amount):
    return client.order.create({
        "amount": int(amount * 100),
        "currency": "INR",
        "payment_capture": 1
    })

from django.conf import settings
from django.contrib.gis.geoip2 import GeoIP2
import ipaddress
import logging
from jobapp.models import AdminAccessLog
 
# for security setting
def _is_public_ip(ip_text):
    """
    True when the IP looks publicly routable.
    """
    try:
        ip_obj = ipaddress.ip_address(ip_text)
    except ValueError:
        return False
 
    return not (
        ip_obj.is_private
        or ip_obj.is_loopback
        or ip_obj.is_link_local
        or ip_obj.is_multicast
        or ip_obj.is_reserved
        or ip_obj.is_unspecified
    )
 
def _extract_client_ip(request):
    """
    Pull client IP from proxy headers and prefer a public IP when present.
    """
    if request is None:
        return None
 
    header_order = [
        "HTTP_CF_CONNECTING_IP",          # Cloudflare
        "HTTP_X_FORWARDED_FOR",           # Standard proxy chain
        "HTTP_X_REAL_IP",                 # Nginx/common proxy
        "HTTP_X_CLIENT_IP",               # Some proxies
        "HTTP_X_ORIGINAL_FORWARDED_FOR",  # Some edge platforms
        "REMOTE_ADDR",                    # Direct socket peer
    ]
 
    parsed_ips = []
 
    for header_name in header_order:
        raw_value = request.META.get(header_name, "")
        if not raw_value:
            continue
 
        # Most proxy headers can contain a comma-separated chain.
        for token in str(raw_value).split(","):
            normalized = _normalize_ip(token)
            if normalized:
                parsed_ips.append(normalized)
 
    if not parsed_ips:
        return None
 
    # Prefer first public IP from header chain; fallback to first valid.
    for parsed_ip in parsed_ips:
        if _is_public_ip(parsed_ip):
            return parsed_ip
 
    return parsed_ips[0]
 
 
def _normalize_ip(raw_ip):
    if not raw_ip:
        return None
 
    candidate = raw_ip.strip()
 
    # [IPv6]:port -> IPv6
    if candidate.startswith("[") and "]" in candidate:
        candidate = candidate[1:candidate.index("]")]
 
    # IPv4:port -> IPv4
    if candidate.count(":") == 1 and "." in candidate:
        host, port = candidate.rsplit(":", 1)
        if port.isdigit():
            candidate = host
 
    # IPv4-mapped IPv6 (::ffff:1.2.3.4) -> 1.2.3.4
    if candidate.lower().startswith("::ffff:"):
        candidate = candidate.split(":", 3)[-1]
 
    try:
        return str(ipaddress.ip_address(candidate))
    except ValueError:
        return None
 
 
def _resolve_location(ip_address):
    if not ip_address:
        return ""
 
    try:
        ip_obj = ipaddress.ip_address(ip_address)
    except ValueError:
        return ""
 
    # Local/private ranges cannot be geolocated by MaxMind city DB.
    if ip_obj.is_loopback:
        return "Localhost"
 
    if ip_obj.is_private or ip_obj.is_reserved or ip_obj.is_link_local or ip_obj.is_unspecified:
        return "Private Network"
 
    try:
        geo = GeoIP2(path=str(settings.GEOIP_PATH))
    except Exception as exc:
        logger.warning("GeoIP init failed: %s", exc)
        return ""
 
    try:
        city_data = geo.city(ip_address)
        country = city_data.get("country_name", "") or ""
        region = city_data.get("region", "") or ""
        city = city_data.get("city", "") or ""
 
        parts = [part for part in [city, region, country] if part]
        if parts:
            return ", ".join(parts)
    except Exception as exc:
        logger.info("GeoIP city lookup failed for %s: %s", ip_address, exc)
 
    try:
        country_data = geo.country(ip_address)
        return country_data.get("country_name", "") or ""
    except Exception as exc:
        logger.info("GeoIP country lookup failed for %s: %s", ip_address, exc)
        return ""
class AdminSecurityService:
 
    @staticmethod
    def log_event(
        request,
        action,
        status="SUCCESS",
        user=None,
        extra_data=None,
    ):
 
        ip_address = _extract_client_ip(request)
        user_agent = request.META.get("HTTP_USER_AGENT", "") if request else ""
        location = _resolve_location(ip_address)
       
        # CREATE ACCESS LOG
     
 
        AdminAccessLog.objects.create(
            user=user,
            action=action,
            status=status,
            ip_address=ip_address,
            location=location,
            user_agent=user_agent,
            extra_data=extra_data or {},
        )
 
 
from datetime import timedelta
 
from django.utils import timezone
 
from jobapp.models import (
    AdminProfile,
    EmailOTP,
    SMSOTP,
)
 
from jobapp.utils import (
    generate_otp,
    send_email_otp,
)
 
 
class Admin2FAService:
 
    @staticmethod
    def handle_admin_login_2fa(user):
 
     
        # ONLY ADMIN
       
 
        if user.user_type != "admin":
 
            return None
 
        profile, _ = AdminProfile.objects.get_or_create(
            user=user
        )
 
       
        # 2FA NOT ENABLED
     
 
        if not profile.two_factor_enabled:
 
            return None
 
        method = profile.two_factor_method
 
        otp = generate_otp()
 
       
 
        if method == "email":
 
            # expire old OTPs
 
            EmailOTP.objects.filter(
                email=user.email,
                purpose="admin_login_2fa",
                is_verified=False
            ).update(
                expires_at=timezone.now() - timedelta(minutes=1)
            )
 
            # create new OTP
 
            EmailOTP.objects.create(
                email=user.email,
                otp=otp,
                purpose="admin_login_2fa",
                expires_at=timezone.now() + timedelta(minutes=5)
            )
 
            # send email OTP
 
            send_email_otp(
                user.email,
                otp,
                "admin_login_2fa"
            )
 
       
 
        elif method == "sms":
 
            if not user.phone:
 
                return {
                    "success": False,
                    "message": "Phone number not available"
                }
 
            SMSOTP.objects.filter(
                phone=user.phone,
                purpose="admin_login_2fa",
                is_verified=False
            ).update(
                expires_at=timezone.now() - timedelta(minutes=1)
            )
 
            SMSOTP.objects.create(
                phone=user.phone,
                otp=otp,
                purpose="admin_login_2fa",
                expires_at=timezone.now() + timedelta(minutes=5)
            )
 
            print(f"[LOGIN OTP SMS] {user.phone}: {otp}")
 
       
 
        return {
 
            "requires_2fa": True,
 
            "method": method,
 
            "user_id": user.id,
 
            "message": f"OTP sent via {method}"
        }
 



from django.conf import settings

from .models import (
    Notification,
    Subscription,
    EmployerPlatformSettings,
    NotificationChannelSettings,
    NotificationConfig,
)

from .utils import send_mail
# =========================================================
# services.py
# PRODUCTION-READY NOTIFICATION SERVICE
# =========================================================

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
import logging

from .models import (
    Notification,
    NotificationConfig,
    NotificationChannelSettings,
    EmployerPlatformSettings,
    Subscription,
    UserDevice,
    NotificationDeliveryLog,
    AdminQuietHours,
)

from .firebase_service import (
    send_push_notification,
    InvalidFCMTokenError,
    PushNotificationError,
)

logger = logging.getLogger(__name__)


# =========================================================
# EVENT CATEGORY MAP
# =========================================================

EVENT_CATEGORY_MAP = {

    # USER MANAGEMENT

    "jobseeker_signup": "user_mgmt",
    "employer_signup": "user_mgmt",
    "password_reset_success": "user_mgmt",

    # JOB MANAGEMENT

    "job_approved": "job_mgmt",
    "job_rejected": "job_mgmt",
    "job_flagged": "job_mgmt",
    "job_deleted": "job_mgmt",
    "job_saved": "job_mgmt",

    # APPLICATIONS

    "application_submitted": "apps",
    "application_withdrawn": "apps",
    "application_status_updated": "apps",
    "new_job_application": "apps",

    # COMPANIES

    "company_verification_updated": "companies",
    "company_profile_created" : "companies",

    # REPORTS

    "weekly_report": "reports",

    # GENERAL

    "new_message": "general",
    "support_ticket_created": "general",
    "ticket_submitted": "general",
    "complaint_submitted": "general",
    "complaint_status_updated": "general",
    "subscription_cancelled": "general",
    "payment_method_added": "general",
    "payment_method_removed": "general",
    "new_subscription_plan": "general",
}


# =========================================================
# NOTIFICATION SERVICE
# =========================================================

class NotificationService:

    # =====================================================
    # PUSH TOKEN EXTRACTION
    # =====================================================

    @staticmethod
    def _extract_push_tokens(recipient):

        tokens = set()

        # USER TOKEN

        user_token = getattr(
            recipient,
            "fcm_token",
            None
        )

        if user_token:

            normalized = str(user_token).strip()

            if normalized:
                tokens.add(normalized)

        # DEVICE TOKENS

        device_tokens = UserDevice.objects.filter(
            user=recipient,
            is_active=True
        ).values_list(
            "fcm_token",
            flat=True
        )

        for token in device_tokens:

            normalized = str(token or "").strip()

            if normalized:
                tokens.add(normalized)

        return list(tokens)

    # =====================================================
    # INVALID TOKEN CLEANUP
    # =====================================================

    @staticmethod
    def _cleanup_invalid_token(
        recipient,
        token
    ):

        if not token:
            return

        UserDevice.objects.filter(
            user=recipient,
            fcm_token=token
        ).update(
            is_active=False
        )

        if getattr(
            recipient,
            "fcm_token",
            None
        ) == token:

            recipient.fcm_token = None

            recipient.save(
                update_fields=["fcm_token"]
            )

    # =====================================================
    # DELIVERY LOG HELPER
    # =====================================================

    @staticmethod
    def _log_delivery(
        notification,
        recipient,
        channel,
        status_value,
        reason=None,
        provider_response=None
    ):

        NotificationDeliveryLog.objects.create(
            notification=notification,
            user=recipient,
            channel=channel,
            status=status_value,
            reason=reason,
            provider_response=provider_response
        )

    # =====================================================
    # QUIET HOURS CHECK
    # ADMIN ONLY
    # =====================================================

    @staticmethod
    def _is_admin_quiet_hours(recipient):

        if recipient.user_type != "admin":
            return False

        quiet_hours = AdminQuietHours.objects.filter(
            admin=recipient,
            enabled=True
        ).first()

        if not quiet_hours:
            return False

        current_time = timezone.localtime().time()

        start_time = quiet_hours.start_time
        end_time = quiet_hours.end_time

        # SAME DAY RANGE

        if start_time < end_time:

            return (
                start_time <= current_time <= end_time
            )

        # OVERNIGHT RANGE

        return (
            current_time >= start_time or
            current_time <= end_time
        )

    # =====================================================
    # MAIN NOTIFICATION METHOD
    # =====================================================

    @staticmethod
    def create_notification(
        recipient,
        title,
        message,
        category=None,
        event_type=None,
        notification_type=None,
        related_object_id=None
    ):

        logger.info(
            "NOTIFICATION REQUEST | user=%s | title=%s",
            recipient.id,
            title
        )

        # =================================================
        # DEFAULT FLAGS
        # =================================================

        allow_inapp = True
        allow_email = False
        allow_sms = False
        allow_push = False

        # =================================================
        # MAP EVENT CATEGORY
        # =================================================

        mapped_category = EVENT_CATEGORY_MAP.get(
            event_type,
            "general"
        )

        # =================================================
        # GLOBAL CHANNEL SETTINGS
        # =================================================

        channel_settings = (
            NotificationChannelSettings.objects.first()
        )

        if channel_settings:

            allow_inapp = (
                channel_settings.inapp_notif
            )

            allow_email = (
                channel_settings.email_notif
            )

            allow_sms = (
                channel_settings.sms_notif
            )

            allow_push = (
                channel_settings.push_notif
            )

        # =================================================
        # CATEGORY CONFIG
        # =================================================

        config = NotificationConfig.objects.filter(
            category=mapped_category
        ).first()

        if config:

            allow_inapp = (
                allow_inapp and config.in_app
            )

            allow_email = (
                allow_email and config.email
            )

            allow_sms = (
                allow_sms and config.sms
            )

            allow_push = (
                allow_push and config.push
            )

        # =================================================
        # EMPLOYER PLAN SETTINGS
        # =================================================

        if recipient.user_type == "employer":
 
            subscription = Subscription.objects.filter(
                user=recipient,
                status='active'
            ).select_related(
                'plan'
            ).first()
 
            if subscription:
 
                platform = (
                    EmployerPlatformSettings.objects.filter(
                        plan=subscription.plan,
                        account_status=recipient.status
                    ).first()
                )

                if platform:

                    allow_email = (
                        allow_email and
                        platform.notif_email
                    )

                    category_enabled = True

                    if category == "new_signup":

                        category_enabled = (
                            platform.notif_new_signups
                        )

                    elif category == "alert":

                        category_enabled = (
                            platform.notif_alerts
                        )

                    elif category == "announcement":

                        category_enabled = (
                            platform.notif_announcements
                        )

                    elif category == "weekly_summary":

                        category_enabled = (
                            platform.notif_weekly_summary
                        )

                    allow_inapp = (
                        allow_inapp and
                        category_enabled
                    )

                    allow_email = (
                        allow_email and
                        category_enabled
                    )

                    allow_sms = (
                        allow_sms and
                        category_enabled
                    )

                    allow_push = (
                        allow_push and
                        category_enabled
                    )

        # =================================================
        # QUIET HOURS
        # ADMIN ONLY
        # BLOCK EXTERNAL CHANNELS ONLY
        # =================================================

        if NotificationService._is_admin_quiet_hours(
            recipient
        ):

            logger.info(
                "QUIET HOURS ACTIVE | admin=%s",
                recipient.id
            )

            allow_email = False
            allow_sms = False
            allow_push = False

        # =================================================
        # ALWAYS CREATE DATABASE NOTIFICATION
        # =================================================

        notification = Notification.objects.create(
            user=recipient,
            title=title,
            message=message,
            category=category,
            event_type=event_type,
            notification_type=notification_type,
            related_object_id=related_object_id
        )

        # =================================================
        # IN-APP LOGGING
        # =================================================

        if allow_inapp:

            NotificationService._log_delivery(
                notification=notification,
                recipient=recipient,
                channel='inapp',
                status_value='sent'
            )

        else:

            NotificationService._log_delivery(
                notification=notification,
                recipient=recipient,
                channel='inapp',
                status_value='skipped',
                reason='In-app notifications disabled'
            )

        # =================================================
        # EMAIL
        # =================================================

        if allow_email:

            try:

                send_mail(
                    subject=title,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[recipient.email],
                    fail_silently=False
                )

                NotificationService._log_delivery(
                    notification=notification,
                    recipient=recipient,
                    channel='email',
                    status_value='sent'
                )

                logger.info(
                    "EMAIL SENT | user=%s",
                    recipient.id
                )

            except Exception as exc:

                NotificationService._log_delivery(
                    notification=notification,
                    recipient=recipient,
                    channel='email',
                    status_value='failed',
                    reason=str(exc)
                )

                logger.exception(
                    "EMAIL FAILED | user=%s",
                    recipient.id
                )

        else:

            NotificationService._log_delivery(
                notification=notification,
                recipient=recipient,
                channel='email',
                status_value='skipped',
                reason='Email notifications disabled'
            )

        # =================================================
        # SMS
        # =================================================

        if allow_sms:

            try:

                logger.info(
                    "SMS SENT | user=%s",
                    recipient.id
                )

                NotificationService._log_delivery(
                    notification=notification,
                    recipient=recipient,
                    channel='sms',
                    status_value='sent'
                )

            except Exception as exc:

                NotificationService._log_delivery(
                    notification=notification,
                    recipient=recipient,
                    channel='sms',
                    status_value='failed',
                    reason=str(exc)
                )

                logger.exception(
                    "SMS FAILED | user=%s",
                    recipient.id
                )

        else:

            NotificationService._log_delivery(
                notification=notification,
                recipient=recipient,
                channel='sms',
                status_value='skipped',
                reason='SMS notifications disabled'
            )

        # =================================================
        # PUSH NOTIFICATIONS
        # =================================================

        if allow_push:

            tokens = (
                NotificationService._extract_push_tokens(
                    recipient
                )
            )

            if not tokens:

                NotificationService._log_delivery(
                    notification=notification,
                    recipient=recipient,
                    channel='push',
                    status_value='skipped',
                    reason='No FCM tokens available'
                )

            payload_data = {

                "notification_type": (
                    str(notification_type)
                    if notification_type is not None
                    else ""
                ),

                "category": (
                    str(category)
                    if category is not None
                    else ""
                ),

                "event_type": (
                    str(event_type)
                    if event_type is not None
                    else ""
                ),

                "related_object_id": (
                    str(related_object_id)
                    if related_object_id is not None
                    else ""
                ),

                "notification_id": (
                    str(notification.id)
                ),
            }

            for token in tokens:

                try:

                    response_id = (
                        send_push_notification(
                            token=token,
                            title=title,
                            body=message,
                            data=payload_data
                        )
                    )

                    NotificationService._log_delivery(
                        notification=notification,
                        recipient=recipient,
                        channel='push',
                        status_value='sent',
                        provider_response=response_id
                    )

                    logger.info(
                        "PUSH SENT | user=%s | token_prefix=%s",
                        recipient.id,
                        token[:12]
                    )

                except InvalidFCMTokenError as exc:

                    NotificationService._cleanup_invalid_token(
                        recipient=recipient,
                        token=token
                    )

                    NotificationService._log_delivery(
                        notification=notification,
                        recipient=recipient,
                        channel='push',
                        status_value='failed',
                        reason=f'Invalid token: {str(exc)}'
                    )

                    logger.warning(
                        "INVALID TOKEN | user=%s",
                        recipient.id
                    )

                except PushNotificationError as exc:

                    NotificationService._log_delivery(
                        notification=notification,
                        recipient=recipient,
                        channel='push',
                        status_value='failed',
                        reason=str(exc)
                    )

                    logger.error(
                        "PUSH FAILED | user=%s",
                        recipient.id
                    )

                except Exception as exc:

                    NotificationService._log_delivery(
                        notification=notification,
                        recipient=recipient,
                        channel='push',
                        status_value='failed',
                        reason=str(exc)
                    )

                    logger.exception(
                        "UNKNOWN PUSH ERROR | user=%s",
                        recipient.id
                    )

        else:

            NotificationService._log_delivery(
                notification=notification,
                recipient=recipient,
                channel='push',
                status_value='skipped',
                reason='Push notifications disabled'
            )

        logger.info(
            "NOTIFICATION COMPLETED | user=%s | notification_id=%s",
            recipient.id,
            notification.id
        )

        return notification