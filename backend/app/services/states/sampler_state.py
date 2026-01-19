from pydantic import BaseModel, Field

class SamplerState(BaseModel):
    symptoms: list[str] = Field(default=[], description="Signs and symptoms")
    allergies: list[str] = Field(default=[], description="Allergies")
    medication: list[str] = Field(default=[], description="Current medications")
    past_medical_history: list[str] = Field(default=[], description="Past medical history/Pre-existing conditions")
    last: list[str] = Field(default=[], description="Last meal, drink, medication, etc.")
    events: list[str] = Field(default=[], description="Events leading up to the incident")
    risk_factors: list[str] = Field(default=[], description="Risk factors (smoking, family history, etc.)")