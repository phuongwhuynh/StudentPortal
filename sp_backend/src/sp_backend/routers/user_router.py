from fastapi.responses import JSONResponse
from fastapi.requests import Request
from fastapi import APIRouter, status, Response, Depends
from sp_backend.schemas.user.user_signin_schema import (
    UserSignInRequest,
    UserSignInResponse,
)
from sp_backend.schemas.user.user_claims import UserClaims
from sp_backend.services.user.user_signin_service import UserSignInService
from sp_backend.dependencies.auth import get_current_user
from sp_backend.utils.jwt import encode_jwt

router = APIRouter(tags=["User"])


@router.get("/signin", status_code=status.HTTP_200_OK, response_class=JSONResponse)
async def sign_in(request: Request, signin_request: UserSignInRequest) -> Response:
    service = UserSignInService(
        db_session=request.state.db, signin_request=signin_request
    )
    signin_response: UserSignInResponse = service.invoke()
    token: str = encode_jwt(signin_response.model_dump())
    response: Response = JSONResponse(content=signin_response.model_dump())
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=3600,
        secure=False,  # for local development
        samesite="lax",
    )
    return response


@router.post("/signout", status_code=status.HTTP_200_OK, response_class=JSONResponse)
async def signout() -> Response:
    response: Response = JSONResponse(content={"message": "Successfully signed out"})
    response.delete_cookie(key="access_token")
    return response


@router.get("/", status_code=status.HTTP_200_OK, response_class=JSONResponse)
async def get_user_claims(current_user=Depends(get_current_user)) -> UserClaims:
    return current_user
