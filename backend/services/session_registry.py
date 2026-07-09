from .training_session import TrainingSession

_sessions: dict[str, TrainingSession] = {}

def create_session(connection_id: str) -> TrainingSession:
    pass

def get_session(connection_id: str) -> TrainingSession:
    pass

def remove_session(connection_id: str) -> None:
    pass