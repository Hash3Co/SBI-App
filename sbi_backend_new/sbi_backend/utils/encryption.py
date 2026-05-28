import hashlib
import hmac
from django.conf import settings

def hash_device_fingerprint(fingerprint):
    """Hash device fingerprint for storage"""
    return hashlib.sha256(
        f"{fingerprint}{settings.SECRET_KEY}".encode()
    ).hexdigest()


def verify_webhook_signature(payload, signature, secret):
    """Verify Stripe webhook signature"""
    try:
        expected = hmac.new(
            secret.encode(),
            msg=payload,
            digestmod=hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(expected, signature)
    except Exception:
        return False