from flask import request, jsonify
from app.utils.status import HTTPStatus
from app.utils.db import fetch_one, execute
from app.utils.auth import hash_password, verify_password
from app.utils.validators import validate_password
from app.utils.sanitizer import sanitize_string
from app.utils.logger import app_logger
from app.middleware.auth import token_required


def init_profile_routes(app):
    """
    Kullanıcı profil yönetimi için endpoint'ler.
    """

    @app.route("/profile", methods=["GET"])
    @token_required
    def get_profile():
        """
        Kullanıcı profil bilgilerini döndürür.
        """
        username = request.current_user["username"]
        
        kullanici = fetch_one(
            """
            SELECT id, username, namesurname
            FROM users
            WHERE username = %s
            """,
            (username,)
        )
        
        if not kullanici:
            return jsonify({
                "success": False,
                "message": "Kullanıcı bulunamadı."
            }), HTTPStatus.NOT_FOUND
        
        namesurname = kullanici.get("namesurname", "")
        name_parts = namesurname.split(" ", 1) if namesurname else ["", ""]
        
        return jsonify({
            "success": True,
            "user": {
                "id": kullanici.get("id"),
                "username": kullanici.get("username"),
                "namesurname": namesurname,
                "first_name": name_parts[0] if len(name_parts) > 0 else "",
                "last_name": name_parts[1] if len(name_parts) > 1 else ""
            }
        }), HTTPStatus.OK

    @app.route("/profile", methods=["PUT"])
    @token_required
    def update_profile():
        """
        Kullanıcı profil bilgilerini günceller (isim/soyisim).
        """
        username = request.current_user["username"]
        data = request.json or {}
        
        first_name = sanitize_string(data.get("first_name", ""))
        last_name = sanitize_string(data.get("last_name", ""))
        
        if not first_name or not last_name:
            return jsonify({
                "success": False,
                "message": "Ad ve soyad alanları zorunludur."
            }), HTTPStatus.BAD_REQUEST
        
        # İsim/soyisim uzunluk kontrolü
        if len(first_name) > 50 or len(last_name) > 50:
            return jsonify({
                "success": False,
                "message": "Ad ve soyad en fazla 50 karakter olabilir."
            }), HTTPStatus.BAD_REQUEST
        
        full_name = f"{first_name} {last_name}".strip()
        
        user_id = request.current_user["user_id"]
        execute(
            "UPDATE users SET namesurname = %s WHERE id = %s",
            (full_name, user_id)
        )
        
        updated_user = fetch_one(
            """
            SELECT id, username, namesurname
            FROM users
            WHERE id = %s
            """,
            (user_id,)
        )
        
        return jsonify({
            "success": True,
            "message": "Profil başarıyla güncellendi!",
            "user": {
                "id": updated_user.get("id"),
                "username": updated_user.get("username"),
                "namesurname": updated_user.get("namesurname"),
                "first_name": first_name,
                "last_name": last_name
            }
        }), HTTPStatus.OK

    @app.route("/profile/password", methods=["PUT"])
    @token_required
    def change_password():
        """
        Kullanıcı şifresini değiştirir.
        """
        user_id = request.current_user["user_id"]
        data = request.json or {}
        
        current_password = data.get("current_password", "").strip()
        new_password = data.get("new_password", "").strip()
        confirm_password = data.get("confirm_password", "").strip()
        
        if not current_password or not new_password or not confirm_password:
            return jsonify({
                "success": False,
                "message": "Tüm şifre alanları zorunludur."
            }), HTTPStatus.BAD_REQUEST
        
        if new_password != confirm_password:
            return jsonify({
                "success": False,
                "message": "Yeni şifre ve şifre tekrarı eşleşmiyor."
            }), HTTPStatus.BAD_REQUEST
        
        # Şifre validasyonu
        password_valid, password_error = validate_password(new_password)
        if not password_valid:
            return jsonify({
                "success": False,
                "message": password_error
            }), HTTPStatus.BAD_REQUEST
        
        kullanici = fetch_one(
            """
            SELECT id, password
            FROM users
            WHERE id = %s
            """,
            (user_id,)
        )
        
        if not kullanici:
            return jsonify({
                "success": False,
                "message": "Kullanıcı bulunamadı."
            }), HTTPStatus.NOT_FOUND
        
        if not verify_password(current_password, kullanici.get("password")):
            return jsonify({
                "success": False,
                "message": "Mevcut şifre yanlış."
            }), HTTPStatus.BAD_REQUEST
        
        new_password_hash = hash_password(new_password)
        
        execute(
            "UPDATE users SET password = %s WHERE id = %s",
            (new_password_hash, user_id)
        )
        
        return jsonify({
            "success": True,
            "message": "Şifre başarıyla değiştirildi!"
        }), HTTPStatus.OK

