from fastapi import APIRouter, Depends, status, Query
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from sp_backend.dependencies.auth import get_current_user

