from pydantic import BaseModel, Field

class SamplerState(BaseModel):
    symptoms: str = Field(default="", description="Signs and symptoms")
    allergies: str = Field(default="", description="Allergies")
    medication: str = Field(default="", description="Current medications")
    past_medical_history: str = Field(default="", description="Past medical history/Pre-existing conditions")
    last: str = Field(default="", description="Last meal, drink, medication, etc.")
    events: str = Field(default="", description="Events leading up to the incident")
    risk_factors: str = Field(default="", description="Risk factors (smoking, family history, etc.)")