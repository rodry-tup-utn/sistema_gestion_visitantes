from pydantic import computed_field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    postgres_user: str = "CHANGE_ME"
    postgres_password: str = "CHANGE_ME"
    postgres_db: str = "CHANGE_ME"
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    secret_key: str = "CHANGE_ME_IN_PRODUCTION"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    cookie_secure: bool = False
    cookie_samesite: str = "lax"
    postgres_sslmode: str = "disable"
    seed_admin_email: str
    seed_admin_password: str
    seed_operator_email: str
    seed_operator_password: str

    @computed_field
    @property
    def DATABASE_URL(self) -> str:
        url = (
            f"postgresql://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )
        if self.postgres_sslmode != "disable":
            url += f"?sslmode={self.postgres_sslmode}"
        return url

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        # Ignorar variables extra del .env que no sean campos declarados
        "extra": "ignore",
    }


settings = Settings()  # type: ignore[call-args]
