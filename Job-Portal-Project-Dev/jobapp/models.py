from datetime import timedelta
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import uuid
from django.core.validators import RegexValidator


class User(AbstractUser):
    class UserType(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        EMPLOYER = 'employer', 'Employer'
        JOBSEEKER = 'jobseeker', 'Jobseeker'
    
    class AccountStatus(models.TextChoices):  # newly added
        ACTIVE = 'Active', 'Active'
        HOLD = 'Hold', 'Hold'
        DEACTIVATED = 'Deactivated', 'Deactivated'
          

    user_type = models.CharField(max_length=10, choices=UserType.choices)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    status = models.CharField(                          # ← NEW
        max_length=15,
        choices=AccountStatus.choices,
        default=AccountStatus.ACTIVE
    )
    password_changed_at = models.DateTimeField(null=True,blank=True)
    password_expiry_days = models.IntegerField(default=30)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'user_type']

    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(null=True, blank=True)
    login_time = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'User'

    def __str__(self):
        return f"{self.username} ({self.user_type})"


# PROFILES
class JobSeekerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='jobseeker_profile')

    class EmploymentStatus(models.TextChoices):
        FRESHER = "Fresher", "Fresher"
        EXPERIENCED = "Experienced", "Experienced"
 
    employment_status = models.CharField(
        max_length=20,
        choices=EmploymentStatus.choices,
        null=True,
        blank=True
    )
 
    # Basic Profile
    full_name = models.CharField(max_length=200, blank=True)
    gender = models.CharField(
        max_length=20,
        choices=(('Male', 'Male'), ('Female', 'Female'), ('Not Specified', 'Not Specified')),
        blank=True
    )
    dob = models.DateField(null=True, blank=True)
    marital_status = models.CharField(
        max_length=20,
        choices=(('Single', 'Single'), ('Married', 'Married')),
        blank=True
    )
    nationality = models.CharField(max_length=100, blank=True)
    profile_photo = models.ImageField(upload_to='profile_photos/', null=True, blank=True)
 
    # Current / Professional Details
    current_job_title = models.CharField(max_length=200, blank=True)
    current_company = models.CharField(max_length=200, blank=True)
    total_experience_years = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    notice_period = models.CharField(
        max_length=50,
        choices=(
            ('Immediate', 'Immediate'),
            ('1 Month', '1 Month'),
            ('2 Months', '2 Months'),
            ('3 Months', '3 Months'),
        ),
        blank=True
    )
    current_location = models.CharField(max_length=200, blank=True)
    preferred_locations = models.TextField(blank=True)
 
    # Contact Details
    alternate_phone = models.CharField(max_length=15, blank=True, null=True)
    alternate_email = models.EmailField(blank=True, null=True)
    full_address = models.TextField(blank=True)
    street = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=10, blank=True)
    country = models.CharField(max_length=100, blank=True)

    # Resume & Portfolio
    resume_file = models.FileField(upload_to='resumes/', null=True, blank=True)
    portfolio_link = models.URLField(blank=True, null=True)

    # Career Preferences (FIXED DECIMALS)
    total_experience_years = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        null=True,
        blank=True,
        default=None
    )

    current_ctc = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        default=None
    )

    expected_ctc = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        default=None
    )

    preferred_job_type = models.CharField(
        max_length=50,
        choices=(
            ('Full-time', 'Full-time'),
            ('Part-time', 'Part-time'),
            ('Internship', 'Internship'),
            ('Contract', 'Contract'),
        ),
        blank=True
    )
    preferred_role_industry = models.CharField(max_length=200, blank=True)
    ready_to_start_immediately = models.BooleanField(default=False)
    willing_to_relocate = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # =====================================================
    # HELPERS (UNCHANGED)
    # =====================================================
    def get_current_experience(self):
        return self.experiences.filter(currently_working=True).first()
 
    def get_total_experience(self):
        return self.experiences.count()
 
    class Meta:
        db_table = 'JobSeekerProfile'
    
    @property
    def profile_completion(self):

        fields_to_check = [

            self.full_name,

            self.gender,

            self.dob,

            self.marital_status,

            self.nationality,

            self.profile_photo,

            self.current_job_title,

            self.current_company,

            self.total_experience_years,

            self.notice_period,

            self.current_location,

            self.preferred_locations,

            self.alternate_phone,

            self.alternate_email,

            self.full_address,

            self.street,

            self.city,

            self.state,

            self.pincode,

            self.country,

            self.resume_file,

            self.portfolio_link,

            self.current_ctc,

            self.expected_ctc,

            self.preferred_job_type,

            self.preferred_role_industry,
        ]

        completed_fields = sum(
            1
            for field in fields_to_check
            if field not in [None, "", []]
        )

        total_fields = len(fields_to_check)

        percentage = int(
            (
                completed_fields
                /
                total_fields
            ) * 100
        )

        return percentage

    def __str__(self):

        return (
            f"Job Seeker: "
            f"{self.user.email}"
        )

    def __str__(self):
        return f"Job Seeker: {self.user.email}"


class AdminProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')

    department = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    access_level = models.CharField(max_length=50, default='Full')
    profile_photo = models.ImageField(
        upload_to='admin_profile_photos/',
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    two_factor_enabled = models.BooleanField(default=False)   
    two_factor_method = models.CharField(            
        max_length=10,
        choices=[
            ("email", "Email"),
            ("sms", "SMS")
        ],
        null=True,
        blank=True
    )

    class Meta:
        db_table = 'AdminProfile'

    def __str__(self):
        return f"Admin: {self.user.email}"


# JOB SEEKER RELATED DETAIL MODELS


class EducationEntry(models.Model):
    class QualificationLevel(models.TextChoices):
        SSLC = 'SSLC', 'SSLC'
        HSC = 'HSC', 'HSC'
        DIPLOMA = 'Diploma', 'Diploma'
        GRADUATION = 'Graduation', 'Graduation'
        POST_GRADUATION = 'Post-Graduation', 'Post-Graduation'
        DOCTORATE = 'Doctorate', 'Doctorate'

    class Post10thStudy(models.TextChoices):
        INTERMEDIATE = 'Intermediate', 'Intermediate/12th'
        DIPLOMA = 'Diploma', 'Diploma'

    profile = models.ForeignKey(JobSeekerProfile, on_delete=models.CASCADE, related_name='educations')

    qualification_level = models.CharField(
        max_length=30,
        choices=QualificationLevel.choices
    )

    # Common fields
    institution = models.CharField(max_length=200)
    percentage_or_cgpa = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    # SSLC / HSC
    location = models.CharField(max_length=200, blank=True)

    # HSC specific
    post_10th_study = models.CharField(
        max_length=20,
        choices=Post10thStudy.choices,
        blank=True,
        null=True
    )

    # Graduation / Post-Grad / Doctorate specific
    degree = models.CharField(max_length=200, blank=True, null=True)
    department = models.CharField(max_length=200, blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=(('Completed', 'Completed'), ('Pursuing', 'Pursuing')),
        blank=True,
        null=True
    )
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)

    # Date fields - different depending on level
    completion_year = models.DateField(
        null=True,
        blank=True,
        help_text="Used for SSLC, HSC, Diploma - year of completion"
    )

    start_year = models.DateField(
        null=True,
        blank=True,
        help_text="Used for Graduation, Post-Graduation, Doctorate"
    )

    end_year = models.DateField(
        null=True,
        blank=True,
        help_text="Used for Graduation, Post-Graduation, Doctorate"
    )

    class Meta:
        db_table = 'EducationEntry'
        ordering = ['-end_year', '-completion_year', '-start_year']

    def __str__(self):
        return f"{self.qualification_level} - {self.institution}"


