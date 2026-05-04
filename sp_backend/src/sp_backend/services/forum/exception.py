from fastapi import HTTPException, status


class InvalidQueryParameterException(HTTPException):
    def __init__(self, parameter_name: str, message: str = "Invalid query parameter."):
        detail = f"{message} | Parameter: {parameter_name}"
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)
