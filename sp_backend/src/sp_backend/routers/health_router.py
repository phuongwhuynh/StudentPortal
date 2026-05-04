from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", status_code=status.HTTP_200_OK, response_class=JSONResponse)
async def health_check():
    return JSONResponse(content={"status": "healthy"}, status_code=status.HTTP_200_OK)