class WorkExperienceEntry(models.Model):
    class CurrentStatus(models.TextChoices):
        FRESHER = 'Fresher', 'Fresher'
        EXPERIENCED = 'Experienced', 'Experienced'

    class YesNo(models.TextChoices):
        YES = 'Yes', 'Yes'
        NO = 'No', 'No'

    class IndustryDomain(models.TextChoices):
        IT_SOFTWARE = 'IT-Software', 'IT-Software'
        FINANCE = 'Finance', 'Finance'
        HEALTHCARE = 'Healthcare', 'Healthcare'
        EDUCATION = 'Education', 'Education'
        MANUFACTURING = 'Manufacturing', 'Manufacturing'
        MARKETING = 'Marketing', 'Marketing'
        RETAIL = 'Retail', 'Retail'
        OTHER = 'Other', 'Other'

    class JobType(models.TextChoices):
        FULL_TIME = 'Full-time', 'Full-time'
        PART_TIME = 'Part-time', 'Part-time'
        CONTRACT = 'Contract', 'Contract'
        INTERNSHIP = 'Internship', 'Internship'

    profile = models.ForeignKey(JobSeekerProfile, on_delete=models.CASCADE, related_name='experiences')

    # Status & internship
    current_status = models.CharField(
        max_length=20,
        choices=CurrentStatus.choices,
        default=CurrentStatus.FRESHER
    )
    has_internship_experience = models.CharField(
        max_length=3,
        choices=YesNo.choices,
        blank=True,
        help_text="Only relevant if current_status is Fresher"
    )

    # Experience details
    job_title = models.CharField(max_length=200, blank=True)
    company_name = models.CharField(max_length=200, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    currently_working = models.BooleanField(default=False)
    industry_domain = models.CharField(max_length=50, choices=IndustryDomain.choices, blank=True)
    job_type = models.CharField(max_length=50, choices=JobType.choices, blank=True)
    location = models.CharField(max_length=200, blank=True)
    key_responsibilities = models.TextField(blank=True)

    class Meta:
        db_table = 'WorkExperienceEntry'
        ordering = ['-start_date']

    def __str__(self):
        if self.current_status == self.CurrentStatus.FRESHER:
            return f"Fresher (Internship: {self.has_internship_experience})"
        return f"{self.job_title} @ {self.company_name}"


class Skill(models.Model):
    profile = models.ForeignKey(JobSeekerProfile, on_delete=models.CASCADE, related_name='skills')
    name = models.CharField(max_length=100)

    class Meta:
        db_table = 'Skill'
        unique_together = ['profile', 'name']

    def __str__(self):
        return self.name


class LanguageKnown(models.Model):
    profile = models.ForeignKey(JobSeekerProfile, on_delete=models.CASCADE, related_name='languages')
    name = models.CharField(max_length=100)
    proficiency = models.CharField(
        max_length=50,
        choices=(
            ('Beginner', 'Beginner'),
            ('Intermediate', 'Intermediate'),
            ('Fluent', 'Fluent'),
            ('Native', 'Native'),
        )
    )

    class Meta:
        db_table = 'LanguageKnown'
        unique_together = ['profile', 'name']

    def __str__(self):
        return f"{self.name} ({self.proficiency})"


class Certification(models.Model):
    profile = models.ForeignKey(JobSeekerProfile, on_delete=models.CASCADE, related_name='certifications')
    name = models.CharField(max_length=200)
    certificate_file = models.FileField(upload_to='certificates/', null=True, blank=True)

    class Meta:
        db_table = 'Certification'

    def __str__(self):
        return self.name


# JOBS & APPLICATIONS


class EmployerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employer_profile')
    full_name = models.CharField(max_length=200, blank=True)
    employee_id = models.CharField(max_length=50, blank=True, unique=True, null=True)
   
    company = models.ForeignKey('CompanyProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='employers')  
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'EmployerProfile'


class JobHistory(models.Model):
    job_id = models.IntegerField()
    employer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    job_title = models.CharField(max_length=255)
 
    created_at = models.DateTimeField()
    deleted_at = models.DateTimeField()
 
    data = models.JSONField(default=dict)

    class Meta:
        db_table = 'JobHistory'


# Post a Job Model (Main Job Model)
from django.core.exceptions import ValidationError
class PostAJob(models.Model):
    class WorkType(models.TextChoices):
        HYBRID = "Hybrid", "Hybrid"
        REMOTE = "Remote", "Remote"
        ON_SITE = "On-site", "On-site"
 
    class Shift(models.TextChoices):
        GENERAL = "General", "General"
        NIGHT = "Night", "Night"
        ROTATIONAL = "Rotational", "Rotational"
 
    class JobStatus(models.TextChoices):
        HIRING_IN_PROGRESS = "Hiring in Progress", "Hiring in Progress"
        REVIEWING_APPLICATION = "Reviewing Application", "Reviewing Application"
        HIRING_DONE = "Hiring Done", "Hiring Done"
 
    # NEW: Approval Status (CRITICAL)
    class ApprovalStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
 
    employer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='post_a_jobs'
    )
 
    job_title = models.CharField(max_length=255)
    industry_type = models.JSONField(default=list, blank=True)
    department = models.JSONField(default=list, blank=True)
    work_type = models.CharField(max_length=50, choices=WorkType.choices)
    shift = models.CharField(max_length=50, choices=Shift.choices)
    work_duration = models.CharField(max_length=100)
    salary = models.CharField(max_length=100, blank=True, default='Not Disclosed')
    experience = models.CharField(max_length=100)
    location = models.JSONField(default=list, blank=True)
    openings = models.PositiveIntegerField()
    job_category = models.CharField(max_length=255, blank=True)
    education = models.JSONField(default=list, blank=True)
    key_skills = models.JSONField(default=list, blank=True)
    job_highlights = models.JSONField(default=list, blank=True)
    job_description = models.TextField()
    responsibilities = models.JSONField(default=list, blank=True)
    last_date_to_apply = models.DateField(null=True, blank=True)

    expiry_days = models.PositiveIntegerField(
    default=30
    )
 
    expiry_date = models.DateTimeField(
        null=True,
        blank=True,
        db_index=True
    )
 
    is_expired = models.BooleanField(
        default=False,
        db_index=True
    )
 
    expiry_notified = models.BooleanField(
        default=False
    )
 
 
    job_status = models.CharField(
        max_length=50,
        choices=JobStatus.choices,
        default=JobStatus.REVIEWING_APPLICATION,
    )
 
    # EXISTING FIELD
    is_published = models.BooleanField(default=False, db_index=True)
 
    # NEW FIELD (IMPORTANT)
    approval_status = models.CharField(
        max_length=10,
        choices=ApprovalStatus.choices,
        default=ApprovalStatus.PENDING,
        db_index=True
    )
 
    # OPTIONAL: track admin actions
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_jobs"
    )
 
    approved_at = models.DateTimeField(null=True, blank=True)
 
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    flagged = models.BooleanField(default=False, help_text="Admin flagged for review")
    is_highlighted = models.BooleanField(default=False)
    highlighted_at = models.DateTimeField(
        null=True,
        blank=True
    )
 
    class Meta:
        db_table = 'PostAJob'

    # ================= VALIDATIONS =================
    def clean(self):
        valid_statuses = [status[0] for status in self.JobStatus.choices]
       
        if not self.job_status or self.job_status.strip() == "":
            raise ValidationError({
                'job_status': "Job status cannot be empty. Must be one of: " + ", ".join(valid_statuses)
            })
       
        if self.job_status not in valid_statuses:
            raise ValidationError({
                'job_status': f"Invalid job status: '{self.job_status}'. Must be one of: {', '.join(valid_statuses)}"
            })
 
    # ================= SAVE LOGIC =================
    def save(self, *args, **kwargs):
        self.clean()
 
        # AUTO CONTROL LOGIC (VERY IMPORTANT)
        if self.approval_status != "approved":
            self.is_published = False  # cannot be visible
 
        if self.approval_status == "approved" and not self.approved_at:
            self.approved_at = timezone.now()
 
        super().save(*args, **kwargs)
 
    def delete(self, *args, **kwargs):
        from .models import JobHistory
        from django.forms.models import model_to_dict
        from django.core.serializers.json import DjangoJSONEncoder
        import json
 
        try:
            job_data = model_to_dict(self)
           
            job_data = json.loads(
                json.dumps(
                    job_data,
                    cls=DjangoJSONEncoder
                )
            )
 
            job_data["id"] = self.id
            job_data["created_at"] = (
                self.created_at.isoformat()
                if self.created_at
                else None
            )
 
            JobHistory.objects.create(
                job_id=self.id,
                employer=self.employer,
                job_title=self.job_title,
                created_at=self.created_at,
                deleted_at=timezone.now(),
                data=job_data
            )
            print("JOB HISTORY CREATED")
        except Exception as e:
          pass
        super().delete(*args, **kwargs)
       

 
    # ================= HELPER METHODS =================
    def is_visible_to_jobseekers(self):
        return self.is_published and self.approval_status == "approved"
 
    def __str__(self):
        return f"{self.job_title} ({self.approval_status})"


