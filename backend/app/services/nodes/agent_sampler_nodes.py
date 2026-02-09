import json
import logging
import random
import re
from unittest import result
from services.ollama_service import OllamaService
from services.states.agent_sampler_state import AgentState, Overwrite
from services.states.sampler_state import MedicalHistory, SamplerState, Symptom
from prompts import Prompts

logger = logging.getLogger(__name__)
llm = OllamaService()

def is_missing(v) -> bool:
    if v is None:
        return True
    if isinstance(v, str) and v.strip() == "":
        return True
    if isinstance(v, (list, dict)) and len(v) == 0:
        return True
    return False  # IMPORTANT: 0 / False are NOT missing


def _extract_first_json_object(text: str) -> str | None:
    if not text:
        return None
    m = re.search(r"\{[\s\S]*\}", text)
    return m.group(0) if m else None

def get_missing_sampler_fields(sampler: SamplerState) -> list[str]:
    missing = []
    if not sampler.symptoms or len(sampler.symptoms) == 0:
        missing.append("symptoms")
    if not sampler.allergies or len(sampler.allergies) == 0:
        missing.append("allergies")
    if not sampler.medication or len(sampler.medication) == 0:
        missing.append("medication")
    if not sampler.past_medical_history or len(sampler.past_medical_history) == 0:
        missing.append("past_medical_history")
    if not sampler.last or len(sampler.last) == 0:
        missing.append("last")
    if not sampler.events or len(sampler.events) == 0:
        missing.append("events")
    if not sampler.risk_factors or len(sampler.risk_factors) == 0:
        missing.append("risk_factors")
    return missing

def build_classifier_message(
    messages: list[dict],
    latest_user_message: str,
) -> str:
    return f"""
    Conversation so far:
    {messages[:-1] if messages else ""}

    The user replied with the following answer to the last question above:
    {latest_user_message}
    """

def build_companion_message(
    messages: list[dict],
    sampler: SamplerState,
    missing_fields: list[str],
    latest_user_message: str,
) -> str:
    return f"""
    Conversation so far:
    {messages}

    Known medical information:
    {sampler.model_dump()}

    Missing information:
    {missing_fields}

    Latest user message:
    {latest_user_message}
    """

def build_extractor_message(
    messages: list[dict],
) -> str:
    latest_user_message = messages[-1]["content"]

    if len(messages) > 1:
        return f"""
        What you asked:
        {messages[-2]["content"]}

        What user answered:
        {latest_user_message}
    """
    else:
        return latest_user_message

async def classifier_node(state: AgentState) -> AgentState:
    """
    Classifier node.
    - Never writes to messages
    - Only classifies the user message into predefined categories
    """
    logger.info("Classifier Node Invoked")

    last_message = state["messages"][-1]["content"]

    CLASSIFIER_SYSTEM_PROMPT = """
        Classify the user message as either:
        1. 'medical': 
                - If it asks for medical information, diagnosis, treatment, pains, symptoms, advice, analysis, or support
                -  How the ER process, ED process works
                - Triage procedures, waiting room, or next steps
                - Any question about "how to get care in the ED process, ER process" or "what happens in triage" must be classified as 'medical', even if it mentions symptoms or medical terms.

        2. 'navigation': 
                - If the message asks about navigating the hospital including:
                - Locations of doctors, nurses, staff, or hospital departments

        3. 'offtopic': 
                - If the message is clearly unrelated to health, hospitals, or emergency care.
                - This includes personal conversation, jokes, or topics outside the medical or hospital context.
                - Ignore references to previous conversation unless they directly involve medical or navigation topics.

        If the user's reply is a valid answer to a prior medical question and not a naivgation question, classify it as 'medical'.

        Return valid JSON that matches the provided schema.
    """

    format_schema = {
        "type": "object",
        "properties": {
            "message_type": {
                "type": "string",
                "enum": ["medical", "navigation", "offtopic"],
            },
        },
        "required": ["message_type"],
    }

    message = build_classifier_message(
        messages=state["messages"],
        latest_user_message=last_message,
    )

    response = await llm.invoke(prompt=CLASSIFIER_SYSTEM_PROMPT,
                                message=message,
                                format=format_schema,
                                stream=False)

    logger.info(f"Classifier raw response: {response}")

    raw = response.get("content", "")

    try:
        data = json.loads(raw)
    except Exception:
        logger.exception("Classifier JSON parse failed.")
        data = {}

    res = {"message_type": data["message_type"]}

    if data["message_type"] in ["navigation", "offtopic"]:
        res["messages"] =  Overwrite(state["messages"][:-1])
        logger.info(f"Classifier adjusted messages for type {res}")

    return res


