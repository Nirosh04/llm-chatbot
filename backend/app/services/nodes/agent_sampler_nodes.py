import json
from fastapi import logger
from langchain_core.messages import HumanMessage, SystemMessage
from services.ollama_service import OllamaService
from services.states.agent_sampler_state import AgentState
from services.states.sampler_state import SamplerState
import logging

logger = logging.getLogger(__name__)

llm = OllamaService()

# helper function
def is_missing(v) -> bool:
    if v is None:
        return True
    if isinstance(v, str) and v.strip() == "":
        return True
    if isinstance(v, (list, dict)) and len(v) == 0:
        return True
    return False  # IMPORTANT: 0 / False are NOT missing




async def guardrail_node(state: AgentState):
    """Checks for emergencies or requests for medical advice."""

    logger.info(f"Guardrail Node Invoked: {state}")
    last_msg = state["messages"][-1]["content"]
    prompt = f"""Analyze this ER patient input: "{last_msg}"
    1. Is this a life-threatening emergency (e.g., chest pain, stroke symptoms)? 
    2. Is the user asking for medical advice/diagnosis?
    3. Did the user add relevant medical info?
    Respond in JSON: {{"emergency": bool, "medical_advice_requested": bool, "contains_new_medical_info": bool}}"""
    
    response = await llm.invoke(prompt)

    logger.info(f"Guardrail Response: {response}")

    # extract JSON
    try: 
        data = json.loads(response["content"])
    except Exception:
        logger.exception("Guardrail JSON parse failed, using safe defaults.")
        data = {
            "emergency": False,
            "medical_advice_requested": False,
            "contains_new_medical_info": True,  # conservative: don't skip extraction
        }


    return {
        "is_emergency": data["emergency"],
        "medical_advice_requested": data["medical_advice_requested"],
         "contains_new_medical_info": data["contains_new_medical_info"],
    }





async def extraction_node(state: AgentState):
    """Extracts SAMPLER data from the whole conversation history."""

    logger.info(f"Extraction Node Invoked: {state}")

    history = "\n".join([f"{m['role']}: {m['content']}" for m in state["messages"]])
    
    updated_data = await llm.invoke(f"Extract medical info from this chat history:\n{history}", SamplerState.model_json_schema())
    
    return {"sampler_data": json.loads(updated_data['content'])}

    
async def interviewer_node(state: AgentState):
    logger.info("Interviewer Node Invoked")
    
    expected_fields = [
        "symptoms", "allergies", "medication", 
        "past_medical_history", "last", "events", "risk_factors"
    ]

    data = state.get("sampler_data") or {}
    missing_fields = [f for f in expected_fields if is_missing(data.get(f))]
    
    # Use .get() to prevent crashes if keys are missing from state
    is_emergency = state.get("is_emergency", False)
    advice_req = state.get("medical_advice_requested", False)

    # Build Instructions
    instructions = [
        "You are an ER intake assistant.",
        "Reply in the SAME language as the patient.",
        "Be empathetic and concise.",
        "NO diagnosis or treatment advice."
    ]

    if is_emergency:
        instructions.append("Action: Alert staff, tell patient to stay put, acknowledge emergency.")
        is_complete = True
    elif advice_req:
        instructions.append("Action: Refuse medical advice, redirect to symptom description.")
        is_complete = False
    elif not missing_fields:
        instructions.append("Action: Info complete. Tell them the doctor will be with them soon.")
        is_complete = True
    else:
        next_f = missing_fields[0].replace("_", " ")
        instructions.append(f"Action: Ask ONLY about: {next_f}.")
        is_complete = False

    history_str = "\n".join([f"{m['role']}: {m['content']}" for m in state["messages"]])
    full_prompt = f"System Instructions:\n{instructions}\n\nHistory:\n{history_str}"

    response = await llm.invoke(full_prompt)
    
    return {
        "messages": [{"role": "assistant", "content": response['content']}],
        "is_complete": is_complete
    }