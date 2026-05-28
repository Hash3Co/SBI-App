#!/usr/bin/env python
"""Run this script to verify all security measures are in place"""

import sys
import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sbi_backend.settings')
django.setup()

from django.conf import settings
from django.urls import get_resolver
from sbi_backend.middleware.security_middleware import SecurityHeadersMiddleware
from sbi_backend.utils.security import sanitize_input, validate_email, validate_password_strength, detect_sql_injection, detect_xss

def verify_security():
    print("🔒 SBI Backend Security Verification\n")
    
    checks = []
    
    # 1. Check security middleware
    required_middleware = [
        'SecurityHeadersMiddleware',
        'RateLimitMiddleware',
        'ShardMiddleware'
    ]
    
    for middleware in required_middleware:
        found = any(middleware in m for m in settings.MIDDLEWARE)
        checks.append((
            f"Middleware: {middleware}",
            found,
            "✅ Installed" if found else "❌ Missing"
        ))
    
    # 2. Check security headers
    security_headers = [
        'SECURE_BROWSER_XSS_FILTER',
        'SECURE_CONTENT_TYPE_NOSNIFF',
        'SECURE_HSTS_SECONDS',
        'SECURE_SSL_REDIRECT',
        'SESSION_COOKIE_SECURE',
        'CSRF_COOKIE_SECURE'
    ]
    
    for header in security_headers:
        enabled = getattr(settings, header, False)
        checks.append((
            f"Security Header: {header}",
            enabled,
            "✅ Enabled" if enabled else "⚠️ Disabled (OK for dev)"
        ))
    
    # 3. Check JWT settings
    jwt_settings = [
        'ACCESS_TOKEN_LIFETIME',
        'REFRESH_TOKEN_LIFETIME',
        'ROTATE_REFRESH_TOKENS',
        'BLACKLIST_AFTER_ROTATION'
    ]
    
    for setting in jwt_settings:
        value = settings.SIMPLE_JWT.get(setting, None)
        checks.append((
            f"JWT Setting: {setting}",
            value is not None,
            f"✅ {value}" if value else "❌ Missing"
        ))
    
    # 4. Test security utilities
    test_inputs = [
        ("<script>alert('xss')</script>", detect_xss, True),
        ("SELECT * FROM users", detect_sql_injection, True),
        ("test@example.com", validate_email, True),
        ("weak", validate_password_strength, False),
    ]
    
    for input_val, func, should_pass in test_inputs:
        if should_pass:
            result = func(input_val)
            checks.append((
                f"Security Util: {func.__name__}('{input_val[:20]}...')",
                result,
                "✅ Pass" if result else "❌ Fail"
            ))
        else:
            result, msg = func(input_val)
            checks.append((
                f"Security Util: {func.__name__}('{input_val}')",
                not result,
                f"✅ Blocked: {msg}" if not result else "❌ Should have blocked"
            ))
    
    # 5. Check rate limiting
    checks.append((
        "Rate Limiting",
        'REST_FRAMEWORK' in settings and 'DEFAULT_THROTTLE_RATES' in settings.REST_FRAMEWORK,
        "✅ Configured" if 'DEFAULT_THROTTLE_RATES' in settings.REST_FRAMEWORK else "❌ Missing"
    ))
    
    # 6. Check CORS
    checks.append((
        "CORS Configuration",
        len(settings.CORS_ALLOWED_ORIGINS) > 0,
        f"✅ {len(settings.CORS_ALLOWED_ORIGINS)} origins allowed"
    ))
    
    # Print results
    print("=" * 60)
    for name, passed, message in checks:
        status = "✅" if passed else "❌"
        print(f"{status} {name}: {message}")
    print("=" * 60)
    
    # Summary
    passed = sum(1 for _, p, _ in checks if p)
    total = len(checks)
    print(f"\n📊 Summary: {passed}/{total} security checks passed")
    
    if passed == total:
        print("🎉 All security measures are properly configured!")
    else:
        print("⚠️ Some security measures need attention")
    
    return passed == total

if __name__ == "__main__":
    sys.exit(0 if verify_security() else 1)