async def companion_node(state: AgentState) -> AgentState:
    """
    The ONLY node allowed to talk to the user.

    Responsibilities:
    - Generate empathetic / guardrailed language
    - Decide if extraction is needed
    - Turn extractor_result into a natural follow-up question
    """
    logger.info("Companion Node Invoked")

    COMPANION_SYSTEM_PROMPT = """
        You are Lumee, an AI companion for patients and companions waiting in a hospital emergency department (ED).

        Your role:
        - Support people emotionally while they wait.
        - Help them clearly describe their medical situation for the clinical team.
        - Ask gentle follow-up questions only when information is missing or unclear.

        You are NOT a clinician.
        You must NOT diagnose, give medical advice, assess urgency, suggest treatments or medications, or comment on staff decisions.

        Introduction (first assistant message only):
        - If this is the first time you are responding in the conversation, introduce yourself clearly and briefly.
        - State that you are Lumee, an AI companion in the emergency department.
        - Explain in simple terms what you can and cannot do.
        - Invite the user to share what brought them to the ED.
        - Keep the introduction to 1–2 short sentences.
        - Include exactly ONE gentle, relevant follow-up question.

        Conversation behavior:
        - Respond in 1–2 short, clear sentences.
        - Ask ZERO or ONE follow-up question per turn.
        - If you ask a question:
        - It must be exactly ONE sentence.
        - It must end with a single “?”.
        - Do NOT combine questions.
        - Do NOT use “and”, commas, or multiple clauses to bundle questions.
        - Never include more than one question mark.
        - Focus on ONE issue at a time.

        Clinical focus:
        - Prioritize collecting missing or unclear information related to:
        symptoms, allergies, current medications, past medical history,
        recent intake (food, drink, medication), events leading up to the visit,
        and risk factors.
        - Treat short or fragmentary replies as valid medical answers if they respond to a prior question.
        - If enough information is already available, provide brief emotional support
        or explain ED processes, ER processes in general terms.

        Language:
        - Always reply in the SAME language as the user’s last message.
        - Never mix English and German in the same message or conversation.

        ED process, ER process explanation:
        When users ask about the ED process, ER process:
        - Explain triage in simple terms (people are seen by urgency, not arrival time; reassessment happens; waiting does not mean they are forgotten).
        - Explain the next steps after triage, but in general terms and not related to the patient.
        - Be transparent about uncertainty: You can explain common patterns (labs, imaging, re-evaluation) but cannot give exact times.

        Safety escalation (mandatory):
        - If the user describes life-threatening or rapidly worsening symptoms
        (such as severe chest pain, trouble breathing, confusion, loss of consciousness,
        heavy bleeding, sudden weakness on one side, or an intense new headache),
        respond clearly and calmly:
        “This sounds serious. I’m just a virtual companion and can’t assess you.
        Please tell the ED staff immediately or use the emergency call button if nearby.”

        Tone and language:
        - Warm, calm, and professional.
        - Avoid slang, sarcasm, or exaggerated empathy.
        - Do NOT say you have feelings or emotions.
        - Show care by reflecting what the user says.
        - Use the SAME language as the user.

        Scope control:
        - If the user goes off-topic, gently redirect to their ED visit and current concerns.

        Output format:
        - Return valid JSON ONLY.
        - JSON schema:
        {
            "message": "string"
        }
        """

    format_schema = {
        "type": "object",
        "properties": {
            "message": {"type": "string"},
        },
        'required': ['message'],
    }

    user_message = build_companion_message(
        messages=state["messages"],
        sampler=state.get("sampler_data", SamplerState()),
        missing_fields=get_missing_sampler_fields(
            state.get("sampler_data", SamplerState())
        ),
        latest_user_message=state["messages"][-1]["content"],
    )

    response = await llm.invoke(prompt=COMPANION_SYSTEM_PROMPT,
                                message=user_message,
                                format=format_schema,
                                stream=False)

    logger.info(f"Companion raw response: {response}")
    
    raw = response.get("content", "")

    try:
        data = json.loads(_extract_first_json_object(raw) or "{}")
        raw = data.get("message", "")
    except Exception:
        logger.exception("Companion JSON parse failed.")

    return {
        **state,
        "messages": [{"role": "assistant", "content": raw}],
    }


# Backwards compatibility
async def guardrail_node(state: AgentState):
    return await companion_node(state)

