import json
from langchain_core.messages import HumanMessage, SystemMessage
from backend.app.services.ollama_service import OllamaService
from services.states.agent_sampler_state import AgentState
from services.states.sampler_state import SamplerState

llm = OllamaService()

def guardrail_node(state: AgentState):
    """Checks for emergencies or requests for medical advice."""
    last_msg = state["messages"][-1]["content"]
    prompt = f"""Analyze this ER patient input: "{last_msg}"
    1. Is this a life-threatening emergency (e.g., chest pain, stroke symptoms)? 
    2. Is the user asking for medical advice/diagnosis?
    Respond in JSON: {{"emergency": bool, "medical_advice_requested": bool}}"""
    
    response = llm.invoke(prompt)
    data = json.loads(response.content)
    
    return {
        "is_emergency": data["emergency"],
        "is_off_topic": data["medical_advice_requested"]
    }

def extraction_node(state: AgentState):
    """Extracts SAMPLER data from the whole conversation history."""
    history = "\n".join([f"{m['role']}: {m['content']}" for m in state["messages"]])
    
    structured_llm = llm.with_structured_output(SamplerState)
    updated_data = structured_llm.invoke(f"Extract medical info from this chat history:\n{history}")
    
    return {"sampler_data": updated_data}

def interviewer_node(state: AgentState):
    """The empathetic voice of the bot."""
    data = state["sampler_data"]
    
    missing_fields = [k for k, v in data.dict().items() if not v or v == ""]
    
    if state["is_emergency"]:
        content = "I've flagged this for immediate clinical attention. A nurse is being alerted right now. Please stay where you are."
        is_complete = True
    elif state["is_off_topic"]:
        content = "I understand you're looking for medical advice, but I am an assistant here only to collect your info for the doctor and help you navigate the hospital. I cannot provide diagnoses or treatments. Could you tell me more about your symptoms?"
        is_complete = False
    elif not missing_fields:
        content = "Thank you. I have all the information the doctor needs. They will be with you shortly. The restrooms are down the hall to the left if you need them."
        is_complete = True
    else:
        next_field = missing_fields[0].replace("_", " ")
        prompt = f"The patient hasn't provided info about: {next_field}. Ask them about it empathetically. Do NOT give advice."
        content = llm.invoke(prompt).content
        is_complete = False

    return {
        "messages": [{"role": "assistant", "content": content}],
        "is_complete": is_complete
    }