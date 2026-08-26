# apps/accounts/models.py
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.core.validators import MinLengthValidator, RegexValidator
from django.contrib.postgres.fields import JSONField
import uuid
import bcrypt
import hashlib
import hmac
from cryptography.fernet import Fernet
from django.conf import settings

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        
        # Log user creation
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"User created: {email}")
        
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_verified', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20, blank=True)
    
    ROLE_CHOICES = (
        ('sme', 'SME'),
        ('investor', 'Investor'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='sme')
    
    # Security fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    
    # Security tokens
    verification_token = models.CharField(max_length=255, blank=True, null=True)
    reset_token = models.CharField(max_length=255, blank=True, null=True)
    email_verification_sent_at = models.DateTimeField(null=True, blank=True)
    reset_token_sent_at = models.DateTimeField(null=True, blank=True)
    
    # Session management
    last_login = models.DateTimeField(null=True, blank=True)
    last_ip = models.GenericIPAddressField(null=True, blank=True)
    last_user_agent = models.TextField(blank=True)
    session_key = models.CharField(max_length=255, blank=True, null=True)
    
    # Account lockout
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    
    # Audit fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']
    
    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
            models.Index(fields=['is_active']),
            models.Index(fields=['is_verified']),
        ]
    
    def __str__(self):
        return self.email
    
    @property
    def is_sme(self):
        return self.role == 'sme'
    
    @property
    def is_investor(self):
        return self.role == 'investor'
    
    def set_password(self, raw_password):
        """Override to use bcrypt for stronger hashing"""
        salt = bcrypt.gensalt(rounds=12)
        self.password = bcrypt.hashpw(raw_password.encode('utf-8'), salt).decode('utf-8')
    
    def check_password(self, raw_password):
        """Override to use bcrypt verification"""
        return bcrypt.checkpw(raw_password.encode('utf-8'), self.password.encode('utf-8'))
    
    def generate_verification_token(self):
        """Generate secure verification token"""
        import secrets
        token = secrets.token_urlsafe(32)
        self.verification_token = token
        self.email_verification_sent_at = timezone.now()
        self.save()
        return token
    
    def generate_reset_token(self):
        """Generate secure password reset token"""
        import secrets
        token = secrets.token_urlsafe(32)
        self.reset_token = token
        self.reset_token_sent_at = timezone.now()
        self.save()
        return token
    
    def is_token_valid(self, token, token_type='verification'):
        """Validate token with expiration"""
        if token_type == 'verification':
            stored_token = self.verification_token
            sent_at = self.email_verification_sent_at
        else:
            stored_token = self.reset_token
            sent_at = self.reset_token_sent_at
        
        if not stored_token or stored_token != token:
            return False
        
        # Token expires after 24 hours
        if sent_at and (timezone.now() - sent_at).total_seconds() > 86400:
            return False
        
        return True
    
    def lock_account(self, duration_minutes=30):
        """Lock account for specified duration"""
        self.locked_until = timezone.now() + timezone.timedelta(minutes=duration_minutes)
        self.save()
    
    def is_locked(self):
        """Check if account is locked"""
        if self.locked_until and self.locked_until > timezone.now():
            return True
        return False

class UserActivity(models.Model):
    ACTION_CHOICES = (
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('register', 'Register'),
        ('update_profile', 'Update Profile'),
        ('change_password', 'Change Password'),
        ('enroll_course', 'Enroll Course'),
        ('complete_chapter', 'Complete Chapter'),
        ('connect_investor', 'Connect Investor'),
        ('connect_sme', 'Connect SME'),
        ('create_course', 'Create Course'),
        ('purchase_resource', 'Purchase Resource'),
        ('subscribe', 'Subscribe'),
        ('failed_login', 'Failed Login'),
        ('account_locked', 'Account Locked'),
        ('account_unlocked', 'Account Unlocked'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_activities')
    action = models.CharField(max_length=50, choices=ACTION_CHOICES, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    details = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'user_activities'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'action']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.action} - {self.created_at}"