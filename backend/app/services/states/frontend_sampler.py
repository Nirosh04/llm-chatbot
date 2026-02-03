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

class HealthSummary(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    history_of_present_illness: HistoryOfPresentIllness = Field(
        alias="historyOfPresentIllness"
    )
    medical_history: MedicalHistory = Field(
        alias="medicalHistory"
    )




def convert_mid_to_frontend_sampler(mid_sampler: SamplerState) -> HealthSummary:
    """
    Converts a SamplerState object to a HealthSummary object.
    Symptoms go to HIstoryofpresentillness
    Past medical history goes to MedicalHistory
    Allergies go to MedicalHistory
    Medication goes to MedicalHistory
    Last goes to MedicalHistory
    Events goes to MedicalHistory
    Risk factors goes to MedicalHistory

    When adding smth to MedicalHistory, add a prefix for the key "conditions", that incorporates more info.
    Example:
    Past medical history: ['diabetes'] -> ['Past diagnoses: diabetes'] and with more info
    Allergies: ['penicillin'] -> ['Allergies: penicillin']
    Medication: ['ibuprofen'] -> ['Medication: ibuprofen']
    Last: ['ibuprofen'] -> ['Last: ibuprofen']
    Events: ['ibuprofen'] -> ['Event: ibuprofen']
    Risk factors: ['ibuprofen'] -> ['Risk factor: ibuprofen']
    """
    # 1) Symptoms -> HPI
    hpi_symptoms: List[Symptom] = []
    for s in (mid_sampler.symptoms or []):
        hpi_symptoms.append(
            Symptom(
                description=getattr(s, "description", "") or "",
                location=getattr(s, "location", "") or "",
                # severity=getattr(s, "severity", "") or "",
                duration=getattr(s, "duration", "") or "",
                pain=int(getattr(s, "pain_level", 0) or 0),
            )
        )

    hpi = HistoryOfPresentIllness(keySymptoms=hpi_symptoms)

    # 2) Everything else -> MedicalHistory.conditions
    conditions: List[MedicalCondition] = []

    # ---- Past diagnoses (special handling: keep structure if present) ----
    for item in (mid_sampler.past_medical_history or []):
        # structured object? (has attribute "condition" or dict key "condition")
        if hasattr(item, "condition") or (isinstance(item, dict) and "condition" in item):
            cond = item.condition if hasattr(item, "condition") else str(item.get("condition", "")).strip()
            if not cond:
                continue

            since = item.since if hasattr(item, "since") else item.get("since", "")
            medication = item.medication if hasattr(item, "medication") else item.get("medication", "")
            notes = item.notes if hasattr(item, "notes") else item.get("notes", "")

            conditions.append(
                MedicalCondition(
                    condition=f"Past diagnoses: {cond}",
                    since=str(since or ""),
                    medication=str(medication or ""),
                    notes=str(notes or ""),
                )
            )
        else:
            # fallback: treat as string
            text = str(item).strip()
            if not text:
                continue
            conditions.append(
                MedicalCondition(
                    condition=f"Past diagnoses: {text}",
                    since="",
                    medication="",
                    notes="",
                )
            )

    # ---- Simple list fields get prefixed + flattened ----
    def _add_prefixed(items: list[str], prefix: str) -> None:
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

    _add_prefixed(mid_sampler.allergies, "Allergy: ")
    _add_prefixed(mid_sampler.medication, "Medication: ")
    _add_prefixed(mid_sampler.last, "Last: ")
    _add_prefixed(mid_sampler.events, "Event: ")
    _add_prefixed(mid_sampler.risk_factors, "Risk factor: ")

    med_hist = MedicalHistory(conditions=conditions)

    return HealthSummary(
        historyOfPresentIllness=hpi,
        medicalHistory=med_hist,
    )
