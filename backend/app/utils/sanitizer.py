"""
Input sanitization utilities for XSS protection
"""
from markupsafe import escape
from typing import Any


def sanitize_string(value: Any) -> str:
    """
    String değerini HTML escape eder (XSS koruması).
    
    Args:
        value: Sanitize edilecek değer
        
    Returns:
        HTML escape edilmiş string
    """
    if value is None:
        return ""
    
    if not isinstance(value, str):
        value = str(value)
    
    return escape(value).strip()


def sanitize_input(data: dict) -> dict:
    """
    Dictionary içindeki tüm string değerleri sanitize eder.
    
    Args:
        data: Sanitize edilecek dictionary
        
    Returns:
        Sanitize edilmiş dictionary
    """
    if not isinstance(data, dict):
        return data
    
    sanitized = {}
    for key, value in data.items():
        if isinstance(value, str):
            sanitized[key] = sanitize_string(value)
        elif isinstance(value, dict):
            sanitized[key] = sanitize_input(value)
        elif isinstance(value, list):
            sanitized[key] = [sanitize_input(item) if isinstance(item, dict) else sanitize_string(item) if isinstance(item, str) else item for item in value]
        else:
            sanitized[key] = value
    
    return sanitized

