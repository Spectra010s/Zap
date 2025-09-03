import secrets
from datetime import datetime, timedelta
from fastapi import Response
from core.config import settings

def create_session_token() -> str:
    return secrets.token_urlsafe(32)

def set_session_cookie(response: Response, token: str):
    expire = datetime.utcnow() + timedelta(minutes=settings.SESSION_EXPIRE_MINUTES)
    max_age = settings.SESSION_EXPIRE_MINUTES * 60 

    response.set_cookie(
        key=settings.SESSION_COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=max_age,
        expires=expire.strftime("%a, %d %b %Y %H:%M:%S GMT"),
        samesite="lax",
        path="/",
        secure=settings.ENVIRONMENT == "production", 
        domain=settings.COOKIE_DOMAIN if hasattr(settings, 'COOKIE_DOMAIN') else None
    )

def delete_session_cookie(response: Response):
    response.delete_cookie(settings.SESSION_COOKIE_NAME)
