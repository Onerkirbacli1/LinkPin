import os
from contextlib import contextmanager

import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from typing import Iterable, Sequence, Any, Optional


load_dotenv()


def _connection_kwargs():
    """Bağlantı için kullanılacak ayarları döndürür."""
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return {"dsn": database_url}

    return {
        "dbname": os.getenv("POSTGRES_DB", "myapp"),
        "user": os.getenv("POSTGRES_USER", "postgres"),
        "password": os.getenv("POSTGRES_PASSWORD", "postgres"),
        "host": os.getenv("POSTGRES_HOST", "127.0.0.1"),
        "port": os.getenv("POSTGRES_PORT", "5432"),
    }


def get_connection():
    """Yeni bir psycopg2 bağlantısı döndürür."""
    kwargs = _connection_kwargs()
    if "dsn" in kwargs:
        return psycopg2.connect(kwargs["dsn"])
    return psycopg2.connect(**kwargs)


@contextmanager
def get_cursor(dict_cursor: bool = False):
    """Sorgular için otomatik commit/rollback yapan cursor yardımcı fonksiyonu."""
    conn = get_connection()
    try:
        factory = RealDictCursor if dict_cursor else None
        cursor = conn.cursor(cursor_factory=factory)
        yield cursor
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()


def fetch_one(query: str, params: Optional[Sequence[Any]] = None):
    with get_cursor(dict_cursor=True) as cursor:
        cursor.execute(query, params)
        return cursor.fetchone()


def fetch_all(query: str, params: Optional[Sequence[Any]] = None):
    with get_cursor(dict_cursor=True) as cursor:
        cursor.execute(query, params)
        return cursor.fetchall()


def execute(query: str, params: Optional[Sequence[Any]] = None):
    with get_cursor() as cursor:
        cursor.execute(query, params)
        return cursor.rowcount


def execute_many(query: str, params_list: Iterable[Sequence[Any]]):
    if not params_list:
        return 0
    with get_cursor() as cursor:
        cursor.executemany(query, params_list)
        return cursor.rowcount