async def extraction_node(state: AgentState) -> AgentState:
    """
    SILENT node.
    - Never writes to messages
    - Only updates sampler_data
    - Suggests (but does not ask) follow-up questions
    """
    logger.info("Extraction Node Invoked")

    EXTRACTOR_SYSTEM_PROMPT = """
        You are a medical information extractor.

        Extract ONLY information explicitly stated below.
        Do NOT infer, guess, or add new medical facts.
        If nothing relevant is present, return empty lists.

        symptoms: Symptoms that the user is currently experiencing, for example hand pain, headache, etc.
            - description: What is the symptom?
            - location: Where is it?
            - severity: How bad is it / descriptive adjectives?
            - duration: How long has it been going on?
            - pain_level: Integer 1-10 (if applicable).
        allergies: Allergies the user has mentioned, for example peanuts, pollen, dust mites, medication allergys etc.
        medication: Current medications the user is taking, for example aspirin, ibuprofen, etc.
        past_medical_history: Past medical history or pre-existing conditions the user has mentioned, for example diabetes, hypertension, asthma, etc.
            - condition: The name of the condition.
            - since: Date or duration since diagnosis.
            - medication: Medication specifically for this condition.
            - notes: Any extra details.
        last: Last meal, drink, medication, etc. the user has recently taken or if a procedure was recently done.
        events: The events leading up to the incident or current situation the user is describing due to which they are seeking medical advice.
        risk_factors: Risk factors mentioned by the user, for example smoking, family history, genetic disorders, age, lifestyle etc.

        If the user says something like "no", "none", "not that I know of", "I don't think so", etc.
        for any of the above categories, treat it as an explicit statement of "no known X" and it can be recorded as an answer.

        Return valid JSON that matches the provided schema.
    """

    user_msg = build_extractor_message(state["messages"])

    format_schema = {
        "type": "object",
        "properties": {
            "symptoms": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "description": {"type": "string"},
                        "location": {"type": "string"},
                        "severity": {"type": "string"},
                        "duration": {"type": "string"},
                        "pain_level": {"type": ["integer", "null"]},
                    },
                    "required": ["description"]
                }
            },
            "past_medical_history": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "condition": {"type": "string"},
                        "since": {"type": "string"},
                        "medication": {"type": "string"},
                        "notes": {"type": "string"},
                    },
                    "required": ["condition"]
                }
            },
            
            "allergies": {"type": "array", "items": {"type": "string"}},
            "medication": {"type": "array", "items": {"type": "string"}},
            "last": {"type": "array", "items": {"type": "string"}},
            "events": {"type": "array", "items": {"type": "string"}},
            "risk_factors": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["symptoms", "past_medical_history", "allergies", "medication", "last", "events", "risk_factors"],
    }

    sampler = state.get("sampler_data", SamplerState())

    response = await llm.invoke(prompt=EXTRACTOR_SYSTEM_PROMPT,
                                message=user_msg,
                                format=format_schema,
                                stream=False)

    logger.info(f"Extractor response: {response}")
    
    raw = response.get("content", "")

    logger.info(f"Extractor raw response: {raw}")

    try:
        data = json.loads(raw)

        new_symptoms = [Symptom(**item) for item in data.get("symptoms", [])]
        
        new_history = [MedicalHistory(**item) for item in data.get("past_medical_history", [])]
        
        logger.info(f"new_symptoms: {new_symptoms}")
        logger.info(f"new_history: {new_history}")

        sampler = SamplerState(
            symptoms=sampler.symptoms + new_symptoms,
            past_medical_history=sampler.past_medical_history + new_history,
            allergies=sampler.allergies + data.get("allergies", []),
            medication=sampler.medication + data.get("medication", []),
            last=sampler.last + data.get("last", []),
            events=sampler.events + data.get("events", []),
            risk_factors=sampler.risk_factors + data.get("risk_factors", []),
        )
    except Exception:
        logger.exception("Extractor JSON parse failed.")
        data = {}

    

    return {
        "sampler_data": sampler,
    }

async def navigation_node(state: AgentState) -> AgentState:
    """
    Navigation node.
    - Called when user asks for navigation help.
    - Never writes to messages
    """
    logger.info("Navigation Node Invoked")

    message_list = [
        "Please refer to the navigation tab for more info",
        "You can find directions and information in the navigation section",
        "For help with navigation, please check the navigation resources provided",
        "The navigation section has all the details you need",
    ]

    return {
        "navigation_message": random.choice(message_list),
    }

async def offtopic_node(state: AgentState) -> AgentState:
    """
    Off-topic node.
    - Called when user asks for off-topic help.
    - Never writes to messages
    """
    logger.info("Off-topic Node Invoked")

    message_list = [
        "I'm here to help with medical and navigation questions. Let's focus on that!",
        "Let's keep our conversation centered around medical or navigation topics.",
        "I'm designed to assist with medical and navigation inquiries. How can I help you in those areas?",
        "Please direct your questions towards medical or navigation topics for assistance.",
    ]

    return {
        "offtopic_message": random.choice(message_list),
    }

