from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from core.config import settings

def add_cors_middleware(app):
    # this will only allow specific origins from settings
    allowed_origins = settings.ALLOWED_ORIGINS
    
    # for the CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_origin_regex=None,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
        max_age=600,
    )
    
    # Add additional security headers
    @app.middleware("http")
    async def add_security_headers(request: Request, call_next):
        response = await call_next(request)
        
        headers = dict(response.headers)
        
        # Security headers
        security_headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
        }
        
        # Add security headers maybe if not already set
        for key, value in security_headers.items():
            if key not in headers:
                response.headers[key] = value
                
        return response
