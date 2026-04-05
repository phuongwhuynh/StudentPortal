from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    # Database settings
    DB_USER: str = "student_portal_user"
    DB_PASSWORD: str = "student_portal_password"
    DB_HOST: str = "localhost"
    DB_PORT: int = 5433
    DB_NAME: str = "student_portal"

    SECRET_KEY: str = "your_secret_key"
    JWT_ALGORITHM: str = "HS256"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