async def refiner_node(state: AgentState) -> AgentState:
    logger.info("Refinement Node Invoked")
    
    current_sampler = state.get("sampler_data", SamplerState())

    raw_data_str = current_sampler.model_dump_json()

    REFINER_SYSTEM_PROMPT = """
    You are a Clinical Documentation Integrity Specialist. 
    Your goal is to clean, deduplicate, and refine raw medical data collected by a chatbot.

    INSTRUCTIONS:
    1. SYMPTOMS: 
       - Merge duplicate symptoms (e.g. if two concerns have an equivalent symptom location)
       - Combine details (e.g. if one entry is a location of concern and another gives a description related to the prevoius, merge them).
       - Remove entries that are effectively empty.

    2. PAST MEDICAL HISTORY: 
       - Remove entries that are just negations (e.g., Condition="No", Condition="None"). 
       - If the user said "No blood clotting issues", do NOT list "Blood Clotting" as a condition.
       - Fix vague entries (e.g., if Condition="injury" and it refers to the current symptom, remove it from History).

    3. MEDICATION:
       - Deduplicate (e.g., "ibuprofen" + "medicine" -> just "ibuprofen").
       - Remove generic terms if specific ones exist.

    4. GENERAL:
       - Fix capitalization (sentence case).
       - Remove empty strings or nulls from lists.
    
    Extract ONLY information explicitly stated in the given data.
        Do NOT infer, guess, or add new medical facts.
        If nothing relevant is present, return empty lists.

        symptoms: Symptoms that the user is currently experiencing.
            - description: What is the symptom?
            - location: Where is it?
            - severity: How bad is it / descriptive adjectives?
            - duration: How long has it been going on?
            - pain_level: Integer 1-10 (if applicable).
        allergies: Allergies the user has mentioned, for example peanuts, pollen, dust mites, medication allergys etc.
        medication: Current medications the user is taking, for example aspirin, ibuprofen, etc.
        past_medical_history: Past medical history or pre-existing conditions the user has mentioned, for example diabetes, hypertension, asthma, etc.
            - condition: The name of the condition.
            - since: Date or duration since diagnosis.
            - medication: Medication specifically for this condition.
            - notes: Any extra details.
        last: Last meal, drink, medication, etc. the user has recently taken or if a procedure was recently done.
        events: The events leading up to the incident or current situation the user is describing due to which they are seeking medical advice.
        risk_factors: Risk factors mentioned by the user, for example smoking, family history, genetic disorders, age, lifestyle etc.
    
    Return a valid JSON object matching the exact schema of the input.
    """

    format_schema = {
        "type": "object",
        "properties": {
            "symptoms": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "description": {"type": "string"},
                        "location": {"type": "string"},
                        "severity": {"type": "string"},
                        "duration": {"type": "string"},
                        "pain_level": {"type": ["integer", "null"]},
                    },
                    "required": ["description"]
                }
            },
            "past_medical_history": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "condition": {"type": "string"},
                        "since": {"type": "string"},
                        "medication": {"type": "string"},
                        "notes": {"type": "string"},
                    },
                    "required": ["condition"]
                }
            },
            "allergies": {"type": "array", "items": {"type": "string"}},
            "medication": {"type": "array", "items": {"type": "string"}},
            "last": {"type": "array", "items": {"type": "string"}},
            "events": {"type": "array", "items": {"type": "string"}},
            "risk_factors": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["symptoms", "past_medical_history", "allergies", "medication", "last", "events", "risk_factors"],
    }

    response = await llm.invoke(
        prompt=REFINER_SYSTEM_PROMPT,
        message="Please refine the medical data below:\n" + raw_data_str, 
        format=format_schema,
        stream=False
    )

    raw = response.get("content", "")
    logger.info(f"Refiner response: {raw}")

    try:
        data = json.loads(raw)
        
        cleaned_symptoms = [Symptom(**item) for item in data.get("symptoms", [])]
        cleaned_history = [MedicalHistory(**item) for item in data.get("past_medical_history", [])]

        refined_sampler = SamplerState(
            symptoms=cleaned_symptoms,
            past_medical_history=cleaned_history,
            allergies=data.get("allergies", []),
            medication=data.get("medication", []),
            last=data.get("last", []),
            events=data.get("events", []),
            risk_factors=data.get("risk_factors", []),
        )

        return {"sampler_data": refined_sampler}

    except Exception:
        logger.exception("Refiner JSON parse failed. Returning original state.")
        
    return {"sampler_data": current_sampler}


# Backwards compatibility
async def interviewer_node(state: AgentState):
    return await companion_node(state)
