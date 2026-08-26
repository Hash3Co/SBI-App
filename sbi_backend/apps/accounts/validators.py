# apps/accounts/validators.py
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _
import re


class PasswordLengthValidator:
    """Validate password length"""
    def validate(self, password, user=None):
        if len(password) < 7:
            raise ValidationError(
                _("Password must be at least 7 characters long."),
                code='password_too_short',
            )
    
    def get_help_text(self):
        return _("Your password must be at least 7 characters long.")