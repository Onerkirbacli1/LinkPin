from flask import request, jsonify
from app.utils.status import HTTPStatus
from app.utils.db import fetch_one, fetch_all, execute
from app.utils.auth import hash_password, verify_password
from app.middleware.auth import token_required


def _get_user_id(username: str):
    """Kullanıcı adından user_id'yi döndürür."""
    kayit = fetch_one(
        "SELECT id FROM users WHERE username = %s",
        (username,)
    )
    if kayit:
        return kayit["id"]
    return None


def init_dashboard_routes(app):
    """
    Dashboard sayfası için özel endpoint'ler.
    """

    @app.route("/dashboard/user", methods=["GET"])
    @token_required
    def get_dashboard_user():
        """
        Dashboard için kullanıcı bilgilerini döndürür.
        Token'dan kullanıcı bilgisi alınır.
        """
        username = request.current_user["username"]
        
        kullanici = fetch_one(
            """
            SELECT username, namesurname
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
        
        return jsonify({
            "success": True,
            "user": {
                "username": kullanici.get("username"),
                "namesurname": kullanici.get("namesurname")
            },
            "message": "Kullanıcı bilgileri başarıyla getirildi!"
        }), HTTPStatus.OK

    @app.route("/dashboard/stats", methods=["GET"])
    @token_required
    def get_dashboard_stats():
        """
        Dashboard için istatistikleri döndürür (toplam link sayısı, son linkler).
        """
        username = request.current_user["username"]
        user_id = _get_user_id(username)
        
        if not user_id:
            return jsonify({
                "success": False,
                "message": "Kullanıcı bulunamadı."
            }), HTTPStatus.NOT_FOUND
        
        # Toplam link sayısı
        total_links_result = fetch_one(
            """
            SELECT COUNT(*) as total
            FROM user_links
            WHERE user_id = %s
            """,
            (user_id,)
        )
        total_links = total_links_result.get("total", 0) if total_links_result else 0
        
        # Son eklenen 5 link
        recent_links = fetch_all(
            """
            SELECT id, url, title, category, created_at, is_favorite
            FROM user_links
            WHERE user_id = %s
            ORDER BY is_favorite DESC, created_at DESC
            LIMIT 5
            """,
            (user_id,)
        )
        
        links = [
            {
                "id": link["id"],
                "url": link["url"],
                "title": link.get("title") or "",
                "category": link.get("category") or "Diğer",
                "created_at": link["created_at"].isoformat() if link.get("created_at") else None,
                "is_favorite": link.get("is_favorite", False)
            }
            for link in recent_links
        ]
        
        return jsonify({
            "success": True,
            "stats": {
                "total_links": total_links,
                "recent_links": links
            }
        }), HTTPStatus.OK

    @app.route("/dashboard/logout", methods=["POST"])
    @token_required
    def dashboard_logout():
        """
        Dashboard için logout endpoint'i.
        Token doğrulaması yapılır ancak frontend'de token silinir.
        """
        return jsonify({
            "success": True,
            "message": "Çıkış işlemi başarılı."
        }), HTTPStatus.OK

