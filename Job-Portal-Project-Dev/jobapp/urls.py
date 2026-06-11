from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    AJobListView,
    AdminCompanyListView,
    AdminCompanyDetailView,
    AdminComplaintDetailView,
    # AdminDashboardOverviewView,
    AdminDashboardStats,
    AdminJobDetailView,
    AdminLoginView,
    AdminProfilePhotoView,
    AdminTicketDeleteView,
    AdminTicketListView,
    AdminTicketUpdateView,
    AdminUpdateComplaintView,
    CheckPlanExpiryView,
    CompanyProfileCreateView,
    ContactMessageDeleteAPIView,
    ContactMessageStatusUpdateAPIView,
    DashboardView,
    DisableAdmin2FAView,
    EmployerPlatformSettingsView,
    EmployerWeeklySummaryView,
    JobSeekerRegistrationView,
    EmployerRegistrationView,
    JobseekerPlatformSettingsView,
    LoginView,
    LogoutView,
    JobSeekerProfileView,
    EmployerProfileView,
    MarkNotificationUnreadView,
    DeleteNotificationView,
    ClearAllNotificationsView,
    NewsletterSubscribeAPIView,
    PlanDetailView,
    PlanListCreateView,
    PlanPublishToggleView,
    SubmitComplaintView,
    UpdateCompanyStatusView,
    UserDeleteView,
    UserDetailView,
    UserListView,
    UserSettingsView,
    SaveJobView,
    JobApplicationDetailView,
    ConversationListView,
    ConversationDetailView,
    ConversationMessagesView,
    MarkConversationReadView,
    SendMessageView,
    UnreadCountView,
    ConversationWithUserView,
    MarkMessageReadView,
    ChatUsersView,
    EmployerInitiateChatView,
    UserStatsView,
    UserStatusUpdateView,
    VerifyAdmin2FAOTPView,
    VerifyEmailOTPView,
    chat_api,
    ForgotPasswordView,
    ResetPasswordConfirmView,
    CreatePasswordView,
    ValidateResetTokenView,
    AdminCreatePasswordTokenView,
    RaiseTicketCreateView,
    ContactMessageCreateAPIView,
    SubmitCompanyVerification,
    CompanyVerificationAction,
    CreateJobPreviewView,
    PreviewJobView,
    PublishJobView,
    UpdateJobView,
    DeleteJobView,
    JobListView,
    CompanyProfileDetailView,
    CompanyProfileUpdateView,
    AdminComplaintListView,
    SendEmailOTPView,
    SendLoginOTPView,
    VerifyLoginOTPView,
    PostedJobListView,
    EmployerJobListView,
    JobSeekerJobListView,
    JobSeekerJobDetailView,
    PlanListView,
    CreateOrderView,
    CurrentSubscriptionView,
    CancelSubscriptionView,
    InvoiceListView,
    InvoiceDownloadView,
    PaymentMethodView,
    DeletePaymentMethodView,
    VerifyPaymentView,
    CompanyProfileListView,
    CompanyProfileByIdView,
    LinkToExistingCompanyView,
    VerifyCompanyEmailOTPView,
    SendCompanyEmailOTPView,
    CompanyVerificationStatusView,
    EmployerOnboardingStatusView,
    GoogleLoginView,
    AdminJobStatsView,
    AdminJobDeleteView,
    AdminJobApproveView,
    AdminJobRejectView,
    AdminJobFlagView,
    AdminJobListView,
    JobHighlightLimitView,
    # HighlightedJobsView,
    AdminDashboardOverviewNewView,
    AdminChangePasswordView,
    AdminTrustedDeviceListView,
    RevokeTrustedDeviceView,
    AdminAccessLogListView,
    Admin2FAStatusView,
    VerifyAdminLoginOTPView,
    SendAdmin2FAOTPView,
    NotificationPreferenceUpdateView,
    AdminQuietHoursView,
    AdminQuietHoursUpdateView,
    NotificationChannelSettingsView,
    NotificationChannelSettingsUpdateView,
    NotificationPreferenceListView,
    ContactMessageListAPIView,
    AdminUpdateJobStatusView,
    CurrentUserView
    

    # REMOVED: Company-related view imports (CompanyListView, CompanyDetailView, etc.)
)
from .webhooks import razorpay_webhook
from . import views 


