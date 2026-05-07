from fastapi import HTTPException, status


class InvalidCredentialsException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )


class PermissionException(HTTPException):
    def __init__(
        self, message: str = "You do not have permission to perform this action."
    ):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=message)


class UserNotFoundException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
        )
