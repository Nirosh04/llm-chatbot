from typing import Annotated, List
from typing_extensions import TypedDict
import operator
from services.states.sampler_state import SamplerState

class AgentState(TypedDict):
    messages: Annotated[List[dict], operator.add]
    sampler_data: SamplerState
    is_emergency: bool
    medical_advice_requested: bool
    contains_new_medical_info: bool
    is_complete: bool