class JobApplication(models.Model):
    class Status(models.TextChoices):
        APPLIED = 'applied', 'Applied'
        RESUME_SCREENING = 'resume_screening', 'Resume Screening'
        RECRUITER_REVIEW = 'recruiter_review', 'Recruiter Review'
        SHORTLISTED = 'shortlisted', 'Shortlisted'
        INTERVIEW_CALLED = 'interview_called', 'Interview Called'
        OFFERED = 'offered', 'Offered'
        REJECTED = 'rejected', 'Rejected'
        HIRED = 'hired', 'Hired'
        WITHDRAWN = 'withdrawn', 'Withdrawn'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    job = models.ForeignKey('PostAJob', on_delete=models.CASCADE, related_name='applications')
    applied_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.APPLIED)
    cover_letter = models.TextField(blank=True, null=True)
    resume_version = models.FileField(upload_to='application_resumes/', null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)  
    resume_hash = models.CharField(max_length=64, null=True, blank=True) 
    expires_at = models.DateTimeField(
        null=True,
        blank=True
    ) 

    class Meta:
        db_table = 'JobApplication'
        indexes = [
            models.Index(fields=['user', 'job']),
        ]
    

    def __str__(self):
        return f"{self.user.email} → {self.job.job_title}"
    
class ApplicationFlag(models.Model):
 
    class Reason(models.TextChoices):
        IP_CONFLICT = "IP_CONFLICT", "IP Conflict"
        RESUME_BOT = "RESUME_BOT", "Resume Bot"
        FRAUDULENT_CREDS = "FRAUDULENT_CREDS", "Fraudulent Credentials"
 
    class Risk(models.TextChoices):
        CRITICAL = "CRITICAL", "Critical"
        HIGH = "HIGH", "High"
        MODERATE = "MODERATE", "Moderate"
 
    application = models.ForeignKey(
        JobApplication,
        on_delete=models.CASCADE,
        related_name="flags"
    )
 
    flag_reason = models.CharField(max_length=50, choices=Reason.choices)
    detected_method = models.TextField()
    risk_level = models.CharField(max_length=20, choices=Risk.choices)
 
    is_reviewed = models.BooleanField(default=False)
 
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ApplicationFlag'
 
    def __str__(self):
        return f"{self.flag_reason} - {self.application.id}"


class SavedJob(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_jobs')
    job = models.ForeignKey('PostAJob', on_delete=models.CASCADE, related_name='saved_by')
    saved_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'SavedJob'
        unique_together = ['user', 'job']

    def __str__(self):
        return f"{self.user.email} saved {self.job.job_title}"


# OTHER MODELS


class NewsletterSubscriber(models.Model):
    email = models.EmailField(unique=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'NewsletterSubscriber'

    def __str__(self):
        return self.email

# Notification
class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('message', 'Message'),
        ('job_alert', 'Job Alert'),
        ('application', 'Application Update'),
        ('system', 'System Notification'),
        ('job_approved', 'Job Approved'),
        ('job_rejected', 'Job Rejected'),

        ('complaint', 'Complaint'),

        ('announcement', 'Announcement'),
    )

    # =====================================================
    # FIXED CATEGORY CHOICES
    # =====================================================

    CATEGORY_CHOICES = (

        # Notification routing/config categories

        ('user_mgmt', 'User Management'),

        ('job_mgmt', 'Job Management'),

        ('apps', 'Applications'),

        ('companies', 'Companies'),

        ('reports', 'Reports'),

        ('general', 'General'),

        # Employer plan categories

        ('new_signup', 'New Signup'),

        ('alert', 'Alert'),

        ('announcement', 'Announcement'),

        ('weekly_summary', 'Weekly Summary'),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    title = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    message = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    is_read = models.BooleanField(
        default=False
    )

    notification_type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPES,
        default='system'
    )

    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        null=True,
        blank=True
    )

    related_object_id = models.PositiveIntegerField(
        null=True,
        blank=True
    )
    
    # OPTIONAL (SAFE ADDITION - no impact on existing)
    job = models.ForeignKey(
        'PostAJob',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications'
    )

    event_type = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    class Meta:
        db_table = 'Notification'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.message}"


