from pydantic import BaseModel, ConfigDict
from typing import Optional


class JWTPayload(BaseModel):
    sub: str
    role: str
    name: str
    exp: Optional[int] = None

    model_config = ConfigDict(extra="ignore")
