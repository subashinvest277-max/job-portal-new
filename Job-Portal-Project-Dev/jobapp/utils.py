from __future__ import annotations
import random
import secrets
from django.core.mail import send_mail
from django.conf import settings
 
def generate_token():
    """Generate a secure token"""
    return secrets.token_urlsafe(32)
 
def send_password_reset_email(user, token, request):
    """Send password reset email with different links based on user type"""
   
    frontend_url = settings.FRONTEND_URL
   
    if user.user_type == 'employer':
        reset_page = f"{frontend_url}/Job-portal/employer/login/forgotpassword/createpassword?token={token}"
    elif user.user_type == 'jobseeker':
        reset_page = f"{frontend_url}/Job-portal/jobseeker/login/forgotpassword/createpassword?token={token}"
    else:
        reset_page = f"{frontend_url}/Job-portal/login/forgotpassword/createpassword?token={token}"
   
    subject = f'Password Reset Request - {user.get_user_type_display()} Account'
    message = f"""
Hello {user.username},
 
We received a request to reset your password for your {user.get_user_type_display()} account: {user.email}
 
Please visit this link:
{reset_page}
 
And enter this token on the page:
 
 
This token will expire in 24 hours.
 
If you didn't request this, please ignore this email.
"""
   
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )

def generate_company_otp():
    """Generate a 6-digit OTP for company email verification"""
    import random
    return str(random.randint(100000, 999999))

def send_company_email_otp(email, otp, company_name):
    """Send OTP to company email for verification"""
    from django.core.mail import send_mail
    from django.conf import settings
    
    subject = f"Verify your company email - {company_name}"
    message = f"""
Hello,

Your OTP for verifying company email {email} is: {otp}

This OTP is valid for 10 minutes.

If you didn't request this, please ignore this email.

Thank you,
Job Portal Team
"""
    
    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [email],
        fail_silently=False,
    )    
 
# OTP Functions
 
def generate_otp():
    """Generate a 6-digit OTP for signup"""
    return str(random.randint(100000, 999999))
 
def generate_4digit_otp():
    """Generate a 4-digit OTP for login"""
    return str(random.randint(1000, 9999))
 
def send_email_otp(email, otp, purpose="signup"):
    """Send OTP email based on purpose"""
   
    if purpose == "signup" or purpose == "email_verification":
        subject = "Email Verification OTP"
        expiry = "10 minutes"
        digits = "6-digit"
        message = f"""
Hello,
 
Your {digits} OTP for email verification is: {otp}
 
This OTP will expire in {expiry}.
 
If you didn't request this, please ignore this email.
"""
    elif purpose == "login":
        subject = "Login OTP"
        expiry = "5 minutes"
        digits = "4-digit"
        message = f"""
Hello,
 
Your {digits} OTP for login is: {otp}
 
This OTP will expire in {expiry}.
 
If you didn't request this, please ignore this email.
"""
    elif purpose == "admin_2fa":
        subject = "Admin 2FA OTP"
        expiry = "5 minutes"
        digits = "6-digit"
        message = f"""
Hello,
 
Your {digits} OTP for admin two-factor authentication is: {otp}
 
This OTP will expire in {expiry}.
 
If you didn't request this, please secure your account immediately.
"""
    else:
        subject = "OTP Verification"
        expiry = "10 minutes"
        message = f"""
Hello,
 
Your OTP is: {otp}
 
This OTP will expire in {expiry}.
"""
 
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
    )

# Billing
# jobapp/utils.py
import uuid
import os
from decimal import Decimal
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.pagesizes import letter

def generate_invoice_number():
    """Generate a unique invoice number"""
    return f"INV-{uuid.uuid4().hex[:6].upper()}"

def calculate_gst(amount):
    """Calculate 18% GST on amount"""
    # Convert to Decimal if needed
    if not isinstance(amount, Decimal):
        amount = Decimal(str(amount))
    
    gst_rate = Decimal('0.18')
    gst = amount * gst_rate
    total = amount + gst
    return round(gst, 2), round(total, 2)

def generate_invoice_pdf(invoice):
    """Generate PDF invoice"""
    directory = "media/invoices"
    
    # Create folder
    os.makedirs(directory, exist_ok=True)
    
    file_path = os.path.join(directory, f"{invoice.invoice_number}.pdf")
    
    doc = SimpleDocTemplate(file_path, pagesize=letter)
    
    elements = [
        Paragraph(f"Invoice: {invoice.invoice_number}", None),
        Paragraph(f"Customer: {invoice.company_name}", None),
        Paragraph(f"Total: ₹{invoice.total}", None),
    ]
    
    doc.build(elements)
    return file_path


import hashlib
import math
from collections import Counter
from dataclasses import dataclass
from typing import Optional
 
import PyPDF2
import docx
import requests
 
from .models import ApplicationFlag, JobApplication, CompanyVerification
 
 
# =========================================================
# CONSTANTS
# =========================================================
 
