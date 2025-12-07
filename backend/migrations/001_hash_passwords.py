"""
Migration: Mevcut düz metin şifreleri hashler
Tarih: 2024-12-04
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.db import fetch_all, execute
from app.utils.auth import hash_password


def up():
    """
    Migration'ı uygular (şifreleri hashler)
    """
    print("Migration başlatılıyor: Şifre hashleme")
    
    users = fetch_all("SELECT id, password FROM users")
    
    if not users:
        print("Hashlenecek kullanıcı bulunamadı.")
        return
    
    hashed_count = 0
    skipped_count = 0
    error_count = 0
    
    for user in users:
        current_password = user['password']
        
        if not current_password:
            skipped_count += 1
            print(f"User ID {user['id']}: Şifre boş, atlanıyor")
            continue
        
        if current_password.startswith('pbkdf2:sha256:'):
            skipped_count += 1
            print(f"User ID {user['id']}: Zaten hashlenmiş, atlanıyor")
            continue
        
        try:
            password_hash = hash_password(current_password)
            execute(
                "UPDATE users SET password = %s WHERE id = %s",
                (password_hash, user['id'])
            )
            hashed_count += 1
            print(f"User ID {user['id']}: Şifre başarıyla hash'lendi")
        except Exception as e:
            error_count += 1
            print(f"User ID {user['id']}: Hata - {str(e)}")
    
    print(f"\nÖzet:")
    print(f"  Hashlenen: {hashed_count}")
    print(f"  Atlanan: {skipped_count}")
    print(f"  Hatalar: {error_count}")
    print(f"  Toplam: {len(users)}")


def down():
    """
    Migration'ı geri alır (NOT: Hashlenmiş şifreler düz metne çevrilemez!)
    Bu migration geri alınamaz.
    """
    print("UYARI: Hashlenmiş şifreler düz metne çevrilemez!")
    print("Bu migration geri alınamaz. Eğer geri almak istiyorsanız,")
    print("veritabanını yedekten geri yüklemelisiniz.")


if __name__ == "__main__":
    up()
