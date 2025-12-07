import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.db import execute


def up():
    print("Migration başlatılıyor: user_links tablosuna is_favorite kolonu ekleme")
    try:
        execute(
            """
            ALTER TABLE user_links
            ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE
            """
        )
        print("✓ is_favorite kolonu başarıyla eklendi.")
    except Exception as e:
        if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
            print("✓ is_favorite kolonu zaten mevcut, atlanıyor.")
        else:
            print(f"✗ Hata: {str(e)}")
            raise


def down():
    print("Migration geri alınıyor: is_favorite kolonu siliniyor")
    try:
        execute(
            """
            ALTER TABLE user_links
            DROP COLUMN IF EXISTS is_favorite
            """
        )
        print("✓ is_favorite kolonu başarıyla silindi.")
    except Exception as e:
        print(f"✗ Hata: {str(e)}")
        raise


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "down":
        down()
    else:
        up()

