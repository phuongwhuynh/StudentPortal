from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    # Database settings
    DB_USER: str = "student_portal_user"
    DB_PASSWORD: str = "student_portal_password"
    DB_HOST: str = "localhost"
    DB_PORT: int = 5433
    DB_NAME: str = "student_portal"


settings = Settings()
