from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    SESSION_EXPIRE_MINUTES: int = 30
    SESSION_COOKIE_NAME: str = "session_token"
    COOKIE_DOMAIN: str = ""  
    API_ACTIVE_VERSION: int = 1
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    GPT_TOKEN: str
    ASSEMBLYAI_API_KEY: str
    TABLES_FILE: str = "tables.json"
    
    # allowed origins for CORS
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.1.129:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]

    class Config:
        env_file = ".env"

settings = Settings()