GENERIC_PHRASES = {
    "i am a passionate": 4,
    "results-driven professional": 4,
    "dynamic and motivated": 4,
    "proven track record": 3,
    "seeking a challenging position": 3,
    "excellent communication skills": 3,
    "highly motivated": 3,
    "i am responsible for": 3,
    "responsible for": 2,
    "team player": 2,
    "detail-oriented": 2,
    "fast learner": 2,
}
 
METHODS = {
    "IP_SHARED": "Multiple accounts using same IP address",
    "RESUME_PATTERN": "Pattern detection in resume content",
    "RESUME_SHORT": "Insufficient resume content detected",
    "RESUME_DUPLICATE": "Same resume used across multiple accounts",
    "DUPLICATE_APPLY": "Multiple applications submitted for same job",
}
 
SHARED_IP_THRESHOLD = 3
MIN_RESUME_CHARS = 200
MIN_COVER_CHARS = 50
IP_API_TIMEOUT = 3
 
 
# =========================================================
# DATA CLASS (NOW WITH RISK)
# =========================================================
 
@dataclass
class FraudSignal:
    flag_reason: str
    detected_method: str
    score: int
    risk_level: str  
 
 
# =========================================================
# FILE UTILITIES
# =========================================================
 
def extract_resume_text(file):
    if not file:
        return ""
 
    text = ""
    name = getattr(file, "name", "").lower()
 
    try:
        file.seek(0)
 
        if name.endswith(".pdf"):
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                text += page.extract_text() or ""
 
        elif name.endswith(".docx"):
            doc = docx.Document(file)
            text = " ".join(p.text for p in doc.paragraphs)
 
    except Exception:
        return ""
 
    return text.lower()
 
 
def compute_resume_hash(file):
    if not file:
        return None
 
    try:
        file.seek(0)
        hash_val = hashlib.sha256(file.read()).hexdigest()
        file.seek(0)
        return hash_val
    except:
        return None
 
 
# =========================================================
# TEXT ANALYSIS
# =========================================================
 
def text_score(text):
    words = text.split()
    if not words:
        return 0
 
    freq = Counter(words)
    total = len(words)
 
    entropy = -sum((c / total) * math.log2(c / total) for c in freq.values())
    diversity = len(set(words)) / total
 
    phrase_score = sum(text.count(p) * w for p, w in GENERIC_PHRASES.items())
 
    score = 0
 
    if entropy < 3.5:
        score += 20
 
    if diversity < 0.35:
        score += 20
 
    if phrase_score > 10:
        score += 20
 
    return score
 
 
# =========================================================
# IP LOCATION
# =========================================================
 
def get_ip_country(ip):
    if not ip:
        return None
 
    try:
        res = requests.get(f"http://ip-api.com/json/{ip}", timeout=IP_API_TIMEOUT)
        return res.json().get("country")
    except:
        return None
 
 
# =========================================================
# ANALYZERS
# =========================================================
 
def analyze_ip(instance, ip):
    signals = []
 
    if not ip:
        return signals
 
    shared_count = JobApplication.objects.filter(
        ip_address=ip
    ).exclude(user=instance.user).values("user").distinct().count()
 
    if shared_count >= SHARED_IP_THRESHOLD:
        signals.append(FraudSignal(
            "IP_CONFLICT",
            METHODS["IP_SHARED"],
            40,
            "CRITICAL"
        ))
 
    return signals
 
 
def analyze_duplicate_application(instance):
    signals = []
 
    if JobApplication.objects.filter(
        user=instance.user,
        job=instance.job
    ).exclude(id=instance.id).exists():
 
        signals.append(FraudSignal(
            "FRAUDULENT_CREDS",
            METHODS["DUPLICATE_APPLY"],
            50,
            "HIGH"
        ))
 
    return signals
 
 
def analyze_resume(instance):
    signals = []
    resume_file = instance.resume_version
 
    resume_hash = compute_resume_hash(resume_file)
 
    # SAVE HASH
    if resume_hash:
        instance.resume_hash = resume_hash
        instance.save(update_fields=["resume_hash"])
 
    # 🔴 CROSS USER ONLY
    if resume_hash and JobApplication.objects.filter(
        resume_hash=resume_hash
    ).exclude(user=instance.user).exists():
 
        signals.append(FraudSignal(
            "RESUME_BOT",
            METHODS["RESUME_DUPLICATE"],
            60,
            "HIGH"
        ))
 
    text = extract_resume_text(resume_file)
 
    if not text:
        signals.append(FraudSignal(
            "RESUME_BOT",
            "Unreadable resume",
            30,
            "HIGH"
        ))
        return signals
 
    if len(text) < MIN_RESUME_CHARS:
        signals.append(FraudSignal(
            "RESUME_BOT",
            METHODS["RESUME_SHORT"],
            25,
            "MODERATE"
        ))
        return signals
 
    if text_score(text) >= 20:
        signals.append(FraudSignal(
            "RESUME_BOT",
            METHODS["RESUME_PATTERN"],
            20,
            "MODERATE"
        ))
 
    return signals
 
 
