from functools import wraps
from flask import request, jsonify
from app.utils.status import HTTPStatus
from app.utils.auth import verify_token


def token_required(f):
    """
    Decorator: Endpoint'i token ile korur.
    Token doğrulandıktan sonra kullanıcı bilgilerini request.current_user'a ekler.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        auth_header = request.headers.get("Authorization")
        if auth_header:
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({
                    "success": False,
                    "message": "Geçersiz token formatı"
                }), HTTPStatus.UNAUTHORIZED
        
        if not token:
            return jsonify({
                "success": False,
                "message": "Token bulunamadı. Lütfen giriş yapın."
            }), HTTPStatus.UNAUTHORIZED
        
        try:
            payload = verify_token(token)
            request.current_user = {
                "username": payload.get("username"),
                "user_id": payload.get("user_id")
            }
        except ValueError as e:
            return jsonify({
                "success": False,
                "message": str(e)
            }), HTTPStatus.UNAUTHORIZED
        
        return f(*args, **kwargs)
    
    return decorated

