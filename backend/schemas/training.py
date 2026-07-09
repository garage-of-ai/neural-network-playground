from pydantic import BaseModel, Field
from typing import Literal

Optimizer = Literal["sgd", "sgd-momentum", "adam"]
WeightInit = Literal["zeros", "uniform", "gaussian"]
DatasetKind = Literal["circle", "xor", "gauss", "spiral", "moons", "blobs3"]

class TrainingConfigSchema(BaseModel):
    optimizer: Optimizer
    learningRate: float = Field(gt=0)
    batchSize: int = Field(gt=0)
    epochs: int = Field(gt=0)
    weightInit: WeightInit

class DatasetConfigSchema(BaseModel):
    kind: DatasetKind
    trainSplit: int = Field(ge=50, le=95)
    noise: int = Field(ge=0, le=50)