from flask import request, jsonify
from flask_limiter import Limiter
from app.utils.status import HTTPStatus
from app.utils.db import fetch_one
from app.utils.auth import verify_password, generate_token, hash_password
from app.utils.validators import validate_password, validate_email
from app.utils.sanitizer import sanitize_string
from app.utils.logger import app_logger, security_logger


def init_auth_routes(app, limiter: Limiter):
    @app.route("/login", methods=["POST"])
    @limiter.limit("5 per minute")  # Login için rate limit
    def login():
        try:
            data = request.json or {}
            kullaniciadi = sanitize_string(data.get("username", ""))
            password = data.get("password", "")  # Şifre sanitize edilmez

            if not kullaniciadi or not password:
                security_logger.warning(f"Boş login denemesi: {request.remote_addr}")
                return jsonify({
                    "success": False,
                    "message": "Kullanıcı adı ve şifre boş olamaz."
                }), HTTPStatus.BAD_REQUEST

            kullanici_bulundu = fetch_one(
                """
                SELECT id, username, namesurname, password
                FROM users
                WHERE username = %s
                """,
                (kullaniciadi,)
            )
            
            if kullanici_bulundu and verify_password(password, kullanici_bulundu.get("password")):
                user_id = kullanici_bulundu.get("id")
                username = kullanici_bulundu.get("username")
                token = generate_token(username, user_id)
                
                app_logger.info(f"Başarılı login: {username} (IP: {request.remote_addr})")
                
                return jsonify({
                    "success": True,
                    "token": token,
                    "user": {
                        "username": username,
                        "namesurname": kullanici_bulundu.get("namesurname")
                    }
                })
            else:
                security_logger.warning(f"Başarısız login denemesi: {kullaniciadi} (IP: {request.remote_addr})")
                return jsonify({"success": False, "message": "Kullanıcı adı veya şifre yanlış."}), HTTPStatus.UNAUTHORIZED
        except Exception as e:
            app_logger.error(f"Login hatası: {str(e)}", exc_info=True)
            return jsonify({
                "success": False,
                "message": "Bir hata oluştu. Lütfen daha sonra tekrar deneyin."
            }), HTTPStatus.INTERNAL_SERVER_ERROR

    @app.route("/register", methods=["POST"])
    @limiter.limit("3 per hour")  # Register için rate limit
    def register_user():
        try:
            data = request.json or {}

            email = sanitize_string(data.get("email", "")).lower()
            first_name = sanitize_string(data.get("first_name", ""))
            last_name = sanitize_string(data.get("last_name", ""))
            password = data.get("password", "")  # Şifre sanitize edilmez

            # E-posta validasyonu
            email_valid, email_error = validate_email(email)
            if not email_valid:
                return jsonify({
                    "success": False,
                    "message": email_error
                }), HTTPStatus.BAD_REQUEST

            if not first_name or not last_name or not password:
                return jsonify({
                    "success": False,
                    "message": "Tüm alanlar zorunludur."
                }), HTTPStatus.BAD_REQUEST

            # Şifre validasyonu
            password_valid, password_error = validate_password(password)
            if not password_valid:
                return jsonify({
                    "success": False,
                    "message": password_error
                }), HTTPStatus.BAD_REQUEST

            # İsim/soyisim uzunluk kontrolü
            if len(first_name) > 50 or len(last_name) > 50:
                return jsonify({
                    "success": False,
                    "message": "Ad ve soyad en fazla 50 karakter olabilir."
                }), HTTPStatus.BAD_REQUEST

            existing_user = fetch_one(
                "SELECT id FROM users WHERE username = %s",
                (email,)
            )
            if existing_user:
                security_logger.warning(f"Kayıt denemesi - E-posta zaten kullanılıyor: {email} (IP: {request.remote_addr})")
                return jsonify({
                    "success": False,
                    "message": "Bu e-posta ile kayıtlı bir kullanıcı zaten var."
                }), HTTPStatus.BAD_REQUEST

            password_hash = hash_password(password)
            full_name = f"{first_name} {last_name}".strip()
            new_user = fetch_one(
                """
                INSERT INTO users (username, password, namesurname)
                VALUES (%s, %s, %s)
                RETURNING id, username, namesurname
                """,
                (email, password_hash, full_name)
            )

            user_id = new_user.get("id")
            username = new_user.get("username")
            token = generate_token(username, user_id)

            app_logger.info(f"Yeni kullanıcı kaydı: {username} (IP: {request.remote_addr})")

            return jsonify({
                "success": True,
                "message": "Kayıt başarılı!",
                "token": token,
                "user": new_user
            }), HTTPStatus.CREATED
        except Exception as e:
            app_logger.error(f"Register hatası: {str(e)}", exc_info=True)
            return jsonify({
                "success": False,
                "message": "Kayıt sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin."
            }), HTTPStatus.INTERNAL_SERVER_ERROR

