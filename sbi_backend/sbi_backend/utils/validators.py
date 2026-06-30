import re
from django.core.exceptions import ValidationError
from datetime import datetime

def validate_lesotho_phone(phone):
    """Validate Lesotho phone number (+266 or 0 followed by 8 digits)"""
    pattern = r'^(\+266|0)[0-9]{8}$'
    return bool(re.match(pattern, phone))

def validate_sa_phone(phone):
    """Validate South Africa phone number (+27 or 0 followed by 9 digits)"""
    pattern = r'^(\+27|0)[0-9]{9}$'
    return bool(re.match(pattern, phone))

def validate_phone_number(phone, country='Lesotho'):
    """Validate phone number based on country"""
    if country == 'Lesotho':
        return validate_lesotho_phone(phone)
    else:
        return validate_sa_phone(phone)

def validate_lesotho_id(id_number):
    """Validate Lesotho ID format (C or R followed by 8 digits)"""
    pattern = r'^[CR][0-9]{8}$'
    return bool(re.match(pattern, id_number.upper()))

def validate_sa_id(id_number):
    """Validate South African ID (13 digits)"""
    if not re.match(r'^[0-9]{13}$', id_number):
        return False
    
    # SA ID validation algorithm
    total = 0
    for i, digit in enumerate(id_number):
        digit = int(digit)
        if i % 2 == 1:  # Even position
            double = digit * 2
            total += sum(int(d) for d in str(double))
        else:
            total += digit
    
    return total % 10 == 0
def validate_amount(amount):
    """
    Validate monetary amount
    """
    if amount is None:
        raise ValidationError("Amount is required")

    if amount <= 0:
        raise ValidationError("Amount must be greater than 0")

    return amount


def validate_year(year):
    """
    Validate year
    """
    current_year = datetime.now().year

    if year < 1900 or year > current_year + 10:
        raise ValidationError("Invalid year")

    return year

def validate_tax_number(tax_number, country='Lesotho'):
    """Validate tax number based on country"""
    if country == 'Lesotho':
        return bool(re.match(r'^[0-9]{9}$', tax_number))
    else:
        return bool(re.match(r'^[0-9]{10}$', tax_number))