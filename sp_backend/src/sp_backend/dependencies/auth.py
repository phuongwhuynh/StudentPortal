from fastapi import Cookie, Depends, HTTPException, status, Request
from sp_backend.utils.jwt import decode_jwt
from sp_backend.schemas.user.user_claims import UserClaims


def get_current_user(
    request: Request, access_token: str | None = Cookie(default=None)
) -> UserClaims:
    if access_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token"
        )

    try:
        payload = decode_jwt(access_token)
        payload["email"] = payload["email"]
        payload["full_name"] = payload["full_name"]
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

    return UserClaims.model_validate(payload)