urlpatterns = [
    # Registration (open to everyone)
    path('register/jobseeker/', JobSeekerRegistrationView.as_view(), name='jobseeker-register'),
    path('register/employer/', EmployerRegistrationView.as_view(), name='employer-register'),

    # JWT Auth
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),

    # Profile (only authenticated users)
    path('profile/jobseeker/', JobSeekerProfileView.as_view(), name='jobseeker-profile'),
    path('jobseekers/', views.JobSeekerListView.as_view(), name='jobseeker-list'),
    path('profile/employer/', EmployerProfileView.as_view(), name='employer-profile'),

    # REMOVED: Old Company URLs (using Company model)
    # These have been replaced with CompanyProfile URLs below
    # path('companies/', views.CompanyListView.as_view(), name='company-list'),
    # path('companies/<int:pk>/', views.CompanyDetailView.as_view(), name='company-detail'),
    # path('companies/create/', views.CompanyCreateView.as_view(), name='company-create'),
    # path('companies/link/', views.CompanyLinkView.as_view(), name='company-link'),
    # path('companies/<int:pk>/edit/', views.CompanyEditView.as_view(), name='company-edit'),
    # path('admin/companies/<int:pk>/toggle-active/', views.AdminCompanyToggleActiveView.as_view(), name='admin-company-toggle'),

    # Jobs
    path('jobs/', views.JobListView.as_view(), name='job-list'),
    path('jobs/<int:pk>/', views.JobDetailView.as_view(), name='job-detail'),
    path('jobs/create/', views.JobCreateView.as_view(), name='job-create'),
    path('jobs/<int:pk>/update/', views.JobUpdateView.as_view(), name='job-update'),
    path('jobs/<int:pk>/delete/', views.JobDeleteView.as_view(), name='job-delete'),
    path('jobs/<int:pk>/toggle-active/', views.JobToggleActiveView.as_view(), name='job-toggle-active'),

    # Applications & Saved
    path('jobs/apply/', views.ApplyJobView.as_view(), name='job-apply'),
    path('jobs/applied/', views.AppliedJobsListView.as_view(), name='applied-jobs'),
    path('jobs/save/', views.SaveJobView.as_view(), name='job-save'),
    path('jobs/saved/', views.SavedJobsListView.as_view(), name='saved-jobs'),

    # Withdraw application
    path('jobs/applications/<int:pk>/withdraw/', views.WithdrawApplicationView.as_view(), name='withdraw-application'),

    # Employer sees applications
    path('jobs/applications/', views.EmployerApplicationsListView.as_view(), name='employer-applications'),
    path('jobs/applications/<int:pk>/status/', views.EmployerApplicationStatusUpdateView.as_view(), name='employer-application-status-update'),

    # Notifications
    path('notifications/', views.NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/read/', views.MarkNotificationReadView.as_view(), name='mark-notification-read'),
 
    path('notifications/<int:pk>/unread/', MarkNotificationUnreadView.as_view()),
    path('notifications/<int:pk>/delete/', DeleteNotificationView.as_view()),
    path('notifications/clear-all/', ClearAllNotificationsView.as_view()),
   
    path("settings/", UserSettingsView.as_view(), name="user-settings"),
    path("jobs/save/", SaveJobView.as_view(), name="save-job"),
    path("jobs/save/<int:job_id>/", SaveJobView.as_view(), name="remove-saved-job"),
    path("jobs/applications/<int:pk>/", JobApplicationDetailView.as_view()),
 
    # Conversations
    path('chat/conversations/', ConversationListView.as_view(), name='chat-conversations'),
    path('chat/conversations/<int:pk>/', ConversationDetailView.as_view(), name='chat-conversation-detail'),
    path('chat/conversations/<int:pk>/messages/', ConversationMessagesView.as_view(), name='chat-conversation-messages'),
    path('chat/conversations/<int:pk>/mark-read/', MarkConversationReadView.as_view(), name='chat-conversation-mark-read'),
    path('chat/messages/send/', SendMessageView.as_view(), name='chat-send-message'),
    path('chat/messages/unread/', UnreadCountView.as_view(), name='chat-unread-count'),
    path('chat/messages/<int:pk>/read/', MarkMessageReadView.as_view(), name='chat-mark-message-read'),
    path('chat/with-user/', ConversationWithUserView.as_view(), name='chat-with-user'),
    path('chat/users/', ChatUsersView.as_view(), name='chat-users'),
    path('chat/employer/initiate/', EmployerInitiateChatView.as_view(), name='employer-initiate-chat'),
    path("chat/", chat_api, name="chat_api"),
    
    # Password
    path('auth/forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('auth/reset-password-confirm/', ResetPasswordConfirmView.as_view(), name='reset-password-confirm'),
    path('auth/create-password/', CreatePasswordView.as_view(), name='create-password'),
    path('auth/validate-reset-token/', ValidateResetTokenView.as_view(), name='validate-reset-token'),
    path('admin/create-password-token/', AdminCreatePasswordTokenView.as_view(), name='admin-create-password-token'),
    
    # raise ticket
     # CREATE TICKET
    path('raise-ticket/',RaiseTicketCreateView.as_view(), name='raise-ticket'),
 
    # ADMIN LIST ALL TICKETS
    path('admin/tickets/',AdminTicketListView.as_view(),name='admin-ticket-list'),
 
    # ADMIN UPDATE TICKET STATUS
    path('admin/tickets/<int:pk>/update/',AdminTicketUpdateView.as_view(), name='admin-ticket-update'),
 
    # ADMIN / USER DELETE TICKET
    path('admin/tickets/<int:pk>/delete/',AdminTicketDeleteView.as_view(),name='admin-ticket-delete'),
    
    # contact  create/Enquiries
    path( "contact/create/", ContactMessageCreateAPIView.as_view(), name="contact-create" ),
        #contact list
    path("contact/list/",ContactMessageListAPIView.as_view(),name="contact-list" ),
     #contact update
    path("contact/update/<int:pk>/",ContactMessageStatusUpdateAPIView.as_view(),name="contact-update"),

    path("contact-messages/<int:pk>/delete/",ContactMessageDeleteAPIView.as_view(), name="contact-message-delete",),
    
    
    # newsletter subscribe
    path("subscribe/", NewsletterSubscribeAPIView.as_view(), name="subscribe-newsletter"),
    
    # Company Verify 
    path("company/verify/", SubmitCompanyVerification.as_view()),
    path("admin/company-verification/<int:pk>/", CompanyVerificationAction.as_view()),
    
    # Post a Job
    path('jobs/preview/', CreateJobPreviewView.as_view(), name='job-preview'),
    path('jobs/preview/<int:pk>/', PreviewJobView.as_view(), name='job-preview-detail'),
    path('jobs/publish/<int:pk>/', PublishJobView.as_view(), name='job-publish'),
    path('jobs/update/<int:pk>/', UpdateJobView.as_view(), name='job-update'),
    path('jobs/delete/<int:pk>/', DeleteJobView.as_view(), name='job-delete'),
    path('jobs/published/', PostedJobListView.as_view(), name='job-list-published'),
    path('jobs/my-jobs/', EmployerJobListView.as_view(), name='job-list-employer'),
    path('jobs/all/', JobSeekerJobListView.as_view(), name='all-jobs'),
    path('jobs/<int:pk>/', JobSeekerJobDetailView.as_view(), name='job-detail'),
 
    # Verify Email OTP
    path('verify-email-otp/', VerifyEmailOTPView.as_view(), name='verify-email-otp'),
    path('send-email-otp/', SendEmailOTPView.as_view()),
    
    # OTP Login
    path('send-login-otp/', SendLoginOTPView.as_view(), name='send-login-otp'),
    path('verify-login-otp/', VerifyLoginOTPView.as_view(), name='verify-login-otp'),
 
    # Company Profile (NEW - Replaces old Company URLs)
    path('company/profile/create/', CompanyProfileCreateView.as_view(), name='company-profile-create'),
    path('company/profile/', CompanyProfileDetailView.as_view(), name='company-profile-detail'),
    path('company/profile/update/', CompanyProfileUpdateView.as_view(), name='company-profile-update'),
    path('company/link-to-existing/', LinkToExistingCompanyView.as_view(), name='link-to-existing-company'),

    #dashboad-verification status
    path('company/verification-status/', CompanyVerificationStatusView.as_view(), name='company-verification-status'),
    
    # Company Profile Public Endpoints
    path('companies/', CompanyProfileListView.as_view(), name='company-profile-list'),
    path('companies/<int:company_id>/', CompanyProfileByIdView.as_view(), name='company-profile-by-id'),
    

     # Report A Job/Escalation
    # path('complaints/submit/', SubmitComplaintView.as_view(), name='submit-complaint'),
    path('complaints/submit/<int:job_id>/', SubmitComplaintView.as_view(), name='submit-complaint'),
    path('admin/complaints/', AdminComplaintListView.as_view(), name='admin-complaint-list'),
    path('admin/complaints/<int:pk>/', AdminUpdateComplaintView.as_view(), name='admin-complaint-update'),
    path('admin/complaints/<int:pk>/detail/', AdminComplaintDetailView.as_view(), name='admin-complaint-detail'),
    path('admin/jobs/<int:pk>/detail/', AdminJobDetailView.as_view(), name='admin-job-detail'),
    path( "admin/jobs/<int:pk>/status/", AdminUpdateJobStatusView.as_view()),

    # Billing
    # path("plans/", PlanListView.as_view(), name='plan-list'),
    path("create-order/", CreateOrderView.as_view(), name='create-order'),
    path("subscription/", CurrentSubscriptionView.as_view(), name='current-subscription'),
    path("cancel/", CancelSubscriptionView.as_view(), name='cancel-subscription'),
    path("invoices/", InvoiceListView.as_view(), name='invoice-list'),
    path("invoice/<int:pk>/download/", InvoiceDownloadView.as_view(), name='invoice-download'),
    path("payment-methods/", PaymentMethodView.as_view(), name='payment-methods'),
    path("payment-methods/<int:pk>/", DeletePaymentMethodView.as_view(), name='delete-payment-method'),
    path("webhook/", razorpay_webhook, name='razorpay-webhook'),
    path("verify-payment/", VerifyPaymentView.as_view(), name='verify-payment'),

    path('company/send-email-otp/', SendCompanyEmailOTPView.as_view(), name='send-company-email-otp'),
    path('company/verify-email-otp/', VerifyCompanyEmailOTPView.as_view(), name='verify-company-email-otp'),
    path('employer/onboarding-status/', EmployerOnboardingStatusView.as_view(), name='employer-onboarding-status'),
     #AdminHeader
    path('admin/profile/photo/', AdminProfilePhotoView.as_view(), name='admin-profile-photo'),
    # Google Login
    path("google-login/", GoogleLoginView.as_view()),
    # admin login
    path('admin-login/', AdminLoginView.as_view(), name='admin-login'),
    #ActivityMonitor
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('company/', AdminCompanyListView.as_view(), name='dashboardlist'),
    path('company/<int:pk>/', AdminCompanyDetailView.as_view(), name='admin-company-detail'),
    path('company/<int:pk>/status/', UpdateCompanyStatusView.as_view(), name='update-company-status'),
    # ============ CURRENT LOGGED-IN USER ============
    path('users/me/', views.CurrentUserView.as_view(), name='current-user'),
    #UserManagement
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/status/', UserStatusUpdateView.as_view(), name='user-status-update'),
    path('users/stats/', UserStatsView.as_view(), name='user-stats'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('users/<int:pk>/delete/', UserDeleteView.as_view(), name='user-delete'),
     #admin JobMonitoring
    path('admin/jobs/', AdminJobListView.as_view(), name='admin-job-list'),
    path('admin/jobs/<int:pk>/approve/', AdminJobApproveView.as_view(), name='admin-job-approve'),
    path('admin/jobs/<int:pk>/reject/', AdminJobRejectView.as_view(), name='admin-job-reject'),
    path('admin/jobs/<int:pk>/flag/', AdminJobFlagView.as_view(), name='admin-job-flag'),
    path('admin/jobs/<int:pk>/delete/', AdminJobDeleteView.as_view(), name='admin-job-delete'),
    path('admin/jobs/stats/', AdminJobStatsView.as_view(), name='admin-job-stats'),

    #job highlight limits
    path('jobs/highlight-limit/', JobHighlightLimitView.as_view(), name='job-highlight-limit'),

    #admin dashboard
    # path('admin/dashboard/', AdminDashboardStats.as_view()),
    # path('admin/jobs/ajoblist/', AJobListView.as_view()),
    # path('admin/dashboard/overview/', AdminDashboardOverviewView.as_view(), name='admin-dashboard-overview'),
    # path("highlighted-jobs/", HighlightedJobsView.as_view(), name="highlighted-jobs" ),

    path('admin/dashboard/',AdminDashboardOverviewNewView.as_view(),name='admin-dashboard-view'),

         #for notification catogory prefer
 
    path("notification-preferences/update/",NotificationPreferenceUpdateView.as_view(),),
    path("notification-preferences/",NotificationPreferenceListView.as_view(),),
 
    # quiet hours
    path("quiet-hours/",AdminQuietHoursView.as_view(),),
    path("quiet-hours/update/", AdminQuietHoursUpdateView.as_view(),),
 
     # Notification Channel Settings
 
 
    path("notification-channels/",NotificationChannelSettingsView.as_view(),name="notification-channels"),
    path("notification-channels/update/",NotificationChannelSettingsUpdateView.as_view(),name="notification-channels-update"),



 
    #admin security settings
 
    #for cat -1 password
    path("admin-change-password/",AdminChangePasswordView.as_view(),name="admin-change-password"),
 

    # for cat-2 device log
    path("admin-trusted-devices/", AdminTrustedDeviceListView.as_view(),),
    path("admin-trusted-devices/<int:device_id>/",RevokeTrustedDeviceView.as_view(),),
    path("admin-access-log/",AdminAccessLogListView.as_view(),),
 
   
    # for cat - 3Admin 2FA
 
    path("admin/2fa/status/", Admin2FAStatusView.as_view(), name="admin-2fa-status"),
    path("admin-2fa/login/verify-otp/",VerifyAdminLoginOTPView.as_view(),name="admin-login-verify-otp"),

    path("admin/2fa/send-otp/",SendAdmin2FAOTPView.as_view(),name="admin-2fa-send-otp"),

    path("admin/2fa/verify-otp/",VerifyAdmin2FAOTPView.as_view(),name="admin-2fa-verify-otp"),
    path("admin/2fa/disable/", DisableAdmin2FAView.as_view(),name="admin-2fa-disable"),

    #for employer setting 

    path("employer-settings/<int:plan_id>/<str:account_status>/",EmployerPlatformSettingsView.as_view()),
    path('employer/weekly-summary/',EmployerWeeklySummaryView.as_view(),name='employer-weekly-summary'),

    # jobseekersetting
    path('jobseeker/settings/',JobseekerPlatformSettingsView.as_view(),name='jobseeker-platform-settings'),

    # PLANS
    path('plans/', PlanListCreateView.as_view(), name='plan-list-create'),
    path('plans/<int:pk>/', PlanDetailView.as_view(), name='plan-detail'),
    path('plans/<int:pk>/toggle-publish/', PlanPublishToggleView.as_view(), name='plan-toggle-publish'),
    path('check-plan-expiry/', CheckPlanExpiryView.as_view(), name='check-plan-expiry'),
    

]