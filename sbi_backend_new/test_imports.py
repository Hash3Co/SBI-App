#!/usr/bin/env python
"""Test all imports to identify issues before runserver"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sbi_backend.settings')

# Test Django setup
try:
    django.setup()
    print("✓ Django setup successful")
except Exception as e:
    print(f"✗ Django setup failed: {e}")
    sys.exit(1)

# Test models imports
try:
    from apps.accounts.models import User, UserSession, LoginAttempt
    print("✓ Accounts models imported successfully")
except Exception as e:
    print(f"✗ Accounts models import failed: {e}")
    
try:
    from apps.sme.models import SMEProfile
    print("✓ SME models imported successfully")
except Exception as e:
    print(f"✗ SME models import failed: {e}")

try:
    from apps.investor.models import InvestorProfile, Investment
    print("✓ Investor models imported successfully")
except Exception as e:
    print(f"✗ Investor models import failed: {e}")

try:
    from apps.matching.models import Match
    print("✓ Matching models imported successfully")
except Exception as e:
    print(f"✗ Matching models import failed: {e}")

try:
    from apps.training.models import Course, Enrollment, ChapterProgress
    print("✓ Training models imported successfully")
except Exception as e:
    print(f"✗ Training models import failed: {e}")

try:
    from apps.payments.models import SubscriptionPlan, Subscription, Transaction, PaymentMethod
    print("✓ Payments models imported successfully")
except Exception as e:
    print(f"✗ Payments models import failed: {e}")

try:
    from apps.marketplace.models import MarketplaceResource, TradeRequest
    print("✓ Marketplace models imported successfully")
except Exception as e:
    print(f"✗ Marketplace models import failed: {e}")

try:
    from apps.analytics.models import UserActivity, Report
    print("✓ Analytics models imported successfully")
except Exception as e:
    print(f"✗ Analytics models import failed: {e}")

# Test URLs
try:
    from sbi_backend import urls
    print("✓ URLs configured successfully")
except Exception as e:
    print(f"✗ URLs configuration failed: {e}")

# Test Django check
try:
    from django.core.management import call_command
    from io import StringIO
    output = StringIO()
    call_command('check', stdout=output, stderr=output)
    print("✓ Django check passed")
    if output.getvalue():
        print("Django warnings/info:")
        print(output.getvalue())
except Exception as e:
    print(f"✗ Django check failed: {e}")

print("\n✓ All imports successful!")

