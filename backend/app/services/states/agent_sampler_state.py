from typing import Any, Dict, List, Literal, Optional, Annotated
from pydantic import BaseModel, Field
from typing_extensions import TypedDict
import operator
from services.states.sampler_state import SamplerState
from langgraph.graph.message import add_messages


class MessageClassifier(BaseModel):
    message_type: Literal["medical", "navigation", "offtopic"] = Field(
        ...,
        description="Classify if the message requires a medical, navigation, or off-topic response."
    )

class ExtractorResult(TypedDict, total=False):
    clarification_needed: bool
    suggested_followup: Optional[str]
    missing_fields: List[str]
    updated_fields: Dict[str, Any]


def custom_list_reducer(existing: list, update: list | str):
    
    if isinstance(update, list) and getattr(update, "type", "") == "overwrite":
        return update
    
    return existing + update

class Overwrite(list):
    type = "overwrite"

class AgentState(TypedDict, total=False):
    messages: Annotated[List[Dict[str, str]], custom_list_reducer]
    sampler_data: SamplerState
    message_type: str | None
    navigation_message: str | None
    offtopic_message: str | None
    # extractor_result: Optional[ExtractorResult]
    # contains_new_medical_info: bool
    # has_extracted_this_turn: bool
