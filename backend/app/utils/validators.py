import re
from urllib.parse import urlparse
from typing import Tuple


def is_valid_url(url: str) -> Tuple[bool, str]:
    """
    URL formatını kontrol eder.
    
    Args:
        url: Kontrol edilecek URL string'i
        
    Returns:
        (is_valid, error_message) tuple'ı
        is_valid: True ise URL geçerli, False ise geçersiz
        error_message: Hata mesajı (geçerli ise boş string)
    """
    if not url or not isinstance(url, str):
        return False, "URL boş olamaz."
    
    url = url.strip()
    
    if not url:
        return False, "URL boş olamaz."
    
    if len(url) > 2048:
        return False, "URL çok uzun. Maksimum 2048 karakter olabilir."
    
    if not url.startswith(('http://', 'https://')):
        return False, "URL http:// veya https:// ile başlamalıdır."
    
    try:
        parsed = urlparse(url)
        
        if not parsed.netloc:
            return False, "Geçersiz URL formatı. Domain adı bulunamadı."
        
        if len(parsed.netloc) > 253:
            return False, "Domain adı çok uzun."
        
        domain_pattern = re.compile(
            r'^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$'
        )
        
        netloc_clean = parsed.netloc.split(':')[0]
        
        if not domain_pattern.match(netloc_clean):
            return False, "Geçersiz domain formatı."
        
        return True, ""
    
    except Exception as e:
        return False, f"URL parse hatası: {str(e)}"


def normalize_url(url: str) -> str:
    """
    URL'yi normalize eder (başında http:// yoksa ekler).
    
    Args:
        url: Normalize edilecek URL
        
    Returns:
        Normalize edilmiş URL
    """
    if not url:
        return url
    
    url = url.strip()
    
    if url and not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    return url


def validate_password(password: str) -> Tuple[bool, str]:
    """
    Şifre güçlülüğünü kontrol eder.
    
    Args:
        password: Kontrol edilecek şifre
        
    Returns:
        (is_valid, error_message) tuple'ı
    """
    if not password:
        return False, "Şifre boş olamaz."
    
    if len(password) < 8:
        return False, "Şifre en az 8 karakter olmalıdır."
    
    if len(password) > 128:
        return False, "Şifre en fazla 128 karakter olabilir."
    
    # En az bir büyük harf
    if not re.search(r'[A-Z]', password):
        return False, "Şifre en az bir büyük harf içermelidir."
    
    # En az bir küçük harf
    if not re.search(r'[a-z]', password):
        return False, "Şifre en az bir küçük harf içermelidir."
    
    # En az bir rakam
    if not re.search(r'\d', password):
        return False, "Şifre en az bir rakam içermelidir."
    
    # En az bir özel karakter
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Şifre en az bir özel karakter içermelidir (!@#$%^&*(),.?\":{}|<>)."
    
    return True, ""


def validate_email(email: str) -> Tuple[bool, str]:
    """
    E-posta formatını kontrol eder.
    
    Args:
        email: Kontrol edilecek e-posta
        
    Returns:
        (is_valid, error_message) tuple'ı
    """
    if not email:
        return False, "E-posta boş olamaz."
    
    email = email.strip().lower()
    
    if len(email) > 254:
        return False, "E-posta çok uzun."
    
    # Basit e-posta regex
    email_pattern = re.compile(
        r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    )
    
    if not email_pattern.match(email):
        return False, "Geçersiz e-posta formatı."
    
    return True, ""
