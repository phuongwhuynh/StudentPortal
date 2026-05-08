from fastapi import HTTPException, status


class InvalidQueryParameterException(HTTPException):
    def __init__(self, parameter_name: str, message: str = "Invalid query parameter."):
        detail = f"{message} | Parameter: {parameter_name}"
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class ForumNotFoundException(HTTPException):
    def __init__(self, forum_id: int):
        detail = f"Forum with ID {forum_id} not found."
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)
