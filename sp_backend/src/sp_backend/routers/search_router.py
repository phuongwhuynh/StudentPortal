from typing import Optional

from fastapi import APIRouter, Depends, status, Query
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from sp_backend.dependencies.auth import get_current_user_optional
from sp_backend.schemas.user.user_claims import UserClaims
from sp_backend.services.search.search_service import SearchService
from sp_backend.schemas.search.search_schema import SearchResponse

router = APIRouter(tags=["Search"], prefix="/search")


@router.get("/", status_code=status.HTTP_200_OK, response_class=JSONResponse)
async def search(
    request: Request,
    search: str = Query(..., min_length=2, max_length=200, description="Search query"),
    limit: int = Query(1000, ge=1, le=1000, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    current_user: Optional[UserClaims] = Depends(get_current_user_optional),
) -> SearchResponse:
    service = SearchService(
        db_session=request.state.db,
        search=search,
        limit=limit,
        offset=offset,
        user_id=current_user.id if current_user else None,
    )
    search_response: SearchResponse = service.invoke()
    return search_response
