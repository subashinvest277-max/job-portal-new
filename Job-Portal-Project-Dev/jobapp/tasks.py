# tasks.py
 
import logging
from datetime import timedelta
 
from celery import shared_task
from django.contrib.auth import get_user_model
from django.utils import timezone
 
from .models import EmployerPlatformSettings, PostAJob, Subscription
from .services import NotificationService
 
User = get_user_model()
logger = logging.getLogger(__name__)
 
 
@shared_task(name="jobapp.tasks.send_weekly_summary_notifications", bind=True)
def send_weekly_summary_notifications(self):
    logger.info(
        "Weekly summary task started | task_id=%s",
        getattr(self.request, "id", None),
    )
 
    employers = User.objects.filter(user_type="employer")
    total_employers = employers.count()
 
    sent_count = 0
    skipped_no_subscription = 0
    skipped_no_platform = 0
    skipped_disabled = 0
    error_count = 0
 
    for employer in employers:
        try:
            subscription = (
                Subscription.objects.filter(user=employer, status="active")
                .select_related("plan")
                .first()
            )
            if not subscription:
                skipped_no_subscription += 1
                continue
 
            platform = EmployerPlatformSettings.objects.filter(
                plan=subscription.plan,
                account_status=employer.status,
            ).first()
 
            # Fallback: use plan-level settings if exact status row is missing.
            if not platform:
                platform = EmployerPlatformSettings.objects.filter(
                    plan=subscription.plan
                ).first()
 
            if not platform:
                skipped_no_platform += 1
                continue
 
            if not platform.notif_weekly_summary:
                skipped_disabled += 1
                continue
 
            NotificationService.create_notification(
                recipient=employer,
                title="Weekly Summary Ready",
                message=(
                    "Your weekly employer summary is now available. "
                    "View report at: /employer/dashboard/weekly-summary"
                ),
                category="weekly_summary",
                event_type="weekly_report",
                notification_type="system",
            )
            sent_count += 1
 
        except Exception:
            error_count += 1
            logger.exception(
                "Weekly summary failed for employer_id=%s",
                employer.id,
            )
 
    logger.info(
        "Weekly summary task finished | total=%s sent=%s no_subscription=%s no_platform=%s disabled=%s errors=%s",
        total_employers,
        sent_count,
        skipped_no_subscription,
        skipped_no_platform,
        skipped_disabled,
        error_count,
    )
 
    return {
        "total_employers": total_employers,
        "sent": sent_count,
        "skipped_no_subscription": skipped_no_subscription,
        "skipped_no_platform": skipped_no_platform,
        "skipped_disabled": skipped_disabled,
        "errors": error_count,
    }
 
 
@shared_task(name="jobapp.tasks.expire_jobs")
def expire_jobs():
    try:
        now = timezone.now()
        # Process all jobs so we can correct stale states
        # (e.g. unapproved jobs incorrectly marked expired).
        jobs = PostAJob.objects.all()
 
        for job in jobs:
            try:
                # Pending/unapproved jobs are not "expired"; they are just not approved.
                if not job.approved_at:
                    updated_fields = []
 
                    if job.expiry_date is not None:
                        job.expiry_date = None
                        updated_fields.append("expiry_date")
 
                    if job.is_expired:
                        job.is_expired = False
                        updated_fields.append("is_expired")
 
                    if job.is_published:
                        job.is_published = False
                        updated_fields.append("is_published")
 
                    if job.expiry_notified:
                        job.expiry_notified = False
                        updated_fields.append("expiry_notified")
 
                    if updated_fields:
                        job.save(update_fields=updated_fields)
 
                    continue
 
                expected_expiry_date = (
                    job.approved_at + timedelta(days=job.expiry_days)
                    if job.expiry_days
                    else None
                )
 
                # If expiry window changed (for example due to plan changes),
                # recompute expiry_date and reset reminder flag.
                if job.expiry_date != expected_expiry_date:
                    job.expiry_date = expected_expiry_date
                    job.expiry_notified = False
                    job.save(update_fields=["expiry_date", "expiry_notified"])
 
                if not job.expiry_date:
                    continue
 
                subscription = (
                    Subscription.objects.filter(user=job.employer, status="active")
                    .order_by("-start_date")
                    .first()
                )
 
                if not subscription:
                    job.is_expired = True
                    job.is_published = False
                    job.save()
                    continue
 
                if subscription.end_date and subscription.end_date < now:
                    if subscription.status != "expired":
                        subscription.status = "expired"
                        subscription.save(update_fields=["status"])
 
                    job.is_expired = True
                    job.is_published = False
                    job.save()
                    continue
 
                if job.expiry_date < now:
                    job.is_expired = True
                    job.is_published = False
                    job.save()
 
                    logger.info("Job expired | job_id=%s", job.id)
 
            except Exception as job_error:
                logger.exception(
                    "Expire job failed | job_id=%s | error=%s",
                    job.id,
                    str(job_error),
                )
 
    except Exception as error:
        logger.exception("Expire jobs task failed | error=%s", str(error))
 
 
@shared_task(name="jobapp.tasks.notify_expiring_jobs")
def notify_expiring_jobs():
    try:
        tomorrow = (timezone.now() + timedelta(days=1)).date()
 
        jobs = PostAJob.objects.filter(is_expired=False, expiry_notified=False)
 
        for job in jobs:
            try:
                if not job.expiry_date:
                    continue
 
                if job.expiry_date.date() == tomorrow:
                    NotificationService.create_notification(
                        recipient=job.employer,
                        title="Job Expiring Soon",
                        message=(
                            f"Your job '{job.job_title}' will expire tomorrow. "
                            "Upgrade your plan to extend visibility."
                        ),
                        category="alert",
                        event_type="job_expiring",
                        notification_type="system",
                        related_object_id=job.id,
                    )
 
                    job.expiry_notified = True
                    job.save()
 
                    logger.info(
                        "Expiry notification sent | job_id=%s",
                        job.id,
                    )
 
            except Exception as job_error:
                logger.exception(
                    "Expiry notification failed | job_id=%s | error=%s",
                    job.id,
                    str(job_error),
                )
 
    except Exception as error:
        logger.exception(
            "Notify expiring jobs task failed | error=%s",
            str(error),
        )