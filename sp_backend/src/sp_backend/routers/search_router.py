from fastapi import APIRouter, Depends, status, Query
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from sp_backend.services.search.search_service import SearchService
from sp_backend.schemas.search.search_schema import SearchResponse

router = APIRouter(tags=["Search"], prefix="/search")


@router.get("/", status_code=status.HTTP_200_OK, response_class=JSONResponse)
async def search(
    request: Request,
    search: str = Query(..., min_length=2, max_length=200, description="Search query"),
    limit: int = Query(10, ge=1, le=100, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
) -> SearchResponse:
    service = SearchService(
        db_session=request.state.db, search=search, limit=limit, offset=offset
    )
    search_response: SearchResponse = service.invoke()
    return search_response