# Chat

from django.conf import settings


class Conversation(models.Model):
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='job_conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)    
    initiated_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='initiated_conversations', on_delete=models.SET_NULL, null=True, blank=True)
    jobseeker_can_reply = models.BooleanField(default=False)
   
    class Meta:
        db_table = 'Conversation'
        ordering = ['-updated_at']
   
    def __str__(self):
        return f"Conversation {self.id} ({self.participants.count()} participants)"
   
    def allow_jobseeker_to_reply(self):
        self.jobseeker_can_reply = True
        self.save()


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='sent_job_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='received_job_messages', on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    is_first_message = models.BooleanField(default=False)
   
    class Meta:
        db_table = 'Message'
        ordering = ['timestamp']
   
    def save(self, *args, **kwargs):
        if not self.conversation.messages.exists():
            self.is_first_message = True
           
            if self.sender.user_type == 'employer':
                self.conversation.allow_jobseeker_to_reply()
                self.conversation.initiated_by = self.sender
                self.conversation.save()
        super().save(*args, **kwargs)


class ChatMessage(models.Model):
    USER = "user"
    BOT = "bot"

    SENDER_CHOICES = [
        (USER, "User"),
        (BOT, "Bot"),
    ]

    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ChatMessage'

    def __str__(self):
        return f"{self.sender}: {self.message[:30]}"


class UserSettings(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="settings"
    )

    account_type = models.CharField(max_length=50, default="Job Seeker")
    phone = models.CharField(max_length=20, blank=True)

    show_online_status = models.BooleanField(default=True)
    show_read_receipts = models.BooleanField(default=True)
    restrict_duplicate_applications = models.BooleanField(default=False)
    hide_cv = models.BooleanField(default=False)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'UserSettings'

    def __str__(self):
        return f"{self.user.email} settings"


class HelpTopic(models.Model):
    title = models.CharField(max_length=200)
    path = models.CharField(max_length=200)

    class Meta:
        db_table = 'HelpTopic'

    def __str__(self):
        return self.title


class RaiseTicket(models.Model):
    CATEGORY_CHOICES = (
        ('Jobseeker', 'Jobseeker'),
        ('Employer', 'Employer'),
    )

    SUBJECT_CHOICES = (
        ("Broken 'Apply' Button/Application Failure", "Broken 'Apply' Button/Application Failure"),
        ("File Upload/Resume Parsing Errors", "File Upload/Resume Parsing Errors"),
        ("Outdated or Ghost Job Listings", "Outdated or Ghost Job Listings"),
        ("Incorrect/Irrelevant Search Results & Filters", "Incorrect/Irrelevant Search Results & Filters"),
        ("Profile Update/Saved Data Not Saving", "Profile Update/Saved Data Not Saving"),
        ("Application Status Unchanged/Limbo", "Application Status Unchanged/Limbo"),
        ("Broken Job Alerts & Notifications", "Broken Job Alerts & Notifications"),
        ("Login/Registration Issues (Social Login Bugs)", "Login/Registration Issues (Social Login Bugs)"),
        ("Site Incompatibility/Non-Responsive Mobile Layout", "Site Incompatibility/Non-Responsive Mobile Layout"),
        ("Duplicate Job Listings (Spam)", "Duplicate Job Listings (Spam)"),
        ("Others", "Others"),
    )
 
    PRIORITY_CHOICES = (
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    )
 
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Hold', 'Hold'),
        ('Resolved', 'Resolved'),
    )
 
    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES
    )
 
    subject = models.CharField(
        max_length=255,
        choices=SUBJECT_CHOICES
    )
 
    name = models.CharField(
        max_length=150
    )
 
    email = models.EmailField()
 
    phone = models.CharField(
        max_length=20
    )
 
    message = models.TextField(
        blank=True,
        null=True
    )
 
    attachment = models.FileField(
        upload_to='tickets/',
        blank=True,
        null=True
    )
 
    # NEW FIELD
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='Medium'
    )
 
    # NEW FIELD
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Pending'
    )
 
    # NEW FIELD
    resolved_on = models.DateField(
        blank=True,
        null=True
    )
 
    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table='RaiseTicket'
 
    def __str__(self):
        return f"{self.name} - {self.subject}"


# Password

class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        db_table = 'PasswordResetToken'

    def __str__(self):
        return f"Reset token for {self.user.email}"

    def is_valid(self):
        return not self.is_used and timezone.now() <= self.expires_at

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=24)
        super().save(*args, **kwargs)


class ContactMessage(models.Model):
    class Status(models.TextChoices):
        PENDING = "Pending", "Pending"
        CONTACTED = "Contacted","Contacted"
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="contact_messages"
    )
    name = models.CharField(max_length=150)
    email = models.EmailField()
    contact = models.CharField(max_length=15)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )

    class Meta:
        db_table = 'ContactMessage'

    def __str__(self):
        return f"{self.name} - {self.email}"


# Company Verify

class CompanyVerification(models.Model):
    STATUS_CHOICES = [
    ("Pending", "Pending"),
    ("Hold", "Hold"),
    ("Reject", "Reject"),
    ("Verified", "Verified"),
]
 
    employer = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="company_verification"
    )
 
    legal_name = models.CharField(max_length=255)
    registration_number = models.CharField(max_length=255)  # REMOVED unique=True
    tax_id = models.CharField(max_length=255)  # REMOVED unique=True
    website_url = models.URLField()
    official_email = models.EmailField()
    phone_number = models.CharField(max_length=20)
    incorporation_certificate = models.FileField(
        upload_to="company_certificates/"
    )
    gst_certificate = models.FileField(
        upload_to='company/gst/',
        null=True,
        blank=True
    )
 
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="Pending",
        db_index=True
    )
 
    created_at = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        db_table = 'CompanyVerification'
        ordering = ['-created_at']
        unique_together = ['employer', 'legal_name']
 
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        previous_status = None
 
        if not is_new:
            previous_status = CompanyVerification.objects.get(pk=self.pk).status
 
        super().save(*args, **kwargs)
 
        if self.status == "Verified" and previous_status != "Verified":
            employer_profile = self.employer.employer_profile
           
            # Find or create company profile
            company_profile, created = CompanyProfile.objects.get_or_create(
                company_name=self.legal_name,
                defaults={
                    'website': self.website_url,
                    'company_moto': '',
                    'contact_person': employer_profile.full_name or '',
                    'contact_number': self.phone_number,
                    'company_email': self.official_email,
                    'company_size': '',
                    'address1': '',
                    'about': '',
                    'company_logo': None,
                    'created_by': self.employer
                }
            )
           
            # If company already exists, update with latest info if needed
            if not created:
                # Optionally update company details
                pass
           
            # Link employer to company
            if not employer_profile.company:
                employer_profile.company = company_profile
                employer_profile.save()
 
    def __str__(self):
        return self.legal_name
 
 
