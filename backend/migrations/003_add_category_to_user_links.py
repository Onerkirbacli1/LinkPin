"""
Migration: user_links tablosuna category kolonu ekler
Tarih: 2024-12-04
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.db import execute


def up():
    """
    Migration'ı uygular (category kolonu ekler)
    """
    print("Migration başlatılıyor: user_links tablosuna category kolonu ekleme")
    
    try:
        # category kolonu ekle (VARCHAR(50), nullable, default 'Diğer')
        execute(
            """
            ALTER TABLE user_links
            ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'Diğer'
            """
        )
        print("✓ category kolonu başarıyla eklendi.")
    except Exception as e:
        # Eğer kolon zaten varsa hata verme
        if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
            print("✓ category kolonu zaten mevcut, atlanıyor.")
        else:
            print(f"✗ Hata: {str(e)}")
            raise


def down():
    """
    Migration'ı geri alır (category kolonunu siler)
    """
    print("Migration geri alınıyor: category kolonu siliniyor")
    
    try:
        execute(
            """
            ALTER TABLE user_links
            DROP COLUMN IF EXISTS category
            """
        )
        print("✓ category kolonu başarıyla silindi.")
    except Exception as e:
        print(f"✗ Hata: {str(e)}")
        raise


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "down":
        down()
    else:
        up()

