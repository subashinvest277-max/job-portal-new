from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import Notification, Message, Plan, PlanFeature, EmployerPlatformSettings, User
# Signal for sending email when notification is created (commented out)
# @receiver(post_save, sender=Notification)
# def send_email_when_notification_created(sender, instance, created, **kwargs):
#     if created:
#         user = instance.user
#         if user.email:
#             send_mail(
#                 subject="New Notification",
#                 message=instance.message,
#                 from_email=settings.DEFAULT_FROM_EMAIL,
#                 recipient_list=[user.email],
#                 fail_silently=True,
#             )


# Signal for creating notification when a new message is sent
@receiver(post_save, sender=Message)
def create_message_notification(sender, instance, created, **kwargs):
    """
    Automatically create a notification when a new message is sent
    """
    if created and instance.sender != instance.receiver:
        # Create notification for the message receiver
        Notification.objects.create(
            user=instance.receiver,
            title=f"New message from {instance.sender.username}",
            message=f"You have a new message from {instance.sender.username}",
            notification_type='message',
            category='message',  
            event_type='new_message',  
            related_object_id=instance.conversation.id,
            is_read=False
        )  

# ============================================================
# SIGNALS (AUTOMATED ONBOARDING MAPPING GENERATOR)
# ============================================================
 
@receiver(post_save, sender=Plan)
def create_default_features_and_settings(sender, instance, created, **kwargs):
    if created:  # Only runs automatically when a completely NEW plan row is added
        # Safe match condition that captures your precise system names
        is_free_tier = instance.name.lower() in ["free", "starter plan", "starter"]
        # 1. Automatically generate the features required by the React JSX loop map
        default_features = [
            { 
                "text": "Jobs Posting", 
                "value": "1", # Strictly locked to 1 Job Post
                "order": 0 
            },
            { 
                "text": "Analytics", 
                "value": "false" if is_free_tier else ("true" if instance.Analytics else "false"), 
                "order": 1 
            },
            { 
                "text": "Candidate Search", 
                "value": "false" if is_free_tier else ("true" if instance.Candidate_Search else "false"), 
                "order": 2 
            },
            { 
                "text": "Highlight Your Job Listing", 
                "value": "1", # Strictly hardcoded to 0/Disabled for the free plan
                "order": 3 
            },
            { 
                "text": "Premium Support", 
                "value": "false" if is_free_tier else ("true" if instance.Premium_Support else "false"), 
                "order": 4 
            },
            { 
                "text": "Account Manager", 
                "value": "false" if is_free_tier else ("true" if instance.Account_Manager else "false"), 
                "order": 5 
            },
        ]
        for feature in default_features:
            PlanFeature.objects.create(
                plan=instance,
                text=feature['text'],
                value=feature['value'],
                order=feature['order']
            )
        # 2. Automatically generate the Platform Onboarding Settings needed by your Serializer
        if is_free_tier:
            statuses_to_generate = [User.AccountStatus.ACTIVE, User.AccountStatus.HOLD]
            for status_choice in statuses_to_generate:
                EmployerPlatformSettings.objects.get_or_create(
                    plan=instance,
                    account_status=status_choice,
                    defaults={
                        "max_job_posts": 1,
                        "featured_job_limit": 0,
                        "featured_employer_option": False,
                        "approval_type": "Automatic",
                        "job_expire_days": 30,
                        "allow_edit_after_approval": False,
                        "employer_registration": True,
                        "email_verification": True,
                        "mobile_verification": False,
                        "req_company_cert": False,
                        "req_gst_cert": False,
                        "req_business_email": False,
                        "req_company_website": False,
                        "allow_multiple_company": False,
                        "allow_multiple_users": False,
                        "show_company_reviews": False,
                        "enable_company_branding": False,
                        "notif_email": False,
                        "notif_new_signups": False,
                        "notif_alerts": False,
                        "notif_announcements": False,
                        "notif_weekly_summary": False,
                    }
                )
        else:
            # For paid plans
            for status_choice in [User.AccountStatus.ACTIVE, User.AccountStatus.HOLD]:
                EmployerPlatformSettings.objects.get_or_create(
                    plan=instance,
                    account_status=status_choice,
                    defaults={
                        "max_job_posts": 1,
                        "featured_job_limit": 1,
                        "featured_employer_option": False if is_free_tier else True, # Fixed Python boolean casing typo here
                        "approval_type": "Manual Type",
                        "job_expire_days": 30,
                        "allow_edit_after_approval": False,
                    }
                )
        print(f"✅ Automated System features and onboarding context maps generated for {instance.name}")
