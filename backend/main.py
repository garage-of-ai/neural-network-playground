from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.ws_training import router as ws_router
from api.health_check import router as health_router

app = FastAPI(title="NetLab API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ws_router)
app.include_router(health_router)

# python -m uvicorn main:app --reload
# (main: tên file, app: tên biến)