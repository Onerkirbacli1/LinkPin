"""
Migration: user_links tablosuna title kolonu ekler
Tarih: 2024-12-04
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.db import execute


def up():
    """
    Migration'ı uygular (title kolonu ekler)
    """
    print("Migration başlatılıyor: user_links tablosuna title kolonu ekleme")
    
    try:
        # title kolonu ekle (VARCHAR(255), nullable)
        execute(
            """
            ALTER TABLE user_links
            ADD COLUMN IF NOT EXISTS title VARCHAR(255)
            """
        )
        print("✓ title kolonu başarıyla eklendi.")
    except Exception as e:
        # Eğer kolon zaten varsa hata verme
        if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
            print("✓ title kolonu zaten mevcut, atlanıyor.")
        else:
            print(f"✗ Hata: {str(e)}")
            raise


def down():
    """
    Migration'ı geri alır (title kolonunu siler)
    """
    print("Migration geri alınıyor: title kolonu siliniyor")
    
    try:
        execute(
            """
            ALTER TABLE user_links
            DROP COLUMN IF EXISTS title
            """
        )
        print("✓ title kolonu başarıyla silindi.")
    except Exception as e:
        print(f"✗ Hata: {str(e)}")
        raise


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "down":
        down()
    else:
        up()

