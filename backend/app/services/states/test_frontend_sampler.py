# test_frontend_sampler.py

from services.states.sampler_state import SamplerState
from services.states.sampler_state import Symptom as MidSymptom
from services.states.frontend_sampler import convert_mid_to_frontend_sampler, FrontendSampler


def main():
    # ---- build a tiny mid-sampler example ----
    mid = SamplerState(
        symptoms=[
            MidSymptom(
                description="leg pain",
                location="lower leg",
                severity="strong",
                duration="2 hours",
                pain_level="7",
            )
        ],
        past_medical_history=[
            {
                "condition": "diabetes",
                "since": "2015",
                "medication": "metformin",
                "notes": "well controlled",
            }
        ],
        allergies=["penicillin"],
        medication=["ibuprofen"],
        last=["coffee"],
        events=["fell off motorcycle"],
        risk_factors=["smoking"],
    )

    # ---- convert ----
    frontend = convert_mid_to_frontend_sampler(mid)

    # ---- type check (the actual test) ----
    assert isinstance(frontend, FrontendSampler), (
        f"Expected FrontendSampler, got {type(frontend)}"
    )

    # ---- inspect result ----
    print("\n=== FRONTEND SAMPLER (FrontendSampler) ===")
    print(frontend.model_dump_json(by_alias=True, indent=2))


if __name__ == "__main__":
    main()
