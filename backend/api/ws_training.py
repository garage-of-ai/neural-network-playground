import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import TypeAdapter, ValidationError

from schemas.messages import (
    ClientMessage,
    SessionInitMessage,
    UpdateArchitectureMessage,
    UpdateDatasetMessage,
    UpdateTrainingConfigMessage,
    StepMessage,
    RunEpochMessage,
    ResetMessage,
    StateUpdateMessage,
    DatasetPointsMessage,
    PredictionGridMessage,
)
from services import session_registry
from services.training_session import RESOLUTION

router = APIRouter()

_client_message_adapter = TypeAdapter(ClientMessage)

def _build_state_update(session, weights_reset=False):
    loss, accuracy = session.get_metrics()
    return StateUpdateMessage(
        epoch=session.epoch,
        weights=session.get_weights(),
        loss=loss,
        accuracy=accuracy,
        weightsReset=weights_reset,
    )

def _build_prediction_grid(session):
    return PredictionGridMessage(resolution=RESOLUTION, grid=session.predict_grid())

def _build_dataset_points(session):
    return DatasetPointsMessage(train=session.dataset.train_points, test=session.dataset.test_points)


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
    if isinstance(message, SessionInitMessage):
        session = session_registry.create_session(connection_id)
        session.init_session(message.architecture, message.trainingConfig, message.datasetConfig)
        await websocket.send_json(_build_dataset_points(session).model_dump())
        await websocket.send_json(_build_state_update(session, weights_reset=True).model_dump())
        await websocket.send_json(_build_prediction_grid(session).model_dump())
        return

    session = session_registry.get_session(connection_id)

    if isinstance(message, UpdateArchitectureMessage):
        session.rebuild_network(message.architecture)
        await websocket.send_json(_build_state_update(session, weights_reset=True).model_dump())
        await websocket.send_json(_build_prediction_grid(session).model_dump())

    elif isinstance(message, UpdateDatasetMessage):
        session.rebuild_dataset(message.datasetConfig)
        await websocket.send_json(_build_dataset_points(session).model_dump())
        await websocket.send_json(_build_prediction_grid(session).model_dump())

    elif isinstance(message, UpdateTrainingConfigMessage):
        session.update_training_config(message.trainingConfig)

    elif isinstance(message, StepMessage):
        session.step()
        await websocket.send_json(_build_state_update(session).model_dump())
        await websocket.send_json(_build_prediction_grid(session).model_dump())

    elif isinstance(message, RunEpochMessage):
        session.run_epoch()
        await websocket.send_json(_build_state_update(session).model_dump())
        await websocket.send_json(_build_prediction_grid(session).model_dump())

    elif isinstance(message, ResetMessage):
        session.reset()
        await websocket.send_json(_build_state_update(session, weights_reset=True).model_dump())
        await websocket.send_json(_build_prediction_grid(session).model_dump())

