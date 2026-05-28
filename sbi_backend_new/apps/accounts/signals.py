from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import User

@receiver(post_save, sender=User)
def send_welcome_email(sender, instance, created, **kwargs):
    """Send welcome email when new user registers"""
    if created:
        subject = 'Welcome to SBI App!'
        full_name = instance.get_full_name() or instance.email
        message = f"""
        Hi {full_name},
        
        Welcome to SBI App - Connecting SMEs with Investors!
        
        Your account has been successfully created.
        Please verify your email to get started.
        
        Best regards,
        SBI App Team
        """
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [instance.email], fail_silently=True)