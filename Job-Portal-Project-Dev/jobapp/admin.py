from django.contrib import admin
from django.contrib.sessions.models import Session
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import (
    AdminProfile,
    Complaint,
    EducationEntry,
    WorkExperienceEntry,
    Skill,
    LanguageKnown,
    Certification,
    # REMOVED: Company,
    EmployerProfile,
    PostAJob,
    JobApplication,
    SavedJob,
    NewsletterSubscriber,
    Notification,
    Conversation,
    Message,
    ChatMessage,
    HelpTopic,
    RaiseTicket,
    ContactMessage,
    CompanyVerification,
    JobSeekerProfile,
    User,
    CompanyProfile
)

User = get_user_model()


# -------------------------
# INLINE CONFIGURATION
# -------------------------

class EducationInline(admin.TabularInline):
    model = EducationEntry
    extra = 0


class ExperienceInline(admin.TabularInline):
    model = WorkExperienceEntry
    extra = 0


class SkillInline(admin.TabularInline):
    model = Skill
    extra = 0


class LanguageInline(admin.TabularInline):
    model = LanguageKnown
    extra = 0


class CertificationInline(admin.TabularInline):
    model = Certification
    extra = 0


# -------------------------
# COMPANY ADMIN - REMOVED
# -------------------------

# REMOVED: @admin.register(Company)
# REMOVED: class CompanyAdmin(admin.ModelAdmin)


# -------------------------
# EMPLOYER ADMIN
# -------------------------

@admin.register(EmployerProfile)
class EmployerAdmin(admin.ModelAdmin):
    list_display = ("full_name", "user", "company", "created_at")
    search_fields = ("full_name", "user__email")
    list_filter = ("company",)


# -------------------------
# ADMIN PROFILE
# -------------------------

@admin.register(AdminProfile)
class AdminProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "department", "access_level", "created_at")
    search_fields = ("user__email", "department")


# -------------------------
# JOB ADMIN (UPDATED TO POSTAJOB)
# -------------------------

@admin.register(PostAJob)
class PostAJobAdmin(admin.ModelAdmin):
    list_display = ("job_title", "employer", "location", "work_type", "is_published", "created_at", "job_status")
    list_filter = ("work_type", "shift", "is_published", "job_status", "created_at")
    search_fields = ("job_title", "employer__email", "location")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)


# -------------------------
# JOB APPLICATION ADMIN (UPDATED)
# -------------------------

@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ("user", "job", "status", "applied_date")
    list_filter = ("status",)
    search_fields = ("user__email", "job__job_title")
    readonly_fields = ("applied_date",)


# -------------------------
# SAVED JOBS (UPDATED)
# -------------------------

@admin.register(SavedJob)
class SavedJobAdmin(admin.ModelAdmin):
    list_display = ("user", "job", "saved_date")
    search_fields = ("user__email", "job__job_title")


# -------------------------
# NEWSLETTER
# -------------------------

@admin.register(NewsletterSubscriber)
class NewsletterAdmin(admin.ModelAdmin):
    list_display = ("email", "is_active", "subscribed_at")
    search_fields = ("email",)
    list_filter = ("is_active",)


# -------------------------
# NOTIFICATIONS
# -------------------------

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("user", "is_read", "created_at")
    list_filter = ("is_read",)
    search_fields = ("user__email",)


# -------------------------
# CHAT SYSTEM
# -------------------------

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ("id", "initiated_by", "jobseeker_can_reply", "updated_at")
    readonly_fields = ("created_at", "updated_at")


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("conversation", "sender", "receiver", "timestamp", "is_read")
    search_fields = ("sender__email", "receiver__email")
    readonly_fields = ("timestamp",)


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("sender", "created_at")
    readonly_fields = ("created_at",)


# -------------------------
# HELP SYSTEM
# -------------------------

@admin.register(HelpTopic)
class HelpTopicAdmin(admin.ModelAdmin):
    list_display = ("title", "path")


@admin.register(RaiseTicket)
class RaiseTicketAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "email", "category", "subject", "created_at")
    list_filter = ("category", "subject", "created_at")
    search_fields = ("name", "email", "subject")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)


# -------------------------
# SESSIONS
# -------------------------

class ActiveUserAdmin(admin.ModelAdmin):
    list_display = ('user', 'email', 'session_key', 'expire_date')
    readonly_fields = ('user', 'email', 'session_key', 'expire_date')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.filter(expire_date__gte=timezone.now())

    def user(self, obj):
        data = obj.get_decoded()
        user_id = data.get('_auth_user_id')
        if user_id:
            return User.objects.filter(id=user_id).first()
        return None

    def email(self, obj):
        data = obj.get_decoded()
        user_id = data.get('_auth_user_id')
        if user_id:
            user = User.objects.filter(id=user_id).first()
            if user:
                return user.email
        return None


admin.site.register(Session, ActiveUserAdmin)


# -------------------------
# CONTACT MESSAGE ADMIN
# -------------------------

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "contact", "message", "created_at")
    search_fields = ("name", "email", "contact")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)