# About Company
 
class CompanyProfile(models.Model):
 
    company_name = models.CharField(max_length=255)
    company_moto = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255)
    contact_number = models.CharField(max_length=15)
    company_email = models.EmailField()
    website = models.URLField()
    company_size = models.CharField(max_length=100)
    address1 = models.TextField()
    address2 = models.TextField(blank=True, null=True)
    about = models.TextField()
    company_logo = models.ImageField(upload_to='company_logos/')
    created_at = models.DateTimeField(auto_now_add=True)
    average_rating = models.DecimalField(  # newly added 
        max_digits=3,
        decimal_places=1,
        default=0.0
    )
    
    total_reviews = models.PositiveIntegerField(
        default=0                                      # newly added 
    )

    banner_image = models.ImageField(
        upload_to='company/banner/',
        null=True,
        blank=True
    )

    brand_color = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    linkedin_url = models.URLField(
        blank=True,
        null=True
    )

    facebook_url = models.URLField(
        blank=True,
        null=True
    )

    twitter_url = models.URLField(
        blank=True,
        null=True
    )

    
    
    created_by = models.ForeignKey(User,on_delete=models.SET_NULL,null=True, blank=True,related_name='companies_created')
    class Meta:
        db_table = 'CompanyProfile'

    def __str__(self):
        return self.company_name


from django.db import models
from django.db.models import Avg


class CompanyReview(models.Model):  #newly added 

    RATING_CHOICES = [
        (1, "1 Star"),
        (2, "2 Stars"),
        (3, "3 Stars"),
        (4, "4 Stars"),
        (5, "5 Stars"),
    ]

    company = models.ForeignKey(
        CompanyProfile,
        on_delete=models.CASCADE,
        related_name="reviews"
    )

    reviewer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="company_reviews"
    )

    rating = models.PositiveIntegerField(
        choices=RATING_CHOICES
    )

    review = models.TextField()

    is_anonymous = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        db_table = 'CompanyReview'
        ordering = ['-created_at']
        unique_together = ['company', 'reviewer']

    # ─────────────────────────────────────────
    # UPDATE COMPANY RATING
    # ─────────────────────────────────────────

    def update_company_rating(self):

        avg_rating = self.company.reviews.aggregate(
            avg=Avg("rating")
        )["avg"] or 0

        total_reviews = self.company.reviews.count()

        self.company.average_rating = round(
            avg_rating,
            1
        )

        self.company.total_reviews = total_reviews

        self.company.save(
            update_fields=[
                "average_rating",
                "total_reviews"
            ]
        )

    # ─────────────────────────────────────────
    # SAVE
    # ─────────────────────────────────────────

    def save(self, *args, **kwargs):

        super().save(*args, **kwargs)

        self.update_company_rating()

    # ─────────────────────────────────────────
    # DELETE
    # ─────────────────────────────────────────

    def delete(self, *args, **kwargs):

        company = self.company

        super().delete(*args, **kwargs)

        avg_rating = company.reviews.aggregate(
            avg=Avg("rating")
        )["avg"] or 0

        total_reviews = company.reviews.count()

        company.average_rating = round(
            avg_rating,
            1
        )

        company.total_reviews = total_reviews

        company.save(
            update_fields=[
                "average_rating",
                "total_reviews"
            ]
        )

    def __str__(self):

        return (
            f"{self.company.company_name} "
            f"- {self.rating}"
        )


# OTP

class EmailOTP(models.Model):
    PURPOSE_CHOICES = (
        ('signup', 'Signup'),
        ('login', 'Login'),
        ('email_verification', 'Email Verification'),
        ('password_reset', 'Password Reset'),
    )

    email = models.EmailField(null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)  

    otp = models.CharField(max_length=6)
    purpose = models.CharField(max_length=50, choices=PURPOSE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_verified = models.BooleanField(default=False)

    class Meta:
        db_table = 'EmailOTP'

    def is_valid(self):
        return timezone.now() < self.expires_at and not self.is_verified


# About Complaint

class Complaint(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        RESOLVED = 'resolved', 'Resolved'
        INVESTIGATING = 'investigating', 'Under Investigation'
        REJECTED = 'rejected', 'Rejected'
   
    # User who is reporting
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="complaints"
    )
   
    # The job being reported (now using PostAJob)
    reported_job = models.ForeignKey(
        'PostAJob',
        on_delete=models.CASCADE,
        related_name="complaints",
        null=True,
        blank=True
    )
   
    # Denormalized fields for quick access
    reported_job_title = models.CharField(max_length=255, blank=True)
    reported_employer_name = models.CharField(max_length=255, blank=True)
    reported_company_name = models.CharField(max_length=255, blank=True)
   
    # Reporter details
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    mobile = models.CharField(
    max_length=10,
    validators=[
        RegexValidator(
            regex=r'^\d{10}$',
            message='Enter valid 10-digit mobile number'
        )
    ]
)
    email = models.EmailField()
   
    # Complaint details
    reason = models.CharField(max_length=255)
    explanation = models.TextField()
   
    # Status
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
   
    # Admin fields
    admin_notes = models.TextField(blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="resolved_complaints"
    )
   
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
   
    class Meta:
        db_table = 'Complaint'
        ordering = ['-created_at']
        unique_together = ['user', 'reported_job']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['reported_job', 'status']),
            models.Index(fields=['user', 'reported_job']),
        ]
   
    def __str__(self):
        if self.reported_job:
            return f"{self.first_name} reported '{self.reported_job.job_title}' (Job ID: {self.reported_job.id}) - {self.reason}"
        return f"{self.first_name} reported a job - {self.reason}"
   
    def save(self, *args, **kwargs):
        if self.reported_job:
            self.reported_job_title = self.reported_job.job_title
            if hasattr(self.reported_job.employer, 'employer_profile'):
                if self.reported_job.employer.employer_profile.company:
                    self.reported_employer_name = self.reported_job.employer.employer_profile.company.company_name
                    self.reported_company_name = self.reported_job.employer.employer_profile.company.company_name

        if self.status == self.Status.RESOLVED:
            if not self.resolved_at:
                self.resolved_at = timezone.now()
       
        super().save(*args, **kwargs)

# Billing

