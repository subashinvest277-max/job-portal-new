-- ============================================================
-- JOBPORTAL DATABASE SCRIPT
-- Generated from models.py
-- Character Set: utf8mb4
-- ============================================================

CREATE DATABASE IF NOT EXISTS jobportal_dev
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE jobportal_dev;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. User  (AbstractUser extension)
-- ============================================================
CREATE TABLE IF NOT EXISTS `User` (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    password      VARCHAR(128)  NOT NULL,
    last_login    DATETIME      NULL,
    is_superuser  TINYINT(1)    NOT NULL DEFAULT 0,
    username      VARCHAR(150)  NOT NULL UNIQUE,
    first_name    VARCHAR(150)  NOT NULL DEFAULT '',
    last_name     VARCHAR(150)  NOT NULL DEFAULT '',
    is_staff      TINYINT(1)    NOT NULL DEFAULT 0,
    is_active     TINYINT(1)    NOT NULL DEFAULT 1,
    date_joined   DATETIME      NOT NULL,
    email         VARCHAR(254)  NOT NULL UNIQUE,
    user_type     VARCHAR(10)   NOT NULL,
    phone         VARCHAR(15)   NULL,
    status        VARCHAR(15)   NOT NULL DEFAULT 'Active',
    is_online     TINYINT(1)    NOT NULL DEFAULT 0,
    last_seen     DATETIME      NOT NULL,
    login_time    DATETIME      NULL,
    is_deleted    TINYINT(1)    NOT NULL DEFAULT 0,
    deleted_at    DATETIME      NULL,
    INDEX idx_user_email    (email),
    INDEX idx_user_type     (user_type),
    INDEX idx_user_status   (status),
    INDEX idx_user_online   (is_online)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 2. User ManyToMany tables (Django auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS `User_groups` (
    id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id  BIGINT NOT NULL,
    group_id INT    NOT NULL,
    UNIQUE KEY uq_user_group (user_id, group_id),
    CONSTRAINT fk_ug_user  FOREIGN KEY (user_id)  REFERENCES `User`(id) ON DELETE CASCADE,
    CONSTRAINT fk_ug_group FOREIGN KEY (group_id) REFERENCES auth_group(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `User_user_permissions` (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT NOT NULL,
    permission_id INT    NOT NULL,
    UNIQUE KEY uq_user_perm (user_id, permission_id),
    CONSTRAINT fk_up_user FOREIGN KEY (user_id)       REFERENCES `User`(id) ON DELETE CASCADE,
    CONSTRAINT fk_up_perm FOREIGN KEY (permission_id) REFERENCES auth_permission(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 3. AdminProfile
-- ============================================================
CREATE TABLE IF NOT EXISTS `AdminProfile` (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id      BIGINT       NOT NULL UNIQUE,
    department   VARCHAR(100) NOT NULL DEFAULT '',
    bio          LONGTEXT     NOT NULL DEFAULT '',
    access_level VARCHAR(50)  NOT NULL DEFAULT 'Full',
    created_at   DATETIME     NOT NULL,
    updated_at   DATETIME     NOT NULL,
    CONSTRAINT fk_adminprofile_user FOREIGN KEY (user_id) REFERENCES `User`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 4. JobSeekerProfile
-- ============================================================
CREATE TABLE IF NOT EXISTS `JobSeekerProfile` (
    id                        BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id                   BIGINT          NOT NULL UNIQUE,
    employment_status         VARCHAR(20)     NULL,
    full_name                 VARCHAR(200)    NOT NULL DEFAULT '',
    gender                    VARCHAR(20)     NOT NULL DEFAULT '',
    dob                       DATE            NULL,
    marital_status            VARCHAR(20)     NOT NULL DEFAULT '',
    nationality               VARCHAR(100)    NOT NULL DEFAULT '',
    profile_photo             VARCHAR(255)    NULL,
    current_job_title         VARCHAR(200)    NOT NULL DEFAULT '',
    current_company           VARCHAR(200)    NOT NULL DEFAULT '',
    total_experience_years    DECIMAL(4,1)    NULL,
    notice_period             VARCHAR(50)     NOT NULL DEFAULT '',
    current_location          VARCHAR(200)    NOT NULL DEFAULT '',
    preferred_locations       LONGTEXT        NOT NULL DEFAULT '',
    alternate_phone           VARCHAR(15)     NULL,
    alternate_email           VARCHAR(254)    NULL,
    full_address              LONGTEXT        NOT NULL DEFAULT '',
    street                    VARCHAR(200)    NOT NULL DEFAULT '',
    city                      VARCHAR(100)    NOT NULL DEFAULT '',
    state                     VARCHAR(100)    NOT NULL DEFAULT '',
    pincode                   VARCHAR(10)     NOT NULL DEFAULT '',
    country                   VARCHAR(100)    NOT NULL DEFAULT '',
    resume_file               VARCHAR(255)    NULL,
    portfolio_link            VARCHAR(200)    NULL,
    current_ctc               DECIMAL(12,2)   NULL,
    expected_ctc              DECIMAL(12,2)   NULL,
    preferred_job_type        VARCHAR(50)     NOT NULL DEFAULT '',
    preferred_role_industry   VARCHAR(200)    NOT NULL DEFAULT '',
    ready_to_start_immediately TINYINT(1)     NOT NULL DEFAULT 0,
    willing_to_relocate       TINYINT(1)      NOT NULL DEFAULT 0,
    created_at                DATETIME        NOT NULL,
    updated_at                DATETIME        NOT NULL,
    CONSTRAINT fk_jsp_user FOREIGN KEY (user_id) REFERENCES `User`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 5. EducationEntry
-- ============================================================
CREATE TABLE IF NOT EXISTS `EducationEntry` (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    profile_id          BIGINT          NOT NULL,
    qualification_level VARCHAR(30)     NOT NULL,
    institution         VARCHAR(200)    NOT NULL,
    percentage_or_cgpa  DECIMAL(5,2)    NULL,
    location            VARCHAR(200)    NOT NULL DEFAULT '',
    post_10th_study     VARCHAR(20)     NULL,
    degree              VARCHAR(200)    NULL,
    department          VARCHAR(200)    NULL,
    status              VARCHAR(20)     NULL,
    city                VARCHAR(100)    NULL,
    state               VARCHAR(100)    NULL,
    country             VARCHAR(100)    NULL,
    completion_year     DATE            NULL,
    start_year          DATE            NULL,
    end_year            DATE            NULL,
    CONSTRAINT fk_edu_profile FOREIGN KEY (profile_id) REFERENCES `JobSeekerProfile`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 6. WorkExperienceEntry
-- ============================================================
CREATE TABLE IF NOT EXISTS `WorkExperienceEntry` (
    id                       BIGINT AUTO_INCREMENT PRIMARY KEY,
    profile_id               BIGINT       NOT NULL,
    current_status           VARCHAR(20)  NOT NULL DEFAULT 'Fresher',
    has_internship_experience VARCHAR(3)  NOT NULL DEFAULT '',
    job_title                VARCHAR(200) NOT NULL DEFAULT '',
    company_name             VARCHAR(200) NOT NULL DEFAULT '',
    start_date               DATE         NULL,
    end_date                 DATE         NULL,
    currently_working        TINYINT(1)   NOT NULL DEFAULT 0,
    industry_domain          VARCHAR(50)  NOT NULL DEFAULT '',
    job_type                 VARCHAR(50)  NOT NULL DEFAULT '',
    location                 VARCHAR(200) NOT NULL DEFAULT '',
    key_responsibilities     LONGTEXT     NOT NULL DEFAULT '',
    CONSTRAINT fk_exp_profile FOREIGN KEY (profile_id) REFERENCES `JobSeekerProfile`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 7. Skill
-- ============================================================
CREATE TABLE IF NOT EXISTS `Skill` (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    profile_id BIGINT       NOT NULL,
    name       VARCHAR(100) NOT NULL,
    UNIQUE KEY uq_profile_skill (profile_id, name),
    CONSTRAINT fk_skill_profile FOREIGN KEY (profile_id) REFERENCES `JobSeekerProfile`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 8. LanguageKnown
-- ============================================================
CREATE TABLE IF NOT EXISTS `LanguageKnown` (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    profile_id  BIGINT      NOT NULL,
    name        VARCHAR(100) NOT NULL,
    proficiency VARCHAR(50)  NOT NULL,
    UNIQUE KEY uq_profile_lang (profile_id, name),
    CONSTRAINT fk_lang_profile FOREIGN KEY (profile_id) REFERENCES `JobSeekerProfile`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 9. Certification
-- ============================================================
CREATE TABLE IF NOT EXISTS `Certification` (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    profile_id       BIGINT       NOT NULL,
    name             VARCHAR(200) NOT NULL,
    certificate_file VARCHAR(255) NULL,
    CONSTRAINT fk_cert_profile FOREIGN KEY (profile_id) REFERENCES `JobSeekerProfile`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 10. CompanyProfile
-- ============================================================
CREATE TABLE IF NOT EXISTS `CompanyProfile` (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_name   VARCHAR(255) NOT NULL,
    company_moto   VARCHAR(255) NOT NULL DEFAULT '',
    contact_person VARCHAR(255) NOT NULL DEFAULT '',
    contact_number VARCHAR(15)  NOT NULL DEFAULT '',
    company_email  VARCHAR(254) NOT NULL DEFAULT '',
    website        VARCHAR(200) NOT NULL DEFAULT '',
    company_size   VARCHAR(100) NOT NULL DEFAULT '',
    address1       LONGTEXT     NOT NULL DEFAULT '',
    address2       LONGTEXT     NULL,
    about          LONGTEXT     NOT NULL DEFAULT '',
    company_logo   VARCHAR(255) NULL,
    created_at     DATETIME     NOT NULL,
    created_by_id  BIGINT       NULL,
    CONSTRAINT fk_cp_createdby FOREIGN KEY (created_by_id) REFERENCES `User`(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 11. EmployerProfile
-- ============================================================
CREATE TABLE IF NOT EXISTS `EmployerProfile` (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT       NOT NULL UNIQUE,
    full_name   VARCHAR(200) NOT NULL DEFAULT '',
    employee_id VARCHAR(50)  NULL UNIQUE,
    company_id  BIGINT       NULL,
    created_at  DATETIME     NOT NULL,
    updated_at  DATETIME     NOT NULL,
    CONSTRAINT fk_ep_user    FOREIGN KEY (user_id)    REFERENCES `User`(id) ON DELETE CASCADE,
    CONSTRAINT fk_ep_company FOREIGN KEY (company_id) REFERENCES `CompanyProfile`(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 12. CompanyVerification
-- ============================================================
CREATE TABLE IF NOT EXISTS `CompanyVerification` (
    id                        BIGINT AUTO_INCREMENT PRIMARY KEY,
    employer_id               BIGINT       NOT NULL UNIQUE,
    legal_name                VARCHAR(255) NOT NULL,
    registration_number       VARCHAR(255) NOT NULL,
    tax_id                    VARCHAR(255) NOT NULL,
    website_url               VARCHAR(200) NOT NULL,
    official_email            VARCHAR(254) NOT NULL,
    phone_number              VARCHAR(20)  NOT NULL,
    incorporation_certificate VARCHAR(255) NOT NULL,
    status                    VARCHAR(10)  NOT NULL DEFAULT 'Pending',
    created_at                DATETIME     NOT NULL,
    UNIQUE KEY uq_cv_employer_name (employer_id, legal_name(100)),
    INDEX idx_cv_status (status),
    CONSTRAINT fk_cv_employer FOREIGN KEY (employer_id) REFERENCES `User`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 13. JobHistory
-- ============================================================
CREATE TABLE IF NOT EXISTS `JobHistory` (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id      INT          NOT NULL,
    employer_id BIGINT       NULL,
    job_title   VARCHAR(255) NOT NULL,
    created_at  DATETIME     NOT NULL,
    deleted_at  DATETIME     NOT NULL,
    data        JSON         NOT NULL,
    CONSTRAINT fk_jh_employer FOREIGN KEY (employer_id) REFERENCES `User`(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 14. PostAJob
-- ============================================================
CREATE TABLE IF NOT EXISTS `PostAJob` (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    employer_id      BIGINT          NOT NULL,
    job_title        VARCHAR(255)    NOT NULL,
    industry_type    JSON            NOT NULL,
    department       JSON            NOT NULL,
    work_type        VARCHAR(50)     NOT NULL,
    shift            VARCHAR(50)     NOT NULL,
    work_duration    VARCHAR(100)    NOT NULL,
    salary           DECIMAL(10,2)   NOT NULL,
    experience       VARCHAR(100)    NOT NULL,
    location         JSON            NOT NULL,
    openings         INT UNSIGNED    NOT NULL,
    job_category     VARCHAR(255)    NOT NULL DEFAULT '',
    education        JSON            NOT NULL,
    key_skills       JSON            NOT NULL,
    job_highlights   JSON            NOT NULL,
    job_description  LONGTEXT        NOT NULL,
    responsibilities JSON            NOT NULL,
    job_status       VARCHAR(50)     NOT NULL DEFAULT 'Reviewing Application',
    is_published     TINYINT(1)      NOT NULL DEFAULT 0,
    approval_status  VARCHAR(10)     NOT NULL DEFAULT 'pending',
    approved_by_id   BIGINT          NULL,
    approved_at      DATETIME        NULL,
    flagged          TINYINT(1)      NOT NULL DEFAULT 0,
    is_highlighted   TINYINT(1)      NOT NULL DEFAULT 0,
    highlighted_at   DATETIME        NULL,
    created_at       DATETIME        NOT NULL,
    INDEX idx_postajob_published  (is_published),
    INDEX idx_postajob_approval   (approval_status),
    INDEX idx_postajob_created    (created_at),
    CONSTRAINT fk_paj_employer    FOREIGN KEY (employer_id)   REFERENCES `User`(id) ON DELETE CASCADE,
    CONSTRAINT fk_paj_approvedby  FOREIGN KEY (approved_by_id) REFERENCES `User`(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 15. JobApplication
-- ============================================================
CREATE TABLE IF NOT EXISTS `JobApplication` (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id        BIGINT       NOT NULL,
    job_id         BIGINT       NOT NULL,
    applied_date   DATETIME     NOT NULL,
    status         VARCHAR(30)  NOT NULL DEFAULT 'applied',
    cover_letter   LONGTEXT     NULL,
    resume_version VARCHAR(255) NULL,
    ip_address     VARCHAR(39)  NULL,
    resume_hash    VARCHAR(64)  NULL,
    is_deleted     TINYINT(1)   NOT NULL DEFAULT 0,
    deleted_at     DATETIME     NULL,
    INDEX idx_ja_user_job (user_id, job_id),
    CONSTRAINT fk_ja_user FOREIGN KEY (user_id) REFERENCES `User`(id)     ON DELETE CASCADE,
    CONSTRAINT fk_ja_job  FOREIGN KEY (job_id)  REFERENCES `PostAJob`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 16. ApplicationFlag
-- ============================================================
CREATE TABLE IF NOT EXISTS `ApplicationFlag` (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id  BIGINT       NOT NULL,
    flag_reason     VARCHAR(50)  NOT NULL,
    detected_method LONGTEXT     NOT NULL,
    risk_level      VARCHAR(20)  NOT NULL,
    is_reviewed     TINYINT(1)   NOT NULL DEFAULT 0,
    created_at      DATETIME     NOT NULL,
    CONSTRAINT fk_af_application FOREIGN KEY (application_id) REFERENCES `JobApplication`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 17. SavedJob
-- ============================================================
CREATE TABLE IF NOT EXISTS `SavedJob` (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT   NOT NULL,
    job_id     BIGINT   NOT NULL,
    saved_date DATETIME NOT NULL,
    UNIQUE KEY uq_saved_user_job (user_id, job_id),
    CONSTRAINT fk_sj_user FOREIGN KEY (user_id) REFERENCES `User`(id)     ON DELETE CASCADE,
    CONSTRAINT fk_sj_job  FOREIGN KEY (job_id)  REFERENCES `PostAJob`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 18. NewsletterSubscriber
-- ============================================================
CREATE TABLE IF NOT EXISTS `NewsletterSubscriber` (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(254) NOT NULL UNIQUE,
    subscribed_at DATETIME     NOT NULL,
    is_active     TINYINT(1)   NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 19. Notification
-- ============================================================
CREATE TABLE IF NOT EXISTS `Notification` (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id           BIGINT       NOT NULL,
    message           LONGTEXT     NOT NULL,
    created_at        DATETIME     NOT NULL,
    is_read           TINYINT(1)   NOT NULL DEFAULT 0,
    notification_type VARCHAR(50)  NOT NULL DEFAULT 'system',
    related_object_id INT UNSIGNED NULL,
    job_id            BIGINT       NULL,
    INDEX idx_notif_created (created_at),
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES `User`(id)     ON DELETE CASCADE,
    CONSTRAINT fk_notif_job  FOREIGN KEY (job_id)  REFERENCES `PostAJob`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 20. Conversation
-- ============================================================
CREATE TABLE IF NOT EXISTS `Conversation` (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at          DATETIME   NOT NULL,
    updated_at          DATETIME   NOT NULL,
    initiated_by_id     BIGINT     NULL,
    jobseeker_can_reply TINYINT(1) NOT NULL DEFAULT 0,
    INDEX idx_conv_updated (updated_at),
    CONSTRAINT fk_conv_initiatedby FOREIGN KEY (initiated_by_id) REFERENCES `User`(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 21. Conversation_participants (ManyToMany)
-- ============================================================
CREATE TABLE IF NOT EXISTS `Conversation_participants` (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    user_id         BIGINT NOT NULL,
    UNIQUE KEY uq_conv_user (conversation_id, user_id),
    CONSTRAINT fk_cp_conv FOREIGN KEY (conversation_id) REFERENCES `Conversation`(id) ON DELETE CASCADE,
    CONSTRAINT fk_cp_user FOREIGN KEY (user_id)         REFERENCES `User`(id)         ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 22. Message
-- ============================================================
CREATE TABLE IF NOT EXISTS `Message` (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id  BIGINT     NOT NULL,
    sender_id        BIGINT     NOT NULL,
    receiver_id      BIGINT     NOT NULL,
    content          LONGTEXT   NOT NULL,
    timestamp        DATETIME   NOT NULL,
    is_read          TINYINT(1) NOT NULL DEFAULT 0,
    is_first_message TINYINT(1) NOT NULL DEFAULT 0,
    INDEX idx_msg_timestamp (timestamp),
    CONSTRAINT fk_msg_conv     FOREIGN KEY (conversation_id) REFERENCES `Conversation`(id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_sender   FOREIGN KEY (sender_id)       REFERENCES `User`(id),
    CONSTRAINT fk_msg_receiver FOREIGN KEY (receiver_id)     REFERENCES `User`(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 23. ChatMessage
-- ============================================================
CREATE TABLE IF NOT EXISTS `ChatMessage` (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender     VARCHAR(10) NOT NULL,
    message    LONGTEXT    NOT NULL,
    created_at DATETIME    NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 24. UserSettings
-- ============================================================
CREATE TABLE IF NOT EXISTS `UserSettings` (
    id                             BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id                        BIGINT       NOT NULL UNIQUE,
    account_type                   VARCHAR(50)  NOT NULL DEFAULT 'Job Seeker',
    phone                          VARCHAR(20)  NOT NULL DEFAULT '',
    show_online_status             TINYINT(1)   NOT NULL DEFAULT 1,
    show_read_receipts             TINYINT(1)   NOT NULL DEFAULT 1,
    restrict_duplicate_applications TINYINT(1)  NOT NULL DEFAULT 0,
    hide_cv                        TINYINT(1)   NOT NULL DEFAULT 0,
    updated_at                     DATETIME     NOT NULL,
    CONSTRAINT fk_us_user FOREIGN KEY (user_id) REFERENCES `User`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 25. HelpTopic
-- ============================================================
CREATE TABLE IF NOT EXISTS `HelpTopic` (
    id    BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    path  VARCHAR(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 26. RaiseTicket
-- ============================================================
CREATE TABLE IF NOT EXISTS `RaiseTicket` (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    category   VARCHAR(50)  NOT NULL,
    subject    VARCHAR(255) NOT NULL,
    name       VARCHAR(150) NOT NULL,
    email      VARCHAR(254) NOT NULL,
    phone      VARCHAR(20)  NOT NULL,
    message    LONGTEXT     NULL,
    attachment VARCHAR(255) NULL,
    created_at DATETIME     NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 27. PasswordRestToken
-- ============================================================
CREATE TABLE IF NOT EXISTS `PasswordRestToken` (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT       NOT NULL,
    token      VARCHAR(100) NOT NULL UNIQUE,
    created_at DATETIME     NOT NULL,
    expires_at DATETIME     NOT NULL,
    is_used    TINYINT(1)   NOT NULL DEFAULT 0,
    CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES `User`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 28. ContactMessage
-- ============================================================
CREATE TABLE IF NOT EXISTS `ContactMessage` (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(150) NOT NULL,
    email      VARCHAR(254) NOT NULL,
    contact    VARCHAR(15)  NOT NULL,
    message    LONGTEXT     NOT NULL,
    created_at DATETIME     NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 29. EmailOTP
-- ============================================================
CREATE TABLE IF NOT EXISTS `EmailOTP` (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    email       VARCHAR(254) NULL,
    user_id     BIGINT       NULL,
    otp         VARCHAR(6)   NOT NULL,
    purpose     VARCHAR(50)  NOT NULL,
    created_at  DATETIME     NOT NULL,
    expires_at  DATETIME     NOT NULL,
    is_verified TINYINT(1)   NOT NULL DEFAULT 0,
    CONSTRAINT fk_otp_user FOREIGN KEY (user_id) REFERENCES `User`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 30. Complaint
-- ============================================================
CREATE TABLE IF NOT EXISTS `Complaint` (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id               BIGINT       NOT NULL,
    reported_job_id       BIGINT       NULL,
    reported_job_title    VARCHAR(255) NOT NULL DEFAULT '',
    reported_employer_name VARCHAR(255) NOT NULL DEFAULT '',
    reported_company_name VARCHAR(255) NOT NULL DEFAULT '',
    first_name            VARCHAR(100) NOT NULL,
    last_name             VARCHAR(100) NOT NULL,
    mobile                VARCHAR(10)  NOT NULL,
    email                 VARCHAR(254) NOT NULL,
    reason                VARCHAR(255) NOT NULL,
    explanation           LONGTEXT     NOT NULL,
    status                VARCHAR(20)  NOT NULL DEFAULT 'pending',
    admin_notes           LONGTEXT     NOT NULL DEFAULT '',
    resolved_at           DATETIME     NULL,
    resolved_by_id        BIGINT       NULL,
    created_at            DATETIME     NOT NULL,
    updated_at            DATETIME     NOT NULL,
    UNIQUE KEY uq_complaint_user_job (user_id, reported_job_id),
    INDEX idx_complaint_status     (status, created_at),
    INDEX idx_complaint_job_status (reported_job_id, status),
    CONSTRAINT fk_complaint_user        FOREIGN KEY (user_id)         REFERENCES `User`(id)     ON DELETE CASCADE,
    CONSTRAINT fk_complaint_job         FOREIGN KEY (reported_job_id) REFERENCES `PostAJob`(id) ON DELETE CASCADE,
    CONSTRAINT fk_complaint_resolvedby  FOREIGN KEY (resolved_by_id)  REFERENCES `User`(id)     ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 31. Plan
-- ============================================================
CREATE TABLE IF NOT EXISTS `Plan` (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(50)   NOT NULL,
    monthly_price   DECIMAL(10,2) NOT NULL DEFAULT 0,
    duration_days   INT           NOT NULL DEFAULT 30,
    highlight_limit INT UNSIGNED  NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 32. Subscription
-- ============================================================
CREATE TABLE IF NOT EXISTS `Subscription` (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT      NOT NULL,
    plan_id    BIGINT      NOT NULL,
    status     VARCHAR(20) NOT NULL DEFAULT 'active',
    start_date DATETIME    NOT NULL,
    end_date   DATETIME    NULL,
    duration   VARCHAR(20) NOT NULL DEFAULT 'monthly',
    CONSTRAINT fk_sub_user FOREIGN KEY (user_id) REFERENCES `User`(id) ON DELETE CASCADE,
    CONSTRAINT fk_sub_plan FOREIGN KEY (plan_id) REFERENCES `Plan`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 33. Payment
-- ============================================================
CREATE TABLE IF NOT EXISTS `Payment` (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id             BIGINT          NOT NULL,
    plan_id             BIGINT          NULL,
    razorpay_order_id   VARCHAR(255)    NULL UNIQUE,
    razorpay_payment_id VARCHAR(255)    NULL,
    razorpay_signature  LONGTEXT        NULL,
    amount              DECIMAL(10,2)   NOT NULL,
    currency            VARCHAR(10)     NOT NULL DEFAULT 'INR',
    status              VARCHAR(20)     NOT NULL DEFAULT 'created',
    payment_method      VARCHAR(50)     NOT NULL DEFAULT '',
    failure_reason      LONGTEXT        NOT NULL DEFAULT '',
    created_at          DATETIME        NOT NULL,
    updated_at          DATETIME        NOT NULL,
    razorpay_response   JSON            NULL,
    CONSTRAINT fk_pay_user FOREIGN KEY (user_id) REFERENCES `User`(id) ON DELETE CASCADE,
    CONSTRAINT fk_pay_plan FOREIGN KEY (plan_id) REFERENCES `Plan`(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 34. Invoice
-- ============================================================
CREATE TABLE IF NOT EXISTS `Invoice` (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT          NOT NULL,
    invoice_number  VARCHAR(100)    NOT NULL UNIQUE,
    invoice_date    DATETIME        NOT NULL,
    company_name    VARCHAR(255)    NOT NULL,
    email           VARCHAR(254)    NOT NULL,
    phone           VARCHAR(20)     NULL,
    payment_method  VARCHAR(50)     NOT NULL,
    transaction_id  VARCHAR(100)    NOT NULL,
    payment_status  VARCHAR(50)     NOT NULL,
    subtotal        DECIMAL(10,2)   NOT NULL,
    gst             DECIMAL(10,2)   NOT NULL,
    total           DECIMAL(10,2)   NOT NULL,
    plan_name       VARCHAR(100)    NOT NULL,
    duration        VARCHAR(50)     NOT NULL,
    start_date      DATETIME        NOT NULL,
    end_date        DATETIME        NOT NULL,
    created_at      DATETIME        NOT NULL,
    CONSTRAINT fk_inv_user FOREIGN KEY (user_id) REFERENCES `User`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 35. PaymentMethod
-- ============================================================
CREATE TABLE IF NOT EXISTS `PaymentMethod` (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT      NOT NULL,
    method_type      VARCHAR(20) NOT NULL,
    card_last4       VARCHAR(4)  NOT NULL DEFAULT '',
    card_holder_name VARCHAR(100) NOT NULL DEFAULT '',
    upi_id           VARCHAR(100) NOT NULL DEFAULT '',
    bank_name        VARCHAR(100) NOT NULL DEFAULT '',
    is_default       TINYINT(1)  NOT NULL DEFAULT 0,
    expiry_date      VARCHAR(7)  NULL,
    CONSTRAINT fk_pm_user FOREIGN KEY (user_id) REFERENCES `User`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 36. CompanyEmailOTP
-- ============================================================
CREATE TABLE IF NOT EXISTS `CompanyEmailOTP` (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NULL,
    email        VARCHAR(254) NOT NULL,
    otp          VARCHAR(6)   NOT NULL,
    purpose      VARCHAR(30)  NOT NULL,
    created_at   DATETIME     NOT NULL,
    expires_at   DATETIME     NOT NULL,
    is_verified  TINYINT(1)   NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 37. ACompany
-- ============================================================
CREATE TABLE IF NOT EXISTS `ACompany` (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    created_at DATETIME     NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 38. AEmployer
-- ============================================================
CREATE TABLE IF NOT EXISTS `AEmployer` (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    company_id BIGINT       NOT NULL,
    CONSTRAINT fk_ae_company FOREIGN KEY (company_id) REFERENCES `ACompany`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 39. AJobseeker
-- ============================================================
CREATE TABLE IF NOT EXISTS `AJobseeker` (
    id    BIGINT AUTO_INCREMENT PRIMARY KEY,
    name  VARCHAR(255) NOT NULL,
    email VARCHAR(254) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 40. AJob
-- ============================================================
CREATE TABLE IF NOT EXISTS `AJob` (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    title      VARCHAR(255) NOT NULL,
    company_id BIGINT       NOT NULL,
    status     VARCHAR(50)  NOT NULL DEFAULT 'active',
    created_at DATETIME     NOT NULL,
    CONSTRAINT fk_aj_company FOREIGN KEY (company_id) REFERENCES `ACompany`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 41. Role
-- ============================================================
CREATE TABLE IF NOT EXISTS `Role` (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description LONGTEXT     NOT NULL DEFAULT '',
    created_at  DATETIME     NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 42. Module
-- ============================================================
CREATE TABLE IF NOT EXISTS `Module` (
    id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 43. Permission
-- ============================================================
CREATE TABLE IF NOT EXISTS `Permission` (
    id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_id   BIGINT     NOT NULL,
    module_id BIGINT     NOT NULL,
    `read`    TINYINT(1) NOT NULL DEFAULT 0,
    `create`  TINYINT(1) NOT NULL DEFAULT 0,
    `update`  TINYINT(1) NOT NULL DEFAULT 0,
    `delete`  TINYINT(1) NOT NULL DEFAULT 0,
    UNIQUE KEY uq_role_module (role_id, module_id),
    CONSTRAINT fk_perm_role   FOREIGN KEY (role_id)   REFERENCES `Role`(id)   ON DELETE CASCADE,
    CONSTRAINT fk_perm_module FOREIGN KEY (module_id) REFERENCES `Module`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 44. NotificationConfig
-- ============================================================
CREATE TABLE IF NOT EXISTS `NotificationConfig` (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id               BIGINT     NOT NULL UNIQUE,
    email_notifications   TINYINT(1) NOT NULL DEFAULT 1,
    push_notifications    TINYINT(1) NOT NULL DEFAULT 1,
    sms_notifications     TINYINT(1) NOT NULL DEFAULT 0,
    job_alerts            TINYINT(1) NOT NULL DEFAULT 1,
    application_updates   TINYINT(1) NOT NULL DEFAULT 1,
    message_notifications TINYINT(1) NOT NULL DEFAULT 1,
    CONSTRAINT fk_nc_user FOREIGN KEY (user_id) REFERENCES `User`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 45. AdminQuietHours
-- ============================================================
CREATE TABLE IF NOT EXISTS `AdminQuietHours` (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT      NOT NULL UNIQUE,
    start_time VARCHAR(5)  NOT NULL DEFAULT '22:00',
    end_time   VARCHAR(5)  NOT NULL DEFAULT '08:00',
    enabled    TINYINT(1)  NOT NULL DEFAULT 0,
    CONSTRAINT fk_aqh_user FOREIGN KEY (user_id) REFERENCES `User`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 46. NotificationChannelSettings
-- ============================================================
CREATE TABLE IF NOT EXISTS `NotificationChannelSettings` (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT      NOT NULL UNIQUE,
    email       TINYINT(1)  NOT NULL DEFAULT 1,
    sms         TINYINT(1)  NOT NULL DEFAULT 0,
    push        TINYINT(1)  NOT NULL DEFAULT 1,
    in_app      TINYINT(1)  NOT NULL DEFAULT 1,
    CONSTRAINT fk_ncs_user FOREIGN KEY (user_id) REFERENCES `User`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 47. SMSOTP
-- ============================================================
CREATE TABLE IF NOT EXISTS `SMSOTP` (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    phone       VARCHAR(15)  NOT NULL,
    otp         VARCHAR(6)   NOT NULL,
    purpose     VARCHAR(30)  NOT NULL,
    created_at  DATETIME     NOT NULL,
    expires_at  DATETIME     NOT NULL,
    is_verified TINYINT(1)   NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 48. AdminAccessLog
-- ============================================================
CREATE TABLE IF NOT EXISTS `AdminAccessLog` (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT       NULL,
    action     VARCHAR(255) NOT NULL,
    ip_address VARCHAR(39)  NULL,
    user_agent LONGTEXT     NULL,
    created_at DATETIME     NOT NULL,
    CONSTRAINT fk_aal_user FOREIGN KEY (user_id) REFERENCES `User`(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 49. AdminTrustedDevice
-- ============================================================
CREATE TABLE IF NOT EXISTS `AdminTrustedDevice` (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id      BIGINT       NOT NULL,
    device_token VARCHAR(255) NOT NULL UNIQUE,
    device_name  VARCHAR(100) NULL,
    ip_address   VARCHAR(39)  NULL,
    created_at   DATETIME     NOT NULL,
    last_used    DATETIME     NULL,
    CONSTRAINT fk_atd_user FOREIGN KEY (user_id) REFERENCES `User`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- PERFORMANCE INDEXES
-- ============================================================
CREATE INDEX idx_ja_status          ON `JobApplication`(status);
CREATE INDEX idx_postajob_employer  ON `PostAJob`(employer_id);
CREATE INDEX idx_notif_user         ON `Notification`(user_id);
CREATE INDEX idx_msg_conversation   ON `Message`(conversation_id);
CREATE INDEX idx_savedjob_user      ON `SavedJob`(user_id);
CREATE INDEX idx_savedjob_job       ON `SavedJob`(job_id);
CREATE INDEX idx_eduentry_profile   ON `EducationEntry`(profile_id);
CREATE INDEX idx_workexp_profile    ON `WorkExperienceEntry`(profile_id);
CREATE INDEX idx_skill_profile      ON `Skill`(profile_id);
CREATE INDEX idx_lang_profile       ON `LanguageKnown`(profile_id);


-- ============================================================
-- VIEWS
-- ============================================================

-- Jobs List View
CREATE OR REPLACE VIEW vw_jobs_list AS
SELECT
    j.id, j.job_title, j.location, j.work_type, j.salary,
    j.openings, j.job_status, j.approval_status,
    j.is_published, j.created_at,
    u.username AS employer_name,
    cp.company_name
FROM PostAJob j
JOIN `User` u ON j.employer_id = u.id
LEFT JOIN EmployerProfile ep ON ep.user_id = u.id
LEFT JOIN CompanyProfile cp ON ep.company_id = cp.id
WHERE j.is_published = 1 AND j.approval_status = 'approved';


-- Job Applications View
CREATE OR REPLACE VIEW vw_job_applications AS
SELECT
    ja.id, ja.status, ja.applied_date,
    u.id AS user_id, u.email, u.username,
    j.id AS job_id, j.job_title,
    cp.company_name
FROM JobApplication ja
JOIN `User` u  ON ja.user_id = u.id
JOIN PostAJob j ON ja.job_id  = j.id
LEFT JOIN EmployerProfile ep ON ep.user_id = j.employer_id
LEFT JOIN CompanyProfile cp  ON ep.company_id = cp.id;


-- User Profiles View
CREATE OR REPLACE VIEW vw_user_profiles AS
SELECT
    u.id, u.email, u.username, u.user_type, u.is_online, u.last_seen,
    jsp.full_name, jsp.current_location, jsp.total_experience_years,
    jsp.employment_status
FROM `User` u
LEFT JOIN JobSeekerProfile jsp ON u.id = jsp.user_id;


-- Admin Dashboard View
CREATE OR REPLACE VIEW vw_admin_dashboard AS
SELECT
    (SELECT COUNT(*) FROM `User`)           AS total_users,
    (SELECT COUNT(*) FROM PostAJob)          AS total_jobs,
    (SELECT COUNT(*) FROM JobApplication)    AS total_applications,
    (SELECT COUNT(*) FROM CompanyProfile)    AS total_companies,
    (SELECT COUNT(*) FROM `User` WHERE user_type = 'jobseeker') AS total_jobseekers,
    (SELECT COUNT(*) FROM `User` WHERE user_type = 'employer')  AS total_employers;


SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- END OF SCRIPT
-- Total Tables: 49 (47 custom + 2 ManyToMany)
-- ============================================================
