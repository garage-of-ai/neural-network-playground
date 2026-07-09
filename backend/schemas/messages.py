from pydantic import BaseModel, Field
from typing import Literal, Union
from .network import LayerSpec
from .training import TrainingConfigSchema, DatasetConfigSchema

### Client -> Server ###

class SessionInitMessage(BaseModel):
    type: Literal["session_init"]
    architecture: list[LayerSpec]
    trainingConfig: TrainingConfigSchema
    datasetConfig: DatasetConfigSchema

class UpdateArchitectureMessage(BaseModel):
    type: Literal["update_architecture"]
    architecture: list[LayerSpec]

class UpdateDatasetMessage(BaseModel):
    type: Literal["update_dataset"]
    datasetConfig: DatasetConfigSchema

class UpdateTrainingConfigMessage(BaseModel):
    type: Literal["update_training_config"]
    trainingConfig: TrainingConfigSchema

class StepMessage(BaseModel):
    type: Literal["step"]

class RunEpochMessage(BaseModel):
    type: Literal["run_epoch"]

class ResetMessage(BaseModel):
    type: Literal["reset"]

ClientMessage = Union[
    SessionInitMessage,
    UpdateArchitectureMessage,
    UpdateDatasetMessage,
    UpdateTrainingConfigMessage,
    StepMessage,
    RunEpochMessage,
    ResetMessage,
]

### Server -> Client ###

class StateUpdateMessage(BaseModel):
    type: Literal["state_update"] = "state_update"
    epoch: int
    weights: list[list[list[float]]] 
    loss: float
    accuracy: float
    weightsReset: bool = False

class DatasetPointsMessage(BaseModel):
    type: Literal["dataset_points"] = "dataset_points"
    train: list[list[float]]   # mỗi phần tử [x, y, label]
    test: list[list[float]]

class PredictionGridMessage(BaseModel):
    type: Literal["prediction_grid"] = "prediction_grid"
    resolution: int
    grid: list[list[float]]

class ErrorMessage(BaseModel):
    type: Literal["error"] = "error"
    message: str
    code: str

