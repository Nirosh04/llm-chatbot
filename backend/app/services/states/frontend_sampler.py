import re
from typing import List
from pydantic import BaseModel, ConfigDict, Field
from services.states.sampler_state import SamplerState
## this file contains:
# the structure of frontend sampler.
# a function to convert mid-sampler to frontend-sampler



# ---------------------------------------------------------------------
# Model - frontend sampler
# ---------------------------------------------------------------------

class Symptom(BaseModel):
    description: str = ""
    location: str = ""
    severity: str = ""
    duration: str = ""
    pain: int = 0


class MedicalCondition(BaseModel):
    condition: str     # condition begins always with a prefix from CONDITION_TYPE_VALUES
    since: str = ""
    medication: str = ""
    notes: str = ""

class HistoryOfPresentIllness(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    key_symptoms: List[Symptom] = Field(alias="keySymptoms")

class MedicalHistory(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    conditions: List[MedicalCondition]

class FrontendSampler(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    history_of_present_illness: HistoryOfPresentIllness = Field(
        alias="historyOfPresentIllness"
    )
    medical_history: MedicalHistory = Field(
        alias="medicalHistory"
    )




def _safe_int_pain(val: any) -> int:
    """Safely convert pain level (likely a string from LLM) to int 1-10."""
    if val is None:
        return 0
    if isinstance(val, int):
        return val
    
    s = str(val).strip().lower()
    if not s or s in {"na", "n/a", "none", "unknown", "null"}:
        return 0
        
    # Try to find a digit in strings like "7/10" or "Grade 7"
    match = re.search(r"(\d+)", s)
    if match:
        try:
            return int(match.group(1))
        except ValueError:
            return 0
    return 0

def convert_mid_to_frontend_sampler(mid_sampler: SamplerState | dict) -> FrontendSampler:
    """
    Converts a SamplerState object (or dict representation) to a FrontendSampler object.
    Symptoms go to Historyofpresentillness
    Past medical history goes to MedicalHistory
    Allergies go to MedicalHistory
    Medication goes to MedicalHistory
    Last goes to MedicalHistory
    Events goes to MedicalHistory
    Risk factors goes to MedicalHistory
    """
    # Normalize input to a dict-like access pattern
    def get_attr(obj, attr, default=None):
        if hasattr(obj, attr):
            return getattr(obj, attr)
        if isinstance(obj, dict):
            return obj.get(attr, default)
        return default

    # 1) Symptoms -> HPI
    hpi_symptoms: List[Symptom] = []
    raw_symptoms = get_attr(mid_sampler, "symptoms", []) or []
    
    for s in raw_symptoms:
        hpi_symptoms.append(
            Symptom(
                description=get_attr(s, "description", "") or "",
                location=get_attr(s, "location", "") or "",
                severity="", # user asked to ignore for now
                duration=get_attr(s, "duration", "") or "",
                pain=_safe_int_pain(get_attr(s, "pain_level", 0)),
            )
        )

    hpi = HistoryOfPresentIllness(keySymptoms=hpi_symptoms)

    # 2) Everything else -> MedicalHistory.conditions
    conditions: List[MedicalCondition] = []

    # ---- Past diagnoses ----
    raw_pmh = get_attr(mid_sampler, "past_medical_history", []) or []
    for item in raw_pmh:
        cond = get_attr(item, "condition", "")
        if not cond:
            # Maybe it's just a string in the list?
            if isinstance(item, str) and item.strip():
                cond = item.strip()
            else:
                continue

        since = get_attr(item, "since", "")
        medication = get_attr(item, "medication", "")
        notes = get_attr(item, "notes", "")

        conditions.append(
            MedicalCondition(
                condition=f"Past diagnoses: {cond}",
                since=str(since or ""),
                medication=str(medication or ""),
                notes=str(notes or ""),
            )
        )

    # ---- Simple list fields get prefixed + flattened ----
    def _add_prefixed(items: list, prefix: str) -> None:
        for x in (items or []):
            text = str(x).strip()
            if not text:
                continue
            conditions.append(
                MedicalCondition(
                    condition=f"{prefix}{text}",
                    since="",
                    medication="",
                    notes="",
                )
            )

    _add_prefixed(get_attr(mid_sampler, "allergies", []), "Allergy: ")
    _add_prefixed(get_attr(mid_sampler, "medication", []), "Medication: ")
    _add_prefixed(get_attr(mid_sampler, "last", []), "Last: ")
    _add_prefixed(get_attr(mid_sampler, "events", []), "Event: ")
    _add_prefixed(get_attr(mid_sampler, "risk_factors", []), "Risk factor: ")

    med_hist = MedicalHistory(conditions=conditions)

    return FrontendSampler(
        historyOfPresentIllness=hpi,
        medicalHistory=med_hist,
    )
