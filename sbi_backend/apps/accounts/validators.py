# apps/accounts/validators.py
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _
import re

class SpecialCharacterValidator:
    """Validate that the password contains at least one special character."""
    
    def validate(self, password, user=None):
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            raise ValidationError(
                _("Password must contain at least one special character: !@#$%^&*(),.?\":{}|<>"),
                code='password_no_special',
            )
    
    def get_help_text(self):
        return _("Your password must contain at least one special character: !@#$%^&*(),.?\":{}|<>")

class NoSequentialValidator:
    """Validate that the password doesn't contain sequential characters."""
    
    SEQUENCES = [
        '123', '234', '345', '456', '567', '678', '789', '890',
        'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij',
        'qwerty', 'asdfgh', 'zxcvbn',
    ]
    
    def validate(self, password, user=None):
        password_lower = password.lower()
        for seq in self.SEQUENCES:
            if seq in password_lower:
                raise ValidationError(
                    _("Password contains sequential characters: %(sequence)s") % {'sequence': seq},
                    code='password_sequential',
                )
    
    def get_help_text(self):
        return _("Your password must not contain sequential characters like '1234' or 'abcd'")

class NoRepeatingValidator:
    """Validate that the password doesn't contain repeating characters."""
    
    def validate(self, password, user=None):
        if re.search(r'(.)\1{2,}', password):
            raise ValidationError(
                _("Password contains repeating characters (e.g., 'aaa')"),
                code='password_repeating',
            )
    
    def get_help_text(self):
        return _("Your password must not contain repeating characters like 'aaa'")

class NoPersonalInfoValidator:
    """Validate that the password doesn't contain personal information."""
    
    def validate(self, password, user=None):
        if user:
            # Check email parts
            email_parts = user.email.split('@')[0].split('.')
            for part in email_parts:
                if part.lower() in password.lower():
                    raise ValidationError(
                        _("Password contains part of your email address"),
                        code='password_personal',
                    )
            
            # Check name parts
            if user.full_name:
                name_parts = user.full_name.split()
                for part in name_parts:
                    if len(part) > 2 and part.lower() in password.lower():
                        raise ValidationError(
                            _("Password contains part of your name"),
                            code='password_personal',
                        )
    
    def get_help_text(self):
        return _("Your password must not contain personal information like your name or email")