def analyze_cover_letter(instance):
    signals = []
    cover = (instance.cover_letter or "").lower()
 
    if not cover:
        return signals
 
    if len(cover) < MIN_COVER_CHARS:
        signals.append(FraudSignal(
            "RESUME_BOT",
            "Insufficient cover letter",
            15,
            "LOW"
        ))
 
    elif JobApplication.objects.filter(
        cover_letter=instance.cover_letter
    ).exclude(id=instance.id).exists():
 
        signals.append(FraudSignal(
            "RESUME_BOT",
            "Duplicate cover letter",
            40,
            "HIGH"
        ))
 
    return signals
 
 
def analyze_company(instance):
    signals = []
 
    try:
        employer = instance.job.employer
 
        if not CompanyVerification.objects.filter(
            employer=employer,
            status="Verified"
        ).exists():
 
            signals.append(FraudSignal(
                "FRAUDULENT_CREDS",
                "Company not verified",
                30,
                "HIGH"
            ))
    except:
        pass
 
    return signals
 
 
# =========================================================
# MAIN FUNCTION
# =========================================================
 
def run_application_flag_checks(instance, request):
 
    ip = request.META.get("REMOTE_ADDR")
 
    instance.ip_address = ip
    instance.save(update_fields=["ip_address"])
 
    signals = []
 
    signals += analyze_ip(instance, ip)
    signals += analyze_duplicate_application(instance)
    signals += analyze_resume(instance)
    signals += analyze_cover_letter(instance)
    signals += analyze_company(instance)
 
    # REMOVE DUPLICATES
    seen = set()
    unique_signals = []
 
    for s in signals:
        key = (s.flag_reason, s.detected_method)
        if key not in seen:
            seen.add(key)
            unique_signals.append(s)
 
    # SAVE FLAGS (PER-SIGNAL RISK)
    for s in unique_signals:
        ApplicationFlag.objects.get_or_create(
            application=instance,
            flag_reason=s.flag_reason,
            detected_method=s.detected_method,
            defaults={"risk_level": s.risk_level}
        )
 
 
# for admin escalation job priority
 
import re
 
 
HIGH_PRIORITY_KEYWORDS = [
 
    # Fraud / Scam
    'fake',
    'fraud',
    'scam',
    'illegal',
    'cheat',
    'cheating',
    'money scam',
    'financial fraud',
 
    # Abuse / Harassment
    'abuse',
    'harassment',
    'harass',
    'bully',
    'bullying',
 
    # Threat / Violence
    'threat',
    'threatening',
    'violence',
    'violent',
    'attack',
 
    # Criminal
    'criminal',
    'crime',
    'blackmail',
    'extortion',
 
    # Exploitation
    'exploit',
    'exploiting',
    'forced work',
    'unsafe',
 
    # Deceptive
    'deceptive',
    'deception',
    'mislead',
    'misleading salary',
    'fake company',
]
 
 
MEDIUM_PRIORITY_KEYWORDS = [
 
    # Spam
    'spam',
    'spamming',
    'spammer',
 
    # Wrong / Duplicate
    'duplicate',
    'repeated',
    'irrelevant',
    'wrong',
    'incorrect',
    'false information',
 
    # Quality Issues
    'missing details',
    'unclear',
    'confusing',
    'bad experience',
 
    # Content
    'outdated',
    'expired',
    'inactive',
]
 
 
LOW_PRIORITY_KEYWORDS = [
 
    # General Complaints
    'salary not mentioned',
    'location issue',
    'timing issue',
    'minor issue',
    'not interested',
 
    # UI/UX
    'slow',
    'loading',
    'layout',
    'design',
]
 
 
def normalize_text(text):
 
    """
    Normalize text for matching.
    """
 
    if not text:
        return ""
 
    text = text.lower()
 
    text = re.sub(
        r'[^a-z0-9\s]',
        ' ',
        text
    )
 
    text = re.sub(
        r'\s+',
        ' ',
        text
    ).strip()
 
    return text
 
 
def contains_keyword(text, keywords):
 
    """
    Check keyword existence.
    """
 
    for keyword in keywords:
 
        if keyword in text:
            return True
 
    return False
 
 
def get_priority_from_reason(reason):
 
    """
    Determine complaint priority.
 
    Returns:
        High
        Medium
        Low
    """
 
    normalized_reason = normalize_text(
        reason
    )
 
    if not normalized_reason:
        return "Low"
 
    # High Priority
    if contains_keyword(
        normalized_reason,
        HIGH_PRIORITY_KEYWORDS
    ):
        return "High"
 
    # Medium Priority
    if contains_keyword(
        normalized_reason,
        MEDIUM_PRIORITY_KEYWORDS
    ):
        return "Medium"
 
    # Low Priority
    if contains_keyword(
        normalized_reason,
        LOW_PRIORITY_KEYWORDS
    ):
        return "Low"
 
    # Default fallback
    return "Low"