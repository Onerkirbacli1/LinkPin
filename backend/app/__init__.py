import os
from flask import Flask
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from app.routes import auth, dashboard, links, profile
from app.utils.logger import app_logger


def create_app():
    app = Flask(__name__)
    
    # CORS ayarları - Production'da daha sıkı olmalı
    cors_origins = os.getenv("CORS_ORIGINS", "*")
    CORS(
        app,
        origins=cors_origins.split(",") if cors_origins != "*" else ["*"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
        supports_credentials=True
    )
    
    # Rate limiting
    limiter = Limiter(
        app=app,
        key_func=get_remote_address,
        default_limits=["200 per day", "50 per hour"],
        storage_uri=os.getenv("REDIS_URL", "memory://")  # Production'da Redis kullanılmalı
    )
    
    app_logger.info("Flask uygulaması başlatıldı")
    
    auth.init_auth_routes(app, limiter)
    dashboard.init_dashboard_routes(app)
    links.init_links_routes(app)
    profile.init_profile_routes(app)
    
    return app

