from pydantic import BaseModel, Field
from typing import Literal, Optional

ActivationFn = Literal["relu", "tanh", "sigmoid", "linear", "softmax"]
LayerKind = Literal["input", "hidden", "output"]

class LayerSpec(BaseModel):
    id: str
    units: int = Field(gt=0)    # greater than 0
    kind: LayerKind
    label: str
    activation: Optional[ActivationFn] = None