from django.contrib.auth import get_user_model

User = get_user_model()
from django.utils.timezone import now

class PlanFeature(models.Model):
    plan  = models.ForeignKey(
        'Plan',
        on_delete=models.CASCADE,
        related_name='features'
    )
    text  = models.CharField(max_length=200)
    value = models.CharField(max_length=100)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order']
        db_table = 'PlanFeature'

    def __str__(self):
        return f"{self.plan.name} → {self.text}: {self.value}"

class Plan(models.Model):
   # Basic
    name         = models.CharField(max_length=100, unique=True)
    summary      = models.CharField(max_length=255, blank=True)
    color        = models.CharField(max_length=30, default='#1E88E5')
    is_published = models.BooleanField(default=True)
    
    # Feature Flags
    Analytics        = models.BooleanField(default=False)
    Candidate_Search = models.BooleanField(default=False)
    Premium_Support  = models.BooleanField(default=False)
    Account_Manager  = models.BooleanField(default=False)
    
    # Pricing
    monthly_price     = models.DecimalField(max_digits=10, decimal_places=2)
    tax               = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount_halfyear = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount_annual   = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    # Duration
    duration_days   = models.IntegerField(default=30)
    highlight_limit = models.PositiveIntegerField(default=0)

    # Trial
    is_trial_enabled = models.BooleanField(default=False)
    trial_duration   = models.PositiveIntegerField(default=0)

    # Advanced
    is_auto_renewal = models.BooleanField(default=False)
    grace_time      = models.PositiveIntegerField(default=0)

    # Audit
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['id']
        db_table = 'Plan'

    @property
    def total_payable(self):
        """Calculates total payable for 1 month including tax safely"""
        base = float(self.monthly_price) if self.monthly_price else 0.0
        tax  = float(self.tax) if self.tax else 0.0
        if base == 0.0:
            return 0.0
        return round(base + base * (tax / 100), 2)

    def __str__(self):
        return self.name
    
