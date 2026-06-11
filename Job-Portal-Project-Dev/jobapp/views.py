from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import api_view
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from django.db.models import Q, Count
from datetime import timedelta
import random
import logging
from django.db.models.functions import Coalesce
from datetime import timedelta
 
from django.utils import timezone
 
from django.db.models import (
    Count,
    Sum,
    Q,
    DecimalField,
)
 
from django.db.models.functions import (
    TruncMonth,
    Coalesce
)



from .serializers import (
    JobSeekerRegistrationSerializer,
    EmployerRegistrationSerializer,
    JobSeekerProfileReadSerializer,
    JobSeekerProfileWriteSerializer,
    EmployerProfileReadSerializer,
    EmployerProfileWriteSerializer,
    UserReadSerializer,
    JobApplicationDetailSerializer,
    NotificationSerializer,
    CustomTokenObtainPairSerializer,
    ContactMessageSerializer,
    PostAJobSerializer,
    JobReadSerializer,
    JobWriteSerializer,
    JobUpdateSerializer,
    JobApplicationWriteSerializer,
    JobApplicationEmployerSerializer,
    JobApplicationListSerializer,
    SavedJobSerializer,
    UserSettingsSerializer,
    ConversationSerializer,
    MessageSerializer,
    SendMessageSerializer,
    ChatUserSerializer,
    ChatMessageSerializer,
    HelpTopicSerializer,
    RaiseTicketSerializer,
    ForgotPasswordSerializer,
    ResetPasswordConfirmSerializer,
    CreatePasswordSerializer,
    NewsletterSubscriberSerializer,
    CompanyVerificationSerializer,
    CompanyProfileSerializer,
    ComplaintSerializer,
    VerifyEmailOTPSerializer,
    PlanSerializer,
    SubscriptionSerializer,
    InvoiceSerializer,
    PaymentMethodSerializer,
    AdminCompanySerializer,
    AdminCompanyDetailSerializer,
    SaveDeviceTokenSerializer,

)

from .models import (
    User, JobSeekerProfile, EmployerProfile, PostAJob, 
    JobApplication, SavedJob, Notification, UserSettings,
    Conversation, Message, ChatMessage, HelpTopic, RaiseTicket,
    PasswordResetToken, EmailOTP, NewsletterSubscriber,
    CompanyVerification, CompanyProfile, Complaint, Plan, Subscription,
    Invoice, PaymentMethod, CompanyEmailOTP, NotificationConfig,
    NotificationChannelSettings, UserDevice,
)
from .permissions import IsAdminOrEmployer, IsEmployerOrAdmin, IsJobSeeker, IsAdminUserType
from .utils import generate_otp, generate_4digit_otp, send_email_otp, generate_token, send_password_reset_email,generate_company_otp, send_company_email_otp,run_application_flag_checks
from .services import NotificationService
User = get_user_model()
logger = logging.getLogger(__name__)


# ============ REGISTRATION VIEWS ============

class JobSeekerRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        platform = (
            JobseekerPlatformSettings.get_settings()
        )
        if not platform.registration:
            return Response(
                {
                    "error": (
                        "Jobseeker registration "
                        "is currently disabled."
                    )
                },
                status=403
            )
        email = request.data.get("email")

        if (
            platform.domain_restriction
            and
            email
        ):

            domain = (
                email.split("@")[-1]
                .lower()
                .strip()
            )

            allowed_domains = [

                d.lower().strip()

                for d in (
                    platform.allowed_domains
                    or []
                )
            ]

            if domain not in allowed_domains:

                return Response(
                    {
                        "error": (
                            "Email domain "
                            "is not allowed."
                        )
                    },
                    status=400
                )

       
        if platform.email_verification:
            email_verified = (
                EmailOTP.objects.filter(
                    email=email,
                    purpose="email_verification",
                    is_verified=True
                ).exists()
            )

            if not email_verified:
                return Response(
                    {
                        "error": (
                            "Please verify "
                            "your email first"
                        )
                    },
                    status=400
                )

        serializer = (
            JobSeekerRegistrationSerializer(
                data=request.data
            )
        )

        if serializer.is_valid():
            user = serializer.save()
            if (
                platform.account_status
                ==
                "Pending"
            ):
                user.is_active = False
            elif (
                platform.account_status
                ==
                "Blocked"
            ):
                user.is_active = False
            else:
                user.is_active = True
            user.save()

            NotificationService.create_notification(
                recipient=user,
                title="Welcome to Job Portal",
                message=(
                    "Your jobseeker account "
                    "has been created successfully."
                ),
                category="new_signup",
                event_type="jobseeker_signup",
                notification_type="system"
            )
            return Response(
                {
                    "message": (
                        "User registered successfully"
                    )
                },
                status=201
            )
        return Response(
            serializer.errors,
            status=400
        )

class EmployerRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # PLAN
        plan_id = request.data.get("plan_id", 1)
        plan = Plan.objects.filter(id=plan_id).first()

        # CREATE DEFAULT STARTER PLAN
        if not plan:
            plan = Plan.objects.create(
                id=1,
                name="STARTER PLAN",
                monthly_price=0,
                duration_days=30,
                highlight_limit=0
            )

        # DEFAULT FLOW STATUS
        default_status = User.AccountStatus.HOLD

        # PLATFORM SETTINGS
        platform = EmployerPlatformSettings.objects.filter(
            plan=plan,
            account_status=default_status
        ).first()

        # CREATE DEFAULT SETTINGS
        if not platform:
            platform = EmployerPlatformSettings.objects.create(
                plan=plan,
                account_status=User.AccountStatus.HOLD,
                employer_registration=True,
                email_verification=True,
                mobile_verification=False,
                approval_type="Manual Type",
                req_company_cert=False,
                req_gst_cert=False,
                req_business_email=False,
                req_company_website=False,
                allow_multiple_company=False,
                allow_multiple_users=False,
                show_company_reviews=False,
                enable_company_branding=False,
                featured_employer_option=False,
                notif_email=False,
                notif_new_signups=False,
                notif_alerts=False,
                notif_announcements=False,
                notif_weekly_summary=False,
                job_expire_days=30,
                max_job_posts=10,
                featured_job_limit=0,
                allow_edit_after_approval=False
            )

        # EMPLOYER REGISTRATION ENABLED
        if not platform.employer_registration:
            return Response(
                {"error": "Employer registration is disabled."},
                status=status.HTTP_403_FORBIDDEN
            )

        # EMAIL VERIFICATION
        if platform.email_verification:
            email = request.data.get("email")
            email_verified = EmailOTP.objects.filter(
                email=email,
                purpose="email_verification",
                is_verified=True
            ).exists()
            if not email_verified:
                return Response(
                    {"error": "Please verify your email first."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # COMPANY MULTIPLE USER CHECK
        company_id = request.data.get("company")
        if company_id:
            company = CompanyProfile.objects.filter(id=company_id).first()
            if company:
                existing_members = EmployerProfile.objects.filter(company=company).exists()
                if existing_members and not platform.allow_multiple_users:
                    return Response(
                        {"error": "Multiple employers are not allowed for this company."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

        # SERIALIZER VALIDATION WITH FRIENDLY ERRORS
        serializer = EmployerRegistrationSerializer(data=request.data)

        if not serializer.is_valid():
            errors = serializer.errors

            if 'username' in errors:
                return Response(
                    {
                        "error": "Username already exists. Please choose a different username.",
                        "field": "username",
                        "details": errors['username']
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            elif 'email' in errors:
                return Response(
                    {
                        "error": "Email already registered. Please login instead or use a different email.",
                        "field": "email",
                        "details": errors['email']
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            else:
                return Response(
                    {
                        "error": "Validation failed",
                        "details": errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        user = serializer.save()

        # APPROVAL FLOW
        if platform.approval_type == "Automatic":
            user.status = User.AccountStatus.ACTIVE
            user.is_active = True
        else:
            user.status = User.AccountStatus.HOLD
            user.is_active = False

        user.save()

        # SUBSCRIPTION
        Subscription.objects.get_or_create(
            user=user,
            plan=plan,
            defaults={"status": "active"}
        )

        # NOTIFICATION
        # NotificationService.create_notification(
        #     recipient=user,
        #     title="Employer Account Created",
        #     message="Your employer account has been created successfully.",
        #     category="new_signup",
        #     event_type="employer_signup",
        #     notification_type="system"
        # )
        NotificationService.create_notification(
            recipient=user,
            title="Employer Account Created",
            message="Your employer account has been created successfully.",

            category="new_signup",
            event_type="employer_signup",
            notification_type="system"
        )

        # RESPONSE
        return Response(
            {
                "message": "Employer registered successfully.",
                "account_status": user.status,
                "is_active": user.is_active,
                "plan": plan.name
            },
            status=status.HTTP_201_CREATED
        )
 
# ============ AUTHENTICATION VIEWS ============

class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer
 

class LogoutView(APIView):

    permission_classes = [IsAuthenticated]
 
    def post(self, request):

        try:

            user = request.user
 
            user.is_online = False

            user.last_seen = timezone.now()
 
            user.save(

                update_fields=[

                    "is_online",

                    "last_seen"

                ]

            )
 
            refresh_token = request.data.get("refresh")
 
            if refresh_token:

                token = RefreshToken(refresh_token)

                token.blacklist()
 
            return Response(

                {

                    "message": "Logged out successfully"

                },

                status=status.HTTP_200_OK

            )
 
        except Exception as e:

            return Response(

                {

                    "error": str(e)

                },

                status=status.HTTP_400_BAD_REQUEST

            )

# ============ PROFILE VIEWS ============

class JobSeekerProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return JobSeekerProfileReadSerializer
        return JobSeekerProfileWriteSerializer

    def get_object(self):
        profile, created = JobSeekerProfile.objects.get_or_create(
            user=self.request.user
        )
        return profile

    def update(self, request, *args, **kwargs):
        print("\n" + "="*80)
        print("🚀 JOBSEEKER PROFILE UPDATE - START")
        print("="*80)

        print(f"📌 User: {request.user.email} (ID: {request.user.id})")
        print(f"📌 Method: {request.method}")
        print(f"📌 Content-Type: {request.headers.get('Content-Type', 'Not specified')}")

        content_type = request.headers.get('Content-Type', '')

        if 'multipart/form-data' in content_type and 'data' in request.data:
            try:
                import json
                json_data = json.loads(request.data.get('data'))
                print("\n📦 Parsed JSON data from 'data' field:")
                print(json.dumps(json_data, indent=2, default=str)[:1000])

                combined_data = {}

                # Add all JSON data
                for key, value in json_data.items():
                    combined_data[key] = value

                # IMPORTANT: Check for delete_profile_photo flag in FormData
                if 'delete_profile_photo' in request.data:
                    combined_data['delete_profile_photo'] = request.data.get('delete_profile_photo') == 'true'
                    print(f"📸 Found delete_profile_photo flag: {combined_data['delete_profile_photo']}")

                # Add file data
                for key, value in request.data.items():
                    if key != 'data':
                        combined_data[key] = value
                
                # Process certifications
                certifications_list = []
                
                # First, get certifications from JSON data
                if 'certifications' in json_data:
                    certifications_list = json_data['certifications']
                
                # Then, check for files in FormData and merge with existing IDs
                cert_index = 0
                while f'certifications[{cert_index}][name]' in request.data:
                    cert_name = request.data.get(f'certifications[{cert_index}][name]')
                    cert_id = request.data.get(f'certifications[{cert_index}][id]')
                    cert_file = request.FILES.get(f'certifications[{cert_index}][certificate_file]')
                    
                    if cert_index < len(certifications_list):
                        if cert_id:
                            certifications_list[cert_index]['id'] = int(cert_id)
                        certifications_list[cert_index]['name'] = cert_name
                        if cert_file:
                            certifications_list[cert_index]['certificate_file'] = cert_file
                    else:
                        cert_dict = {'name': cert_name}
                        if cert_id:
                            cert_dict['id'] = int(cert_id)
                        if cert_file:
                            cert_dict['certificate_file'] = cert_file
                        certifications_list.append(cert_dict)
                    
                    cert_index += 1
                
                if certifications_list:
                    print("FINAL certifications_list:", certifications_list)
                    combined_data['certifications'] = certifications_list
                    print(f"\n📦 Processed {len(certifications_list)} certifications")
                    for i, cert in enumerate(certifications_list):
                        print(f"   Cert {i}: ID={cert.get('id')}, Name={cert.get('name')}, HasFile={bool(cert.get('certificate_file'))}")

                # Replace request.data with our combined data
                request._full_data = combined_data

            except Exception as e:
                print(f"Error parsing JSON data: {e}")
                import traceback
                traceback.print_exc()

        print("\n" + "="*80)
        print("🚀 CALLING SUPER().UPDATE()")
        print("="*80 + "\n")

        return super().update(request, *args, **kwargs)

class JobSeekerListView(generics.ListAPIView):
    serializer_class = JobSeekerProfileReadSerializer
    permission_classes = [IsAdminOrEmployer]
 
    def get_queryset(self):
        qs = JobSeekerProfile.objects.select_related(
            'user',
        ).prefetch_related(
            'skills',
            'educations',
            'experiences',
            'certifications',
        )
 
        # Search filter
        search = self.request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(user__email__icontains=search) |
                Q(current_job_title__icontains=search) |
                Q(skills__name__icontains=search)
            ).distinct()
 
        # Location filter
        location = self.request.query_params.get('location', '').strip()
        if location:
            qs = qs.filter(location__icontains=location)
 
        # Experience filter
        experience = self.request.query_params.get('experience', '').strip()
        if experience:
            qs = qs.filter(total_experience_years__gte=experience)
 
        return qs
   

class EmployerProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
 
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return EmployerProfileReadSerializer
        return EmployerProfileWriteSerializer
 
    def get_object(self):
        if not hasattr(self.request.user, 'employer_profile'):
            raise ValidationError("You are not an employer.")
        return self.request.user.employer_profile
   

# ============ COMPANY VIEWS - REMOVED AND REPLACED WITH COMPANYPROFILE ============

# REMOVED: CompanyListView, CompanyDetailView, CompanyCreateView, 
# CompanyLinkView, CompanyEditView, AdminCompanyToggleActiveView

# These have been replaced with CompanyProfile views at the bottom of the file


# ============ JOB VIEWS ============

class JobListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = PostAJobSerializer
 
    def get_queryset(self):
        # ONLY approved + published jobs visible
        return PostAJob.objects.filter( is_published=True, approval_status=PostAJob.ApprovalStatus.APPROVED, is_expired=False )
 
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        search = request.query_params.get("search")
        location = request.query_params.get("location")
        experience = request.query_params.get("experience")
        company_id = request.query_params.get("company")
        
        if company_id:
            # Changed to use CompanyProfile
            queryset = queryset.filter(employer__employer_profile__company_id=company_id)
        
        if search:
            queryset = queryset.filter(job_title__icontains=search)
        
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        if experience:
            queryset = queryset.filter(experience__icontains=experience)
        
        queryset = queryset.order_by(
            '-is_highlighted',
            '-highlighted_at',
            '-created_at'
        )
 
        serializer = self.get_serializer(queryset, many=True)
 
        return Response({
            "total_jobs": queryset.count(),
            "jobs": serializer.data
        })
 

class JobDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = PostAJobSerializer
    queryset = PostAJob.objects.filter(is_published=True)


#newly added for similar job setting in joseeker setting
from django.db.models import (
    Case,
    When,
    Value,
    IntegerField
)

from django.db.models.functions import (
    Coalesce
)

from rest_framework.generics import (
    ListAPIView
)

from rest_framework.permissions import (
    AllowAny
)

from rest_framework.response import (
    Response
)

from rest_framework import status

from .models import (
    PostAJob,
    JobseekerPlatformSettings
)

from .serializers import (
    PostAJobSerializer
)


class SimilarJobsAPIView(
    ListAPIView
):

    serializer_class = (
        PostAJobSerializer
    )

    permission_classes = [AllowAny]

    def get_queryset(self):

        platform = (
            JobseekerPlatformSettings.get_settings()
        )

      

        if not platform.similar_jobs:

            self.similar_jobs_disabled = True

            return PostAJob.objects.none()

        self.similar_jobs_disabled = False


        job_id = self.kwargs.get("job_id")

        try:

            current_job = PostAJob.objects.get(

                id=job_id,

                is_published=True,

                approval_status="approved"
            )

        except PostAJob.DoesNotExist:

            return PostAJob.objects.none()

    

        queryset = (
            PostAJob.objects.filter(

                is_published=True,

                approval_status="approved"

            ).exclude(
                id=current_job.id
            )
        )


        queryset = queryset.annotate(

            industry_match=Case(

                When(

                    industry_type__overlap=(
                        current_job.industry_type
                    ),

                    then=Value(1)
                ),

                default=Value(0),

                output_field=IntegerField()
            ),

            department_match=Case(

                When(

                    department__overlap=(
                        current_job.department
                    ),

                    then=Value(1)
                ),

                default=Value(0),

                output_field=IntegerField()
            ),

            skills_match=Case(

                When(

                    key_skills__overlap=(
                        current_job.key_skills
                    ),

                    then=Value(1)
                ),

                default=Value(0),

                output_field=IntegerField()
            ),

            education_match=Case(

                When(

                    education__overlap=(
                        current_job.education
                    ),

                    then=Value(1)
                ),

                default=Value(0),

                output_field=IntegerField()
            ),

            category_match=Case(

                When(

                    job_category__iexact=(
                        current_job.job_category
                    ),

                    then=Value(1)
                ),

                default=Value(0),

                output_field=IntegerField()
            ),
        )


        queryset = queryset.annotate(
    total_matches=
        Coalesce(
            "industry_match",
            Value(0),
            output_field=IntegerField()
        )
        +
        Coalesce(
            "department_match",
            Value(0),
            output_field=IntegerField()
        )
        +
        Coalesce(
            "skills_match",
            Value(0),
            output_field=IntegerField()
        )
        +
        Coalesce(
            "education_match",
            Value(0),
            output_field=IntegerField()
        )
        +
        Coalesce(
            "category_match",
            Value(0),
            output_field=IntegerField()
        )
)


        queryset = queryset.filter(

            total_matches__gte=2

        ).order_by(

            "-total_matches",

            "-created_at"

        )[:10]

        return queryset

    def list(self, request, *args, **kwargs):

        queryset = self.get_queryset()


        if getattr(

            self,

            "similar_jobs_disabled",

            False
        ):

            return Response(
                {
                    "error": (
                        "Similar jobs option "
                        "is disabled."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(

            queryset,

            many=True
        )

        return Response(
            {
                "success": True,

                "count": len(serializer.data),

                "results": serializer.data
            },
            status=status.HTTP_200_OK
        )
    

class JobCreateView(generics.CreateAPIView):
 
    permission_classes = [IsAuthenticated]
    serializer_class = PostAJobSerializer
 
    def perform_create(self, serializer):
 
        user = self.request.user
 
        # ── Employer profile check ──────────────────────────────────
        if not hasattr(user, 'employer_profile'):
            raise PermissionDenied("Only employers can post jobs.")
 
        employer_profile = user.employer_profile
 
        if not employer_profile.company:
            raise PermissionDenied(
                "You must link a company before posting jobs."
            )
 
        # ── Active subscription ─────────────────────────────────────
        subscription = (
            Subscription.objects
            .filter(user=user, status='active')
            .select_related('plan')
            .first()
        )
 
        if not subscription:
            raise PermissionDenied("No active subscription found.")
 
        # ── Platform settings ───────────────────────────────────────
        # FIX: print both values so you can see exactly what is stored
        # vs what user.status contains. Remove after debugging.
        print(f"[DEBUG] user.status = {repr(user.status)}")
        print(f"[DEBUG] EmployerPlatformSettings account_status choices:")
        for obj in EmployerPlatformSettings.objects.filter(plan=subscription.plan):
            print(f"         plan={obj.plan}, account_status={repr(obj.account_status)}")
 
        platform = (
            EmployerPlatformSettings.objects
            .filter(
                plan=subscription.plan,
                account_status=user.status,
            )
            .first()
        )
 
        if not platform:
            # FIX: raise ValidationError with detail instead of
            # PermissionDenied so the real mismatch is visible in response
            raise ValidationError({
                "settings": (
                    f"Employer platform settings not configured "
                    f"for plan '{subscription.plan}' "
                    f"and account_status '{user.status}'."
                )
            })
 
        # ── Save ────────────────────────────────────────────────────
        serializer.save(
            employer=user,
            is_published=False,
        )

class JobUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PostAJobSerializer
 
    def get_queryset(self):
        return PostAJob.objects.filter(employer=self.request.user)
    
    def perform_update(self, serializer):  # changed on 13/05



        subscription = Subscription.objects.filter(
            user=self.request.user,
            status='active'
        ).select_related(
            'plan'
        ).first()

        if not subscription:

            raise PermissionDenied(
                "No active subscription found."
            )


        platform = (
            EmployerPlatformSettings.objects.filter(
                plan=subscription.plan
            ).first()
        )

        if not platform:

            raise PermissionDenied(
                (
                    "Employer platform settings "
                    "not configured for this plan."
                )
            )



        job = self.get_object()

  

        if (

            job.approval_status
            ==
            PostAJob.ApprovalStatus.APPROVED

            and

            not platform.allow_edit_after_approval
        ):

            raise PermissionDenied(
                "Editing approved jobs is disabled."
            )

        serializer.save()
 

class JobDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PostAJobSerializer
 
    def get_queryset(self):
        return PostAJob.objects.filter(employer=self.request.user)
 

class JobToggleActiveView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PostAJobSerializer
 
    def get_queryset(self):
        return PostAJob.objects.filter(employer=self.request.user)
 
    def perform_update(self, serializer):
        job = serializer.instance
        job.is_published = not job.is_published
        job.save()
        serializer.save()
 

# ============ POST A JOB VIEWS ============

class CreateJobPreviewView(generics.CreateAPIView):
    serializer_class = PostAJobSerializer
    permission_classes = [IsAuthenticated]
 
    def get_serializer_context(self):
        # Start with the default context (request, view, format)
        context = super().get_serializer_context()
        # platform is injected here after perform_create resolves it.
        # The initial value is None; perform_create sets it before
        # the serializer's to_representation runs.
        context['platform'] = getattr(self, '_platform', None)
        return context
 
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {
                "message": "Job saved as draft pending approval.",
                "job": serializer.data,
                "job_id": serializer.instance.id,
            },
            status=status.HTTP_201_CREATED
        )
 
    def perform_create(self, serializer):
        user = self.request.user
        # ── Employer check ──────────────────────────────────────────
        if user.user_type != "employer":
            raise PermissionDenied("Only employers can post jobs")
 
        if not hasattr(user, "employer_profile"):
            raise PermissionDenied("Employer profile not found")
 
        if not user.employer_profile.company:
            raise PermissionDenied("You must link a company first")
 
        # ── Company verification ────────────────────────────────────
        if not CompanyVerification.objects.filter(
            employer=user,
            status="Verified"
        ).exists():
            raise PermissionDenied(
                "Company must be verified before posting jobs"
            )
 
        # ── Active subscription ─────────────────────────────────────
        subscription = (
            Subscription.objects
            .filter(user=user, status='active')
            .select_related('plan')
            .first()
        )
        if not subscription:
            raise ValidationError(
                {"subscription": "No active subscription found."}
            )
 
        # ── Platform settings ───────────────────────────────────────
        platform = (
            EmployerPlatformSettings.objects
            .filter(
                plan=subscription.plan,
                account_status=user.status,
            )
            .first()
        )
        if not platform:
            raise ValidationError(
                {
                    "settings": (
                        f"Employer settings not configured "
                        f"for plan '{subscription.plan}' "
                        f"and status '{user.status}'."
                    )
                }
            )
 
        # Store platform on self so get_serializer_context can inject
        # it into the serializer — to_representation reuses it for free
        self._platform = platform
        serializer.context['platform'] = platform
 
        # ── Job post limit ──────────────────────────────────────────
        total_jobs = PostAJob.objects.filter(employer=user).count()
 
        if total_jobs >= platform.max_job_posts:
            raise ValidationError(
                {
                    "error": (
                        f"Job posting limit reached. "
                        f"Your plan allows {platform.max_job_posts} jobs."
                    )
                }
            )
 
        jobs_left = platform.max_job_posts - total_jobs
 
        # ── Highlight check ─────────────────────────────────────────
        is_highlighted = self.request.data.get('is_highlighted', False)
        if isinstance(is_highlighted, str):
            is_highlighted = is_highlighted.lower() == 'true'
 
        if is_highlighted:
 
            if not platform.featured_employer_option:
                raise ValidationError(
                    {
                        "is_highlighted": (
                            "Highlighted jobs are not allowed for your plan."
                        )
                    }
                )
 
            highlighted_count = PostAJob.objects.filter(
                employer=user,
                is_highlighted=True,
            ).count()
 
            if highlighted_count >= platform.featured_job_limit:
                raise ValidationError(
                    {
                        "error": (
                            f"Highlight limit reached. "
                            f"Your plan allows only "
                            f"{platform.featured_job_limit} highlighted jobs."
                        )
                    }
                )
 
        # ── Save job ────────────────────────────────────────────────
        job = serializer.save(
            employer=user,
            is_published=False,
            approval_status=PostAJob.ApprovalStatus.PENDING,
            is_highlighted=is_highlighted,
            highlighted_at=timezone.now() if is_highlighted else None,
            expiry_days=platform.job_expire_days,
            is_expired=False,
        )
 
        # ── Notification message ────────────────────────────────────
        message = (
            f"Your job '{job.job_title}' was submitted successfully "
            f"and is pending admin approval. "
            f"You have {jobs_left - 1} job posts remaining."
        )
 
        if platform.featured_employer_option:
            highlighted_count = PostAJob.objects.filter(
                employer=user,
                is_highlighted=True,
            ).count()
            featured_left = platform.featured_job_limit - highlighted_count
            message += (
                f" You also have {featured_left} "
                f"highlighted job slots remaining."
            )
 
        # ── Employer notification ───────────────────────────────────
        NotificationService.create_notification(
            recipient=job.employer,
            title="Job Submitted",
            message=message,
            category="alert",
            event_type="job_submitted_for_review",
            notification_type="system",
            related_object_id=job.id,
        )
 
        # ── Admin notifications ─────────────────────────────────────
        for admin in User.objects.filter(user_type="admin"):
            NotificationService.create_notification(
                recipient=admin,
                title="New Job Pending Approval",
                message=(
                    f"New job '{job.job_title}' submitted "
                    f"for approval by {user.email}"
                ),
                category="alert",
                event_type="job_pending_approval",
                notification_type="system",
                related_object_id=job.id,
            )
 
    def handle_exception(self, exc):
        print(f"Exception: {exc}")
        return super().handle_exception(exc)
 
 
class PreviewJobView(generics.RetrieveAPIView):
 
    serializer_class = PostAJobSerializer
    permission_classes = [IsAuthenticated]
 
    def get_queryset(self):
        return PostAJob.objects.filter(employer=self.request.user)
 
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['platform'] = getattr(self, '_platform', None)
        return context
 
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
 
        # ── Resolve platform once, inject into context ──────────────
        user = request.user
        limits = {}
 
        subscription = (
            Subscription.objects
            .filter(user=user, status='active')
            .select_related('plan')
            .first()
        )
 
        if subscription:
            platform = (
                EmployerPlatformSettings.objects
                .filter(
                    plan=subscription.plan,
                    account_status=user.status,
                )
                .first()
            )
 
            if platform:
                # Inject so to_representation reuses it — no second query
                self._platform = platform
 
                total_jobs = PostAJob.objects.filter(employer=user).count()
                highlighted_count = PostAJob.objects.filter(
                    employer=user,
                    is_highlighted=True,
                ).count()
 
                limits = {
                    "max_job_posts": platform.max_job_posts,
                    "jobs_used": total_jobs,
                    "jobs_remaining": max(
                        platform.max_job_posts - total_jobs, 0
                    ),
                    "featured_job_limit": platform.featured_job_limit,
                    "highlighted_used": highlighted_count,
                    "highlighted_remaining": max(
                        platform.featured_job_limit - highlighted_count, 0
                    ),
                    "featured_employer_option": platform.featured_employer_option,
                }
 
        serializer = self.get_serializer(instance)
 
        return Response(
            {
                "job": serializer.data,
                "limits": limits,
            }
        )
 

class PublishJobView(APIView):
    permission_classes = [IsAuthenticated]
 
    def patch(self, request, pk):
        if request.user.user_type != "employer":
            raise PermissionDenied("Only employers can publish jobs")
 
        job = get_object_or_404(
            PostAJob,
            id=pk,
            employer=request.user
        )
 
        # Prevent re-submitting approved job
        if job.approval_status == PostAJob.ApprovalStatus.APPROVED:
            return Response({
                "message": "Job already approved and live"
            }, status=status.HTTP_400_BAD_REQUEST)
 
        # MAIN LOGIC (IMPORTANT)
        job.approval_status = PostAJob.ApprovalStatus.PENDING
        job.is_published = False
        job.save()
 
        # Notify Admins
        # admins = User.objects.filter(user_type="admin")
 
        # for admin in admins:
        #     Notification.objects.create(
        #         user=admin,
        #         message=f"Job '{job.job_title}' submitted for approval by {request.user.email}",
        #         notification_type="job_pending",
        #         job=job
        #     )
 
        return Response({
            "message": "Job submitted for admin approval",
            "job_id": job.id,
            "job_title": job.job_title,
            "status": "pending"
        }, status=status.HTTP_200_OK)
 

class UpdateJobView(generics.UpdateAPIView):
    serializer_class = PostAJobSerializer
    permission_classes = [IsAuthenticated]
 
    def get_queryset(self):
        return PostAJob.objects.filter(employer=self.request.user)
   
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['partial'] = True
        return context
   
    def patch(self, request, *args, **kwargs):
        print("=" * 50)
        print("PATCH request received for job update")
        print("Request data:", request.data)
        print("=" * 50)
        return super().patch(request, *args, **kwargs)
 

class DeleteJobView(generics.DestroyAPIView):
    serializer_class = PostAJobSerializer
    permission_classes = [IsAuthenticated]
 
    def get_queryset(self):
        return PostAJob.objects.filter(employer=self.request.user)
 

class PostedJobListView(generics.ListAPIView):
    queryset = PostAJob.objects.filter(is_published=True)
    serializer_class = PostAJobSerializer
 

class EmployerJobListView(generics.ListAPIView):
    serializer_class = PostAJobSerializer
    permission_classes = [IsAuthenticated]
 
    def get_queryset(self):
        queryset = PostAJob.objects.filter(
            employer=self.request.user
        ).order_by('-created_at')
 
        # Optional filter by status
        status_filter = self.request.query_params.get("status")  # pending/approved/rejected
 
        if status_filter:
            queryset = queryset.filter(approval_status=status_filter)
 
        return queryset
 
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
 
        serializer = self.get_serializer(queryset, many=True)
 
        # Dashboard-style stats
        total = PostAJob.objects.filter(employer=request.user).count()
        pending = PostAJob.objects.filter(
            employer=request.user,
            approval_status=PostAJob.ApprovalStatus.PENDING
        ).count()
        approved = PostAJob.objects.filter(
            employer=request.user,
            approval_status=PostAJob.ApprovalStatus.APPROVED
        ).count()
        rejected = PostAJob.objects.filter(
            employer=request.user,
            approval_status=PostAJob.ApprovalStatus.REJECTED
        ).count()
 
        return Response({
            "stats": {
                "total_jobs": total,
                "pending_jobs": pending,
                "approved_jobs": approved,
                "rejected_jobs": rejected,
            },
            "jobs": serializer.data
        })

class JobSeekerJobListView(generics.ListAPIView):
    serializer_class = PostAJobSerializer
    permission_classes = [IsAuthenticated]
   
    def get_queryset(self):
        return PostAJob.objects.filter(
            is_published=True,
            approval_status=PostAJob.ApprovalStatus.APPROVED
        ).order_by(
            '-is_highlighted',
            '-highlighted_at',
            '-created_at'
        )
 
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
 
        # 🔍 Optional filters
        search = request.query_params.get("search")
        location = request.query_params.get("location")
        experience = request.query_params.get("experience")
 
        if search:
            queryset = queryset.filter(job_title__icontains=search)
 
        if location:
            queryset = queryset.filter(location__icontains=location)
 
        if experience:
            queryset = queryset.filter(experience__icontains=experience)
 
        serializer = self.get_serializer(queryset, many=True)
       
        return Response({
            'total_jobs': queryset.count(),
            'jobs': serializer.data
        })

class JobSeekerJobDetailView(generics.RetrieveAPIView):
    serializer_class = PostAJobSerializer
    permission_classes = [IsAuthenticated]
   
    def get_queryset(self):
        # ONLY approved + published jobs accessible
        return PostAJob.objects.filter(
            is_published=True,
            approval_status=PostAJob.ApprovalStatus.APPROVED
        )

# ============ JOB APPLICATION & SAVED JOBS ============

class ApplyJobView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobApplicationWriteSerializer
    parser_classes = [MultiPartParser, FormParser]
 
    # GET METHOD ONLY FOR EASY APPLY

    def get(self, request, *args, **kwargs):
 
        platform = JobseekerPlatformSettings.get_settings()
 
        # if easy apply OFF block GET method

        if not platform.easy_apply:
 
            return Response(

                {

                    "status": False,

                    "message": "Easy Apply is disabled."

                },

                status=status.HTTP_403_FORBIDDEN

            )
 
        user = request.user
 
        if not hasattr(user, 'jobseeker_profile'):
 
            return Response(

                {

                    "status": False,

                    "message": "Jobseeker profile not found."

                },

                status=status.HTTP_404_NOT_FOUND

            )
 
        profile = user.jobseeker_profile
 
        return Response(
    {
        "status": True,
        "data": {
            "full_name": profile.full_name,
            "date_of_birth": profile.dob,
            "marital_status": profile.marital_status,
            "phone_number": (
                profile.alternate_phone
                or
                user.phone
            ),
            "email": (
                profile.alternate_email
                or
                user.email
            ),
            "street": profile.street,
            "city": profile.city,
            "state": profile.state,
            "pincode": profile.pincode,
            "country": profile.country,
            "resume": (
                profile.resume_file.url
                if profile.resume_file
                else None
            )
        }
    },
    status=status.HTTP_200_OK
)
 
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(

            data=request.data

        )
 
        if not serializer.is_valid():
            print("❌ JOB APPLY VALIDATION ERROR:", serializer.errors)
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
 
        instance = serializer.save()
 
        run_application_flag_checks(

            instance,

            request

        )
 
        job = instance.job
        if (
            job.employer
            and
            hasattr(
                job.employer,
                'employer_profile'
            )
        ):
            NotificationService.create_notification(
                recipient=job.employer,
                title="New Job Application",
                message=(
                    f"New application received for "
                    f"'{job.job_title}' "
                    f"from {request.user.email}"
                ),
                category="alert",
                event_type="new_job_application",
                notification_type="application",
                related_object_id=job.id
            )
            NotificationService.create_notification(
                recipient=request.user,
                title="Application Submitted",
                message=(
                    f"You applied for "
                    f"'{job.job_title}'."
                ),
                category="application_update",
                event_type="application_submitted",
                notification_type="application",
                related_object_id=job.id
            )
        detail_serializer = (

            JobApplicationDetailSerializer(

                instance

            )

        )
 
        headers = self.get_success_headers(

            serializer.data

        )
 
        return Response(

            detail_serializer.data,

            status=status.HTTP_201_CREATED,

            headers=headers

        )
 
 

class AppliedJobsListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobApplicationListSerializer
 
    def get_queryset(self):
        return JobApplication.objects.filter(user=self.request.user)
 

class SaveJobView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

     

        platform = (
            JobseekerPlatformSettings.get_settings()
        )


        if not platform.save_jobs:

            return Response(
                {
                    "error": (
                        "Save jobs feature "
                        "is disabled."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = SavedJobSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:

            saved_job = serializer.save(
                user=request.user
            )



            job = saved_job.job


            NotificationService.create_notification(

                recipient=request.user,

                title="Job Saved",

                message=(

                    f"'{job.job_title}' "

                    f"was added to saved jobs."
                ),

                category="saved_job",

                event_type="job_saved",

                notification_type="system",

                related_object_id=job.id
            )

        except IntegrityError:

            raise ValidationError(
                {
                    "detail": (
                        "Job already saved"
                    )
                }
            )

        return Response(

            serializer.data,

            status=status.HTTP_201_CREATED
        )

    def delete(self, request, job_id):
        deleted, _ = SavedJob.objects.filter(
            user=request.user,
            job_id=job_id
        ).delete()
        if deleted == 0:
            return Response(
                {
                    "detail": (
                        "Saved job not found"
                    )
                },
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(
            {"message": "Removed successfully"},
            status=status.HTTP_204_NO_CONTENT
        )

class SavedJobsListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SavedJobSerializer
 
    def get_queryset(self):
        return (
            SavedJob.objects
            .filter(user=self.request.user)
            .select_related("job")
            .order_by("-saved_date")
        )
 

class WithdrawApplicationView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobApplicationDetailSerializer
    queryset = JobApplication.objects.all()
 
    def get_queryset(self):
        return JobApplication.objects.filter(user=self.request.user)
 
    '''def perform_update(self, serializer):
        application = serializer.instance
        if application.status == JobApplication.Status.WITHDRAWN:
            raise ValidationError("Application is already withdrawn.")
       
        application.status = JobApplication.Status.WITHDRAWN
        application.save()
       
        return Response(JobApplicationDetailSerializer(application).data)'''
    def perform_update(self, serializer):

        application = serializer.instance

        if (
            application.status
            ==
            JobApplication.Status.WITHDRAWN
        ):

            raise ValidationError(
                "Application is already withdrawn."
            )

    

        application.status = (
            JobApplication.Status.WITHDRAWN
        )

        application.save()

#------------------------------------------------------------------------------

        NotificationService.create_notification(

    recipient=application.job.employer,

    title="Application Withdrawn",

    message=(

        f"{application.user.username} "

        f"withdrew their application "

        f"for '{application.job.job_title}'."
    ),

    category="application_update",

    event_type="application_withdrawn",

    notification_type="application",

    related_object_id=application.id
)
        
        NotificationService.create_notification(

    recipient=application.user,

    title="Application Withdrawn",

    message=(

        f"You withdrew your application "

        f"for '{application.job.job_title}'."
    ),

    category="application_update",

    event_type="application_withdrawn",

    notification_type="application",

    related_object_id=application.id
)
 
#-------------------------------------------------------------------------------------
class JobApplicationDetailView(
    generics.RetrieveAPIView
):

    serializer_class = (
        JobApplicationListSerializer
    )

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            JobApplication.objects.filter(

                user=self.request.user

            ).filter(

                Q(expires_at__isnull=True)

                |

                Q(expires_at__gt=timezone.now())

            ).select_related(

                'job',

                'user'
            ).order_by(
                '-applied_date'
            )
        )

        return queryset
 

# ============ EMPLOYER APPLICATION VIEWS ============

class EmployerApplicationsListView(
    generics.ListAPIView
):

    permission_classes = [IsAuthenticated]

    serializer_class = (
        JobApplicationEmployerSerializer
    )

    def get_queryset(self):

        user = self.request.user

     

        if not hasattr(
            user,
            'employer_profile'
        ):

            return JobApplication.objects.none()


        jobs = PostAJob.objects.filter(

            employer=user,

            is_published=True
        )

    

        queryset = (
            JobApplication.objects.filter(

                job__in=jobs

            ).filter(

                Q(expires_at__isnull=True)

                |

                Q(expires_at__gt=timezone.now())

            ).select_related(

                'user',

                'job'
            ).order_by(
                '-applied_date'
            )
        )

        return queryset
    def get_total_experience_years(self, obj):
        try:
            profile = obj.user.jobseeker_profile
            # Handle None or empty values
            experience = profile.total_experience_years
            if experience is None:
                return 0
            # Convert to float if it's a Decimal
            return float(experience)
        except (JobSeekerProfile.DoesNotExist, AttributeError):
            return 0 

class EmployerApplicationStatusUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobApplicationEmployerSerializer
 
    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'employer_profile'):
            return JobApplication.objects.none()
       
        jobs = PostAJob.objects.filter(employer=user)
        return JobApplication.objects.filter(job__in=jobs)
 
    def perform_update(self, serializer):
        application = serializer.instance
        new_status = self.request.data.get('status')
       
        if not new_status:
            raise ValidationError({"status": "This field is required to update status."})
       
        if new_status not in [choice[0] for choice in JobApplication.Status.choices]:
            raise ValidationError({"status": f"Invalid status."})
       
        application.status = new_status
        application.save()
        '''Notification.objects.create(
    user=application.user,
    message=f"Your application for '{application.job.job_title}' has been updated to: {new_status.replace('_', ' ').title()}"   
    '''

#----------------------------------------------------------------------------------------------------------------------------------------
        platform = (
            JobseekerPlatformSettings.get_settings()
        )


        if platform.application_status_tracking:
                NotificationService.create_notification(

            recipient=application.user,

            title="Application Status Updated",

            message=(
                f"Your application for "
                f"'{application.job.job_title}' "
                f"has been updated to: "
                f"{new_status.replace('_', ' ').title()}"
            ),

            category="alert",

            event_type="application_status_updated",

            notification_type="application",

            related_object_id=application.id
        )
#---------------------------------------------------------------------------------------------------------------------------------------------------------- 
        return Response(JobApplicationEmployerSerializer(application).data)
 

# ============ NOTIFICATION VIEWS ============

class NotificationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
 
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
 

class MarkNotificationReadView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    queryset = Notification.objects.all()
 
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
 
    def perform_update(self, serializer):
        serializer.instance.is_read = True
        serializer.instance.save()
       

class MarkNotificationUnreadView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    queryset = Notification.objects.all()
 
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
 
    def perform_update(self, serializer):
        serializer.instance.is_read = False
        serializer.instance.save()
 

class DeleteNotificationView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Notification.objects.all()
 
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
 

class ClearAllNotificationsView(APIView):
    permission_classes = [IsAuthenticated]
 
    def delete(self, request):
        Notification.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
 

# ============ USER SETTINGS ============

class UserSettingsView(APIView):
    permission_classes = [IsAuthenticated]
 
    def get(self, request):
        settings, _ = UserSettings.objects.get_or_create(user=request.user)
        serializer = UserSettingsSerializer(settings)
        return Response(serializer.data)
 
    def patch(self, request):
        settings, _ = UserSettings.objects.get_or_create(user=request.user)
        serializer = UserSettingsSerializer(
            settings, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
 

# ============ CHAT VIEWS ============

class ConversationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ConversationSerializer
   
    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user)
   
    def get_serializer_context(self):
        return {'request': self.request}
 

class ConversationDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ConversationSerializer
   
    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user)
   
    def get_serializer_context(self):
        return {'request': self.request}
 

class ConversationMessagesView(APIView):
    permission_classes = [IsAuthenticated]
   
    def get(self, request, pk):
        conversation = get_object_or_404(Conversation, pk=pk)
       
        if request.user not in conversation.participants.all():
            return Response(
                {'error': 'You are not a participant in this conversation'},
                status=status.HTTP_403_FORBIDDEN
            )
       
        messages = conversation.messages.all()
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
 

class MarkConversationReadView(APIView):
    permission_classes = [IsAuthenticated]
   
    def post(self, request, pk):
        conversation = get_object_or_404(Conversation, pk=pk)
       
        if request.user not in conversation.participants.all():
            return Response(
                {'error': 'You are not a participant in this conversation'},
                status=status.HTTP_403_FORBIDDEN
            )
       
        conversation.messages.filter(
            receiver=request.user,
            is_read=False
        ).update(is_read=True)
       
        return Response({'status': 'conversation marked as read'})
 

class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]
   
    def post(self, request):
        serializer = SendMessageSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            message = serializer.save()
#--------------------------------------------------------------------------------------------------------------
            NotificationService.create_notification(
                recipient=message.receiver,
                title="New Message",
                message=(
                    f"You received a new message "
                    f"from {message.sender.username}."
                ),
                category="message",
                event_type="new_message",
                notification_type="message",
                related_object_id=message.id
            )
#----------------------------------------------------------------------------------------------------------------------
            return Response(
                MessageSerializer(message).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 

class UnreadCountView(APIView):
    permission_classes = [IsAuthenticated]
   
    def get(self, request):
        count = Message.objects.filter(
            receiver=request.user,
            is_read=False
        ).count()
        return Response({'unread_count': count})
 

class ConversationWithUserView(APIView):
    permission_classes = [IsAuthenticated]
   
    def get(self, request):
        other_user_id = request.query_params.get('user_id')
        if not other_user_id:
            return Response(
                {'error': 'user_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
       
        try:
            other_user = User.objects.get(id=other_user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
       
        conversation = Conversation.objects.filter(
            participants=request.user
        ).filter(
            participants=other_user
        ).first()
       
        if not conversation:
            conversation = Conversation.objects.create()
            conversation.participants.add(request.user, other_user)
       
        messages = conversation.messages.all()[:50]
        return Response({
            'conversation_id': conversation.id,
            'participants': ChatUserSerializer([request.user, other_user], many=True).data,
            'messages': MessageSerializer(messages, many=True).data
        })
 

class MarkMessageReadView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        message = get_object_or_404(Message, pk=pk)
        
        # Allow both participants to mark as read
        if message.receiver == request.user or message.sender == request.user:
            message.is_read = True
            message.save()
            return Response({'status': 'message marked as read'})
        
        return Response(
            {'error': 'You do not have permission to mark this message as read'},
            status=status.HTTP_403_FORBIDDEN
        )
 

class ChatUsersView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChatUserSerializer
   
    def get_queryset(self):
        return User.objects.exclude(id=self.request.user.id)
   

class EmployerInitiateChatView(APIView):
    permission_classes = [IsAuthenticated]
   
    def post(self, request):
        if request.user.user_type != 'employer':
            return Response(
                {'error': 'Only employers can initiate new conversations'},
                status=status.HTTP_403_FORBIDDEN
            )
       
        jobseeker_id = request.data.get('jobseeker_id')
        initial_message = request.data.get('message', '')
       
        if not jobseeker_id:
            return Response(
                {'error': 'jobseeker_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
       
        try:
            jobseeker = User.objects.get(id=jobseeker_id, user_type='jobseeker')
        except User.DoesNotExist:
            return Response(
                {'error': 'Jobseeker not found'},
                status=status.HTTP_404_NOT_FOUND
            )
       
        conversation = Conversation.objects.filter(
            participants=request.user
        ).filter(
            participants=jobseeker
        ).first()
       
        if not conversation:
            conversation = Conversation.objects.create(
                initiated_by=request.user
            )
            conversation.participants.add(request.user, jobseeker)
           
            if initial_message:
                message = Message.objects.create(
                    conversation=conversation,
                    sender=request.user,
                    receiver=jobseeker,
                    content=initial_message
                )
                return Response({
                    'status': 'Conversation started',
                    'conversation_id': conversation.id,
                    'message': MessageSerializer(message).data
                }, status=status.HTTP_201_CREATED)
       
        return Response({
            'status': 'Conversation exists',
            'conversation_id': conversation.id
        })    
   

@api_view(["POST"])
def chat_api(request):
    user_message = request.data.get("message")
 
    if not user_message:
        return Response({"error": "Message is required"}, status=400)
 
    user_msg = ChatMessage.objects.create(
        sender="user",
        message=user_message
    )
 
    bot_reply_text = generate_bot_reply(user_message)
 
    bot_msg = ChatMessage.objects.create(
        sender="bot",
        message=bot_reply_text
    )
 
    return Response({
        "user": ChatMessageSerializer(user_msg).data,
        "bot": ChatMessageSerializer(bot_msg).data
    })


def generate_bot_reply(user_text):
    text = user_text.lower()
 
    login_responses = [
        "You can log in as a jobseeker by clicking Login → Jobseeker and entering your registered email and password.",
        "To access your account, go to the Login page and choose the Jobseeker option.",
        "Simply click on Login, select your role, and enter your credentials to continue.",
        "Use your registered email and password in the Login section to access your dashboard."
    ]
 
    job_responses = [
        "You can browse available jobs from the Jobs section on your dashboard.",
        "Head over to the Jobs tab to explore current openings.",
        "All listed opportunities are available under the Jobs section.",
        "Visit the dashboard and click on Jobs to see matching positions."
    ]
 
    register_responses = [
        "Click on Register and fill in your details to create an account.",
        "To get started, select Register and complete the signup form.",
        "Choose Register, provide your information, and submit the form.",
        "You can create a new account by clicking the Register button."
    ]
 
    default_responses = [
        "Could you please provide more details so I can assist you better?",
        "I'm here to help. Can you clarify your question?",
        "Let me know a bit more information so I can guide you properly.",
        "Can you explain your concern in more detail?"
    ]
 
    if "login" in text:
        return random.choice(login_responses)
    elif "job" in text:
        return random.choice(job_responses)
    elif "register" in text:
        return random.choice(register_responses)
 
    return random.choice(default_responses)


# ============ HELP & TICKET VIEWS ============

@api_view(['GET'])
def help_topics(request):
    topics = HelpTopic.objects.all().order_by('-id')
    serializer = HelpTopicSerializer(topics, many=True)
    return Response({
        "status": True,
        "message": "Help topics fetched successfully",
        "data": serializer.data
    })
 

class RaiseTicketCreateView(APIView):
 
    parser_classes = [
        MultiPartParser,
        FormParser,
        JSONParser
    ]
 
    def get(self, request):
        return Response({
            "status": True,
            "message": "Raise Ticket API Working"
        })
 
    def post(self, request):
        serializer = RaiseTicketSerializer(
            data=request.data
        )
        if serializer.is_valid():
            ticket = serializer.save()

            admins = User.objects.filter(
                user_type="admin"
            )
            for admin in admins:
                NotificationService.create_notification(
                    recipient=admin,
                    title="New Support Ticket",
                    message=(
                        f"A new support ticket "
                        f"was raised by "
                        f"{ticket.name}."
                    ),
                    category="alert",
                    event_type="support_ticket_created",
                    notification_type="system",
                    related_object_id=ticket.id
                )

            if request.user.is_authenticated:
                NotificationService.create_notification(
                    recipient=request.user,
                    title="Ticket Submitted",
                    message=(
                        "Your support ticket "
                        "has been submitted successfully."
                    ),
                    category="system",
                    event_type="ticket_submitted",
                    notification_type="system",
                    related_object_id=ticket.id
                )
            return Response(
                {
                    "status": True,
                    "message": (
                        "Ticket submitted successfully"
                    ),
                    "data": AdminTicketSerializer(
                        ticket,
                        context={'request': request}
                    ).data
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            {
                "status": False,
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )
        
# Inside views.py
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes

@api_view(['POST'])
@permission_classes([AllowAny]) # Allows unauthenticated creation safely during signup
def company_profile_create_view(request):
    email = request.data.get('employer_email')
    
    # If it's a tokenless multi-step registration request
    if email:
        user = get_object_or_404(User, email=email)
    else:
        # Fall back to standard session token validation if logging in normally
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required"}, status=401)
        user = request.user

    # Process Form data using 'user' variable instead of request.user...
 
 
# ADMIN LIST TICKETS
class AdminTicketListView(APIView):
 
    permission_classes = [
        IsAuthenticated,
        IsAdminUser
    ]
 
    def get(self, request):
 
        tickets = RaiseTicket.objects.all().order_by(
            '-created_at'
        )
 
        serializer = AdminTicketSerializer(
            tickets,
            many=True,
            context={'request': request}
        )
 
        return Response({
            "status": True,
            "count": tickets.count(),
            "data": serializer.data
        })
   
class AdminTicketUpdateView(APIView):
 
    permission_classes = [
        IsAuthenticated,
        IsAdminUser
    ]
 
    VALID_STATUSES = [
        "Pending",
        "In Progress",
        "Hold",
        "Resolved"
    ]
 
    def patch(self, request, pk):
 
        try:
 
            ticket = RaiseTicket.objects.get(
                id=pk
            )
 
        except RaiseTicket.DoesNotExist:
 
            return Response(
                {
                    "status": False,
                    "message": "Ticket not found"
                },
 
                status=status.HTTP_404_NOT_FOUND
            )
 
        old_status = ticket.status
 
        new_status = request.data.get(
            "status"
        )
 
        if not new_status:
 
            return Response(
                {
                    "status": False,
                    "message": "status field is required"
                },
 
                status=status.HTTP_400_BAD_REQUEST
            )
 
        if new_status not in self.VALID_STATUSES:
 
            return Response(
                {
                    "status": False,
                    "message": "Invalid status"
                },
 
                status=status.HTTP_400_BAD_REQUEST
            )
 
        ticket.status = new_status
 
        # AUTO RESOLVED DATE
        if new_status == "Resolved":
 
            ticket.resolved_on = timezone.now().date()
 
        else:
 
            ticket.resolved_on = None
 
        ticket.save()
 
        # NOTIFY TICKET OWNER
        user = User.objects.filter(
            email=ticket.email
        ).first()
 
        if user:
 
            NotificationService.create_notification(
 
                recipient=user,
 
                title="Ticket Status Updated",
 
                message=(
                    f"Your support ticket "
                    f"status changed from "
                    f"{old_status} to "
                    f"{new_status}."
                ),
 
                category="system",
 
                event_type="ticket_status_updated",
 
                notification_type="system",
 
                related_object_id=ticket.id
            )
 
        return Response({
            "status": True,
 
            "message": (
                "Ticket status updated successfully"
            ),
 
            "data": AdminTicketSerializer(
                ticket,
                context={'request': request}
            ).data
        })
 
class AdminTicketDeleteView(APIView):
 
    permission_classes = [
        IsAuthenticated,
    ]
 
    def delete(self, request, pk):
 
        try:
 
            ticket = RaiseTicket.objects.get(
                id=pk
            )
 
        except RaiseTicket.DoesNotExist:
 
            return Response(
                {
                    "status": False,
                    "message": "Ticket not found"
                },
 
                status=status.HTTP_404_NOT_FOUND
            )
 
        # CHECK PERMISSION
        is_admin = (
            hasattr(request.user, "user_type") and
            request.user.user_type == "admin"
        )
 
        is_ticket_owner = (
            request.user.email == ticket.email
        )
 
        if not is_admin and not is_ticket_owner:
 
            return Response(
                {
                    "status": False,
                    "message": (
                        "You do not have permission "
                        "to delete this ticket"
                    )
                },
 
                status=status.HTTP_403_FORBIDDEN
            )
 
        # SEND NOTIFICATION
        user = User.objects.filter(
            email=ticket.email
        ).first()
 
        if user:
 
            NotificationService.create_notification(
 
                recipient=user,
 
                title="Support Ticket Removed",
 
                message=(
                    f"Your support ticket "
                    f"'{ticket.subject}' "
                    f"is no longer available."
                ),
 
                category="alert",
 
                event_type="ticket_deleted",
 
                notification_type="system",
 
                related_object_id=ticket.id
            )
 
        # DELETE ATTACHMENT
        if ticket.attachment:
 
            ticket.attachment.delete(
                save=False
            )
 
        # DELETE TICKET
        ticket.delete()
 
        return Response({
            "status": True,
            "message": "Ticket deleted successfully"
        })
 
# ============ PASSWORD MANAGEMENT ============

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
 
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data, context={'request': request})
       
        if serializer.is_valid():
            user = serializer.context['user']
           
            PasswordResetToken.objects.filter(user=user, is_used=False).delete()
                     
            token = generate_token()
            reset_token = PasswordResetToken.objects.create(
                user=user,
                token=token,
                expires_at=timezone.now() + timedelta(hours=24)
            )
           
            try:
                send_password_reset_email(user, token, request)
                return Response({
                    "message": "Password reset instructions have been sent to your email."
                }, status=status.HTTP_200_OK)
            except Exception as e:
                reset_token.delete()
                return Response({
                    "error": "Failed to send email. Please try again."
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
       
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 

class ResetPasswordConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordConfirmSerializer(data=request.data)

        if serializer.is_valid():
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']

            try:
                reset_token = PasswordResetToken.objects.get(
                    token=token,
                    is_used=False
                )
                if not reset_token.is_valid():
                    return Response({
                        "error": "Token has expired."
                    }, status=400)

                user = reset_token.user

                user.set_password(new_password)
                user.is_active = True

                if hasattr(user, "is_verified"):
                    user.is_verified = True

                user.save()
#--------------------------------------------------------------------------------------------------
                NotificationService.create_notification(
                    recipient=user,
                    title="Password Reset Successful",
                    message=(
                        "Your account password "
                        "has been reset successfully."
                    ),
                    category="security",
                    event_type="password_reset_success",
                    notification_type="system"
                )
#--------------------------------------------------------------------------------------------------------

                reset_token.is_used = True
                reset_token.save()

                refresh = RefreshToken.for_user(user)

                return Response({
                    "message": "Password has been reset successfully.",
                    "access": str(refresh.access_token),
                    "refresh": str(refresh)
                }, status=200)

            except PasswordResetToken.DoesNotExist:
                return Response({
                    "error": "Invalid or expired token."
                }, status=400)

        return Response(serializer.errors, status=400)
 

class CreatePasswordView(APIView):
    permission_classes = [AllowAny]
 
    def post(self, request):
        serializer = CreatePasswordSerializer(data=request.data)
       
        if serializer.is_valid():
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']
           
            try:
                reset_token = PasswordResetToken.objects.get(token=token, is_used=False)
               
                if not reset_token.is_valid():
                    return Response({
                        "error": "Token has expired."
                    }, status=status.HTTP_400_BAD_REQUEST)
               
                user = reset_token.user
               
                if user.password and not user.password.startswith('!'):
                    return Response({
                        "error": "Password already set. Please use forgot password if you need to reset it."
                    }, status=status.HTTP_400_BAD_REQUEST)
               
                user.set_password(new_password)
                user.save()
               
                reset_token.is_used = True
                reset_token.save()
               
                refresh = RefreshToken.for_user(user)
               
                return Response({
                    "message": "Password created successfully.",
                    "access": str(refresh.access_token),
                    "refresh": str(refresh)
                }, status=status.HTTP_200_OK)
               
            except PasswordResetToken.DoesNotExist:
                return Response({
                    "error": "Invalid or expired token."
                }, status=status.HTTP_400_BAD_REQUEST)
       
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 

class ValidateResetTokenView(APIView):
    permission_classes = [AllowAny]
 
    def post(self, request):
        token = request.data.get('token')
       
        if not token:
            return Response({
                "valid": False,
                "error": "Token is required."
            }, status=status.HTTP_400_BAD_REQUEST)
       
        try:
            reset_token = PasswordResetToken.objects.get(token=token, is_used=False)
           
            if reset_token.is_valid():
                return Response({
                    "valid": True,
                    "message": "Token is valid."
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "valid": False,
                    "message": "Token has expired."
                }, status=status.HTTP_200_OK)
               
        except PasswordResetToken.DoesNotExist:
            return Response({
                "valid": False,
                "message": "Invalid token."
            }, status=status.HTTP_200_OK)
 

class AdminCreatePasswordTokenView(APIView):
    permission_classes = [IsAdminUser]
 
    def post(self, request):
        user_id = request.data.get('user_id')
       
        if not user_id:
            return Response({
                "error": "user_id is required."
            }, status=status.HTTP_400_BAD_REQUEST)
       
        try:
            user = User.objects.get(id=user_id)
           
            PasswordResetToken.objects.filter(user=user, is_used=False).delete()
           
            token = generate_token()
            reset_token = PasswordResetToken.objects.create(
                user=user,
                token=token,
                expires_at=timezone.now() + timedelta(days=7)  
            )
           
            setup_link = f"{request.scheme}://{request.get_host()}/create-password?token={token}"
           
            return Response({
                "message": "Password creation token generated successfully.",
                "token": token,
                "setup_link": setup_link
            }, status=status.HTTP_200_OK)
           
        except User.DoesNotExist:
            return Response({
                "error": "User not found."
            }, status=status.HTTP_404_NOT_FOUND)    
       

# ============ CONTACT US ============

class ContactMessageCreateAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data.copy()
        user = request.user if request.user.is_authenticated else None
        
        # Don't override anything - trust frontend values
        # Just save as-is

        serializer = ContactMessageSerializer(data=data)

        if serializer.is_valid():
            serializer.save(user=user)
            return Response(
                {
                    "status": True,
                    "message": "Message sent successfully",
                    "data": serializer.data
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            {
                "status": False,
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
class ContactMessageListAPIView(APIView):
 
    #permission_classes = [IsAuthenticated, IsAdminUserType]
 
    def get(self, request):
 
        messages = ContactMessage.objects.all().order_by("-created_at")
 
        serializer = ContactMessageSerializer(
            messages,
            many=True
        )
 
        return Response(
            {
                "status": True,
                "count": messages.count(),
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )

    
#for admin update status only
class ContactMessageStatusUpdateAPIView(APIView):
 
    #permission_classes = [IsAuthenticated,IsAdminUserType]
 
    def patch(self, request, pk):
 
        try:
 
            message = ContactMessage.objects.get(id=pk)
 
        except ContactMessage.DoesNotExist:
 
            return Response(
                {
                    "status": False,
                    "message": "Contact message not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )
 
        status_value = request.data.get("status")
 
        valid_status = [
            choice[0]
            for choice in ContactMessage.Status.choices
        ]
 
        if status_value not in valid_status:
 
            return Response(
                {
                    "status": False,
                    "message": f"Invalid status. Allowed values: {valid_status}"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
 
        message.status = status_value
        message.save()
 
        serializer = ContactMessageSerializer(message)
 
        return Response(
            {
                "status": True,
                "message": "Status updated successfully",
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )


class ContactMessageDeleteAPIView(APIView):

    # permission_classes = [
    #     IsAuthenticated,
    #     IsAdminUserType
    # ]

    def delete(self, request, pk):

        try:
            message = ContactMessage.objects.get(id=pk)

        except ContactMessage.DoesNotExist:

            return Response(
                {
                    "status": False,
                    "message": "Contact message not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        message.delete()

        return Response(
            {
                "status": True,
                "message": "Contact message deleted successfully"
            },
            status=status.HTTP_200_OK
        )
               

# ============ NEWSLETTER ============

class NewsletterSubscribeAPIView(APIView):
    def post(self, request):
        email = request.data.get("email")
        print(request.data)
 
        if not email:
            return Response(
                {"error": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
 
        if NewsletterSubscriber.objects.filter(email=email).exists():
            return Response(
                {"message": "Email already subscribed"},
                status=status.HTTP_400_BAD_REQUEST
            )
 
        serializer = NewsletterSubscriberSerializer(data={"email": email})
 
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Subscribed successfully"},
                status=status.HTTP_201_CREATED
            )
 
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============ COMPANY VERIFICATION ============

class SubmitCompanyVerification(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        if request.user.user_type != "employer":
            return Response(
                {
                    "error": (
                        "Only employers can submit "
                        "company verification"
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )
        if CompanyVerification.objects.filter(employer=request.user).exists():
            return Response({
                "error": "You already submitted verification"
            })
        serializer = (
            CompanyVerificationSerializer(
                data=request.data,
                context={
                    'request': request
                }
            )
        )
        if serializer.is_valid():
            serializer.save(
                employer=request.user
            )
            return Response(
                {
                    "message": (
                        "Verification submitted "
                        "successfully"
                    ),
                    "status": "pending"
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class CompanyVerificationAction(APIView):
    permission_classes = [IsAdminUser]
 
    def patch(self, request, pk):
        try:
            verification = CompanyVerification.objects.get(id=pk)
        except CompanyVerification.DoesNotExist:
            return Response({"error": "Verification not found"}, status=404)
 
        status_value = request.data.get("status")
 
        if status_value not in ["Verified", "reject"]:
            return Response({"error": "Invalid status"})
 
        verification.status = status_value
        verification.save()
#-------------------------------------------------------------------------------------
        NotificationService.create_notification(
            recipient=verification.employer,
            title="Company Verification Updated",
            message=(
                f"Your company verification "
                f"request was "
                f"{status_value}."
            ),
            category="verification",
            event_type="company_verification_updated",
            notification_type="system",
            related_object_id=verification.id
        )
#-------------------------------------------------------------------------------------------------------  
        return Response({
            "message": f"Company {status_value} successfully"
        })

# ============ COMPANY PROFILE VIEWS ============

class CompanyProfileCreateView(APIView):

    permission_classes = [IsEmployerOrAdmin]

    def post(self, request):
        
        subscription = (
            Subscription.objects.filter(
                user=request.user,
                status='active'
            ).select_related(
                'plan'
            ).first()
        )
        platform = None

        if subscription:
            platform = (
                EmployerPlatformSettings.objects.filter(
        
                    plan=subscription.plan,
        
                    account_status=request.user.status
        
                ).first()
            )

        if (
            hasattr(
                request.user,
                'employer_profile'
            )
            and
            request.user.employer_profile.company
        ):
            if (
                not platform
                or
                not platform.allow_multiple_company
            ):
                return Response(
                    {
                        "error": (
                            "You are already "
                            "linked to a company"
                        )
                    },
                    status=400
                )

     

        company_name = request.data.get(
            'company_name'
        )

        existing_company = (
            CompanyProfile.objects.filter(
                company_name__iexact=company_name
            ).first()
        )

        if existing_company:

            return Response(
                {
                    "error": (
                        f"A company with the name "
                        f"'{company_name}' already "
                        f"exists. Please use a "
                        f"different name."
                    )
                },
                status=400
            )

 

        serializer = CompanyProfileSerializer(
            data=request.data,
            context={
                'request': request,
                'platform': platform
            }
        )

        if serializer.is_valid():
            company = serializer.save()

            if hasattr(
                request.user,
                'employer_profile'
            ):

                request.user.employer_profile.company = (
                    company
                )
                request.user.employer_profile.save()

            return Response(
                {
                    "message": (
                        "Company profile created "
                        "successfully"
                    ),
                    "company_id": company.id,
                    "company_name": (
                        company.company_name
                    ),
                    "is_existing": False
                },
                status=201
            )
        NotificationService.create_notification(
            recipient=request.user,
            title="Company Profile Created",
            message=(
                f"Your company profile "
                f"'{company.company_name}' "
                f"has been created successfully."
            ),
            category="company",
            event_type="company_profile_created",
            notification_type="system",
            related_object_id=company.id
        )
        return Response(
            serializer.errors,
            status=400
        )
 
class CompanyProfileDetailView(APIView):

    permission_classes = [IsEmployerOrAdmin]
 
    def get(self, request):

        # Get company through employer profile instead of user field

        if not hasattr(request.user, 'employer_profile'):

            return Response({"error": "Employer profile not found"}, status=404)

        company = request.user.employer_profile.company

        if not company:

            return Response({"error": "No company linked to this employer"}, status=404)
 
        serializer = CompanyProfileSerializer(

            company,

            context={'request': request}

        )
 
        return Response(serializer.data)

 
class CompanyProfileUpdateView(APIView):

    permission_classes = [IsEmployerOrAdmin]

    def patch(self, request):

        # Get company through employer profile

        if not hasattr(request.user, 'employer_profile'):

            return Response({"error": "Employer profile not found"}, status=404)

        company = request.user.employer_profile.company

        if not company:

            return Response({"error": "No company linked to this employer"}, status=404)

        serializer = CompanyProfileSerializer(

            company,

            data=request.data,

            partial=True,

            context={'request': request}

        )
 
        if serializer.is_valid():

            serializer.save()

            return Response({

                "message": "Profile updated successfully",

                "data": serializer.data

            }, status=200)

        return Response(serializer.errors, status=400)


class CompanyProfileListView(APIView):
    """
    List all companies - Public access
    For employers, shows their own company
    For public/other users, shows all companies
    """
    permission_classes = [AllowAny]
 
    def get(self, request):
        # Start with all companies
        companies = CompanyProfile.objects.all().order_by('-created_at')
        
        # If authenticated employer, optionally filter to their company
        if request.user.is_authenticated:
            if request.user.user_type == 'employer':
                employer_profile = getattr(request.user, 'employer_profile', None)
                if employer_profile and employer_profile.company:
                    # Employers see only their company
                    companies = companies.filter(id=employer_profile.company.id)
        
        serializer = CompanyProfileSerializer(
            companies,
            many=True,
            context={'request': request}
        )
        
        return Response(serializer.data, status=200)
 
 
class CompanyProfileByIdView(APIView):
    permission_classes = [AllowAny]
 
    def get(self, request, company_id):
        try:
            company = CompanyProfile.objects.get(id=company_id)

            # ONLY check permissions if user is authenticated AND is an employer
            if request.user.is_authenticated:
                if request.user.user_type == 'employer':
                    employer_profile = getattr(request.user, 'employer_profile', None)
                    if employer_profile and employer_profile.company_id != company_id:
                        return Response(
                            {"error": "You don't have permission to view this company"}, 
                            status=403
                        )
            
            serializer = CompanyProfileSerializer(
                company,
                context={'request': request}
            )
            
            return Response(serializer.data, status=200)
 
        except CompanyProfile.DoesNotExist:
            return Response(
                {"error": "Company not found"},
                status=404
            )
        
class LinkToExistingCompanyView(APIView):
    permission_classes = [IsEmployerOrAdmin]
    
    def post(self, request):
        company_name = request.data.get('company_name')
        
        if not company_name:
            return Response({"error": "Company name is required"}, status=400)
        
        # Find existing company (case-insensitive)
        company = CompanyProfile.objects.filter(company_name__iexact=company_name).first()
        
        if not company:
            return Response({"error": "Company not found. Please create a new company."}, status=404)
        
        # Check if employer already has a company
        if hasattr(request.user, 'employer_profile') and request.user.employer_profile.company:
            return Response({
                "error": f"You are already linked to company: {request.user.employer_profile.company.company_name}"
            }, status=400)
        
        # Link employer to existing company
        if hasattr(request.user, 'employer_profile'):
            request.user.employer_profile.company = company
            request.user.employer_profile.save()
            
            return Response({
                "message": f"Successfully linked to existing company: {company.company_name}",
                "company_id": company.id,
                "company_name": company.company_name,
                "is_existing": True
            }, status=200)
        
        return Response({"error": "Employer profile not found"}, status=400)        
 
    

# ============ OTP VIEWS ============

class SendEmailOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response({"error": "Email is required"}, status=400)

        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already registered"}, status=400)

        otp = generate_otp()

        EmailOTP.objects.create(
            email=email,
            otp=otp,
            purpose="email_verification",
            expires_at=timezone.now() + timedelta(minutes=10)
        )

        send_email_otp(email, otp, "signup")

        return Response({"message": "OTP sent to email"})


class VerifyEmailOTPView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
        otp_obj = EmailOTP.objects.filter(
            email=email,
            otp=otp,
            purpose="email_verification",
            is_verified=False
        ).last()
        if not otp_obj or not otp_obj.is_valid():
            return Response(
                {"error": "Invalid or expired OTP"},
                status=400
            )
        otp_obj.is_verified = True
        otp_obj.save()
        # check user exists
        user = User.objects.filter(email=email).first()
        if user:
            user.login_time = timezone.now()
            user.save(update_fields=["login_time"])
        return Response({
            "message": "Email verified successfully"
        })


class SendLoginOTPView(APIView):
    permission_classes = [AllowAny]
 
    def post(self, request):
        email = request.data.get("email")
 
        if not email:
            return Response({"error": "Email is required"}, status=400)
 
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"error": "User not found. Please sign up first."}, status=404)
 
        EmailOTP.objects.filter(email=email, purpose="login").delete()
 
        otp = generate_4digit_otp()
 
        EmailOTP.objects.create(
            email=email,
            otp=otp,
            purpose="login",
            expires_at=timezone.now() + timedelta(minutes=5)
        )
 
        send_email_otp(email, otp, "login")
 
        print(f"🔐 Login OTP for {email}: {otp}")
 
        return Response({"message": "OTP sent successfully"})
 

class VerifyLoginOTPView(APIView):
    permission_classes = [AllowAny]
 
    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
 
        if not email or not otp:
            return Response({"error": "Email and OTP are required"}, status=400)
 
        if len(otp) != 4:
            return Response({"error": "OTP must be 4 digits"}, status=400)
 
        otp_obj = EmailOTP.objects.filter(
            email=email,
            otp=otp,
            purpose="login",
            is_verified=False
        ).last()
 
        if not otp_obj or not otp_obj.is_valid():
            return Response({"error": "Invalid or expired OTP"}, status=400)
 
        otp_obj.is_verified = True
        otp_obj.save()
 
        user = User.objects.get(email=email)
        refresh = RefreshToken.for_user(user)
        from django.utils import timezone
        user.login_time = timezone.now()
        user.save(update_fields=["login_time"])
 
        return Response({
            "message": "Login successful",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "user_type": user.user_type
            }
        })
 

# ============ REPORT A JOB ============

class SubmitComplaintView(APIView):
 
    permission_classes = [
        IsAuthenticated,
        IsJobSeeker
    ]
 
    def post(self, request, job_id):
 
        try:
 
            job = PostAJob.objects.get(
                id=job_id
            )
 
        except PostAJob.DoesNotExist:
 
            return Response(
                {"error": "Job not found"},
                status=404
            )
 
        serializer = ComplaintSerializer(
 
            data=request.data,
 
            context={
                'request': request
            }
        )
 
        if serializer.is_valid():
 
            # Prevent duplicate complaint
            if Complaint.objects.filter(
                user=request.user,
                reported_job=job
            ).exists():
 
                return Response(
                    {
                        "error":
                        "You already submitted "
                        "complaint for this job"
                    },
                    status=400
                )
            complaint = serializer.save(
                user=request.user,
                reported_job=job
            )
# ---------------------------------------------------------------------------------------------------------------------

            admins = User.objects.filter(
                user_type="admin"
            )
            for admin in admins:
                NotificationService.create_notification(
                    recipient=admin,
                    title="New Complaint Submitted",
                    message=(
                        f"{request.user.username} "
                        f"submitted a complaint."
                    ),
                    category="alert",
                    event_type="complaint_submitted",
                    notification_type="system",
                    related_object_id=complaint.id
                )
# ---------------------------------------------------------------------------------------------------------------------

            NotificationService.create_notification(
                recipient=request.user,
                title="Complaint Submitted",
                message=(
                    "Your complaint "
                    "has been submitted successfully."
                ),
                category="system",
                event_type="complaint_submitted",
                notification_type="system",
                related_object_id=complaint.id
            )
# ---------------------------------------------------------------------------------------------------------------------

            return Response(
                {
                    "message":
                    "Complaint submitted successfully"
                },
                status=status.HTTP_201_CREATED
            )
 
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class CompanyVerificationStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get verification status for the logged-in employer
        Returns: { status: 'pending'/'approved'/'rejected'/'not_submitted', is_verified: true/false }
        """
        if request.user.user_type != 'employer':
            return Response(
                {"error": "Only employers can access this endpoint"},
                status=status.HTTP_403_FORBIDDEN
            )

        verification = CompanyVerification.objects.filter(
            employer=request.user
        ).order_by("-id").first()

        if not verification:
            return Response({
                "status": "not_submitted",
                "is_verified": False
            }, status=status.HTTP_200_OK)

        return Response({
            "status": verification.status,
            "is_verified": verification.status == "Verified"
        }, status=status.HTTP_200_OK)
 

class AdminComplaintListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserType]
 
    def get(self, request):
        complaints = Complaint.objects.all().order_by('-created_at')
 
        status_filter = request.GET.get("status")
        if status_filter:
            complaints = complaints.filter(status=status_filter)
 
        serializer = ComplaintSerializer(complaints, many=True)
        return Response(serializer.data)
 

class AdminUpdateComplaintView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserType]
 
    def patch(self, request, pk):
        try:
            complaint = Complaint.objects.get(id=pk)
        except Complaint.DoesNotExist:
            return Response({"error": "Not found"}, status=404)
 
        complaint.status = request.data.get("status", complaint.status)
        complaint.save()
#---------------------------------------------------------------------------------------------------------------------
        NotificationService.create_notification(
        recipient=complaint.user,
        title="Complaint Status Updated",
        message=(
            f"Your complaint status "
            f"has been updated to "
            f"'{complaint.status}'."
        ),
        category="alert",
        event_type="complaint_status_updated",
        notification_type="complaint",
        related_object_id=complaint.id
    )
#-----------------------------------------------------------------------------------------------------------------------
 
        return Response({"message": "Status updated"})
    
# ============ BILLING VIEWS ============

from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.utils.timezone import now
from datetime import timedelta
import razorpay
from decimal import Decimal
import random
import string
from datetime import datetime
 
from .models import *
from .serializers import *
from .services import create_order
from .utils import calculate_gst, generate_invoice_number, generate_invoice_pdf

client = razorpay.Client(auth=(settings.RAZORPAY_KEY, settings.RAZORPAY_SECRET))
 
 
from decimal import Decimal
 
class PlanListView(APIView):
    permission_classes = [IsAuthenticated]
   
    def get(self, request):
        plans = Plan.objects.all()
        duration = request.query_params.get('duration', 'monthly')
       
        data = []
        for plan in plans:
            pricing = self.calculate_pricing_with_discount(plan, duration)
           
            plan_data = {
                'id': plan.id,
                'name': plan.name,
                'monthly_price': float(plan.monthly_price),
                'duration_days': plan.duration_days,
                'pricing': pricing,
                'color' : plan.color
            }
            data.append(plan_data)
       
        return Response(data)
   
    def calculate_pricing_with_discount(self, plan, duration):
        # Convert to Decimal
        monthly_price = Decimal(str(plan.monthly_price))
       
        if duration == 'monthly':
            multiplier = Decimal('1')
            discount_percent = Decimal('0')
            duration_days = plan.duration_days
            duration_text = 'Monthly'
           
        elif duration == '6_months':
            multiplier = Decimal('6')
            discount_percent = Decimal('10')
            duration_days = 180
            duration_text = '6 Months'
           
        elif duration == 'yearly':
            multiplier = Decimal('12')
            discount_percent = Decimal('15')
            duration_days = 365
            duration_text = 'Yearly'
           
        else:
            multiplier = Decimal('1')
            discount_percent = Decimal('0')
            duration_days = plan.duration_days
            duration_text = 'Monthly'
       
        # All calculations using Decimal
        original_price = monthly_price * multiplier
        discount_amount = original_price * (discount_percent / Decimal('100'))
        subtotal = original_price - discount_amount
       
        cgst = subtotal * Decimal('0.09')
        sgst = subtotal * Decimal('0.09')
        total = subtotal + cgst + sgst
       
        return {
            'duration': duration_text,
            'duration_days': duration_days,
            'monthly_price': float(round(monthly_price, 2)),
            'original_price': float(round(original_price, 2)),
            'discount_percent': int(discount_percent),
            'discount_amount': float(round(discount_amount, 2)),
            'subtotal': float(round(subtotal, 2)),
            'cgst': float(round(cgst, 2)),
            'sgst': float(round(sgst, 2)),
            'total': float(round(total, 2)),
            'savings': float(round(original_price - subtotal, 2)) if discount_percent > 0 else None
        }
   

class CreatePlanView(APIView):  # newly added 14-05

    #permission_classes = [IsAuthenticated,IsAdminUserType]

    def post(self, request):

        serializer = PlanSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        plan = serializer.save()
        employers = User.objects.filter(
    user_type="employer"
)

        for employer in employers:
#--------------------------------------------------------------------------------------
            NotificationService.create_notification(

                recipient=employer,

                title="New Subscription Plan",

                message=(
                    f"A new subscription plan "
                    f"'{plan.name}' "
                    f"is now available."
                ),

                category="announcement",

                event_type="new_subscription_plan",

                notification_type="system",

                related_object_id=plan.id
            )
#---------------------------------------------------------------------------------------------
        # Create settings for this plan

        EmployerPlatformSettings.objects.get_or_create(
            plan=plan
        )

        return Response(
            {
                "message": (
                    "Plan created successfully"
                ),
                "data": PlanSerializer(plan).data
            },
            status=status.HTTP_201_CREATED
        )

# class PlanListView(APIView):
#     def get(self, request):
#         return Response(PlanSerializer(Plan.objects.all(), many=True).data)


class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get("plan_id")
        duration = request.data.get("duration", "monthly")  # 'monthly', '6_months', 'yearly'
        
        plan = get_object_or_404(Plan, id=plan_id)
        
        # =============================================
        # CRITICAL: Correct price calculation
        # =============================================
        from decimal import Decimal
        monthly_price = Decimal(str(plan.monthly_price))
        
        if duration == 'monthly':
            multiplier = Decimal('1')
            discount_percent = Decimal('0')
            duration_days = plan.duration_days
            
        elif duration == '6_months':
            multiplier = Decimal('6')
            discount_percent = Decimal(str(plan.discount_halfyear)) if plan.discount_halfyear else Decimal('0')
            duration_days = 180
            
        elif duration == 'yearly':
            multiplier = Decimal('12')
            discount_percent = Decimal(str(plan.discount_annual)) if plan.discount_annual else Decimal('0')
            duration_days = 365
            
        else:
            multiplier = Decimal('1')
            discount_percent = Decimal('0')
            duration_days = plan.duration_days
        
        # Calculate price
        base_price = monthly_price * multiplier
        discount_amount = base_price * (discount_percent / Decimal('100'))
        price_after_discount = base_price - discount_amount
        
        # Calculate GST (tax from plan)
        tax_rate = Decimal(str(plan.tax)) if plan.tax else Decimal('18')
        gst_amount = price_after_discount * (tax_rate / Decimal('100'))
        total_price = price_after_discount + gst_amount
        
        # Create Razorpay order
        import razorpay
        from django.conf import settings
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY, settings.RAZORPAY_SECRET))
        
        order = client.order.create({
            "amount": int(total_price * 100),  # Convert to paise
            "currency": "INR",
            "payment_capture": 1
        })
        
        # =============================================
        # FIX: Remove 'payment_data' - Payment model doesn't have this field
        # Store calculation data separately or use JSON field if available
        # =============================================
        payment = Payment.objects.create(
            user=request.user,
            plan=plan,
            razorpay_order_id=order["id"],
            amount=total_price,
            status="pending",
        )
        
        # Optional: Store price breakdown in a separate variable or log it
        price_breakdown = {
            'duration': duration,
            'duration_days': duration_days,
            'base_price': float(base_price),
            'discount_percent': float(discount_percent),
            'discount_amount': float(discount_amount),
            'price_after_discount': float(price_after_discount),
            'tax_rate': float(tax_rate),
            'tax_amount': float(gst_amount),
            'cgst': float(gst_amount / 2),
            'sgst': float(gst_amount / 2),
            'total': float(total_price)
        }
        
        # Log for debugging
        print(f"Price breakdown for {plan.name} ({duration}): {price_breakdown}")
        
        return Response({
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "payment_db_id": payment.id,
            "razorpay_key": settings.RAZORPAY_KEY,
            "duration": duration,
            "duration_days": duration_days,
            "plan": {
                "id": plan.id,
                "name": plan.name,
                "color": plan.color,
                "summary": plan.summary
            },
            "price_breakdown": price_breakdown
        })
 
from django.utils import timezone
 
class CurrentSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]
 
    def get(self, request):
 
        sub = Subscription.objects.filter(
            user=request.user,
            status='active'
        ).order_by('-start_date').first()
 
        if not sub:
            sub = Subscription.objects.filter(
                user=request.user,
                status='cancelled'
            ).order_by('-start_date').first()
 
        if not sub:
            return Response({})
 
        data = SubscriptionSerializer(sub).data
 
        data["is_expired"] = (
            sub.status == "cancelled"
            and sub.end_date
            and sub.end_date < timezone.now()
        )
 
        return Response(data)
    
    

from django.utils import timezone

class CancelSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]
 
    # ─────────────────────────────────────
    # CANCEL SUBSCRIPTION
    # → DOWNGRADE TO FREE PLAN
    # ─────────────────────────────────────
 
    def post(self, request):
        try:
            sub = (
                Subscription.objects.filter(
                    user=request.user,
                    status='active'
                )
                .order_by('-start_date')
                .first()
            )
    
            if not sub:
                return Response(
                    {"error": "No active subscription found."},
                    status=status.HTTP_404_NOT_FOUND
                )
    
            # Cancel current plan only
            sub.status = "cancelled"
            sub.save()
    
            NotificationService.create_notification(
                recipient=request.user,
                title="Subscription Cancelled",
                message=(
                    f"Your subscription for "
                    f"'{sub.plan.name}' has been cancelled."
                ),
                category="billing",
                event_type="subscription_cancelled",
                notification_type="system",
                related_object_id=sub.id
            )
    
            return Response(
                {
                    "message": "Subscription cancelled successfully",
                    "plan": sub.plan.name,
                    "status": sub.status
                }
            )
    
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    # ─────────────────────────────────────
    # REACTIVATE CANCELLED SUBSCRIPTION
    # ─────────────────────────────────────
 
    def patch(self, request):
        try:
    
            sub = (
                Subscription.objects.filter(
                    user=request.user,
                    status='cancelled'
                )
                .order_by('-start_date')
                .first()
            )
    
            if not sub:
                return Response(
                    {
                        "error":
                        "No cancelled subscription found."
                    },
                    status=status.HTTP_404_NOT_FOUND
                )
    
            # Plan period already ended
            if (
                sub.end_date
                and
                sub.end_date < timezone.now()
            ):
                return Response(
                    {
                        "error":
                        "Subscription expired. Please upgrade again.",
                        "is_expired": True
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
    
            sub.status = "active"
            sub.save()
    
            return Response(
                {
                    "message": "Reactivated",
                    "is_expired": False
                }
            )
    
        except Exception as e:
            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )


class InvoiceListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        invoices = Invoice.objects.filter(user=request.user)
        return Response(InvoiceSerializer(invoices, many=True).data)


class InvoiceDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        invoice = Invoice.objects.get(id=pk, user=request.user)
        file_path = generate_invoice_pdf(invoice)
        return FileResponse(open(file_path, 'rb'), content_type='application/pdf')


class PaymentMethodView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        methods = PaymentMethod.objects.filter(user=request.user)
        serializer = PaymentMethodSerializer(methods, many=True)
        return Response(serializer.data)
 
    def post(self, request):
        serializer = PaymentMethodSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
   
    def patch(self, request, pk):
        try:
            payment_method = PaymentMethod.objects.get(id=pk, user=request.user)
        except PaymentMethod.DoesNotExist:
            return Response({"error": "Payment method not found"}, status=404)
       
        serializer = PaymentMethodSerializer(payment_method, data=request.data, partial=True)
        if serializer.is_valid():
            if request.data.get('is_default') == True:
                PaymentMethod.objects.filter(user=request.user).exclude(id=pk).update(is_default=False)
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
   
    def delete(self, request, pk):
        try:
            payment_method = PaymentMethod.objects.get(id=pk, user=request.user)
            payment_method.delete()
            return Response({"message": "Deleted successfully"})
        except PaymentMethod.DoesNotExist:
            return Response({"error": "Payment method not found"}, status=404)
 
 
class DeletePaymentMethodView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        PaymentMethod.objects.filter(id=pk, user=request.user).delete()
#-----------------------------------------------------------------------------------------------------
        NotificationService.create_notification(
        recipient=request.user,
        title="Payment Method Removed",
        message=(
            "A payment method "
            "was removed from your account."
        ),
        category="billing",
        event_type="payment_method_removed",
        notification_type="system"
    )
#--------------------------------------------------------------------------------------------------------------------
        return Response({"message": "Deleted"}) 

# ============ PAYMENT VERIFICATION VIEW ============

# jobapp/views.py
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from decimal import Decimal

# Import your models
from jobapp.models import Payment, Subscription, Invoice

# Import utility functions - CHOOSE THE CORRECT ONE:
try:
    # Option 1: If functions are in utils.py
    from jobapp.utils import calculate_gst, generate_invoice_number, generate_invoice_pdf
except ImportError:
    # Option 2: If functions are in the same file (views.py)
    from jobapp.views import calculate_gst, generate_invoice_number, generate_invoice_pdf

class VerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]
 
    def post(self, request):
        data = request.data
 
        try:
            razorpay_order_id = data.get('razorpay_order_id')
            razorpay_payment_id = data.get('razorpay_payment_id')
            razorpay_signature = data.get('razorpay_signature')
            duration = data.get('duration', 'monthly')
            duration_days = data.get('duration_days', 30)
            payment_method = data.get('payment_method', 'card')
 
            # Verify payment signature
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
 
            client.utility.verify_payment_signature(params_dict)
 
            # Get the payment record
            payment = Payment.objects.get(
                razorpay_order_id=razorpay_order_id,
                user=request.user
            )
 
            # Update payment details
            payment.razorpay_payment_id = razorpay_payment_id
            payment.razorpay_signature = razorpay_signature
            payment.status = "success"
            payment.payment_method = payment_method
            payment.save()
 
            # Cancel any existing active subscriptions
            Subscription.objects.filter(
                user=request.user,
                status='active'
            ).update(status='cancelled')
 
            # Calculate end date based on duration
            if duration == 'monthly':
                end_date = now() + timedelta(days=30)
            elif duration == '6_months':
                end_date = now() + timedelta(days=180)
            elif duration == 'yearly':
                end_date = now() + timedelta(days=365)
            else:
                end_date = now() + timedelta(days=30)
 
            # Create new subscription
            subscription = Subscription.objects.create(
                user=request.user,
                plan=payment.plan,
                status='active',
                end_date=end_date
            )

              # ─────────────────────────────
            # UPDATE JOB EXPIRY
            # AFTER PLAN UPGRADE
            # ─────────────────────────────
    
            platform = (
                EmployerPlatformSettings.objects.filter(
                    plan=subscription.plan,
                    account_status=request.user.status
                ).first()
            )
            if platform:
                new_expiry_days = (
                    platform.job_expire_days
                )
                employer_jobs = (
                    PostAJob.objects.filter(
                        employer=request.user
                    )
                )
                for job in employer_jobs:
                    # ─────────────────────
                    # UPDATE EXPIRY DAYS
                    # ─────────────────────
                    job.expiry_days = (
                        new_expiry_days
                    )
                    # ─────────────────────
                    # NOT APPROVED
                    # ─────────────────────
                    if not job.approved_at:
                        job.expiry_date = None
                        job.is_published = False
                        job.save()
                        continue
                    # ─────────────────────
                    # RECALCULATE EXPIRY
                    # ─────────────────────
                    if new_expiry_days:
                        job.expiry_date = (
                            job.approved_at
                            +
                            timedelta(
                                days=new_expiry_days
                            )
                        )
                    else:
                        job.expiry_date = None
                    # ─────────────────────
                    # EXPIRE OR RESTORE
                    # ─────────────────────
                    if (
                        job.expiry_date
                        and
                        job.expiry_date
                        >
                        timezone.now()
                    ):
                        job.is_expired = False
                        if (
                            job.approval_status
                            ==
                            PostAJob.ApprovalStatus.APPROVED
                        ):
                            job.is_published = True
                    else:
                        job.is_expired = True
                        job.is_published = False
                    job.save()
                    print(
                        f"Updated job: {job.id}"
                    )
            else:
                print(
                    "No EmployerPlatformSettings found"
                )
 
            # Calculate GST (18%) - payment.amount already includes tax
            subtotal = payment.amount / Decimal('1.18')
            gst = payment.amount - subtotal
 
            # Format duration text
            if duration == 'monthly':
                duration_text = '1 Month'
            elif duration == '6_months':
                duration_text = '6 Months'
            elif duration == 'yearly':
                duration_text = '1 Year'
            else:
                duration_text = '1 Month'
 
            #  FIXED: Get company details through EmployerProfile
            company_name = request.user.username
            company_email = request.user.email
            company_phone = ''
           
            try:
                if hasattr(request.user, 'employer_profile'):
                    employer_profile = request.user.employer_profile
                    if employer_profile.company:
                        company = employer_profile.company
                        company_name = company.company_name
                        company_email = company.company_email
                        company_phone = company.contact_number
                        print(f" Found company: {company_name}, Email: {company_email}, Phone: {company_phone}")
                    else:
                        print(f" Employer has no company linked")
                else:
                    print(f" User is not an employer")
            except Exception as e:
                print(f" Error getting company: {e}")
 
            # Create invoice with CORRECT company details
            invoice = Invoice.objects.create(
                user=request.user,
                invoice_number=self.generate_invoice_number(),
                company_name=company_name,      #  Now this will be actual company name
                email=company_email,             #  Now this will be actual company email
                phone=company_phone,             #  Now this will be actual company phone
                payment_method=payment_method.upper(),
                transaction_id=razorpay_payment_id,
                payment_status="Paid",
                subtotal=round(subtotal, 2),
                gst=round(gst, 2),
                total=payment.amount,
                plan_name=payment.plan.name,
                duration=duration_text,
                start_date=now(),
                end_date=end_date
            )
 
            return Response({
                "message": "Payment verified successfully",
                "subscription_id": subscription.id,
                "invoice_number": invoice.invoice_number,
                "plan_name": payment.plan.name,
                "duration": duration_text,
                "amount": payment.amount,
                "end_date": end_date
            })
 
        except Payment.DoesNotExist:
            return Response({"error": "Payment not found"}, status=404)
       
        except razorpay.errors.SignatureVerificationError:
            return Response({"error": "Invalid payment signature"}, status=400)
       
        except Exception as e:
            return Response({"error": str(e)}, status=400)
 
    def generate_invoice_number(self):
        """Generate unique invoice number"""
        date_part = datetime.now().strftime('%Y%m%d')
        random_part = ''.join(random.choices(string.digits, k=4))
        invoice_number = f"INV-{date_part}-{random_part}"
       
        while Invoice.objects.filter(invoice_number=invoice_number).exists():
            random_part = ''.join(random.choices(string.digits, k=4))
            invoice_number = f"INV-{date_part}-{random_part}"
       
        return invoice_number
 
    
# ============ COMPANY EMAIL OTP VIEWS ============

class SendCompanyEmailOTPView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        email = request.data.get("email")
        company_name = request.data.get("company_name")
        
        if not email:
            return Response({"error": "Email is required"}, status=400)
        
        if not company_name:
            return Response({"error": "Company name is required"}, status=400)
        
        # Check if email is already used by another company
        if CompanyProfile.objects.filter(company_email=email).exists():
            # If updating existing company, check if it's the same company
            if hasattr(request.user, 'employer_profile') and request.user.employer_profile.company:
                existing_company = request.user.employer_profile.company
                if existing_company.company_email != email:
                    return Response(
                        {"error": "This email is already used by another company"}, 
                        status=400
                    )
            else:
                return Response(
                    {"error": "This email is already registered with another company"}, 
                    status=400
                )
        
        # Delete existing OTPs for this email
        CompanyEmailOTP.objects.filter(
            email=email,
            purpose='company_verification',
            is_verified=False
        ).delete()
        
        otp = generate_company_otp()
        
        CompanyEmailOTP.objects.create(
            company_name=company_name,
            email=email,
            otp=otp,
            purpose='company_verification',
            expires_at=timezone.now() + timedelta(minutes=10)
        )
        
        # Send OTP email
        try:
            send_company_email_otp(email, otp, company_name)
            print(f"📧 Company OTP sent to {email}: {otp}")  # For testing
            return Response({
                "message": "OTP sent to company email successfully",
                "email": email
            }, status=200)
        except Exception as e:
            return Response({
                "error": f"Failed to send OTP: {str(e)}"
            }, status=500)


class VerifyCompanyEmailOTPView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
        
        if not email or not otp:
            return Response({"error": "Email and OTP are required"}, status=400)
        
        otp_obj = CompanyEmailOTP.objects.filter(
            email=email,
            otp=otp,
            purpose='company_verification',
            is_verified=False
        ).last()
        
        if not otp_obj or not otp_obj.is_valid():
            return Response({"error": "Invalid or expired OTP"}, status=400)
        
        # Mark OTP as verified
        otp_obj.is_verified = True
        otp_obj.save()
        
        return Response({
            "message": "Email verified successfully",
            "verified": True
        }, status=200)    

class EmployerOnboardingStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.user_type != "employer":
            return Response(
                {"error": "Only employers allowed"},
                status=403
            )

        # ==================================
        # CORRECT COMPANY PROFILE CHECK
        # ==================================
        has_company_profile = False

        if hasattr(user, "employer_profile"):
            has_company_profile = (
                user.employer_profile.company is not None
            )

        # ==================================
        # VERIFICATION CHECK
        # ==================================
        verification = CompanyVerification.objects.filter(
            employer=user
        ).order_by("-id").first()

        has_verification = verification is not None

        verification_status = (
            verification.status
            if verification
            else None
        )

        return Response({
            "has_company_profile": has_company_profile,
            "has_verification": has_verification,
            "verification_status": verification_status
        })
    
# Google Login    
 
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, JobSeekerProfile, EmployerProfile


# Update your GoogleLoginView to this:

class GoogleLoginView(APIView):
    """
    Google Login API
    POST /api/google-login/ 
    Request body: {"id_token": "google_id_token"} or {"access_token": "google_access_token"}
    """
    permission_classes = [AllowAny]

    def post(self, request):
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        from django.conf import settings
        from rest_framework_simplejwt.tokens import RefreshToken
        
        # Try to get token from different possible field names
        id_token_str = request.data.get('id_token') or request.data.get('access_token') or request.data.get('token')
        
        # ❌ REMOVE THESE LINES FROM HERE - they don't belong at the beginning
        # from django.utils import timezone
        # user.login_time = timezone.now()
        # user.save(update_fields=["login_time"])
        
        if not id_token_str:
            return Response(
                {"error": "Google token required. Please provide 'id_token' or 'access_token'"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get Google Client ID from settings
            google_client_id = getattr(settings, 'GOOGLE_CLIENT_ID', None)
            
            if not google_client_id:
                return Response(
                    {"error": "Google Client ID not configured in settings"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            print(f"Using Google Client ID: {google_client_id}")
            print(f"Token received: {id_token_str[:50]}...")
            
            # Verify Google ID token
            info = id_token.verify_oauth2_token(
                id_token_str,
                google_requests.Request(),
                google_client_id
            )
 
            # Google user info
            email = info.get("email")
            name = info.get("name", "")
            picture = info.get("picture", "")
 
            if not email:
                return Response(
                    {
                        "error": "Email not provided by Google"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
 
            # Check if user already exists
            user = User.objects.filter(email=email).first()
 
            # If email already exists -> block signup
            if user:
                # ✅ UPDATE LOGIN_TIME FOR EXISTING USER
                from django.utils import timezone
                user.login_time = timezone.now()
                user.save(update_fields=["login_time"])
                
                return Response(
                    {
                        "error": "Email already registered. Please login."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
 
            # Create new user
            username = email.split("@")[0]
            base_username = username
            counter = 1
 
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
 
            user = User.objects.create(
                username=username,
                email=email,
                user_type=User.UserType.JOBSEEKER,
                is_active=True
            )
 
            user.set_unusable_password()
            
            # SET LOGIN_TIME FOR NEW USER
            from django.utils import timezone
            user.login_time = timezone.now()
            user.save()  # Save both the unusable password and login_time
            
            # Create job seeker profile
            try:
                JobSeekerProfile.objects.create(
                    user=user,
                    full_name=name
                )
            except Exception as e:
                print("Profile creation error:", e)
 
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
 
            return Response(
                {
                    "success": True,
                    "message": "Google signup successful",
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": {
                        "id": user.id,
                        "email": user.email,
                        "username": user.username,
                        "user_type": user.user_type,
                        "profile_image": picture
                    },
                    "is_new_user": True
                },
                status=status.HTTP_201_CREATED
            )
 
        except ValueError as e:
            error_msg = str(e)
            print(f"Token verification error: {error_msg}")
            return Response(
                {
                    "error": f"Invalid Google token: {str(e)}"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
 
        except Exception as e:
            return Response(
                {
                    "error": f"Authentication failed: {str(e)}"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
from rest_framework.views import APIView

from rest_framework.response import Response

from rest_framework.permissions import AllowAny

from rest_framework import status
 
from rest_framework_simplejwt.tokens import RefreshToken
 
from django.utils import timezone

from django.db.models import Q
 
import hashlib

import logging
 
from .models import (

    User,

    AdminTrustedDevice

)
 
from .services import AdminSecurityService
 
 
logger = logging.getLogger(__name__)
 
 
class AdminLoginView(APIView):
 
    permission_classes = [AllowAny]
 
    def post(self, request):
 
        print("REQUEST DATA:", request.data)
        email = (

            request.data.get("email")
            or request.data.get("username")
            or ""

        ).strip()
        password = (
            request.data.get("password", "")
        ).strip()
        print("EMAIL:", email)
        # =================================================
        # FIELD VALIDATION
        # =================================================
        errors = {}
 
        if not email:
            errors["email"] = (
                "Email is required."
            )
        if not password:
            errors["password"] = (
                "Password is required."
            )
        if errors:
            return Response(
                {
                    "success": False,
                    "errors": errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
 
        # =================================================
        # FIND USER
        # =================================================
 
        try:
            user = User.objects.get(
                email__iexact=email
            )
        except User.DoesNotExist:
 
            # =============================================
            # ADMIN SECURITY LOG
            # LOGIN FAILED
            # =============================================
 
            try:
                AdminSecurityService.log_event(
                    request=request,
                    user=None,
                    action="LOGIN_FAILED",
                    status="FAILED",
                    extra_data={
                        "email": email,
                        "reason": "No account found"
                    }
                )
            except Exception as exc:
                logger.exception(
                    "ADMIN LOGIN LOG FAILED: %s",
                    str(exc)
                )

            return Response(
                {
                    "success": False,
                    "errors": {
                        "email": (
                            "No account found "
                            "with this email."
                        )
                    }
                },
                status=status.HTTP_401_UNAUTHORIZED

            )
 
        # =================================================
        # CHECK ADMIN ACCESS
        # =================================================
 
        if user.user_type != "admin":
            try:
                AdminSecurityService.log_event(
                    request=request,
                    user=user,
                    action="LOGIN_FAILED",
                    status="FAILED",
                    extra_data={
                        "reason": (
                            "Non-admin login attempt"
                        )
                    }
                )
            except Exception as exc:
                logger.exception(
                    "ADMIN ACCESS LOG FAILED: %s",
                    str(exc)
                )
            return Response(
                {
                    "success": False,
                    "errors": {
                        "email": (
                            "This account does not "
                            "have admin access."
                        )
                    }
                },
                status=status.HTTP_403_FORBIDDEN
            )
 
        # =================================================
        # PASSWORD CHECK
        # =================================================
 
        if not user.check_password(password):

            try:
                AdminSecurityService.log_event(
                    request=request,
                    user=user,
                    action="LOGIN_FAILED",
                    status="FAILED",
                    extra_data={
                        "reason": (
                            "Incorrect password"
                        )
                    }
                )
            except Exception as exc:
                logger.exception(
                    "PASSWORD FAILURE LOG FAILED: %s",
                    str(exc)
                )
            return Response(
                {
                    "success": False,
                    "errors": {
                        "password": (
                            "Incorrect password."
                        )
                    }
                },
                status=status.HTTP_401_UNAUTHORIZED

            )
 
        # =================================================
        # ACTIVE CHECK
        # =================================================
 
        if not user.is_active:
            try:
                AdminSecurityService.log_event(
                    request=request,
                    user=user,
                    action="LOGIN_FAILED",
                    status="FAILED",
                    extra_data={
                        "reason": (
                            "Account disabled"
                        )
                    }
                )
            except Exception as exc:
                logger.exception(
                    "DISABLED ACCOUNT LOG FAILED: %s",
                    str(exc)
                )
            return Response(
                {
                    "success": False,
                    "errors": {
                        "email": (
                            "This account "
                            "is disabled."
                        )
                    }
                },
                status=status.HTTP_403_FORBIDDEN

            )
 
        # =================================================

        # UPDATE LOGIN TIME

        # =================================================
 
        user.login_time = timezone.now()
        user.save(
            update_fields=["login_time"]
        )
 
        # =================================================

        # GENERATE JWT TOKENS

        # =================================================
 
        refresh = RefreshToken.for_user(user)
 
        # =================================================

        # DEVICE TRACKING

        # =================================================
 
        user_agent = request.META.get(
            "HTTP_USER_AGENT",
            ""
        )
        device_fingerprint = hashlib.md5(
            user_agent.encode()
        ).hexdigest()
        refresh_jti = refresh.payload.get(
            "jti",
            ""
        )
        device, created = (
            AdminTrustedDevice.objects.get_or_create(
                user=user,
                device_fingerprint=device_fingerprint,
                defaults={
                    "device_name": (
                        user_agent[:200]
                    ),
                    "platform": "web",
                    "is_trusted": True,
                    "refresh_token_jti": (
                        refresh_jti
                    ),
                }
            )
        )
        if not created:
            device.last_used_at = (
                timezone.now()
            )
            device.refresh_token_jti = (
                refresh_jti
            )
            device.save()
            print(
                f"UPDATED DEVICE: "
                f"{device.device_name}"
            )
        else:
            print(
                f"NEW DEVICE: "
                f"{device.device_name}"
            )
 
        # =================================================

        # ADMIN SECURITY SUCCESS LOG

        # =================================================
 
        try:
            AdminSecurityService.log_event(
                request=request,
                user=user,
                action="LOGIN_SUCCESS",
                status="SUCCESS",
                extra_data={
                    "login_method": (
                        "email/password"
                    ),
                    "device_fingerprint": (
                        device_fingerprint
                    ),
                    "user_agent": (
                        user_agent[:300]
                    )
                }
            )
            print(
                "ADMIN LOGIN LOG SAVED"
            )
        except Exception as exc:
            logger.exception(
                "ADMIN SUCCESS LOG FAILED: %s",
                str(exc)
            )
 
        # =================================================

        # RESPONSE

        # =================================================
 
        return Response(
            {
                "success": True,
                "message": (
                    "Admin login successful."
                ),
                "access": str(
                    refresh.access_token
                ),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username,
                    "user_type": user.user_type,
                }
            },
            status=status.HTTP_200_OK
        )


from rest_framework.permissions import BasePermission
class IsAdminUserType(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.user_type == 'admin'
        )


class DashboardView(APIView):
 
    def get(self, request):
        today = timezone.now().date()
        week_start = today - timedelta(days=7)
        last_2_days = today - timedelta(days=2)
        last_month = today - timedelta(days=30)
 
       
        user_stats = User.objects.aggregate(
            new_today=Count('id', filter=Q(date_joined__date=today)),
            new_week=Count('id', filter=Q(date_joined__date__gte=week_start)),
 
            active_today = Count(
            'id',
            filter=Q(user_type="employer", login_time__date=today)
        ),
 
        active_week = Count(
            'id',
            filter=Q(user_type="employer", login_time__date__gte=week_start)
        ),
            login_today=Count("id", filter=Q(login_time__date=today)),
 
            new_employers=Count('id', filter=Q(user_type="employer", date_joined__date=today)),
        )
 
       
        job_stats = PostAJob.objects.aggregate(
            total=Count('id'),
            today=Count('id', filter=Q(created_at__date=today)),
            week=Count('id', filter=Q(created_at__date__gte=week_start)),
 
            rejected=Count(
                'id',
                filter=Q(approval_status="rejected")
            ),
            approved=Count(

                'id',

                filter=Q(approval_status="approved")

            ),
 
            highlighted=Count('id', filter=Q(is_highlighted=True)),
 
            
        )
        expired_jobs = JobHistory.objects.count()
 
       
        app_stats = JobApplication.objects.aggregate(
            total=Count('id'),
            today=Count('id', filter=Q(applied_date__date=today)),
            week=Count('id', filter=Q(applied_date__date__gte=week_start)),
 
            last_2_days=Count('id', filter=Q(applied_date__date__gte=last_2_days)),
            last_month=Count('id', filter=Q(applied_date__date__gte=last_month)),
 
            shortlisted=Count('id', filter=Q(status="shortlisted")),
            interviews=Count('id', filter=Q(status="interview_called")),
            rejected=Count('id', filter=Q(status="rejected")),
        )
 
       
        profile_update = (
            JobSeekerProfile.objects.filter(updated_at__date=today).count()
            + EmployerProfile.objects.filter(updated_at__date=today).count()
            + AdminProfile.objects.filter(updated_at__date=today).count()
        )
 
        suspicious_activity = Complaint.objects.filter(
    status=Complaint.Status.INVESTIGATING
).count()
 
        messages_sent = Message.objects.count()
        support_tickets = RaiseTicket.objects.count()
        emails_sent = EmailOTP.objects.count() + CompanyEmailOTP.objects.count()
 
       
        return Response({
            "admin_activity_monitoring": {
                "new_user_registrations": {
                    "today": user_stats["new_today"],
                    "this_week": user_stats["new_week"],
                },
                "job_posted": {
                    "today": job_stats["today"],
                    "this_week": job_stats["week"],
                },
                "total_applications": {
                    "today": app_stats["today"],
                    "this_week": app_stats["week"],
                },
                "active_employers": {
                    "today": user_stats["active_today"],
                    "this_week": user_stats["active_week"],
                },
            },
            "platform_activity_overview": {
                "user_activity": {
                    "login_today": user_stats["login_today"],
                    "profile_update": profile_update,
                    "suspicious_activity": suspicious_activity,
                },
                "application_status": {
                    "total_application": app_stats["total"],
                    "shortlisted": app_stats["shortlisted"],
                    "interviews": app_stats["interviews"],
                    "rejections": app_stats["rejected"],
                },
                "employer_activity": {
                    "new_employers": user_stats["new_employers"],
                    "job_postings": job_stats["total"],
                    # "rejected_jobs": job_stats["rejected"],
                    "highlighted_jobs": job_stats["highlighted"],
                },
            },
            "job_communication": {
                "job_tracking": {
                    "job_posted": job_stats["total"],
                    "job_approved": job_stats["approved"],
                    "expired_jobs": expired_jobs,
                },
                "communication_logs": {
                    "messages_sent": messages_sent,
                    "support_tickets": support_tickets,
                    "emails_sent": emails_sent,
                },
                "employer_activity": {
                    "applications_last_2_days": app_stats["last_2_days"],
                    "applications_last_week": app_stats["week"],
                    "applications_last_month": app_stats["last_month"],
                },
            },
        })

class AdminCompanyListView(APIView):
    #permission_classes = [IsAuthenticated, IsAdminUserType] enable in prod
    def get(self, request):
        queryset = CompanyVerification.objects.select_related('employer')
        serializer = AdminCompanySerializer(queryset, many=True)
        return Response(serializer.data)


class AdminCompanyDetailView(APIView):
    # permission_classes = [IsAuthenticated, IsAdminUserType]  # enable in prod

    def get(self, request, pk):
        company_verification = get_object_or_404(
            CompanyVerification.objects.select_related(
                "employer",
                "employer__employer_profile",
                "employer__employer_profile__company",
            ),
            pk=pk
        )

        serializer = AdminCompanyDetailSerializer(
            company_verification,
            context={"request": request}
        )

        return Response(serializer.data, status=status.HTTP_200_OK)
 
class UpdateCompanyStatusView(APIView):
 
    STATUS_TRANSITIONS = {
        "Pending": ["Verified", "Reject", "Hold"],
        "Hold": ["Verified", "Reject","Pending"],
        "Reject": ["Pending","Hold","Verified"],
        "Verified": []
    }
 
    def patch(self, request, pk):
        try:
            obj = CompanyVerification.objects.get(id=pk)
        except CompanyVerification.DoesNotExist:
            return Response(
                {"error": "Company not found"},
                status=status.HTTP_404_NOT_FOUND
            )
 
        # 🔹 Only status allowed
        if set(request.data.keys()) != {"status"}:
            return Response(
                {"error": "Only 'status' field is allowed"},
                status=status.HTTP_400_BAD_REQUEST
            )
 
        new_status = request.data.get("status")
 
        valid_values = [choice[0] for choice in CompanyVerification.STATUS_CHOICES]
 
        # Validate value
        if new_status not in valid_values:
            return Response(
                {"error": f"Invalid value. Allowed: {valid_values}"},
                status=status.HTTP_400_BAD_REQUEST
            )
 
        #  Transition check
        allowed = self.STATUS_TRANSITIONS.get(obj.status, [])
 
        if new_status not in allowed:
            return Response(
                {
                    "error": f"Cannot change from {obj.status} to {new_status}",
                    "allowed": allowed
                },
                status=status.HTTP_400_BAD_REQUEST
            )
 
        previous = obj.status
        obj.status = new_status
        obj.save()
 
        return Response({
            "message": "Updated successfully",
            "previous": previous,
            "current": obj.status
        })


#user management
 
 
class UserListView(APIView):
 
    def get(self, request):
        search = request.query_params.get('search', '').strip().lower()
 
        # 🔹 Base queryset
        users = User.objects.exclude(
            user_type=User.UserType.ADMIN
        ).select_related(
            'jobseeker_profile',
            'employer_profile'
        ).order_by('-date_joined')
 
        if search:
       
            users_name = users.filter(
                Q(jobseeker_profile__full_name__icontains=search) |
                Q(employer_profile__full_name__icontains=search)
            )
 
            if users_name.exists():
                users = users_name
 
            else:
               
                users_email = users.filter(email__icontains=search)
 
                if users_email.exists():
                    users = users_email
 
                else:
                   
                    if search in ["candidate", "jobseeker"]:
                        users = users.filter(user_type=User.UserType.JOBSEEKER)
 
                    elif search == "employer":
                        users = users.filter(user_type=User.UserType.EMPLOYER)
 
                    else:
                        users = users.none()  # nothing found
 
       
        serializer = UserListSerializer(users, many=True)
 
        return Response(serializer.data, status=status.HTTP_200_OK)
   
 
class UserStatusUpdateView(APIView):
 
    #permission_classes = [IsAuthenticated, IsAdminUserType]
 
    def patch(self, request, pk):
        try:
            user = get_object_or_404(User, pk=pk)
 
           
            if 'status' not in request.data:
                return Response(
                    {"error": "Status field is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
 
            serializer = UserStatusUpdateSerializer(
                user, data=request.data, partial=True
            )
          #two option only show
            if serializer.is_valid():
                serializer.save()
 
                return Response(
                    {
                        "message": f"User status updated to '{serializer.validated_data.get('status')}'",
                        "id": user.id,
                        "status": serializer.validated_data.get('status')
                    },
                    status=status.HTTP_200_OK
                )
 
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 
        except Exception as e:
            return Response(
                {
                    "error": "Something went wrong",
                    "details": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
 
 
class UserStatsView(APIView):
   
    #permission_classes = [IsAuthenticated, IsAdminUserType]
 
    def get(self, request):
        all_users = User.objects.all()
 
        stats = all_users.aggregate(
                totalUsers=Count('id'),
                activeNow=Count('id', filter=Q(status=User.AccountStatus.ACTIVE)),
                candidates=Count('id', filter=Q(user_type=User.UserType.JOBSEEKER)),
                employers=Count('id', filter=Q(user_type=User.UserType.EMPLOYER)),
            )
        return Response(stats, status=status.HTTP_200_OK)

from rest_framework.views import APIView
from rest_framework.response import Response
from .models import AJob, ACompany, AEmployer, AJobSeeker
 
class AdminDashboardStats(APIView):
 
    def get(self, request):
        data = {
            "total_jobs": AJob.objects.count(),
            "total_companies": ACompany.objects.count(),
            "total_employers": AEmployer.objects.count(),
            "total_jobseekers": AJobSeeker.objects.count(),
        }
        return Response(data)
   
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import AJob

class AJobListView(APIView):
    permission_classes = [IsAdminUserType]
    def get(self, request):
        jobs = AJob.objects.all().order_by('-created_at')
 
        job_data = []
        for job in jobs:
            job_data.append({
                "title": job.title,
                "company": job.company.name,
                "new": 100,      # replace later with real logic
                "waiting": 20,
                "total": 200
            })
        
        return Response(job_data, status=status.HTTP_200_OK)
# job monitoring
class AdminJobListView(APIView):
    """Admin view to get all jobs with approval & verification status"""
    permission_classes = [IsAdminUserType]
 
    def get(self, request):
        # 🔍 Optional filters
        approval_status = request.query_params.get("status")   # pending / approved / rejected
        search = request.query_params.get("search")
 
        jobs = PostAJob.objects.all().select_related('employer').order_by('-created_at')
 
        # Filter by approval status
        if approval_status:
            jobs = jobs.filter(approval_status=approval_status)
 
        # Search by job title
        if search:
            jobs = jobs.filter(job_title__icontains=search)
 
        job_data = []
 
        for job in jobs:
            # Safe company name and logo
            company_name = "N/A"
            company_logo = None  # ← Initialize here
            
            if hasattr(job.employer, "employer_profile") and job.employer.employer_profile.company:
                company_obj = job.employer.employer_profile.company  # ← Use different variable name
                company_name = company_obj.company_name
                
                # Get logo URL safely
                if company_obj.company_logo:
                    company_logo = request.build_absolute_uri(company_obj.company_logo.url)
            
            # Get company verification status safely
            verification = CompanyVerification.objects.filter(
                employer=job.employer
            ).first()
 
            verification_status = verification.status if verification else "Not Verified"
 
            job_data.append({
                "id": job.id,
                "job_title": job.job_title,
                "company_name": company_name,
                "company_logo": company_logo,
                "approval_status": job.approval_status,
                "job_status": job.job_status,
                "is_published": job.is_published,
                "flagged": job.flagged,
                "created_at": job.created_at,
                "location": job.location,
                "experience": job.experience,
                "salary": job.salary,
                "work_type": job.work_type,
                "openings": job.openings,
                "key_skills": job.key_skills,
                "applicants_count": job.applications.count(),
                "company_verification_status": verification_status,
                "employer_email": job.employer.email,
                "employer_username": job.employer.username,
                "job_highlights": job.job_highlights,
                "job_description": job.job_description,
                "responsibilities": job.responsibilities,
                "is_highlighted": job.is_highlighted,          
                "highlighted_at": job.highlighted_at,
            })
 
        return Response({
            "total_jobs": jobs.count(),
            "jobs": job_data
        }, status=status.HTTP_200_OK)
 
 
class AdminJobApproveView(APIView):
    """Admin approve a job (publish it)"""
    permission_classes = [IsAdminUserType]

    def patch(self, request, pk):
        job = get_object_or_404(PostAJob, pk=pk)

        # Can only approve if company is verified
        verification = CompanyVerification.objects.filter(
            employer=job.employer,
            status__iexact='Verified'   # safer than 'Verified'
        ).exists()
 
        if not verification:
            return Response({
                "error": "Cannot approve job. Company is not verified."
            }, status=status.HTTP_400_BAD_REQUEST)
 
        # Prevent duplicate approval
        if job.approval_status == PostAJob.ApprovalStatus.APPROVED:
            return Response({
                "message": "Job is already approved"
            }, status=status.HTTP_400_BAD_REQUEST)

        # MAIN APPROVAL LOGIC
        try:
            job.approval_status = (
                PostAJob.ApprovalStatus.APPROVED
            )
 
            job.is_published = True
 
            job.approved_by = request.user
 
            # ─────────────────────────────
            # APPROVED TIME
            # ─────────────────────────────
 
            if not job.approved_at:
 
                job.approved_at = timezone.now()
 
            # ─────────────────────────────
            # START EXPIRY TIMER
            # ─────────────────────────────
 
            if job.expiry_days:
 
                job.expiry_date = (
 
                    job.approved_at
                    +
                    timedelta(
                        days=job.expiry_days
                    )
                )
 
            else:
 
                # no expiry configured
 
                job.expiry_date = None
 
            # ─────────────────────────────
            # SAFETY RESTORE
            # ─────────────────────────────
 
            job.is_expired = False
 
            job.save()
 
        except Exception as e:
 
            return Response(
                {
                    "error": (
                        f"Job approval failed: "
                        f"{str(e)}"
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create notification for employer
        NotificationService.create_notification(
            recipient=job.employer,
            title="Job Approved",
            message=(
                f"Your job "
                f"'{job.job_title}' "
                f"has been approved and is now live!"
            ),
            category="alert",
 
            event_type="job_approved",
 
            notification_type="system",
 
            related_object_id=job.id
        )

        return Response({
            "message": "Job approved successfully",
            "job_id": job.id,
            "status": "approved",
            "is_published": job.is_published
        }, status=status.HTTP_200_OK)
 
 
class AdminJobRejectView(APIView):
    """Admin reject a job (unpublish it)"""
    permission_classes = [IsAdminUserType]

    def patch(self, request, pk):
        job = get_object_or_404(PostAJob, pk=pk)
 
        # Get reject reason
        reason = request.data.get(
            'reason',
            'Job posting does not meet our guidelines.'
        )
 
        # Prevent duplicate rejection
        if job.approval_status == PostAJob.ApprovalStatus.REJECTED:
            return Response({
                "message": "Job is already rejected"
            }, status=status.HTTP_400_BAD_REQUEST)
 
        # MAIN REJECTION LOGIC
        job.approval_status = PostAJob.ApprovalStatus.REJECTED
        job.is_published = False
        job.save()
        NotificationService.create_notification(
            recipient=job.employer,
            title="Job Rejected",
            message=(
                f"Your job "
                f"'{job.job_title}' "
                f"has been rejected. "
                f"Reason: {reason}"
            ),
            category="alert",
            event_type="job_rejected",
            notification_type="system",
            related_object_id=job.id
        )

        return Response({
            "message": "Job rejected successfully",
            "job_id": job.id,
            "status": "rejected",
            "is_published": job.is_published,
            "reason": reason
        }, status=status.HTTP_200_OK)
 
 
class AdminJobFlagView(APIView):
    """Admin flag/unflag a job for review"""
    permission_classes = [IsAdminUserType]
   
    def patch(self, request, pk):
        job = get_object_or_404(PostAJob, pk=pk)
       
        # Toggle flagged status
        job.flagged = not job.flagged
        job.save()

       
        # If flagged, notify employer
        if job.flagged:
            NotificationService.create_notification(
                recipient=job.employer,
                title="Job Flagged",
                message=(
                    f"Your job "
                    f"'{job.job_title}' "
                    f"was flagged by admin."
                ),
                category="alert",
                event_type="job_flagged",
                notification_type="system",
                related_object_id=job.id
            )       
        return Response({
            "message": f"Job {'flagged' if job.flagged else 'unflagged'} successfully",
            "job_id": job.id,
            "flagged": job.flagged
        }, status=status.HTTP_200_OK)

class AdminComplaintListView(APIView):
    #permission_classes = [IsAuthenticated, IsAdminUserType]
 
    def get(self, request):
        complaints = Complaint.objects.all().order_by('-created_at')
 
        status_filter = request.GET.get("status")
        if status_filter:
            complaints = complaints.filter(status=status_filter)
 
        serializer = ComplaintSerializer(complaints, many=True)
        return Response(serializer.data)
 
class AdminUpdateComplaintView(APIView):
 
    #permission_classes = [IsAuthenticated,IsAdminUserType]
 
    def patch(self, request, pk):
 
        try:
 
            complaint = Complaint.objects.get(
                id=pk
            )
 
        except Complaint.DoesNotExist:
 
            return Response(
                {"error": "Complaint not found"},
                status=404
            )
 
        frontend_status = request.data.get(
            "status"
        )
 
        # Only allowed frontend statuses
        status_mapping = {
            "Pending": "pending",
            "In Progress": "investigating",
            "Resolved": "resolved",
        }
 
        # Invalid status
        if frontend_status not in status_mapping:
 
            return Response(
                {
                    "error":
                    "Invalid status selected"
                },
                status=400
            )
 
        db_status = status_mapping[
            frontend_status
        ]
 
        # Already same status
        if complaint.status == db_status:
 
            return Response(
                {
                    "error":
                    f"Complaint is already "
                    f"{frontend_status}"
                },
                status=400
            )
 
        # Update status
        complaint.status = db_status
        complaint.save()
 
# ---------------------------------------------------------------------------------------------------------------------
 
        NotificationService.create_notification(
 
            recipient=complaint.user,
 
            title="Complaint Status Updated",
 
            message=(
                f"Your complaint status "
                f"has been updated to "
                f"'{frontend_status}'."
            ),
 
            category="alert",
 
            event_type="complaint_status_updated",
 
            notification_type="complaint",
 
            related_object_id=complaint.id
        )
 
# ---------------------------------------------------------------------------------------------------------------------
 
        return Response({
 
            "message": "Status updated",
 
            "data": {
                "id": complaint.id,
                "status": frontend_status
            }
 
        }, status=200)

    def delete(self, request, pk):
        try:
            complaint = Complaint.objects.get(id=pk)
        except Complaint.DoesNotExist:
            return Response(
                {"error": "Complaint not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        complaint.delete()

        return Response(
            {"message": "Report deleted successfully."},
            status=status.HTTP_200_OK
        )


class AdminComplaintDetailView(APIView):
    """
    GET /admin/complaints/<pk>/
    Returns full complaint details for the View Details modal.
    """
    # permission_classes = [IsAuthenticated, IsAdminUserType]

    def get(self, request, pk):
        try:
            complaint = Complaint.objects.select_related(
                'reported_job',
                'user',
            ).get(id=pk)
        except Complaint.DoesNotExist:
            return Response(
                {"error": "Complaint not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = ComplaintSerializer(complaint, context={'request': request})
        return Response(serializer.data)

class AdminJobDetailView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsAdminUserType
    ]
    def get(self, request, pk):
        try:
            job = (
                PostAJob.objects
                .select_related(
                    "employer",
                    "employer__employer_profile",
                    "employer__employer_profile__company"
                )
                .get(id=pk)
            )
        except PostAJob.DoesNotExist:
            return Response(
                {"error": "Job not found"},
                status=404
            )
        serializer = JobDetailSerializer(job)
        return Response(serializer.data)

class AdminUpdateJobStatusView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsAdminUserType
    ]
    def patch(self, request, pk):
        try:
            job = PostAJob.objects.get(id=pk)
        except PostAJob.DoesNotExist:
            return Response(
                {"error": "Job not found"},
                status=404
            )
        action = request.data.get("action")
        if action == "approve":
            job.approval_status = "approved"
            job.flagged = False
            job.is_published = True
        elif action == "hold":
            job.approval_status = "pending"
            job.is_published = False
        elif action == "flag":
            job.flagged = True
        elif action == "delete":
            job.delete()
            return Response({
                "message": "Job deleted successfully"
            })
        else:
            return Response(
                {"error": "Invalid action"},
                status=400
            )
        job.save()
        return Response({
            "message": "Job updated successfully",
            "approval_status": job.approval_status,
            "flagged": job.flagged
        })
 
 
class AdminJobDeleteView(APIView):
    """Admin permanently delete a job"""
    permission_classes = [IsAdminUserType]
   
    def delete(self, request, pk):
        job = get_object_or_404(PostAJob, pk=pk)
        job_title = job.job_title
       
        # Notify employer before deletion
        NotificationService.create_notification(
            recipient=job.employer,
            title="Job Deleted",
            message=(
                f"Your job "
                f"'{job_title}' "
                f"has been permanently deleted by admin."
            ),
            category="alert",
            event_type="job_deleted",
            notification_type="system",
            related_object_id=job.id
        )

        job.delete()
       
        return Response({
            "message": f"Job '{job_title}' deleted successfully"
        }, status=status.HTTP_200_OK)
 
 
class AdminJobStatsView(APIView):
    """Get job statistics for admin dashboard"""
    permission_classes = [IsAdminUserType]
   
    def get(self, request):
        today = timezone.now().date()
        week_start = today - timedelta(days=7)
       
        stats = {
            'total_jobs': PostAJob.objects.count(),
            'published_jobs': PostAJob.objects.filter(is_published=True).count(),
            'draft_jobs': PostAJob.objects.filter(is_published=False).count(),
            'flagged_jobs': PostAJob.objects.filter(flagged=True).count(),
            'jobs_today': PostAJob.objects.filter(created_at__date=today).count(),
            'jobs_this_week': PostAJob.objects.filter(created_at__date__gte=week_start).count(),
            'jobs_by_status': {
                'hiring_in_progress': PostAJob.objects.filter(job_status='Hiring in Progress').count(),
                'reviewing_application': PostAJob.objects.filter(job_status='Reviewing Application').count(),
                'hiring_done': PostAJob.objects.filter(job_status='Hiring Done').count(),
            }
        }
       
        return Response(stats, status=status.HTTP_200_OK)  

class JobHighlightLimitView(APIView):
    permission_classes = [IsAuthenticated]
 
    def get(self, request):
        user = request.user
 
        print("Logged in user:", user.email)
 
        subscription = Subscription.objects.filter(
            user=user,
            status='active'
        ).select_related('plan').first()
 
        print("Subscription:", subscription)
 
        if not subscription:
            return Response({
                "plan": "No Plan",
                "total": 0,
                "used": 0,
                "remaining": 0,
                "message": "No active subscription plan"
            })
 
        total_limit = subscription.plan.highlight_limit
 
        used_highlights = PostAJob.objects.filter(
            employer=user,
            is_highlighted=True
        ).count()
 
        remaining = total_limit - used_highlights
 
        return Response({
            "plan": subscription.plan.name,
            "total": total_limit,
            "used": used_highlights,
            "remaining": max(0, remaining)
        })      
    
class AdminDashboardStats(APIView):
    permission_classes = [IsAdminUserType]
 
    def get(self, request):
        data = {
            "total_jobs": PostAJob.objects.count(),
            "total_companies": CompanyProfile.objects.count(),
            "total_employers": User.objects.filter(user_type='employer').count(),
            "total_jobseekers": User.objects.filter(user_type='jobseeker').count(),
            "total_applications": JobApplication.objects.count(),
            "pending_verifications": CompanyVerification.objects.filter(status='Pending').count(),
        }
        return Response(data)

    
 
class JobApplicationReportView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserType]
 
    def get(self, request):
        now = timezone.now()
        last_30_days = now - timedelta(days=30)
        one_year_ago = now - timedelta(days=365)
 
 
 
#for stats
 
 
        # LIVE JOBS
        live_now = PostAJob.objects.filter(
            is_published=True
        ).exclude(
            job_status=PostAJob.JobStatus.HIRING_DONE
        ).count()
 
        live_ly = PostAJob.objects.filter(
            is_published=True,
            created_at__lte=one_year_ago
        ).exclude(
            job_status=PostAJob.JobStatus.HIRING_DONE
        ).count()
 
 
        # CLOSED JOBS (using created_at)
        closed_30d = PostAJob.objects.filter(
            job_status=PostAJob.JobStatus.HIRING_DONE,
            created_at__gte=last_30_days
        ).count()
 
        closed_30d_ly = PostAJob.objects.filter(
            job_status=PostAJob.JobStatus.HIRING_DONE,
            created_at__gte=(last_30_days - timedelta(days=365)),
            created_at__lte=(now - timedelta(days=365))
        ).count()
 
 
        # APPLICATIONS
        apps_now = JobApplication.objects.count()
 
        apps_ly = JobApplication.objects.filter(
            applied_date__lte=one_year_ago
        ).count()
 
 
        # HELPERS INLINE
        def pct_change(current, previous):
            if previous == 0:
                return None
            return round((current - previous) / previous * 100, 1)
 
        '''def trend(pct):
            if pct is None or pct == 0:
                return "neutral"
            return "up" if pct > 0 else "down"'''
 
        def display(pct):
            if pct is None:
                return "N/A"
            if pct > 0:
                return f"+{pct}% vs LY"
            if pct < 0:
                return f"{pct}% vs LY"
            return "Neutral"
 
 
        # CALCULATE
        live_pct = pct_change(live_now, live_ly)
        closed_pct = pct_change(closed_30d, closed_30d_ly)
        apps_pct = pct_change(apps_now, apps_ly)
 
 
# for offer_conversion_rate
 
        offered = JobApplication.objects.filter(
            status__in=["offered", "hired"]
        ).count()
 
        total_apps = JobApplication.objects.count()
 
        rate = round((offered / total_apps) * 100, 1) if total_apps else 0
 
        # LABEL LOGIC
        if rate >= 50:
            label = "Very High"
        elif rate >= 25 :
            label = "High"
        elif rate >= 10:
            label = "Moderate"
        else:
            label = "Low"
 
 
#table_data need to confirm
 
       
 
 #  FLAGGED APPLICATIONS TABLE
 
        flags = ApplicationFlag.objects.select_related(
            "application__user",
            "application__job"
        ).order_by("-created_at")
 
        table_data = [
    {
        "flagId": f.id,  
        "id": f"#USR-{f.application.user.id}" if f.application.user else "#USR-0000",
        "jobId": f"#JOB-{f.application.job.id}" if f.application.job else "#JOB-0000",
        "reason": f.flag_reason.replace("_", " ").upper(),
        "method": f.detected_method,
        "risk": f.risk_level.upper(),
        "isRead": f.is_reviewed
    }
    for f in flags
]
 #  NEW FLAGS COUNT
       
        new_flags = ApplicationFlag.objects.filter(
            is_reviewed=False
        ).count()
 
 
 
#catogoeries
       
 
        SUPPORTED_ICONS =  {
                "fullstack": "Fullstack Dev",
                "fullstack dev": "Fullstack Dev",
                "fullstack developer": "Fullstack Dev",
 
                "cloud architect": "Cloud Architect",
                "cloud_architect": "Cloud Architect",
 
                "product design": "Product Design",
                "product_design": "Product Design",
            }
 
        categories_qs = PostAJob.objects.values("job_category").annotate(
            count=Count("id")
        )
 
        total_jobs = PostAJob.objects.count()
 
        categories_data = []
 
        for index, item in enumerate(categories_qs, start=1):
 
            raw_name = str(item["job_category"] or "").strip()
 
            normalized_key = raw_name.lower()
 
            icon_key = SUPPORTED_ICONS.get(
                normalized_key,
                "Other"
            )
 
            percentage = (
                round((item["count"] / total_jobs) * 100)
                if total_jobs else 0
            )
 
            categories_data.append({
                "id": index,
                "name": icon_key,          
                "other_name": raw_name,   # safe for debug  
                "percentage": percentage,
            })
 
 
       
 # FUNNEL DATA
       
 
        applied_statuses = {
            "applied",
            "resume_screening",
            "recruiter_review"
        }
 
        funnel_buckets = {}
 
        # only fetch required fields
        applications_for_funnel = JobApplication.objects.values(
            "status",
            "job__department"
        )
 
       
       
 
        for app in applications_for_funnel:
 
            department_raw = app.get("job__department")
 
            # if department stored as list
            if isinstance(department_raw, list) and department_raw:
                primary_department = department_raw[0]
            else:
                primary_department = department_raw
 
            # fallback
            department_display = (
                str(primary_department).strip()
                if primary_department
                else "Other"
            )
 
            # frontend style
            department_key = department_display.upper()
 
            # create bucket if not exists
            if department_key not in funnel_buckets:
                funnel_buckets[department_key] = {
                    "department": department_key,
                    "departmentDisplay": department_display,
                    "total": 0,
                    "applied": 0,
                    "interviewed": 0,
                    "offered": 0,
                }
 
            bucket = funnel_buckets[department_key]
 
            # total applications
            bucket["total"] += 1
 
            status_value = app.get("status")
 
           
 
            if status_value in applied_statuses:
                bucket["applied"] += 1
 
 
            if status_value == "interview_called":
                bucket["interviewed"] += 1
 
           
 
            if status_value in {"offered", "hired"}:
                bucket["offered"] += 1
 
 
 
 
        funnel_data = []
 
        for bucket in sorted(
            funnel_buckets.values(),
            key=lambda item: (-item["total"], item["department"])
        ):
 
            total = bucket["total"]
 
            if not total:
                continue
 
            funnel_data.append({
                "department": bucket["department"],
                #"departmentDisplay": bucket["departmentDisplay"],  # no needed for integration
                "totalApps": f"{total:,}",
                #"totalAppsCount": total, # no needed for integration
                "appliedPct": round(
                    (bucket["applied"] / total) * 100
                ),
                "interviewedPct": round(
                    (bucket["interviewed"] / total) * 100
                ),
                "offeredPct": round(
                    (bucket["offered"] / total) * 100
                ),
            })
 
 
        return Response({
    "stats": [
        {
            "label": "Live Job Postings",
            "value": f"{live_now:,}",
            "change": display(live_pct)
        },
        {
            "label": "Closed (Last 30d)",
            "value": f"{closed_30d:,}",
            "change": display(closed_pct)
        },
        {
            "label": "Applications Submitted",
            "value": f"{apps_now:,}",
            "change": display(apps_pct)
        }
    ],
    "offer_conversion_rate": {
        "value": rate,
        "label": label
    },
    "tableData": table_data,
    "newFlags": new_flags,
    "categories": categories_data,
    "funnelData": funnel_data
   
    })
           
 
 # for changing is read
 
 
class ApplicationFlagReadStatusView(APIView):
 
    def patch(self, request, flag_id):
 
        try:
            flag = ApplicationFlag.objects.get(id=flag_id)
 
        except ApplicationFlag.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": "Flag not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )
 
       
        if flag.is_reviewed:
            return Response(
                {
                    "success": False,
                    "message": "Flag already marked as read",
                    "data": {
                        "flagId": flag.id,
                        "isRead": True
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )
 
       
        flag.is_reviewed = True
        flag.save(update_fields=["is_reviewed"])
 
        return Response(
            {
                "success": True,
                "message": "Flag marked as read successfully",
                "data": {
                    "flagId": flag.id,
                    "isRead": True
                }
            },
            status=status.HTTP_200_OK
        )


# ============================================================
# ADD THESE TO THE BOTTOM OF YOUR EXISTING views.py
# Also add Role, Module, Permission to your models import line
# Also add RoleSerializer, PermissionSerializer, EmployerRoleSerializer
# to your serializers import line
# ============================================================

from .models import Role, Module, Permission
from .serializers import RoleSerializer, PermissionSerializer, EmployerRoleSerializer


# ── GET all roles (with live user_count + permissions) ──────────────────────
class RoleListView(APIView):
    permission_classes = [IsAdminUserType]

    def get(self, request):
        roles = Role.objects.prefetch_related('permissions__module').all()
        serializer = RoleSerializer(roles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ── CREATE a new role (also auto-creates permission rows for all modules) ────
class RoleCreateView(APIView):
    permission_classes = [IsAdminUserType]

    def post(self, request):
        name        = request.data.get('name', '').strip()
        description = request.data.get('description', '').strip()

        if not name:
            return Response(
                {"error": "Role name is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if Role.objects.filter(name__iexact=name).exists():
            return Response(
                {"error": f"Role '{name}' already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        role = Role.objects.create(name=name, description=description)

        # Auto-create a default permission row (all False) for every module
        modules = Module.objects.all()
        for module in modules:
            Permission.objects.create(
                role=role,
                module=module,
                read=False, create=False, update=False, delete=False
            )

        serializer = RoleSerializer(role)
        return Response(
            {"message": f"Role '{name}' created successfully.", "role": serializer.data},
            status=status.HTTP_201_CREATED
        )


# ── DELETE a role ────────────────────────────────────────────────────────────
class RoleDeleteView(APIView):
    permission_classes = [IsAdminUserType]

    def delete(self, request, role_id):
        role = get_object_or_404(Role, id=role_id)

        # Prevent deleting built-in roles
        if role.name.lower() in ['candidate', 'employer']:
            return Response(
                {"error": "Built-in roles cannot be deleted."},
                status=status.HTTP_400_BAD_REQUEST
            )

        role.delete()
        return Response(
            {"message": f"Role deleted successfully."},
            status=status.HTTP_200_OK
        )


# ── GET permissions for a specific role ──────────────────────────────────────
class RolePermissionView(APIView):
    permission_classes = [IsAdminUserType]

    def get(self, request, role_id):
        role = get_object_or_404(Role, id=role_id)
        permissions = Permission.objects.filter(role=role).select_related('module')
        serializer = PermissionSerializer(permissions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ── UPDATE a single permission row (toggle read/create/update/delete) ────────
class UpdatePermissionView(APIView):
    permission_classes = [IsAdminUserType]

    def patch(self, request, permission_id):
        # get_object_or_404 — safe, no DoesNotExist crash
        permission = get_object_or_404(Permission, id=permission_id)

        serializer = PermissionSerializer(
            permission,
            data=request.data,
            partial=True   # allows sending only the fields you want to change
        )

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Permission updated successfully.", "permission": serializer.data},
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ── BULK UPDATE all permissions for a role (from the Save button) ────────────
class BulkUpdatePermissionsView(APIView):
    """
    Frontend sends the entire permission table state on 'Edit Permissions' click.

    Expected body:
    {
        "permissions": [
            { "id": 1, "read": true, "create": false, "update": true, "delete": false },
            { "id": 2, "read": false, "create": true, "update": false, "delete": false },
            ...
        ]
    }
    """
    permission_classes = [IsAdminUserType]

    def patch(self, request, role_id):
        get_object_or_404(Role, id=role_id)  # confirm role exists

        permissions_data = request.data.get('permissions', [])

        if not permissions_data:
            return Response(
                {"error": "No permissions data provided."},
                status=status.HTTP_400_BAD_REQUEST
            )

        updated = []
        errors  = []

        for item in permissions_data:
            perm_id = item.get('id')
            perm = Permission.objects.filter(id=perm_id, role_id=role_id).first()

            if not perm:
                errors.append(f"Permission id={perm_id} not found for this role.")
                continue

            perm.read   = item.get('read',   perm.read)
            perm.create = item.get('create', perm.create)
            perm.update = item.get('update', perm.update)
            perm.delete = item.get('delete', perm.delete)
            perm.save()
            updated.append(perm_id)

        return Response({
            "message": f"{len(updated)} permissions updated.",
            "updated": updated,
            "errors":  errors
        }, status=status.HTTP_200_OK)


# ── GET employer list for RoleManagement (reads REAL data) ───────────────────
class EmployerRoleListView(APIView):
    """
    Returns real employer users with their company, subscription status,
    and join date. Used by the Employers table inside Role Management.
    """
    permission_classes = [IsAdminUserType]

    def get(self, request):
        employers = User.objects.filter(
            user_type='employer'
        ).select_related(
            'employer_profile__company'
        ).prefetch_related(
            'subscription_set'
        ).order_by('-date_joined')

        serializer = EmployerRoleSerializer(employers, many=True)
        return Response({
            "total": employers.count(),
            "employers": serializer.data
        }, status=status.HTTP_200_OK)


# ── DELETE an employer user (from the trash button) ──────────────────────────
class EmployerRoleDeleteView(APIView):
    permission_classes = [IsAdminUserType]

    def delete(self, request, pk):
        employer = get_object_or_404(User, id=pk, user_type='employer')
        employer.delete()
        return Response(
            {"message": "Employer deleted successfully."},
            status=status.HTTP_200_OK
        )




 
# for notification setting
 
from datetime import datetime
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
 
from rest_framework.response import Response
 
from .models import NotificationConfig , AdminQuietHours , NotificationChannelSettings
 
class NotificationPreferenceListView(APIView):
 
    #permission_classes = [IsAdminUserType] please activate in production
 
    def get(self, request):
 
        default_notification_categories = [
            "user_mgmt",
            "job_mgmt",
            "apps",
            "companies",
            "reports",
            "general",
        ]
 
        for category in default_notification_categories:
 
            NotificationConfig.objects.get_or_create(
                category=category
            )
 
        configs = NotificationConfig.objects.all()
 
        table_preferences = {}
 
        for config in configs:
 
            table_preferences[config.category] = {
                "Email": config.email,
                "In-App": config.in_app,
                "SMS": config.sms,
                "Push": config.push,
            }
 
        return Response({
            "table_preferences": table_preferences
        })
   
 
class NotificationPreferenceUpdateView(APIView):
 
    #permission_classes = [IsAdminUserType] please activate in production
 
    def patch(self, request):
 
        table_preferences = request.data.get(
            "table_preferences",
            {}
        )

        if not isinstance(table_preferences, dict):
            return Response(
                {
                    "error": "table_preferences must be object"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
 
        for category, values in table_preferences.items():

            if not isinstance(values, dict):
                return Response(
                    {
                        "error": (
                            f"Preferences for '{category}' "
                            f"must be object"
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            config, _ = NotificationConfig.objects.get_or_create(
                category=category
            )

            field_mapping = {
                "Email": "email",
                "In-App": "in_app",
                "SMS": "sms",
                "Push": "push",
            }

            for incoming_key, model_field in field_mapping.items():
                if incoming_key not in values:
                    continue
                incoming_value = values[incoming_key]
                if incoming_value is None:
                    continue
                if not isinstance(incoming_value, bool):
                    return Response(
                        {
                            "error": (
                                f"{category}.{incoming_key} "
                                f"must be true or false"
                            )
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
                setattr(
                    config,
                    model_field,
                    incoming_value
                )

            config.save()
 
        return Response({
            "message": "Notification preferences updated successfully"
        })
   
 
class AdminQuietHoursView(APIView):
 
    #permission_classes = [IsAdminUserType]
 
    def get(self, request):
 
        quiet_hours, created = AdminQuietHours.objects.get_or_create(
            admin=request.user,
            defaults={
                "enabled": False,
                "start_time": "22:00",
                "end_time": "07:00",
                "timezone": "Asia/Kolkata",
                "active_days": [
                    "Mon",
                    "Tue",
                    "Wed",
                    "Thu",
                    "Fri"
                ]
            }
        )
 
        return Response({
            "quiet_hours": {
                "enabled": quiet_hours.enabled,
                "start_time": quiet_hours.start_time,
                "end_time": quiet_hours.end_time,
                "timezone": quiet_hours.timezone,
                "active_days": quiet_hours.active_days,
            }
        })
   
 
 
class AdminQuietHoursView(APIView):
 
    permission_classes = [IsAdminUserType] 
 
    def get(self, request):
        # Temporary hardcoded admin user
            # Remove in production
        user = User.objects.get(id=request.user.id) # remove in production
        quiet_hours, created = AdminQuietHours.objects.get_or_create(
            admin=user, # remove this line and add below line
            #admin=request.user,
            defaults={
                "enabled": False,
                "start_time": "22:00",
                "end_time": "07:00",
                "timezone": "Asia/Kolkata",
                "active_days": [
                    "Mon",
                    "Tue",
                    "Wed",
                    "Thu",
                    "Fri"
                ]
            }
        )
 
        return Response({
            "quiet_hours": {
                "enabled": quiet_hours.enabled,
                "start_time": quiet_hours.start_time,
                "end_time": quiet_hours.end_time,
                "timezone": quiet_hours.timezone,
                "active_days": quiet_hours.active_days,
            }
        })
 
class AdminQuietHoursUpdateView(APIView):
 
    permission_classes = [IsAdminUserType]
 
    VALID_DAYS = [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun"
    ]
 
    def patch(self, request):
 
        try:
 
            quiet_data = request.data.get(
                "quiet_hours",
                {}
            )
 
            if not isinstance(quiet_data, dict):
 
                return Response(
                    {
                        "error": "quiet_hours must be an object"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
 
            # Temporary hardcoded admin user
            # Remove in production
            user = User.objects.get(id=request.user.id)
 
            quiet_hours, created = AdminQuietHours.objects.get_or_create(
                admin=user
                # admin=request.user
            )
 
            enabled = quiet_data.get("enabled")
            start_time = quiet_data.get("start_time")
            end_time = quiet_data.get("end_time")
            timezone = quiet_data.get("timezone")
            active_days = quiet_data.get("active_days")
 
            # ── Enabled Validation ─────────────────────────────
 
            if enabled is not None and not isinstance(enabled, bool):
 
                return Response(
                    {
                        "error": "enabled must be true or false"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
 
            # ── Time Validation ───────────────────────────────
 
            try:
 
                if start_time:
 
                    try:
                        datetime.strptime(start_time, "%H:%M")
                    except ValueError:
                        datetime.strptime(start_time, "%H:%M:%S")
 
                if end_time:
 
                    try:
                        datetime.strptime(end_time, "%H:%M")
                    except ValueError:
                        datetime.strptime(end_time, "%H:%M:%S")
 
            except ValueError:
 
                return Response(
                    {
                        "error": (
                            "Invalid time format. "
                            "Use HH:MM or HH:MM:SS"
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
 
            # ── Timezone Validation ───────────────────────────
 
            if timezone is not None:
 
                if not isinstance(timezone, str):
 
                    return Response(
                        {
                            "error": "timezone must be string"
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
 
                if len(timezone.strip()) == 0:
 
                    return Response(
                        {
                            "error": "timezone cannot be empty"
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
 
            # ── Active Days Validation ────────────────────────
 
            if active_days is not None:
 
                if not isinstance(active_days, list):
 
                    return Response(
                        {
                            "error": "active_days must be list"
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
 
                invalid_days = [
                    day for day in active_days
                    if day not in self.VALID_DAYS
                ]
 
                if invalid_days:
 
                    return Response(
                        {
                            "error": f"Invalid days: {invalid_days}"
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
 
            # ── Save Data ─────────────────────────────────────
 
            if enabled is not None:
                quiet_hours.enabled = enabled
 
            if start_time:
                quiet_hours.start_time = start_time
 
            if end_time:
                quiet_hours.end_time = end_time
 
            if timezone:
                quiet_hours.timezone = timezone
 
            if active_days is not None:
                quiet_hours.active_days = active_days
 
            quiet_hours.save()
 
            return Response(
                {
                    "message": "Quiet hours updated successfully",
 
                    "quiet_hours": {
                        "enabled": quiet_hours.enabled,
                        "start_time": quiet_hours.start_time,
                        "end_time": quiet_hours.end_time,
                        "timezone": quiet_hours.timezone,
                        "active_days": quiet_hours.active_days,
                    }
                },
                status=status.HTTP_200_OK
            )
 
        except User.DoesNotExist:
 
            return Response(
                {
                    "error": "Admin user not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )
 
        except Exception as e:
 
            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
       
 
class NotificationChannelSettingsView(APIView):
     #permission_classes = [IsAdminUserType] please activate in production
 
    def get(self, request):
 
        settings_obj, _ = (
            NotificationChannelSettings.objects.get_or_create(
                id=1  # for production use = request.user
            )
        )
 
        return Response({
            "quick_setup": {
                "email_notif": settings_obj.email_notif,
                "inapp_notif": settings_obj.inapp_notif,
                "sms_notif": settings_obj.sms_notif,
                "push_notif": settings_obj.push_notif,
            }
        })
   
 
class NotificationChannelSettingsUpdateView(APIView):
     #permission_classes = [IsAdminUserType] please activate in production
 
    def patch(self, request):
 
        try:
 
            quick_setup = request.data.get(
                "quick_setup",
                {}
            )
 
            if not isinstance(quick_setup, dict):
 
                return Response(
                    {
                        "error": (
                            "quick_setup must be object"
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
 
            settings_obj, _ = (
                NotificationChannelSettings.objects.get_or_create(
                    id=1
                )
            )
 
            email_notif = quick_setup.get(
                "email_notif"
            )
 
            inapp_notif = quick_setup.get(
                "inapp_notif"
            )
 
            sms_notif = quick_setup.get(
                "sms_notif"
            )
 
            push_notif = quick_setup.get(
                "push_notif"
            )
 
            # Boolean validation
 
            bool_fields = {
                "email_notif": email_notif,
                "inapp_notif": inapp_notif,
                "sms_notif": sms_notif,
                "push_notif": push_notif,
            }
 
            for field, value in bool_fields.items():
 
                if value is not None and not isinstance(value, bool):
 
                    return Response(
                        {
                            "error": (
                                f"{field} must be "
                                f"true or false"
                            )
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
 
            if email_notif is not None:
                settings_obj.email_notif = email_notif
 
            if inapp_notif is not None:
                settings_obj.inapp_notif = inapp_notif
 
            if sms_notif is not None:
                settings_obj.sms_notif = sms_notif
 
            if push_notif is not None:
                settings_obj.push_notif = push_notif
 
            settings_obj.save()
 
            return Response(
                {
                    "message": (
                        "Notification channel "
                        "settings updated successfully"
                    ),
 
                    "quick_setup": {
                        "email_notif": settings_obj.email_notif,
                        "inapp_notif": settings_obj.inapp_notif,
                        "sms_notif": settings_obj.sms_notif,
                        "push_notif": settings_obj.push_notif,
                    }
                },
                status=status.HTTP_200_OK
            )
 
        except Exception as e:
 
            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



 
 
#admin security setting
 
# password sets
 
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
from rest_framework_simplejwt.tokens import RefreshToken
 
from .models import AdminTrustedDevice
from .services import AdminSecurityService
from django.contrib.auth.password_validation import validate_password
from rest_framework.permissions import IsAuthenticated
from . serializers import AdminAccessLogSerializer, AdminTrustedDeviceSerializer
 
class AdminChangePasswordView(APIView):  # new 11/05
    permission_classes = [IsAuthenticated, IsAdminUserType]
 
    def patch(self, request):
        expiry_map = {
            "30 Days": 30,
            "60 Days": 60,
            "90 Days": 90,
            "Never": 99999
        }
        user = request.user
       
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")
        expiration_interval = request.data.get("expiration_interval")
 
        errors = {}
 
        # Current password check
        if not current_password:
            errors["current_password"] = [
                "Current password is required"
            ]
 
        elif not user.check_password(current_password):
            errors["current_password"] = [
                "Current password is incorrect"
            ]
 
        # New password check
        if not new_password:
            errors["new_password"] = [
                "New password is required"
            ]
 
         # Prevent same password
        elif current_password == new_password:
            errors["new_password"] = [
                "New password cannot be same as current password"
            ]
 
        # Confirm password check
        if not confirm_password:
            errors["confirm_password"] = [
                "Confirm password is required"
            ]
 
        elif new_password != confirm_password:
            errors["confirm_password"] = [
                "Passwords do not match"
            ]
 
        # Password validation
        if new_password:
            try:
                validate_password(new_password, user=user)
            except Exception as e:
                errors["new_password"] = list(e.messages)
 
        if errors:
            return Response(
                {
                    "success": False,
                    "errors": errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
 
        # Save password
        user.set_password(new_password)
        user.password_changed_at = timezone.now()
        user.password_expiry_days = expiry_map.get(
            expiration_interval,
            30
        )
        AdminSecurityService.log_event(
    request=request,
    user=user,
    action="PASSWORD_CHANGE",
    status="SUCCESS",
)
        user.save()
 
        return Response(
    {
        "success": True,
        "message": "Password updated successfully",
        "expiration_interval": expiration_interval,
        "password_changed_at": user.password_changed_at
    },
    status=status.HTTP_200_OK
)
   
 
# status for 2fa
 
class Admin2FAStatusView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserType]
 
    def get(self, request):
 
        profile, _ = AdminProfile.objects.get_or_create(
            user=request.user
        )
 
        return Response(
                {
                    "success": True,
 
                    "two_factor_enabled": profile.two_factor_enabled,
 
                    "method": profile.two_factor_method,
 
                    "email_verified": (
                        profile.two_factor_enabled
                        and
                        profile.two_factor_method == "email"
                    ),
 
                    "sms_verified": (
                        profile.two_factor_enabled
                        and
                        profile.two_factor_method == "sms"
                    ),
                },
                status=status.HTTP_200_OK
)
class SendAdmin2FAOTPView(APIView):
    #permission_classes = [IsAuthenticated, IsAdminUserType]
 
    def post(self, request):
 
        if not request.user or not request.user.is_authenticated:
            return Response(
                {
                    "success": False,
                    "message": "Authentication required"
                },
                status=status.HTTP_401_UNAUTHORIZED
            )
 
        method = str(request.data.get("method", "")).strip().lower()
 
        if method not in ["email", "sms"]:
            return Response(
                {
                    "success": False,
                    "message": "Invalid method"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
 
        user = request.user
 
        otp = generate_otp()
 
        # -------------------------------------------------
        # EMAIL OTP
        # -------------------------------------------------
 
        if method == "email":
            admin_email = (user.email or "").strip()
            if not admin_email:
                return Response(
                    {
                        "success": False,
                        "message": "Admin email is not available for this account"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
 
            # Expire old email OTPs
            EmailOTP.objects.filter(
                email=admin_email,
                purpose="admin_2fa",
                is_verified=False
            ).update(
                expires_at=timezone.now() - timedelta(minutes=1)
            )
 
            # Create new email OTP
            otp_obj = EmailOTP.objects.create(
                email=admin_email,
                otp=otp,
                purpose="admin_2fa",
                expires_at=timezone.now() + timedelta(minutes=5)
            )
 
            # Send email OTP
            try:
                send_email_otp(
                    admin_email,
                    otp,
                    "admin_2fa"
                )
            except Exception as exc:
                otp_obj.delete()
                return Response(
                    {
                        "success": False,
                        "message": "Failed to send OTP email",
                        "error": str(exc)
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
 
        # -------------------------------------------------
        # SMS OTP
        # -------------------------------------------------
 
        elif method == "sms":
            if not user.phone:
 
                return Response(
                    {
                        "success": False,
                        "message": "Phone number not available for this account"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
 
            # Expire old SMS OTPs
            SMSOTP.objects.filter(
                phone=user.phone,
                purpose="admin_2fa",
                is_verified=False
            ).update(
                expires_at=timezone.now() - timedelta(minutes=1)
            )
 
            # Create new SMS OTP
            SMSOTP.objects.create(
                phone=user.phone,
                otp=otp,
                purpose="admin_2fa",
                expires_at=timezone.now() + timedelta(minutes=5)
            )
 
            # -------------------------------------------------
            # TEMPORARY SMS IMPLEMENTATION
            # -------------------------------------------------
            # Real SMS service integration pending
            #
            # Future:
            #
            # SMSService.send(
            #     phone=user.phone,
            #     message=f"Your OTP is {otp}"
            # )
            #
            # -------------------------------------------------
 
            print(f"[TEMP SMS OTP] {user.phone}: {otp}")
 
        return Response(
            {
                "success": True,
                "message": f"OTP sent successfully via {method}",
                "method": method
            },
            status=status.HTTP_200_OK
        )
   
class VerifyAdmin2FAOTPView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserType]
 
    def post(self, request):
 
        otp = request.data.get("otp")
        method = request.data.get("method")
 
        if not otp:
            return Response(
                {
                    "success": False,
                    "message": "OTP is required"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
 
        if method not in ["email", "sms"]:
            return Response(
                {
                    "success": False,
                    "message": "Invalid method"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
 
        # EMAIL VERIFY
        if method == "email":
 
            otp_obj = EmailOTP.objects.filter(
                email=request.user.email,
                otp=otp,
                purpose="admin_2fa",
                is_verified=False
            ).last()
 
        # SMS VERIFY
        else:
            if otp == "123456":
 
                otp_obj = True
            #otp_obj = SMSOTP.objects.filter(
                #phone=request.user.phone,
               # otp=otp,
               # purpose="admin_2fa",
               # is_verified=False
            #).last()
 
        if not otp_obj:
            return Response(
                {
                    "success": False,
                    "message": "Invalid OTP"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
 
        if not otp_obj.is_valid():
            return Response(
                {
                    "success": False,
                    "message": "OTP expired"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
 
        otp_obj.is_verified = True
        otp_obj.save()
 
        profile, _ = AdminProfile.objects.get_or_create(
            user=request.user
        )
 
        profile.two_factor_enabled = True
        profile.two_factor_method = method
       
        # Set verified flag based on method
        if method == "email":
            profile.email_verified = True
        else:
            profile.sms_verified = True
 
        # ADMIN 2FA ENABLE LOG
       
 
        AdminSecurityService.log_event(
            request=request,
            user=request.user,
            action="2FA_ENABLED",
            status="SUCCESS",
            extra_data={
                "method": method
            }
        )
 
        profile.save()
 
        return Response(
            {
                "success": True,
                "message": "2FA enabled successfully",
                "two_factor_enabled": True,
                "method": profile.two_factor_method
            },
            status=status.HTTP_200_OK
        )
 
 
class DisableAdmin2FAView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserType]
 
    def patch(self, request):
 
        profile, _ = AdminProfile.objects.get_or_create(
            user=request.user
        )
 
        profile.two_factor_enabled = False
        profile.two_factor_method = None
        AdminSecurityService.log_event(
                request=request,
                user=request.user,
                action="2FA_DISABLED",
                status="SUCCESS",
            )
 
        profile.save()
 
        return Response(
            {
                "success": True,
                "message": "2FA disabled successfully",
                "two_factor_enabled": False
            },
            status=status.HTTP_200_OK
        )
   
#if admin enble 2step verification then use this as verified otp
 
class VerifyAdminLoginOTPView(APIView):
 
    permission_classes = [AllowAny]
 
    def post(self, request):
 
        user_id = request.data.get("user_id")
        otp = request.data.get("otp")
        method = request.data.get("method")
 
        # VALIDATION
       
 
        if not user_id:
            return Response(
                {
                    "success": False,
                    "message": "user_id is required"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
 
        if not otp:
            return Response(
                {
                    "success": False,
                    "message": "OTP is required"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
 
        if method not in ["email", "sms"]:
            return Response(
                {
                    "success": False,
                    "message": "Invalid method"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
 
       
        # GET USER
       
 
        try:
 
            user = User.objects.get(
                id=user_id,
                user_type="admin"
            )
 
        except User.DoesNotExist:
 
            return Response(
                {
                    "success": False,
                    "message": "Admin user not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )
 
        # VERIFY EMAIL OTP
     
 
        if method == "email":
 
            otp_obj = EmailOTP.objects.filter(
                email=user.email,
                otp=otp,
                purpose="admin_login_2fa",
                is_verified=False
            ).last()
 
   
        # VERIFY SMS OTP
 
 
        else:
            if otp == "123456":
 
                otp_obj = True
 
            #otp_obj = SMSOTP.objects.filter(
               # phone=user.phone,
               # otp=otp,
               # purpose="admin_login_2fa",
               # is_verified=False
            #).last()
             
 
   
        # INVALID OTP
 
 
        if not otp_obj:
 
            AdminSecurityService.log_event(
                request=request,
                user=user,
                action="LOGIN_2FA_VERIFY",
                status="FAILED",
                extra_data={
                    "reason": "Invalid OTP"
                }
            )
 
            return Response(
                {
                    "success": False,
                    "message": "Invalid OTP"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
 
        # EXPIRED OTP
 
 
        if not otp_obj.is_valid():
 
            return Response(
                {
                    "success": False,
                    "message": "OTP expired"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
 
       
        # MARK VERIFIED
       
 
        otp_obj.is_verified = True
        otp_obj.save()
 
       
        # UPDATE LOGIN TIME
     
        user.login_time = timezone.now()
        user.save(update_fields=["login_time"])
 
       
        # GENERATE TOKENS
   
 
        refresh = RefreshToken.for_user(user)
 
       
        # SECURITY LOG
       
 
        AdminSecurityService.log_event(
            request=request,
            user=user,
            action="LOGIN_2FA_VERIFY",
            status="SUCCESS",
            extra_data={
                "method": method
            }
        )
 
   
        # SUCCESS RESPONSE
       
 
        return Response(
            {
                "success": True,
                "message": "Admin login successful",
 
                "access": str(
                    refresh.access_token
                ),
 
                "refresh": str(
                    refresh
                ),
 
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username,
                    "user_type": user.user_type,
                }
            },
            status=status.HTTP_200_OK
        )  
# for device log  and activity
 
class AdminTrustedDeviceListView(APIView):
 
    permission_classes = [IsAuthenticated]
 
    def get(self, request):
 
        devices = AdminTrustedDevice.objects.filter(
            user=request.user,
            is_trusted=True
        ).order_by("-last_used_at")
 
        serializer = AdminTrustedDeviceSerializer(
            devices,
            many=True
        )
 
        return Response(
            {
                "success": True,
                "results": serializer.data
            }
        )
   
class RevokeTrustedDeviceView(APIView):
 
    permission_classes = [IsAuthenticated , IsAdminUserType]
 
    def delete(self, request, device_id):
 
        try:
 
            device = AdminTrustedDevice.objects.get(
                id=device_id,
                user=request.user
            )
 
        except AdminTrustedDevice.DoesNotExist:
 
            return Response(
                {
                    "success": False,
                    "message": "Device not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )
 
       
        # BLACKLIST JWT TOKEN
     
 
        try:
 
            outstanding_token = OutstandingToken.objects.get(
                jti=device.refresh_token_jti
            )
 
            RefreshToken(
                str(outstanding_token.token)
            ).blacklist()
 
        except Exception as e:
 
            print(
                "TOKEN BLACKLIST ERROR:",
                str(e)
            )
 
       
        # MARK DEVICE UNTRUSTED
       
 
        device.is_trusted = False
 
        device.save()
 
       
        # SECURITY LOG
     
 
        AdminSecurityService.log_event(
            request=request,
            user=request.user,
            action="DEVICE_REVOKED",
            status="SUCCESS",
            extra_data={
                "device_id": device.id,
                "device_name": device.device_name
            }
        )
 
        return Response(
            {
                "success": True,
                "message": "Device revoked successfully"
            },
            status=status.HTTP_200_OK
        )
   
 
class AdminAccessLogListView(APIView):
 
    permission_classes = [IsAuthenticated,IsAdminUserType]
 
    def get(self, request):
 
        # -------------------------------------------------
        # ADMIN ONLY
        # -------------------------------------------------
 
        if request.user.user_type != "admin":
 
            return Response(
                {
                    "success": False,
                    "message": "Only admins can access logs"
                },
                status=status.HTTP_403_FORBIDDEN
            )
 
        # -------------------------------------------------
        # GET LOGS
        # -------------------------------------------------
 
        logs = AdminAccessLog.objects.filter(
            user=request.user
        ).order_by("-timestamp")
 
        serializer = AdminAccessLogSerializer(
            logs,
            many=True
        )
 
        return Response(
            {
                "success": True,
                "count": logs.count(),
                "results": serializer.data
            },
            status=status.HTTP_200_OK
        )
    

 # employer setting 



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
 
from django.shortcuts import get_object_or_404
 
from .models import (
    EmployerPlatformSettings,
    Plan
)
 
from .serializers import (
    EmployerPlatformSettingsSerializer
)
 
class EmployerPlatformSettingsView(APIView):
 
    permission_classes = [
        IsAuthenticated,
        IsAdminUserType
    ]
 
    # ─────────────────────────────────────────
    # GET SETTINGS
    # ─────────────────────────────────────────
 
    def get(
        self,
        request,
        plan_id,
        account_status
    ):
 
        # ─────────────────────────────
        # PLAN CHECK
        # ─────────────────────────────
 
        plan = (
            Plan.objects.filter(
                id=plan_id
            ).first()
        )
 
        if not plan:
 
            return Response(
                {
                    "error": (
                        "Plan not found. "
                        "Please create "
                        "plan first."
                    )
                },
                status=status.HTTP_404_NOT_FOUND
            )
 
        # ─────────────────────────────
        # SETTINGS
        # ─────────────────────────────
 
        settings_obj, created = (
 
            EmployerPlatformSettings.objects.get_or_create(
 
                plan=plan,
 
                account_status=account_status
            )
        )
 
        serializer = (
            EmployerPlatformSettingsSerializer(
                settings_obj
            )
        )
 
        return Response(
 
            serializer.data,
 
            status=status.HTTP_200_OK
        )
 
    # ─────────────────────────────────────────
    # PATCH SETTINGS
    # ─────────────────────────────────────────
 
    def patch(
        self,
        request,
        plan_id,
        account_status
    ):
 
        # ─────────────────────────────
        # PLAN CHECK
        # ─────────────────────────────
 
        plan = (
            Plan.objects.filter(
                id=plan_id
            ).first()
        )
 
        if not plan:
 
            return Response(
                {
                    "error": (
                        "Plan not found. "
                        "Please create "
                        "plan first."
                    )
                },
                status=status.HTTP_404_NOT_FOUND
            )
 
        # ─────────────────────────────
        # SETTINGS
        # ─────────────────────────────
 
        settings_obj, created = (
 
            EmployerPlatformSettings.objects.get_or_create(
 
                plan=plan,
 
                account_status=account_status
            )
        )
 
        serializer = (
 
            EmployerPlatformSettingsSerializer(
 
                settings_obj,
 
                data=request.data,
 
                partial=True,
 
                context={
                    "request": request
                }
            )
        )
 
        serializer.is_valid(
            raise_exception=True
        )
 
        serializer.save()
 
        # ─────────────────────────────
        # UPDATE PLAN HIGHLIGHT LIMIT
        # ─────────────────────────────
 
        featured_limit = (
            serializer.validated_data.get(
                "featured_job_limit"
            )
        )
 
        if featured_limit is not None:
 
            plan.highlight_limit = (
                featured_limit
            )
 
            plan.save(
                update_fields=[
                    "highlight_limit"
                ]
            )
 
        # ─────────────────────────────
        # RESPONSE
        # ─────────────────────────────
 
        return Response(
            {
                "message": (
                    "Employer platform settings "
                    "updated successfully"
                ),
 
                "data": serializer.data
            },
 
            status=status.HTTP_200_OK
        )
        
from django.db.models import Q
from django.utils import timezone

class CheckPlanExpiryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        if user.user_type != 'employer':
            return Response({"error": "Only employers can access this"}, status=403)
        
        subscription = Subscription.objects.filter(
            user=user,
            status='active'
        ).select_related('plan').first()
        
        if not subscription:
            return Response({
                "has_active_plan": False,
                "is_expired": True,
                "message": "You don't have an active subscription plan."
            })
        
        # Check if plan is expired
        is_expired = subscription.end_date and subscription.end_date < timezone.now()
        
        # Check if plan is expiring soon (within 7 days)
        days_until_expiry = None
        if subscription.end_date and not is_expired:
            days_until_expiry = (subscription.end_date - timezone.now()).days
            
            # If expiring within 7 days, create notification
            if days_until_expiry <= 7 and days_until_expiry > 0:
                NotificationService.create_notification(
                    recipient=user,
                    title="Plan Expiring Soon",
                    message=f"Your {subscription.plan.name} plan will expire in {days_until_expiry} days. Please renew to continue enjoying premium features.",
                    category="alert",
                    event_type="plan_expiring_soon",
                    notification_type="system",
                    related_object_id=subscription.id
                )
        
        return Response({
            "has_active_plan": True,
            "is_expired": is_expired,
            "plan_name": subscription.plan.name,
            "plan_type": "Free" if subscription.plan.monthly_price == 0 else "Paid",
            "start_date": subscription.start_date,
            "end_date": subscription.end_date,
            "days_until_expiry": days_until_expiry,
            "message": "Your plan has expired. Please upgrade to continue." if is_expired else None
        })
 
 
class EmployerWeeklySummaryView(APIView):
 
    permission_classes = [IsAuthenticated]
 
    def get(self, request):
 
        employer = request.user
 
        today = timezone.now()
 
        week_ago = today - timedelta(days=7)
 
        # ─────────────────────────────────────
        # JOBS
        # ─────────────────────────────────────
 
        jobs = PostAJob.objects.filter(
            employer=employer
        )
 
        active_jobs = jobs.filter(
            last_date_to_apply__gte=today.date()
        )
 
        expired_jobs = jobs.filter(
            last_date_to_apply__lt=today.date()
        )
 
        highlighted_jobs = jobs.filter(
            is_highlighted=True
        )
 
        # ─────────────────────────────────────
        # APPLICATIONS
        # ─────────────────────────────────────
 
        applications = JobApplication.objects.filter(
            job__employer=employer
        )
 
        applications_this_week = applications.filter(
            applied_date__gte=week_ago
        )
 
        # ─────────────────────────────────────
        # NOTIFICATIONS
        # ─────────────────────────────────────
 
        notifications = Notification.objects.filter(
            user=employer
        )
 
        unread_notifications = notifications.filter(
            is_read=False
        )
 
        # ─────────────────────────────────────
        # JOB APPLICATION STATS
        # ─────────────────────────────────────
 
        job_stats = []
 
        for job in jobs:
 
            job_applications = JobApplication.objects.filter(
                job=job
            )
 
            job_stats.append({
 
                "job_id": job.id,
 
                "job_title": job.job_title,
 
                "applications_count": (
                    job_applications.count()
                ),
 
                "shortlisted": (
                    job_applications.filter(
                        status='shortlisted'
                    ).count()
                ),
 
                "rejected": (
                    job_applications.filter(
                        status='rejected'
                    ).count()
                ),
 
                "hired": (
                    job_applications.filter(
                        status='hired'
                    ).count()
                ),
            })
 
        # ─────────────────────────────────────
        # RECENT APPLICATIONS
        # ─────────────────────────────────────
 
        recent_applications = (
            applications
            .select_related(
                'user',
                'job'
            )
            .order_by('-applied_date')[:10]
        )
 
        recent_application_data = []
 
        for app in recent_applications:
 
            recent_application_data.append({
 
                "candidate": app.user.email,
 
                "job_title": app.job.job_title,
 
                "status": app.status,
 
                "applied_date": app.applied_date
            })
 
        # ─────────────────────────────────────
        # RECENT NOTIFICATIONS
        # ─────────────────────────────────────
 
        recent_notifications = (
            notifications
            .order_by('-created_at')[:10]
        )
 
        notification_data = []
 
        for notification in recent_notifications:
 
            notification_data.append({
 
                "id": notification.id,
 
                "message": notification.message,
 
                "notification_type": (
                    notification.notification_type
                ),
 
                "created_at": notification.created_at,
 
                "is_read": notification.is_read
            })
 
        # ─────────────────────────────────────
        # FINAL RESPONSE
        # ─────────────────────────────────────
 
        return Response({
 
            "summary": {
 
                "total_jobs": jobs.count(),
 
                "active_jobs": active_jobs.count(),
 
                "expired_jobs": expired_jobs.count(),
 
                "highlighted_jobs": (
                    highlighted_jobs.count()
                ),
 
                "total_applications": (
                    applications.count()
                ),
 
                "applications_this_week": (
                    applications_this_week.count()
                ),
 
                "unread_notifications": (
                    unread_notifications.count()
                )
            },
 
            "job_application_stats": job_stats,
 
            "recent_notifications": notification_data,
 
            "recent_applications": (
                recent_application_data
            )
        })
    
# for push notification
class RegisterDeviceTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SaveDeviceTokenSerializer(
            data=request.data
        )
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data["fcm_token"]
        platform = serializer.validated_data.get(
            "platform",
            "web"
        )

        device, created = UserDevice.objects.update_or_create(
            fcm_token=token,
            defaults={
                "user": request.user,
                "platform": platform,
                "is_active": True,
            },
        )
        logger.info(
            "FCM TOKEN REGISTERED | user=%s | device_id=%s | created=%s",
            request.user.id,
            device.id,
            created
        )
        return Response(
            {
                "status": "token registered",
                "device_id": device.id,
                "created": created,
            }
        )
   

# for jobseekersetting


from rest_framework import status

from .models import (
    JobseekerPlatformSettings
)

from .serializers import (
    JobseekerPlatformSettingsSerializer
)




class JobseekerPlatformSettingsView(APIView):

    #permission_classes = [IsAuthenticated,IsAdminUserType]

   

    def get(self, request):

        settings_obj = (
            JobseekerPlatformSettings.get_settings()
        )

        serializer = (
            JobseekerPlatformSettingsSerializer(
                settings_obj
            )
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

  

    def patch(self, request):

        settings_obj = (
            JobseekerPlatformSettings.get_settings()
        )

        serializer = (
            JobseekerPlatformSettingsSerializer(

                settings_obj,

                data=request.data,

                partial=True,

                context={
                    "request": request
                }
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(

            {
                "message": (
                    "Jobseeker platform settings "
                    "updated successfully"
                ),

                "data": serializer.data
            },

            status=status.HTTP_200_OK
        )
    

def _month_label(dt):
    return dt.strftime("%b")
 
 
def _trend(today_val, yesterday_val):
 
    if yesterday_val == 0:
        return "0.0%"
 
    change = (
        (today_val - yesterday_val) / yesterday_val
    ) * 100
 
    return f"{abs(change):.1f}%"
 
 
def _is_up(today_val, yesterday_val):
    return today_val >= yesterday_val
class AdminDashboardOverviewNewView(APIView):
 
    # permission_classes = [IsAuthenticated, IsAdminUserType]
 
    def get(self, request):
 
        now = timezone.now()
 
        today_start = now.replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0
        )
 
        yesterday_start = (
            today_start - timedelta(days=1)
        )
 
        nine_months_ago = (
            now - timedelta(days=270)
        )
 
        four_months_ago = (
            now - timedelta(days=120)
        )
 
       
        # USER STATS
       
 
        user_stats = User.objects.aggregate(
 
            total_employers=Count(
                "id",
                filter=Q(user_type="employer")
            ),
 
            total_jobseekers=Count(
                "id",
                filter=Q(user_type="jobseeker")
            ),
 
            users_today=Count(
                "id",
                filter=Q(date_joined__gte=today_start)
            ),
 
            users_yesterday=Count(
                "id",
                filter=Q(
                    date_joined__gte=yesterday_start,
                    date_joined__lt=today_start
                )
            ),
        )
 
        # JOB STATS
       
 
        job_stats = PostAJob.objects.aggregate(
 
            total_jobs=Count("id"),
 
            jobs_today=Count(
                "id",
                filter=Q(created_at__gte=today_start)
            ),
 
            jobs_yesterday=Count(
                "id",
                filter=Q(
                    created_at__gte=yesterday_start,
                    created_at__lt=today_start
                )
            ),
        )
 
        # APPLICATION STATS
       
 
        application_stats = JobApplication.objects.aggregate(
 
            apps_today=Count(
                "id",
                filter=Q(applied_date__gte=today_start)
            ),
 
            apps_yesterday=Count(
                "id",
                filter=Q(
                    applied_date__gte=yesterday_start,
                    applied_date__lt=today_start
                )
            ),
        )
 
        # REVENUE STATS
       
 
        revenue_stats = Payment.objects.filter(
            status="success"
        ).aggregate(
 
            rev_today=Coalesce(
                Sum(
                    "amount",
                    filter=Q(created_at__gte=today_start)
                ),
                0,
                output_field=DecimalField(),
            ),
 
            rev_yesterday=Coalesce(
                Sum(
                    "amount",
                    filter=Q(
                        created_at__gte=yesterday_start,
                        created_at__lt=today_start
                    )
                ),
                0,
                output_field=DecimalField(),
            ),
        )
 
       
        # SUBSCRIBER STATS
       
 
        subscriber_stats = Subscription.objects.filter(
            status="active"
        ).aggregate(
 
            subs_today=Count(
                "id",
                filter=Q(start_date__gte=today_start)
            ),
 
            subs_yesterday=Count(
                "id",
                filter=Q(
                    start_date__gte=yesterday_start,
                    start_date__lt=today_start,
                ),
            ),
        )
 
     
        # OVERVIEW STATS
     
 
        total_companies = CompanyProfile.objects.count()
 
        overview_stats = [
 
            {
                "label": "All Jobs",
                "count": job_stats["total_jobs"],
                "tabName": "Job Monitoring",
            },
 
            {
                "label": "Total Companies",
                "count": total_companies,
                "tabName": "Activity Monitoring",
            },
 
            {
                "label": "Total Employers",
                "count": user_stats["total_employers"],
                "query": "Employers",
            },
 
            {
                "label": "Total Jobseekers",
                "count": user_stats["total_jobseekers"],
                "query": "Jobseeker",
            },
        ]
 
        # JOB POSTINGS CHART
       
 
        job_monthly_rows = list(
 
            PostAJob.objects
 
            .filter(
                created_at__gte=nine_months_ago
            )
 
            .annotate(
                month=TruncMonth("created_at")
            )
 
            .values("month")
 
            .annotate(
                postings=Count("id"),
 
                recent_postings=Count(
                    "id",
                    filter=Q(
                        created_at__gte=four_months_ago
                    )
                ),
            )
 
            .order_by("month")
        )
 
        job_postings_map = {
 
            _month_label(row["month"]): row["postings"]
 
            for row in job_monthly_rows
        }
 
        job_posting_months = []
 
        for i in range(8, -1, -1):
 
            job_posting_months.append(
                _month_label(
                    now - timedelta(days=30 * i)
                )
            )
 
        job_postings_chart = [
 
            {
                "name": month,
 
                "postings": job_postings_map.get(month, 0)
            }
 
            for month in job_posting_months
        ]
 
       
        # HIGHLIGHTED JOBS
       
 
        highlighted_jobs_qs = (
 
            PostAJob.objects
 
            .filter(
                is_highlighted=True
            )
 
            .order_by("-highlighted_at")
 
            .values(
                "id",
                "job_title",
                "created_at",
                "highlighted_at"
            )
        )
 
        highlighted_jobs = [
 
            {
                "id": job["id"],
 
                "title": job["job_title"],
 
                "posted": (
                    job["created_at"].strftime("%d %b %Y")
                    if job["created_at"]
                    else "—"
                ),
 
                "highlightOn": (
                    job["highlighted_at"].strftime("%d %b %Y")
                    if job["highlighted_at"]
                    else "—"
                ),
 
                "isHighlighted": True,
            }
 
            for job in highlighted_jobs_qs
        ]
 
       
        # ADMIN STATS
       
 
        users_today = user_stats["users_today"]
        users_yesterday = user_stats["users_yesterday"]
 
        jobs_today = job_stats["jobs_today"]
        jobs_yesterday = job_stats["jobs_yesterday"]
 
        apps_today = application_stats["apps_today"]
        apps_yesterday = application_stats["apps_yesterday"]
 
        rev_today = revenue_stats["rev_today"]
        rev_yesterday = revenue_stats["rev_yesterday"]
 
        subs_today = subscriber_stats["subs_today"]
        subs_yesterday = subscriber_stats["subs_yesterday"]
 
        admin_stats = [
 
            {
                "title": "Total Users",
 
                "value": str(users_today),
 
                "trend": _trend(
                    users_today,
                    users_yesterday
                ),
 
                "isUp": _is_up(
                    users_today,
                    users_yesterday
                ),
            },
 
            {
                "title": "Total Jobs Posted",
 
                "value": str(jobs_today),
 
                "trend": _trend(
                    jobs_today,
                    jobs_yesterday
                ),
 
                "isUp": _is_up(
                    jobs_today,
                    jobs_yesterday
                ),
            },
 
            {
                "title": "Total Applications",
 
                "value": str(apps_today),
 
                "trend": _trend(
                    apps_today,
                    apps_yesterday
                ),
 
                "isUp": _is_up(
                    apps_today,
                    apps_yesterday
                ),
            },
 
            {
                "title": "Total Revenue",
 
                "value": str(rev_today),
 
                "trend": _trend(
                    float(rev_today),
                    float(rev_yesterday)
                ),
 
                "isUp": _is_up(
                    float(rev_today),
                    float(rev_yesterday)
                ),
            },
 
            {
                "title": "Total Subscribers",
 
                "value": str(subs_today),
 
                "trend": _trend(
                    subs_today,
                    subs_yesterday
                ),
 
                "isUp": _is_up(
                    subs_today,
                    subs_yesterday
                ),
            },
        ]
 
       
        # USER GROWTH CHART
       
 
        user_monthly_rows = list(
 
            User.objects
 
            .filter(
                date_joined__gte=nine_months_ago
            )
 
            .annotate(
                month=TruncMonth("date_joined")
            )
 
            .values("month")
 
            .annotate(
                users=Count("id"),
 
                recent_users=Count(
                    "id",
                    filter=Q(
                        date_joined__gte=four_months_ago
                    )
                ),
            )
 
            .order_by("month")
        )
 
        user_growth_map = {
 
            _month_label(row["month"]): row["users"]
 
            for row in user_monthly_rows
        }
 
        user_growth_months = []
 
        for i in range(8, -1, -1):
 
            user_growth_months.append(
                _month_label(
                    now - timedelta(days=30 * i)
                )
            )
 
        user_growth_chart = [
 
            {
                "name": month,
 
                "users": user_growth_map.get(month, 0)
            }
 
            for month in user_growth_months
        ]
 
        # ACTIVITIES CHART
     
 
        new_users_qs = {
 
            _month_label(r["month"]): r["recent_users"]
 
            for r in user_monthly_rows
        }
 
        jobs_posted_qs = {
 
            _month_label(r["month"]): r["recent_postings"]
 
            for r in job_monthly_rows
        }
 
        subs_qs = {
 
            _month_label(r["month"]): r["cnt"]
 
            for r in (
 
                Subscription.objects
 
                .filter(
                    start_date__gte=four_months_ago,
                    status="active"
                )
 
                .annotate(
                    month=TruncMonth("start_date")
                )
 
                .values("month")
 
                .annotate(
                    cnt=Count("id")
                )
 
                .order_by("month")
            )
        }
 
        activity_months = []
 
        for i in range(3, -1, -1):
 
            activity_months.append(
                _month_label(
                    now - timedelta(days=30 * i)
                )
            )
 
        activities_chart = [
 
            {
                "name": m,
 
                "newUsers": new_users_qs.get(m, 0),
 
                "jobsPosted": jobs_posted_qs.get(m, 0),
 
                "subscribers": subs_qs.get(m, 0),
            }
 
            for m in activity_months
        ]
 
        # EXPERIENCE LEVELS
       
 
        profiles = JobSeekerProfile.objects.filter(
            total_experience_years__isnull=False
        ).values_list(
            'total_experience_years',
            flat=True
        )
 
        entry = sum(
            1 for y in profiles
            if float(y) < 1
        )
 
        junior = sum(
            1 for y in profiles
            if 1 < float(y) <= 3
        )
 
        mid = sum(
            1 for y in profiles
            if 3 < float(y) <= 6
        )
 
        senior = sum(
            1 for y in profiles
            if float(y) > 6
        )
 
        total_experience_users = max(
            entry + junior + mid + senior,
            1
        )
 
        experience_levels = [
 
            {
                "label": "Entry Level",
                "count": entry,
                "percentage": round(
                    (entry / total_experience_users) * 100
                ),
            },
 
            {
                "label": "Junior Level",
                "count": junior,
                "percentage": round(
                    (junior / total_experience_users) * 100
                ),
            },
 
            {
                "label": "Mid Level",
                "count": mid,
                "percentage": round(
                    (mid / total_experience_users) * 100
                ),
            },
 
            {
                "label": "Senior Level",
                "count": senior,
                "percentage": round(
                    (senior / total_experience_users) * 100
                ),
            },
        ]
 
        # TOTAL OVERVIEW
       
 
        application_counts = JobApplication.objects.aggregate(
 
            applicants=Count(
                'id',
                filter=Q(
                    status=JobApplication.Status.APPLIED
                )
            ),
 
            recommended=Count(
                'id',
                filter=Q(
                    status=JobApplication.Status.RECRUITER_REVIEW
                )
            ),
 
            shortlisted=Count(
                'id',
                filter=Q(
                    status=JobApplication.Status.SHORTLISTED
                )
            ),
 
            interview=Count(
                'id',
                filter=Q(
                    status=JobApplication.Status.INTERVIEW_CALLED
                )
            ),
 
            rejected=Count(
                'id',
                filter=Q(
                    status=JobApplication.Status.REJECTED
                )
            ),
 
            hired=Count(
                'id',
                filter=Q(
                    status=JobApplication.Status.HIRED
                )
            ),
        )
 
        total_candidates = sum(
            application_counts.values()
        )
 
        total_overview = {
 
            "total_candidates": total_candidates,
 
            "recommended":
                application_counts["recommended"],
 
            "shortlisted":
                application_counts["shortlisted"],
 
            "applicants":
                application_counts["applicants"],
 
            "interview":
                application_counts["interview"],
 
            "rejected":
                application_counts["rejected"],
 
            "hired":
                application_counts["hired"],
        }
 
 
        payload = {
 
            "overview_stats": overview_stats,
 
            "job_postings_chart": job_postings_chart,
 
            "highlighted_jobs": highlighted_jobs,
 
            "admin_stats": admin_stats,
 
            "user_growth_chart": user_growth_chart,
 
            "activities_chart": activities_chart,
 
            "experience_levels": experience_levels,
 
            "total_overview": total_overview,
        }
 
        return Response(
            payload,
            status=status.HTTP_200_OK
        )
    
class AdminProfilePhotoView(APIView):
    """
    GET    /admin/profile/photo/  — returns the current admin's photo URL
    POST   /admin/profile/photo/  — uploads a new photo (multipart/form-data, field: photo)
    DELETE /admin/profile/photo/  — removes the current photo
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def _get_profile(self, user):
        profile, _ = AdminProfile.objects.get_or_create(user=user)
        return profile

    def get(self, request):
        profile = self._get_profile(request.user)
        serializer = AdminProfilePhotoSerializer(
            profile,
            context={'request': request}
        )
        return Response(serializer.data)

    def post(self, request):
        photo = request.FILES.get('photo')
        if not photo:
            return Response(
                {"error": "No photo file provided. Use field name 'photo'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
        if photo.content_type not in allowed_types:
            return Response(
                {"error": "Invalid file type. Allowed: JPG, JPEG, PNG, WEBP."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate file size (5MB max)
        if photo.size > 5 * 1024 * 1024:
            return Response(
                {"error": "File too large. Maximum size is 5MB."},
                status=status.HTTP_400_BAD_REQUEST
            )

        profile = self._get_profile(request.user)

        # Delete old photo from storage before saving new one
        if profile.profile_photo:
            profile.profile_photo.delete(save=False)

        profile.profile_photo = photo
        profile.save()

        serializer = AdminProfilePhotoSerializer(
            profile,
            context={'request': request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request):
        profile = self._get_profile(request.user)

        if not profile.profile_photo:
            return Response(
                {"error": "No photo to remove."},
                status=status.HTTP_400_BAD_REQUEST
            )

        profile.profile_photo.delete(save=False)
        profile.profile_photo = None
        profile.save()

        return Response(
            {"message": "Profile photo removed successfully."},
            status=status.HTTP_200_OK
        )
    
class UserDetailView(APIView):
    """GET /users/<pk>/ — returns full user details for the View Details panel"""
    #permission_classes = [IsAuthenticated, IsAdminUserType]

    def get(self, request, pk):
        user = get_object_or_404(
            User.objects.select_related(
                'jobseeker_profile',
                'employer_profile',
                'employer_profile__company',
            ).prefetch_related(
                'jobseeker_profile__skills',
                'jobseeker_profile__educations',
            ),
            pk=pk
        )
        serializer = UserDetailSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserDeleteView(APIView):
    """DELETE /users/<pk>/delete/ — hard-deletes a user"""
    #permission_classes = [IsAuthenticated, IsAdminUserType]

    def delete(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        user.delete()
        return Response(
            {"message": "User deleted successfully.", "id": pk},
            status=status.HTTP_200_OK
        )

class CurrentUserView(APIView):
    """
    GET /api/users/me/
    Returns current logged-in user's details including name from profile.
    Works for Jobseeker, Employer, and Admin.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'phone': user.phone or '',
            'user_type': user.user_type,
            'name': '',
        }
        
        # Get name from respective profile
        if user.user_type == 'jobseeker':
            profile = getattr(user, 'jobseeker_profile', None)
            if profile:
                data['name'] = profile.full_name or user.username
                # Also fetch alternate phone if main phone is empty
                if not data['phone'] and profile.alternate_phone:
                    data['phone'] = profile.alternate_phone
                    
        elif user.user_type == 'employer':
            profile = getattr(user, 'employer_profile', None)
            if profile:
                data['name'] = profile.full_name or user.username
                
        elif user.user_type == 'admin':
            profile = getattr(user, 'admin_profile', None)
            if profile:
                data['name'] = user.get_full_name() or user.username
            else:
                data['name'] = user.username
        else:
            data['name'] = user.username
            
        return Response(data, status=status.HTTP_200_OK)
    
class PlanListCreateView(APIView):
    """
    GET  /api/plans/       — list all plans
    POST /api/plans/       — admin creates a new plan
    """

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def get(self, request):
        plans = Plan.objects.prefetch_related('features').all()
        serializer = PlanSerializer(plans, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = PlanSerializer(data=request.data)
        if serializer.is_valid():
            plan = serializer.save()
            return Response(
                {
                    "message": "Plan created successfully.",
                    "data": PlanSerializer(plan).data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PlanDetailView(APIView):
    """
    GET    /api/plans/<pk>/   — retrieve a single plan
    PUT    /api/plans/<pk>/   — admin full update
    PATCH  /api/plans/<pk>/   — admin partial update
    DELETE /api/plans/<pk>/   — admin delete
    """

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        return [IsAdminUser()]

    def _get_plan(self, pk):
        try:
            return Plan.objects.get(pk=pk)
        except Plan.DoesNotExist:
            return None

    def get(self, request, pk):
        plan = self._get_plan(pk)
        if plan is None:
            return Response(
                {"error": "Plan not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = PlanSerializer(plan, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        plan = self._get_plan(pk)
        if plan is None:
            return Response(
                {"error": "Plan not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # If it's STARTER PLAN, force price fields to 0
        if plan.name.upper() == 'STARTER PLAN':
            data = request.data.copy() if hasattr(request, 'data') else {}
            data['monthly_price'] = 0
            data['tax'] = 0
            data['discount_halfyear'] = 0
            data['discount_annual'] = 0
            request._full_data = data
        
        serializer = PlanSerializer(plan, data=request.data, context={'request': request})
        if serializer.is_valid():
            updated_plan = serializer.save()
            return Response(
                {
                    "message": "Plan updated successfully.",
                    "data": PlanSerializer(updated_plan, context={'request': request}).data,
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        plan = self._get_plan(pk)
        if plan is None:
            return Response(
                {"error": "Plan not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # If it's STARTER PLAN, force price fields to 0
        if plan.name.upper() == 'STARTER PLAN':
            data = request.data.copy() if hasattr(request, 'data') else {}
            # Force price fields to 0 for Starter Plan
            data['monthly_price'] = 0
            data['tax'] = 0
            data['discount_halfyear'] = 0
            data['discount_annual'] = 0
            # Keep features and other fields as they are
            request._full_data = data
            print(f"[DEBUG] STARTER PLAN - Forcing price fields to 0, keeping features: {data.get('features', 'no features')}")
        
        serializer = PlanSerializer(plan, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            updated_plan = serializer.save()
            return Response(
                {
                    "message": "Plan updated successfully.",
                    "data": PlanSerializer(updated_plan, context={'request': request}).data,
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        plan = self._get_plan(pk)
        if plan is None:
            return Response(
                {"error": "Plan not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Prevent deleting STARTER PLAN
        if plan.name.upper() == 'STARTER PLAN':
            return Response(
                {"error": "Starter Plan cannot be deleted as it is the core system plan."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        plan_name = plan.name
        plan.delete()
        return Response(
            {"message": f"Plan '{plan_name}' deleted successfully."},
            status=status.HTTP_200_OK,
        )

    def patch(self, request, pk):
        plan = self._get_plan(pk)
        if plan is None:
            return Response(
                {"error": "Plan not found."},
                status=status.HTTP_404_NOT_FOUND
            )
    
        # If it's STARTER PLAN, force price fields to 0
        if plan.name.upper() == 'STARTER PLAN':
            data = request.data.copy() if hasattr(request, 'data') else {}
            # Force price fields to 0 for Starter Plan
            data['monthly_price'] = 0
            data['tax'] = 0
            data['discount_halfyear'] = 0
            data['discount_annual'] = 0
            request._full_data = data
            print(f"[DEBUG] STARTER PLAN - Forcing price fields to 0")
    
        print(f"[DEBUG] PATCH request data: {request.data}")
    
        serializer = PlanSerializer(plan, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            updated_plan = serializer.save()
        
            # Fetch fresh data with updated settings
            fresh_serializer = PlanSerializer(updated_plan, context={'request': request})
        
            return Response(
                {
                    "message": "Plan updated successfully.",
                    "data": fresh_serializer.data,
                },
                status=status.HTTP_200_OK,
            )
        print(f"[DEBUG] Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        plan = self._get_plan(pk)
        if plan is None:
            return Response(
                {"error": "Plan not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        plan_name = plan.name
        plan.delete()
        return Response(
            {"message": f"Plan '{plan_name}' deleted successfully."},
            status=status.HTTP_200_OK,
        )


class PlanPublishToggleView(APIView):
    """
    PATCH /api/plans/<pk>/toggle-publish/
    Flips is_published flag. Admin only.
    """
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            plan = Plan.objects.get(pk=pk)
        except Plan.DoesNotExist:
            return Response(
                {"error": "Plan not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        plan.is_published = not plan.is_published
        plan.save(update_fields=['is_published', 'updated_at'])
        state = "published" if plan.is_published else "unpublished"
        return Response(
            {
                "message": f"Plan '{plan.name}' is now {state}.",
                "is_published": plan.is_published,
            },
            status=status.HTTP_200_OK,
        )