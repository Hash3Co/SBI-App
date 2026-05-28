import re
import hashlib
import hmac
from django.conf import settings
from django.core.cache import cache

# SQL Injection patterns
SQL_PATTERNS = [
    r"(\bSELECT\b.*\bFROM\b)",
    r"(\bINSERT\b.*\bINTO\b)",
    r"(\bUPDATE\b.*\bSET\b)",
    r"(\bDELETE\b.*\bFROM\b)",
    r"(\bDROP\b.*\bTABLE\b)",
    r"(\bUNION\b.*\bSELECT\b)",
    r"(\bALTER\b.*\bTABLE\b)",
    r"(\bCREATE\b.*\bTABLE\b)",
    r"(--)",
    r"(;)",
    r"('.*OR.*'.*=')",
    r"('.*AND.*'.*=')",
    r"(\bEXEC\b.*\bXP_\b)",
]

# XSS Patterns
XSS_PATTERNS = [
    r"<script[^>]*>.*</script>",
    r"javascript:",
    r"onerror\s*=",
    r"onload\s*=",
    r"onclick\s*=",
    r"<iframe[^>]*>",
    r"<embed[^>]*>",
    r"<object[^>]*>",
    r"<img[^>]*onerror",
    r"eval\(",
    r"document\.cookie",
    r"localStorage\.",
    r"sessionStorage\.",
]


def sanitize_input(input_string):
    """Remove dangerous characters from input"""
    if not input_string:
        return ""
    
    # Remove HTML tags
    input_string = re.sub(r'<[^>]*>', '', input_string)
    
    # Remove dangerous characters
    dangerous_chars = ['<', '>', '&', '"', "'", '/', '`', '$', '\\', ';', '--']
    for char in dangerous_chars:
        input_string = input_string.replace(char, '')
    
    # HTML encode remaining special characters
    html_escape_table = {
        "&": "&amp;",
        '"': "&quot;",
        "'": "&#x27;",
    }
    
    for char, escaped in html_escape_table.items():
        input_string = input_string.replace(char, escaped)
    
    return input_string.strip()


def validate_email(email):
    """Strict email validation matching frontend"""
    if not email:
        return False
    
    email_lower = email.lower().strip()
    
    # Check length
    if len(email_lower) > 255:
        return False
    
    # Regex pattern matching frontend validation
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    if not re.match(pattern, email_lower):
        return False
    
    # Additional checks
    if '..' in email_lower or '@.' in email_lower or email_lower.startswith('.') or email_lower.endswith('.'):
        return False
    
    # Check for SQL injection in email
    if detect_sql_injection(email_lower):
        return False
    
    return True


def validate_password_strength(password):
    """Password strength validation matching frontend"""
    if not password:
        return False, "Password required"
    
    if len(password) < 8:
        return False, "Minimum 8 characters"
    
    if not re.search(r'[A-Z]', password):
        return False, "Need 1 uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return False, "Need 1 lowercase letter"
    
    if not re.search(r'[0-9]', password):
        return False, "Need 1 number"
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Need 1 special character"
    
    if len(password) > 128:
        return False, "Too long"
    
    return True, "OK"


def detect_sql_injection(input_string):
    """Detect SQL injection attempts"""
    if not input_string:
        return False
    
    for pattern in SQL_PATTERNS:
        if re.search(pattern, input_string, re.IGNORECASE):
            return True
    return False


def detect_xss(input_string):
    """Detect XSS attempts"""
    if not input_string:
        return False
    
    for pattern in XSS_PATTERNS:
        if re.search(pattern, input_string, re.IGNORECASE):
            return True
    return False


def validate_phone_number(phone):
    """Validate Lesotho and South Africa phone numbers"""
    if not phone:
        return False
    
    phone = sanitize_input(phone)
    phone = re.sub(r'\s+', '', phone)
    
    # Lesotho: +266 or 0 followed by 8 digits
    lesotho_pattern = r'^(\+266|0)[0-9]{8}$'
    
    # South Africa: +27 or 0 followed by 9 digits
    sa_pattern = r'^(\+27|0)[0-9]{9}$'
    
    return bool(re.match(lesotho_pattern, phone)) or bool(re.match(sa_pattern, phone))


def validate_amount(amount):
    """Validate monetary amount"""
    try:
        amount = float(amount)
        if amount <= 0:
            return False
        if amount > 1000000000:  # Max 1 billion
            return False
        if amount != round(amount, 2):  # Max 2 decimal places
            return False
        return True
    except (ValueError, TypeError):
        return False


def generate_csrf_token():
    """Generate CSRF token matching frontend"""
    import secrets
    return secrets.token_hex(32)


def verify_csrf_token(token, session_id):
    """Verify CSRF token"""
    stored_token = cache.get(f"csrf_{session_id}")
    if not stored_token:
        return False
    return hmac.compare_digest(stored_token, token)


def hash_device_fingerprint(fingerprint):
    """Hash device fingerprint for storage"""
    return hashlib.sha256(
        f"{fingerprint}{settings.SECRET_KEY}".encode()
    ).hexdigest()


def validate_device_fingerprint(stored, provided):
    """Validate device fingerprint"""
    if not stored or not provided:
        return False
    return hmac.compare_digest(stored, provided)


def sanitize_request_data(data):
    """Sanitize entire request data recursively"""
    if isinstance(data, dict):
        return {k: sanitize_request_data(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_request_data(item) for item in data]
    elif isinstance(data, str):
        # Check for injection attacks
        if detect_sql_injection(data) or detect_xss(data):
            raise ValueError("Invalid characters detected in input")
        return sanitize_input(data)
    return data