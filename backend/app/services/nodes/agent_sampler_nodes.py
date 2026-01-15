import json
from fastapi import logger
from langchain_core.messages import HumanMessage, SystemMessage
from services.ollama_service import OllamaService
from services.states.agent_sampler_state import AgentState
from services.states.sampler_state import SamplerState
import logging

logger = logging.getLogger(__name__)

llm = OllamaService()

async def guardrail_node(state: AgentState):
    """Checks for emergencies or requests for medical advice."""

    logger.info(f"Guardrail Node Invoked: {state}")
    last_msg = state["messages"][-1]["content"]
    prompt = f"""Analyze this ER patient input: "{last_msg}"
    1. Is this a life-threatening emergency (e.g., chest pain, stroke symptoms)? 
    2. Is the user asking for medical advice/diagnosis?
    Respond in JSON: {{"emergency": bool, "medical_advice_requested": bool}}"""
    
    response = await llm.invoke(prompt)

    logger.info(f"Guardrail Response: {response}")
    data = json.loads(response['content'])
    
    return {
        "is_emergency": data["emergency"],
        "is_off_topic": data["medical_advice_requested"]
    }

async def extraction_node(state: AgentState):
    """Extracts SAMPLER data from the whole conversation history."""

    logger.info(f"Extraction Node Invoked: {state}")

    history = "\n".join([f"{m['role']}: {m['content']}" for m in state["messages"]])
    
    updated_data = await llm.invoke(f"Extract medical info from this chat history:\n{history}", SamplerState.model_json_schema())
    
    return {"sampler_data": json.loads(updated_data['content'])}

async def interviewer_node(state: AgentState):
    """The empathetic voice of the bot."""

    logger.info(f"Interviewer Node Invoked: {state}")

    data = state["sampler_data"]
    
    missing_fields = [k for k, v in data.items() if not v or v == ""]
    
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
        content = await llm.invoke(prompt)
        logger.info(f"Interviewer Node Response: {content}")
        content = content['content']
        is_complete = False

    return {
        "messages": [{"role": "assistant", "content": content}],
        "is_complete": is_complete
    }