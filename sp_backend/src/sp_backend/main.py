from fastapi import FastAPI
from sp_backend.web_app import initialize_app

app = FastAPI(title="Student Portal API", version="1.0.0", root_path="/api/v1")


app = initialize_app(app)
