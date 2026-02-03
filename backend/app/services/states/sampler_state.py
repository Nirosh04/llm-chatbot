from pydantic import BaseModel, Field, field_validator

class Symptom(BaseModel):
    description: str = Field(default_factory=str, description="The main symptom, e.g. 'Headache'")
    location: str | None = Field(default_factory=str, description="Where is it located?")
    severity: str | None = Field(default_factory=str, description="Mild, severe, throbbing, etc.")
    duration: str | None = Field(default_factory=str, description="How long has it lasted?")
    pain_level: str | None = Field(default_factory=str, description="Pain scale 1-10")

class MedicalHistory(BaseModel):
    condition: str = Field(default_factory=str, description="The condition name, e.g. 'Diabetes'")
    since: str | None = Field(default_factory=str, description="When was it diagnosed or how long?")
    medication: str | None = Field(default_factory=str, description="Medication taken specifically for this condition")
    notes: str | None = Field(default_factory=str, description="Any extra context")

class SamplerState(BaseModel):
    symptoms: list[Symptom] = Field(default_factory=list, description="Signs and symptoms")
    past_medical_history: list[MedicalHistory] = Field(default_factory=list, description="Past medical history")
    allergies: list[str] = Field(default_factory=list, description="Allergies")
    medication: list[str] = Field(default_factory=list, description="Current medications")
    last: list[str] = Field(default_factory=list, description="Last meal, drink, medication, etc.")
    events: list[str] = Field(default_factory=list, description="Events leading up to the incident")
    risk_factors: list[str] = Field(default_factory=list, description="Risk factors (smoking, family history, etc.)")

    @field_validator(
        "allergies",
        "medication",
        "last",
        "events",
        "risk_factors",
        mode="before",
    )
    @classmethod
    def _normalize_list_fields(cls, v):
        """Normalize list fields and drop common placeholder values like 'na'/'n/a'/'none'."""
        if v is None:
            return []
        if isinstance(v, str):
            v = [v]
        if not isinstance(v, list):
            return []

        cleaned: list[str] = []
        for item in v:
            if item is None:
                continue
            s = str(item).strip()
            if not s:
                continue
            low = s.lower()
            if low in {"na", "n/a", "none", "null", "unknown", "-"}:
                continue
            cleaned.append(s)
        return cleaned