import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import TypeAdapter, ValidationError

from schemas.messages import ClientMessage
from services import session_registry

router = APIRouter()

_client_message_adapter = TypeAdapter(ClientMessage)

def _build_state_update(session, weights_reset=False):
    pass

def _build_prediction_grid(session):
    pass

def _build_dataset_points(session):
    pass


@router.websocket("/ws/training")
async def ws_training(websocket: WebSocket):
    await websocket.accept()
    connection_id = str(id(websocket))  # cho nó tiện lợi

    try:
        while True:
            raw = await websocket.receive_text()

            # Xử lý message có valid về mặt schema không
            try:
                data = json.loads(raw)
                message = _client_message_adapter.validate_python(data)
            except (json.JSONDecodeError, ValidationError) as exc:
                await websocket.send_json({"type": "error", "message": str(exc), "code": "invalid_message"})
                continue
            
            # Nếu message hợp lệ về mặt schema
            try:
                await _dispatch(connection_id, message, websocket)
            except  Exception as exc:
                await websocket.send_json({"type": "error", "message": str(exc), "code": "internal_error"})
                
    except WebSocketDisconnect:
        session_registry.remove_session(connection_id)

async def _dispatch(connection_id: str, message, websocket: WebSocket):
    pass

