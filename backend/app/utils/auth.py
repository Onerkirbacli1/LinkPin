import os
import jwt
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24


def hash_password(password: str) -> str:
    """
    Şifreyi hashler ve hashlenmiş string'i döndürür.
    
    Args:
        password: Hashlenecek düz metin şifre
        
    Returns:
        Hashlenmiş şifre string'i
    """
    return generate_password_hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """
    Kullanıcının girdiği şifre ile veritabanındaki hash'i karşılaştırır.
    
    Args:
        password: Kullanıcının girdiği düz metin şifre
        password_hash: Veritabanından gelen hashlenmiş şifre
        
    Returns:
        Şifreler eşleşirse True, aksi halde False
    """
    return check_password_hash(password_hash, password)


def generate_token(username: str, user_id: int) -> str:
    """
    JWT token oluşturur.
    
    Args:
        username: Kullanıcı adı
        user_id: Kullanıcı ID'si
        
    Returns:
        JWT token string'i
    """
    payload = {
        "username": username,
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def verify_token(token: str) -> dict:
    """
    JWT token'ı doğrular ve payload'ı döndürür.
    
    Args:
        token: Doğrulanacak JWT token
        
    Returns:
        Token payload dictionary
        
    Raises:
        jwt.ExpiredSignatureError: Token süresi dolmuşsa
        jwt.InvalidTokenError: Token geçersizse
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token süresi dolmuş")
    except jwt.InvalidTokenError:
        raise ValueError("Geçersiz token")

