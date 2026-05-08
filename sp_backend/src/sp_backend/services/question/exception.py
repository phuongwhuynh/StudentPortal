from fastapi import HTTPException, status


class QuestionNotFoundException(HTTPException):
    def __init__(self, question_id: int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with ID {question_id} not found",
        )


class InvalidQueryParameterException(HTTPException):
    def __init__(self, parameter_name: str, parameter_value: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid value '{parameter_value}' for query parameter '{parameter_name}'",
        )