# -------------------------
# COMPANY VERIFICATION ADMIN
# -------------------------

@admin.register(CompanyVerification)
class CompanyVerificationAdmin(admin.ModelAdmin):
    list_display = ("legal_name", "official_email", "phone_number", "status", "created_at")
    list_filter = ("status",)


# -------------------------
# USER ADMIN
# -------------------------

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'user_type', 'is_active', 'date_joined')
    list_filter = ('user_type', 'is_active')
    search_fields = ('username', 'email')
    readonly_fields = ('date_joined', 'last_login')
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'phone', 'user_type')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )


# -------------------------
# JOB SEEKER PROFILE ADMIN
# -------------------------

@admin.register(JobSeekerProfile)
class JobSeekerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'current_job_title', 'current_location', 'total_experience_years')
    search_fields = ('user__email', 'full_name', 'user__phone')
    list_filter = ('gender', 'current_location')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {'fields': ('user', 'full_name', 'profile_photo')}),
        ('Personal Info', {'fields': ('gender', 'dob', 'marital_status', 'nationality')}),
        ('Contact Details', {'fields': ('alternate_phone', 'alternate_email', 'full_address', 'street', 'city', 'state', 'pincode', 'country')}),
        ('Professional Details', {'fields': ('current_job_title', 'current_company', 'total_experience_years', 'notice_period', 'current_location', 'preferred_locations')}),
        ('Resume & Portfolio', {'fields': ('resume_file', 'portfolio_link')}),
        ('Career Preferences', {'fields': ('current_ctc', 'expected_ctc', 'preferred_job_type', 'preferred_role_industry', 'ready_to_start_immediately', 'willing_to_relocate')}),
        ('Meta', {'fields': ('created_at', 'updated_at')}),
    )
    inlines = [
        EducationInline,
        ExperienceInline,
        SkillInline,
        LanguageInline,
        CertificationInline
    ]



# -------------------------
# COMPLAINT ADMIN
# -------------------------

@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = (
        'full_name',
        'email',
        'mobile',
        'reason',
        'status',
        'created_at'
    )
    list_filter = ('status', 'created_at')
    search_fields = (
        'first_name',
        'last_name',
        'email',
        'mobile',
        'reason'
    )
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'user')
    list_per_page = 20

    def full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"

    full_name.short_description = "Full Name"
    full_name.admin_order_field = 'first_name'

class EmployerInline(admin.TabularInline):
        model = EmployerProfile
        extra = 0
        fields = ('user', 'full_name', 'employee_id')
        readonly_fields = ('created_at', 'updated_at')
 
@admin.register(CompanyProfile)
class CompanyProfileAdmin(admin.ModelAdmin):
        list_display = ('company_name', 'contact_person', 'company_email', 'company_size', 'employers_count', 'created_at')
        search_fields = ('company_name', 'contact_person', 'company_email')
        list_filter = ('company_size', 'created_at')
        readonly_fields = ('created_at',)
        inlines = [EmployerInline]  # Show all employers linked to this company
       
        def employers_count(self, obj):
            return obj.employers.count()
        employers_count.short_description = 'Number of Employers'
       
        fieldsets = (
            ('Basic Information', {
                'fields': ('company_name', 'company_moto', 'company_logo', 'created_by')
            }),
            ('Contact Information', {
                'fields': ('contact_person', 'contact_number', 'company_email', 'website')
            }),
            ('Address', {
                'fields': ('address1', 'address2')
            }),
            ('Company Details', {
                'fields': ('company_size', 'about')
            }),
            ('Meta', {
                'fields': ('created_at',)
            }),
        )  

 # ==================== BILLING MODELS ADMIN ====================
 
from .models import Plan, Subscription, Payment, Invoice, PaymentMethod
 
@admin.register(Plan)
 
 
class PlanAdmin(admin.ModelAdmin):
    # Use 'monthly_price' instead of 'base_price'
    list_display = ['id', 'name', 'monthly_price', 'duration_days']
    list_editable = ['monthly_price', 'duration_days']
    search_fields = ['name']
 
 
 
 
@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'plan', 'status', 'start_date', 'end_date']
    list_filter = ['status', 'plan']
    search_fields = ['user__email', 'user__username']
    raw_id_fields = ['user', 'plan']
    readonly_fields = ['start_date', 'end_date']
 
 
@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'plan', 'amount', 'status', 'created_at']
    list_filter = ['status', 'currency']
    search_fields = ['user__email', 'razorpay_order_id', 'razorpay_payment_id']
    readonly_fields = ['created_at', 'updated_at']
    raw_id_fields = ['user', 'plan']
 
 
@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'user', 'plan_name', 'total', 'payment_status', 'invoice_date']
    list_filter = ['payment_status', 'invoice_date']
    search_fields = ['invoice_number', 'user__email', 'plan_name']
    readonly_fields = ['invoice_date', 'created_at']
 
 
@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'method_type', 'card_last4', 'is_default']
    list_filter = ['method_type', 'is_default']
    search_fields = ['user__email', 'card_holder_name']
    raw_id_fields = ['user']
 