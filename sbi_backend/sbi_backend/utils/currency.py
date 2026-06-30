"""Currency handling for Lesotho Loti (LSL) and South African Rand (ZAR)"""
# Note: LSL and ZAR are 1:1 pegged, so no conversion needed

def format_currency(amount, currency='LSL'):
    """Format amount with proper currency symbol"""
    if currency == 'LSL':
        return f"M {amount:,.2f}"
    else:
        return f"R {amount:,.2f}"

def parse_currency(amount_str):
    """Parse currency string to number"""
    # Remove currency symbols and commas
    cleaned = amount_str.replace('M', '').replace('R', '').replace(',', '').strip()
    return float(cleaned)

def get_currency_symbol(country):
    """Get currency symbol based on country"""
    if country == 'Lesotho':
        return 'M'  # Maloti
    else:
        return 'R'  # Rand

def get_currency_code(country):
    """Get currency code based on country"""
    if country == 'Lesotho':
        return 'LSL'
    else:
        return 'ZAR'