class Subscription(models.Model):
    STATUS = [
        ('active', 'Active'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    plan = models.ForeignKey(Plan, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS, default='active')
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(blank=True, null=True)
    duration = models.CharField(max_length=20, default='monthly')  # Store which duration they paid for
 
    def save(self, *args, **kwargs):
        if not self.end_date:
            # Set end date based on duration
            if self.duration == 'monthly':
                days = self.plan.duration_days
            elif self.duration == '6_months':
                days = 180
            elif self.duration == 'yearly':
                days = 365
            else:
                days = self.plan.duration_days
           
            self.end_date = now() + timedelta(days=days)
        super().save(*args, **kwargs)

    class Meta:
        db_table = 'Subscription'

class Payment(models.Model):
    STATUS_CHOICES = (
        ('created', 'Created'),
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    plan = models.ForeignKey(Plan, on_delete=models.SET_NULL, null=True)

    razorpay_order_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    razorpay_payment_id = models.CharField(max_length=255, blank=True, null=True)
    razorpay_signature = models.TextField(blank=True, null=True)

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='INR')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='created')

    payment_method = models.CharField(max_length=50, blank=True)
    failure_reason = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    razorpay_response = models.JSONField(blank=True, null=True)

    class Meta:
        db_table = 'Payment'


class Invoice(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    invoice_number = models.CharField(max_length=100, unique=True)
    invoice_date = models.DateTimeField(auto_now_add=True)

    company_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)  
 
    payment_method = models.CharField(max_length=50)
    transaction_id = models.CharField(max_length=100)
    payment_status = models.CharField(max_length=50)

    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    gst = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    plan_name = models.CharField(max_length=100)
    duration = models.CharField(max_length=50)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Invoice'


class PaymentMethod(models.Model):
    TYPE = [
        ('card', 'Card'),
        ('upi', 'UPI'),
        ('netbanking', 'Net Banking'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    method_type = models.CharField(max_length=20, choices=TYPE)

    card_last4 = models.CharField(max_length=4, blank=True)
    card_holder_name = models.CharField(max_length=100, blank=True)

    upi_id = models.CharField(max_length=100, blank=True)
    bank_name = models.CharField(max_length=100, blank=True)

    is_default = models.BooleanField(default=False)
 
    expiry_date = models.CharField(max_length=7, blank=True, null=True)
 
    def save(self, *args, **kwargs):
        if self.is_default:
            PaymentMethod.objects.filter(user=self.user).update(is_default=False)
        super().save(*args, **kwargs)

    class Meta:
        db_table = 'PaymentMethod'


# Company Email OTP

class CompanyEmailOTP(models.Model):
    PURPOSE_CHOICES = (
        ('company_verification', 'Company Verification'),
        ('company_email_change', 'Company Email Change'),
    )
    
    company_name = models.CharField(max_length=255, null=True, blank=True)
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    purpose = models.CharField(max_length=30, choices=PURPOSE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_verified = models.BooleanField(default=False)
    
    def is_valid(self):
        from django.utils import timezone
        return timezone.now() < self.expires_at and not self.is_verified
    
    class Meta:
        db_table = 'CompanyEmailOTP'

    def __str__(self):
        return f"OTP for {self.email} - {self.purpose}"
 


from django.db import models
 
class ACompany(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        db_table = 'ACompany'

    def __str__(self):
        return self.name


class AEmployer(models.Model):
    name = models.CharField(max_length=255)
    company = models.ForeignKey(ACompany, on_delete=models.CASCADE)
 
    class Meta:
        db_table = 'AEmployer'

    def __str__(self):
        return self.name


class AJobSeeker(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
 
    class Meta:
        db_table = 'AJobseeker'

    def __str__(self):
        return self.name


class AJob(models.Model):
    title = models.CharField(max_length=255)
    company = models.ForeignKey(ACompany, on_delete=models.CASCADE)
    status = models.CharField(max_length=50, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        db_table = 'AJob'

    def __str__(self):
        return self.title


# ============================================================
# ADD THESE TO THE BOTTOM OF YOUR EXISTING models.py
# Remove the old: Role, Module, Permission, Employer models
# ============================================================

# Role Management

class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    # DO NOT store user_count as a field — compute it live from User table
    # user_count = models.IntegerField(default=0)  ← REMOVED

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Role'

    def __str__(self):
        return self.name


class Module(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = 'Module'

    def __str__(self):
        return self.name


class Permission(models.Model):
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='permissions')
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='permissions')

    read   = models.BooleanField(default=False)
    create = models.BooleanField(default=False)
    update = models.BooleanField(default=False)
    delete = models.BooleanField(default=False)

    class Meta:
        db_table = 'Permission'
        unique_together = ['role', 'module']

    def __str__(self):
        return f"{self.role.name} → {self.module.name}"


class NotificationConfig(models.Model):  #newly added 08/05
 
    CATEGORY_CHOICES = [
        ('user_mgmt', 'User Management'),
        ('job_mgmt', 'Job Management'),
        ('apps', 'Applications'),
        ('companies', 'Companies'),
        ('reports', 'Reports'),
        ('general', 'General'),
    ]
 
    category = models.CharField(
        max_length=30,
        choices=CATEGORY_CHOICES,
        unique=True
    )
 
    # Channels
    in_app = models.BooleanField(default=True)
 
    email = models.BooleanField(default=True)
 
    sms = models.BooleanField(default=False)
 
    push = models.BooleanField(default=False)
 
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'NotificationConfig'
 
    def __str__(self):
        return self.category
   
 
class AdminQuietHours(models.Model):  #newly added 08/05
    TIMEZONE_CHOICES = [
        ("Asia/Kolkata", "(UTC +05:30) Asia/Kolkata"),
        ("America/Los_Angeles", "(UTC -08:00) America/Los_Angeles"),
        ("UTC", "(UTC +00:00) UTC"),
        ("Europe/London", "(UTC +01:00) Europe/London"),
        ("Europe/Berlin", "(UTC +02:00) Europe/Berlin"),
    ]
    admin = models.OneToOneField(
        User,
        on_delete=models.CASCADE
    )
 
    enabled = models.BooleanField(default=False)
 
    start_time = models.TimeField(
        default="22:00"
    )
 
    end_time = models.TimeField(
        default="07:00"
    )
 
    timezone = models.CharField(
        max_length=100,
        choices=TIMEZONE_CHOICES,
        default="Asia/Kolkata"
    )
 
    active_days = models.JSONField(
        default=list
    )
 
    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        db_table = 'AdminQuietHours'
 
    def __str__(self):
        return self.admin.email
   
 
class NotificationChannelSettings(models.Model): #newly added 08/05
 
    email_notif = models.BooleanField(default=True)
 
    inapp_notif = models.BooleanField(default=True)
 
    sms_notif = models.BooleanField(default=False)
 
    push_notif = models.BooleanField(default=False)
 
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'NotificationChannelSettings'
 
    def __str__(self):
        return "Notification Channel Settings"
 

class UserDevice(models.Model):#newly added 11/05

    PLATFORM_CHOICES = [
        ("web", "Web Browser"),
        ("android", "Android"),
        ("ios", "iOS"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="devices"
    )

    fcm_token = models.TextField(
        unique=True
    )

    platform = models.CharField(
        max_length=10,
        choices=PLATFORM_CHOICES,
        default="web"
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        db_table = 'UserDevice'

    def __str__(self):

        return (
            f"{self.user.email} "
            f"[{self.platform}]"
        )


 
class SMSOTP(models.Model):           
 
    PURPOSE_CHOICES = [
        ("admin_2fa", "Admin 2FA"),
        ("login", "Login"),
    ]
 
    phone = models.CharField(max_length=15)
 
    otp = models.CharField(max_length=6)
 
    purpose = models.CharField(
        max_length=50,
        choices=PURPOSE_CHOICES
    )
 
    is_verified = models.BooleanField(default=False)
 
    created_at = models.DateTimeField(auto_now_add=True)
 
    expires_at = models.DateTimeField()
 
    def is_valid(self):
        return timezone.now() < self.expires_at
    
    class Meta:
        db_table = 'SMSOTP'
 
    def __str__(self):
        return f"{self.phone} - {self.purpose}"
   
 
 
class AdminAccessLog(models.Model):  
 
    ACTION_CHOICES = [
        ("LOGIN_SUCCESS", "Login Success"),
        ("LOGIN_FAILED", "Login Failed"),
        ("LOGOUT", "Logout"),
        ("PASSWORD_CHANGE", "Password Change"),
        ("2FA_ENABLED", "2FA Enabled"),
        ("2FA_DISABLED", "2FA Disabled"),
        ("OTP_FAILED", "OTP Failed"),
        ("DEVICE_REVOKED", "Device Revoked"),
        ("DEVICE_ADDED", "Device Added"),
    ]
 
    STATUS_CHOICES = [
        ("SUCCESS", "Success"),
        ("FAILED", "Failed"),
    ]
 
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="admin_access_logs"
    )
 
    action = models.CharField(
        max_length=50,
        choices=ACTION_CHOICES
    )
 
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES
    )
 
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True
    )
 
    location = models.CharField(
        max_length=255,
        blank=True
    )
 
    user_agent = models.TextField(
        blank=True
    )
 
    extra_data = models.JSONField(
        default=dict,
        blank=True
    )
 
    timestamp = models.DateTimeField(
        auto_now_add=True
    )
 
    class Meta:
        db_table = 'AdminAccessLog'
        ordering = ["-timestamp"]
 
    def __str__(self):
        return f"{self.user} - {self.action}"
 
 
class AdminTrustedDevice(models.Model): #changed on 11/05
 
    PLATFORM_CHOICES = [
        ("web", "Web"),
        ("android", "Android"),
        ("ios", "iOS"),
    ]
 
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="trusted_devices"
    )
 
    device_name = models.CharField(
        max_length=200
    )
 
    device_fingerprint = models.CharField(
        max_length=255,
        blank=True
    )
 
    platform = models.CharField(
        max_length=20,
        choices=PLATFORM_CHOICES,
        default="web"
    )
 
    refresh_token_jti = models.CharField(
        max_length=255,
        blank=True
    )
 
    is_trusted = models.BooleanField(
        default=True
    )
 
    last_used_at = models.DateTimeField(
        auto_now=True
    )
 
    created_at = models.DateTimeField(
        auto_now_add=True
    )
 
    class Meta:
        db_table = 'AdminTrustedDevice'
        ordering = ["-last_used_at"]
 
    def __str__(self):
        return f"{self.user.email} - {self.device_name}"
    
# employer setting 


class EmployerPlatformSettings(models.Model):
 
    plan = models.ForeignKey(
 
        Plan,
 
        on_delete=models.CASCADE,
 
        related_name="employer_settings"
    )
 
    # ─────────────────────────────
    # ACCOUNT STATUS MAPPING
    # ─────────────────────────────
 
    account_status = models.CharField(
 
        max_length=15,
 
        choices=User.AccountStatus.choices,
 
        default=User.AccountStatus.HOLD
    )
 
    employer_registration = models.BooleanField(
        default=True
    )
 
    email_verification = models.BooleanField(
        default=True
    )
 
    mobile_verification = models.BooleanField(
        default=False
    )
 
    # ─────────────────────────────
    # APPROVAL SETTINGS
    # ─────────────────────────────
 
    APPROVAL_CHOICES = [
 
        ('Manual Type', 'Manual Type'),
 
        ('Automatic', 'Automatic'),
    ]
 
    approval_type = models.CharField(
 
        max_length=20,
 
        choices=APPROVAL_CHOICES,
 
        default='Manual Type'
    )
 
    # ─────────────────────────────
    # REQUIRED DOCUMENTS
    # ─────────────────────────────
 
    req_company_cert = models.BooleanField(
        default=False
    )
 
    req_gst_cert = models.BooleanField(
        default=False
    )
 
    req_business_email = models.BooleanField(
        default=False
    )
 
    req_company_website = models.BooleanField(
        default=False
    )
 
    # ─────────────────────────────
    # PREFERENCES
    # ─────────────────────────────
 
    allow_multiple_company = models.BooleanField(
        default=False
    )
 
    allow_multiple_users = models.BooleanField(
        default=False
    )
 
    show_company_reviews = models.BooleanField(
        default=False
    )
 
    enable_company_branding = models.BooleanField(
        default=False
    )
 
    featured_employer_option = models.BooleanField(
        default=False
    )
 
    # ─────────────────────────────
    # NOTIFICATIONS
    # ─────────────────────────────
 
    notif_email = models.BooleanField(
        default=False
    )
 
    notif_new_signups = models.BooleanField(
        default=False
    )
 
    notif_alerts = models.BooleanField(
        default=False
    )
 
    notif_announcements = models.BooleanField(
        default=False
    )
 
    notif_weekly_summary = models.BooleanField(
        default=False
    )
 
    # ─────────────────────────────
    # JOB SETTINGS
    # ─────────────────────────────
 
    job_expire_days = models.PositiveIntegerField(
        default=30
    )
 
    max_job_posts = models.PositiveIntegerField(
        default=10
    )
 
    featured_job_limit = models.PositiveIntegerField(
        default=3
    )
 
    allow_edit_after_approval = models.BooleanField(
        default=False
    )
 
    # ─────────────────────────────
    # TIMESTAMPS
    # ─────────────────────────────
 
    updated_at = models.DateTimeField(
        auto_now=True
    )
 
    class Meta:
        db_table = 'EmployerPlatformSettings' 
        unique_together = (
            'plan',
            'account_status'
        )
 
        ordering = ['plan']
 
    def __str__(self):
 
        return (
 
            f"{self.plan.name} - "
 
            f"{self.account_status}"
        )

class NotificationDeliveryLog(models.Model):

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
        ('skipped', 'Skipped'),
    )

    CHANNEL_CHOICES = (
        ('inapp', 'In App'),
        ('push', 'Push'),
        ('email', 'Email'),
        ('sms', 'SMS'),
    )

    notification = models.ForeignKey(
        'Notification',
        on_delete=models.CASCADE,
        related_name='delivery_logs'
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notification_delivery_logs'
    )

    channel = models.CharField(
        max_length=20,
        choices=CHANNEL_CHOICES
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    reason = models.TextField(
        null=True,
        blank=True
    )

    provider_response = models.TextField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    sent_at = models.DateTimeField(
        null=True,
        blank=True
    )

    class Meta:
        db_table = 'NotificationDeliveryLog'
        ordering = ['-created_at']

    def __str__(self):
        return (
            f"{self.user.email} - "
            f"{self.channel} - "
            f"{self.status}"
        )
    
#for jobseekersetting

class JobseekerPlatformSettings(models.Model):

    def default_allowed_domains():

        return [

            "gmail.com",

            "outlook.com",

            "yahoo.com"
        ]

    PROFILE_VISIBILITY_CHOICES = [

        ("Public", "Public"),

        ("Employers Only", "Employers Only"),

        ("Private", "Private"),
    ]

    ACCOUNT_STATUS_CHOICES = [

        ("Active", "Active"),

        ("Pending", "Pending"),

        ("Blocked", "Blocked"),
    ]

    # ─────────────────────────────────────
    # REGISTRATION
    # ─────────────────────────────────────

    registration = models.BooleanField(
        default=True
    )

    email_verification = models.BooleanField(
        default=True
    )

    phone_verification = models.BooleanField(
        default=False
    )

    domain_restriction = models.BooleanField(
        default=False
    )

    allowed_domains = models.JSONField(

    default=default_allowed_domains,

    blank=True
)

    default_role = models.CharField(
        max_length=100,
        default="Job Seeker"
    )

    account_status = models.CharField(
        max_length=50,
        choices=ACCOUNT_STATUS_CHOICES,
        default="Active"
    )

    # ─────────────────────────────────────
    # PROFILE SETTINGS
    # ─────────────────────────────────────

    profile_visibility = models.CharField(
        max_length=50,
        choices=PROFILE_VISIBILITY_CHOICES,
        default="Employers Only"
    )

    resume_visibility = models.CharField(
        max_length=50,
        choices=PROFILE_VISIBILITY_CHOICES,
        default="Employers Only"
    )

    anonymous_profile = models.BooleanField(
        default=False
    )

    profile_completion_required = models.CharField(
        max_length=20,
        default="0 %"
    )

    # ─────────────────────────────────────
    # JOB FEATURES
    # ─────────────────────────────────────

    salary_visibility = models.BooleanField(
        default=True
    )

    company_reviews = models.BooleanField(
        default=True
    )

    application_status_tracking = models.BooleanField(
        default=True
    )

    similar_jobs = models.BooleanField(
        default=True
    )

    career_advice = models.BooleanField(
        default=True
    )

    easy_apply = models.BooleanField(
        default=True
    )

    save_jobs = models.BooleanField(
        default=True
    )

    max_applications = models.PositiveIntegerField(
        default=30
    )

    application_expiry_days = models.PositiveIntegerField(
        default=60
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    # ─────────────────────────────────────
    # SINGLETON SETTINGS
    # ─────────────────────────────────────

    def save(self, *args, **kwargs):

        self.pk = 1

        super().save(*args, **kwargs)

    @classmethod
    def get_settings(cls):

        obj, created = cls.objects.get_or_create(
            pk=1
        )

        return obj
    
    class Meta:
        db_table = 'JobseekerPlatformSettings'
        
# from django.db.models.signals import post_save
# from django.dispatch import receiver

# DEFAULT_FEATURES = [
#     { "text": "Jobs Posting",               "value": "1",     "order": 0 },
#     { "text": "Analytics",                  "value": "false", "order": 1 },
#     { "text": "Candidate Search",           "value": "false", "order": 2 },
#     { "text": "Highlight Your Job Listing", "value": "false", "order": 3 },
#     { "text": "Premium Support",            "value": "false", "order": 4 },
#     { "text": "Account Manager",            "value": "false", "order": 5 },
# ]

# @receiver(post_save, sender=Plan)
# def create_default_features(sender, instance, created, **kwargs):
#     if created:  # only runs when a NEW plan is created
#         for feature in DEFAULT_FEATURES:
#             PlanFeature.objects.create(
#                 plan=instance,
#                 text=feature['text'],
#                 value=feature['value'],
#                 order=feature['order']
#             )