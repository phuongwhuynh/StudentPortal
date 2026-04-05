from fastapi import HTTPException


class InvalidCredentialsException(HTTPException):
    def __init__(self):
        super().__init__(status_code=401, detail="Invalid email or password.")


class PermissionException(HTTPException):
    def __init__(
        self, message: str = "You do not have permission to perform this action."
    ):
        super().__init__(status_code=403, detail=message)
