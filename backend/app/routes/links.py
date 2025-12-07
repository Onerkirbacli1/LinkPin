from flask import request, jsonify
import base64
import requests
import qrcode
from datetime import datetime
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from app.utils.status import HTTPStatus
from app.utils.db import fetch_one, fetch_all, execute, execute_many
from app.utils.validators import is_valid_url, normalize_url
from app.utils.sanitizer import sanitize_string
from app.utils.logger import app_logger
from app.middleware.auth import token_required


def init_links_routes(app):
    """Link yönetimi için API uçlarını kayıt eder."""

    @app.route("/links", methods=["GET"], endpoint="links_get_user")
    @token_required
    def links_get_user():
        """Kullanıcının kayıtlı linklerini döndürür."""
        username = request.current_user["username"]
        user_id = _get_user_id(username)
        if not user_id:
            return jsonify({"error": "Kullanıcı bulunamadı."}), HTTPStatus.NOT_FOUND

        kayitlar = fetch_all(
            """
            SELECT id, url, title, category, created_at, is_favorite
            FROM user_links
            WHERE user_id = %s
            ORDER BY is_favorite DESC, created_at DESC
            """,
            (user_id,)
        )
        links = [
            {
                "id": kayit["id"],
                "url": kayit["url"],
                "title": kayit.get("title") or "",
                "category": kayit.get("category") or "Diğer",
                "created_at": kayit["created_at"].isoformat() if kayit.get("created_at") else None,
                "is_favorite": kayit.get("is_favorite", False)
            }
            for kayit in kayitlar
        ]
        return jsonify({
            "links": links,
            "message": "Linkler başarıyla getirildi!"
        }), HTTPStatus.OK

    @app.route("/links", methods=["PUT"], endpoint="links_update_user")
    @token_required
    def links_update_user():
        """
        Kullanıcının link listesini günceller.
        İstek gövdesinde `links` anahtarına sahip bir liste beklenir.
        """
        username = request.current_user["username"]
        user_id = _get_user_id(username)
        if not user_id:
            return jsonify({"error": "Kullanıcı bulunamadı."}), HTTPStatus.NOT_FOUND

        data = request.json or {}
        links = data.get("links", [])

        if not isinstance(links, list):
            return jsonify({"error": "Links alanı liste olmalı."}), HTTPStatus.BAD_REQUEST

        sanitized_links = []
        for link_item in links:
            # Eski format desteği (sadece string)
            if isinstance(link_item, str):
                trimmed = link_item.strip()
                if not trimmed:
                    continue
                
                is_valid, error_msg = is_valid_url(trimmed)
                if not is_valid:
                    return jsonify({"error": f"Geçersiz URL: {error_msg}"}), HTTPStatus.BAD_REQUEST
                
                normalized = normalize_url(trimmed)
                sanitized_links.append((normalized, "", "Diğer"))
            # Yeni format (dict: {url, title, category})
            elif isinstance(link_item, dict):
                url = (link_item.get("url") or "").strip()
                title = sanitize_string(link_item.get("title", ""))
                category = sanitize_string(link_item.get("category", "Diğer"))
                
                if not url:
                    continue
                
                is_valid, error_msg = is_valid_url(url)
                if not is_valid:
                    return jsonify({"error": f"Geçersiz URL: {error_msg}"}), HTTPStatus.BAD_REQUEST
                
                normalized = normalize_url(url)
                sanitized_links.append((normalized, title[:255], category[:50]))  # Max 255 karakter title, 50 karakter category
            else:
                return jsonify({"error": "Geçersiz link formatı."}), HTTPStatus.BAD_REQUEST

        execute("DELETE FROM user_links WHERE user_id = %s", (user_id,))
        insert_params = [(user_id, url, title, category) for url, title, category in sanitized_links]
        execute_many(
            "INSERT INTO user_links (user_id, url, title, category) VALUES (%s, %s, %s, %s)",
            insert_params
        )

        return jsonify({
            "message": "Linkler başarıyla güncellendi!",
            "links": sanitized_links
        }), HTTPStatus.OK

    @app.route("/links", methods=["POST"], endpoint="links_add_user")
    @token_required
    def links_add_user():
        """Var olan link listesine yeni bir link ekler."""
        username = request.current_user["username"]
        user_id = _get_user_id(username)
        if not user_id:
            return jsonify({"error": "Kullanıcı bulunamadı."}), HTTPStatus.NOT_FOUND

        data = request.json or {}
        new_link = (data.get("link") or data.get("url") or "").strip()
        title = sanitize_string(data.get("title", ""))
        category = sanitize_string(data.get("category", "Diğer"))

        if not new_link:
            return jsonify({"error": "Eklenecek link boş olamaz."}), HTTPStatus.BAD_REQUEST
        
        is_valid, error_msg = is_valid_url(new_link)
        if not is_valid:
            return jsonify({"error": error_msg}), HTTPStatus.BAD_REQUEST
        
        new_link = normalize_url(new_link)

        execute(
            "INSERT INTO user_links (user_id, url, title, category) VALUES (%s, %s, %s, %s)",
            (user_id, new_link, title[:255] if title else "", category[:50])
        )

        kayitlar = fetch_all(
            "SELECT id, url, title, category, created_at, is_favorite FROM user_links WHERE user_id = %s ORDER BY is_favorite DESC, created_at DESC",
            (user_id,)
        )
        links = [
            {
                "id": kayit["id"],
                "url": kayit["url"],
                "title": kayit.get("title") or "",
                "category": kayit.get("category") or "Diğer",
                "created_at": kayit["created_at"].isoformat() if kayit.get("created_at") else None,
                "is_favorite": kayit.get("is_favorite", False)
            }
            for kayit in kayitlar
        ]

        return jsonify({
            "message": "Link başarıyla eklendi!",
            "links": links
        }), HTTPStatus.CREATED

    @app.route("/links/<int:link_id>", methods=["PUT"], endpoint="links_update_single")
    @token_required
    def links_update_single(link_id):
        """Belirli bir linki günceller."""
        username = request.current_user["username"]
        user_id = _get_user_id(username)
        if not user_id:
            return jsonify({"error": "Kullanıcı bulunamadı."}), HTTPStatus.NOT_FOUND

        link_kayit = fetch_one(
            "SELECT id FROM user_links WHERE id = %s AND user_id = %s",
            (link_id, user_id)
        )
        if not link_kayit:
            return jsonify({"error": "Link bulunamadı veya erişim reddedildi."}), HTTPStatus.NOT_FOUND

        data = request.json or {}
        new_url = (data.get("url") or "").strip()
        new_title = sanitize_string(data.get("title", ""))
        new_category = sanitize_string(data.get("category", "Diğer"))

        if not new_url:
            return jsonify({"error": "URL boş olamaz."}), HTTPStatus.BAD_REQUEST
        
        is_valid, error_msg = is_valid_url(new_url)
        if not is_valid:
            return jsonify({"error": error_msg}), HTTPStatus.BAD_REQUEST
        
        new_url = normalize_url(new_url)

        execute(
            "UPDATE user_links SET url = %s, title = %s, category = %s WHERE id = %s",
            (new_url, new_title[:255] if new_title else "", new_category[:50], link_id)
        )

        updated_link = fetch_one(
            "SELECT id, url, title, category, created_at, is_favorite FROM user_links WHERE id = %s",
            (link_id,)
        )

        return jsonify({
            "message": "Link başarıyla güncellendi!",
            "success": True,
            "link": {
                "id": updated_link["id"],
                "url": updated_link["url"],
                "title": updated_link.get("title") or "",
                "category": updated_link.get("category") or "Diğer",
                "created_at": updated_link["created_at"].isoformat() if updated_link.get("created_at") else None,
                "is_favorite": updated_link.get("is_favorite", False)
            }
        }), HTTPStatus.OK

    @app.route("/links/<int:link_id>", methods=["DELETE"], endpoint="links_delete_user")
    @token_required
    def links_delete_user(link_id):
        """Belirli bir linki siler."""
        username = request.current_user["username"]
        user_id = _get_user_id(username)
        if not user_id:
            return jsonify({"error": "Kullanıcı bulunamadı."}), HTTPStatus.NOT_FOUND

        link_kayit = fetch_one(
            "SELECT id FROM user_links WHERE id = %s AND user_id = %s",
            (link_id, user_id)
        )
        if not link_kayit:
            return jsonify({"error": "Link bulunamadı veya erişim reddedildi."}), HTTPStatus.NOT_FOUND

        execute("DELETE FROM user_links WHERE id = %s", (link_id,))

        return jsonify({
            "message": "Link başarıyla silindi!",
            "success": True
        }), HTTPStatus.OK

    @app.route("/links/<int:link_id>/preview", methods=["GET"])
    @token_required
    def get_link_preview(link_id):
        """Link için metadata önizlemesi döndürür."""
        try:
            user_id = request.current_user["user_id"]
            
            link = fetch_one(
                "SELECT id, url FROM user_links WHERE id = %s AND user_id = %s",
                (link_id, user_id)
            )
            if not link:
                return jsonify({
                    "success": False,
                    "message": "Link bulunamadı."
                }), HTTPStatus.NOT_FOUND
            
            url = link.get("url")
            
            try:
                headers = {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
                response = requests.get(url, headers=headers, timeout=5, allow_redirects=True)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, "html.parser")
                
                # Open Graph ve meta tag'lerden bilgi çek
                title = (
                    soup.find("meta", property="og:title") or
                    soup.find("meta", {"name": "twitter:title"}) or
                    soup.find("title")
                )
                title = title.get("content") if title and title.get("content") else (title.text if title else None)
                
                description = (
                    soup.find("meta", property="og:description") or
                    soup.find("meta", {"name": "twitter:description"}) or
                    soup.find("meta", {"name": "description"})
                )
                description = description.get("content") if description else None
                
                image = (
                    soup.find("meta", property="og:image") or
                    soup.find("meta", {"name": "twitter:image"})
                )
                image = image.get("content") if image else None
                
                # Image URL'ini normalize et
                if image and not image.startswith("http"):
                    parsed_url = urlparse(url)
                    if image.startswith("//"):
                        image = f"{parsed_url.scheme}:{image}"
                    elif image.startswith("/"):
                        image = f"{parsed_url.scheme}://{parsed_url.netloc}{image}"
                    else:
                        image = f"{parsed_url.scheme}://{parsed_url.netloc}/{image}"
                
                return jsonify({
                    "success": True,
                    "preview": {
                        "title": title or url,
                        "description": description or "",
                        "image": image or "",
                        "url": url
                    }
                }), HTTPStatus.OK
                
            except Exception as e:
                app_logger.warning(f"Link preview hatası: {str(e)}")
                return jsonify({
                    "success": True,
                    "preview": {
                        "title": url,
                        "description": "",
                        "image": "",
                        "url": url
                    }
                }), HTTPStatus.OK
                
        except Exception as e:
            app_logger.error(f"Link preview hatası: {str(e)}", exc_info=True)
            return jsonify({
                "success": False,
                "message": "Önizleme alınamadı."
            }), HTTPStatus.INTERNAL_SERVER_ERROR

    @app.route("/links/<int:link_id>/qr", methods=["GET"])
    @token_required
    def get_link_qr(link_id):
        """Link için QR kod oluşturur."""
        try:
            user_id = request.current_user["user_id"]
            
            link = fetch_one(
                "SELECT id, url FROM user_links WHERE id = %s AND user_id = %s",
                (link_id, user_id)
            )
            if not link:
                return jsonify({
                    "success": False,
                    "message": "Link bulunamadı."
                }), HTTPStatus.NOT_FOUND
            
            url = link.get("url")
            
            # QR kod oluştur
            qr = qrcode.QRCode(version=1, box_size=10, border=5)
            qr.add_data(url)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Image'ı base64'e çevir
            buffer = io.BytesIO()
            img.save(buffer, format="PNG")
            buffer.seek(0)
            img_base64 = base64.b64encode(buffer.getvalue()).decode()
            
            return jsonify({
                "success": True,
                "qr_code": f"data:image/png;base64,{img_base64}",
                "url": url
            }), HTTPStatus.OK
                
        except Exception as e:
            app_logger.error(f"QR kod hatası: {str(e)}", exc_info=True)
            return jsonify({
                "success": False,
                "message": "QR kod oluşturulamadı."
            }), HTTPStatus.INTERNAL_SERVER_ERROR


def _get_user_id(username: str):
    kayit = fetch_one(
        "SELECT id FROM users WHERE username = %s",
        (username,)
    )
    if kayit:
        return kayit["id"]
    return None

