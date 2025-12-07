from enum import IntEnum

class HTTPStatus(IntEnum):
    """
    Sık kullanılan HTTP Durum Kodları için numaralandırma (Enum) sınıfı.
    Bu, kodda sayı yerine anlamlı isimler (örneğin 404 yerine NOT_FOUND) kullanmamızı sağlar.
    """
    OK = 200
    CREATED = 201
    
    BAD_REQUEST = 400
    UNAUTHORIZED = 401
    FORBIDDEN = 403
    NOT_FOUND = 404
    
    INTERNAL_SERVER_ERROR = 500

