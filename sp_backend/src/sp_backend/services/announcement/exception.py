from fastapi import HTTPException, status


class AnnouncementNotFoundException(HTTPException):
    def __init__(self, announcement_id: int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Announcement with ID {announcement_id} not found",
        )


class InvalidQueryParameterException(HTTPException):
    def __init__(self, parameter_name: str, message: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid query parameter '{parameter_name}': {message}",
        )
