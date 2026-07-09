from .training_session import TrainingSession

_sessions: dict[str, TrainingSession] = {}

def create_session(connection_id: str) -> TrainingSession:
    session = TrainingSession()
    _sessions[connection_id] = session
    return session

def get_session(connection_id: str) -> TrainingSession:
    return _sessions[connection_id]

def remove_session(connection_id: str) -> None:
    _sessions.pop(connection_id, None)