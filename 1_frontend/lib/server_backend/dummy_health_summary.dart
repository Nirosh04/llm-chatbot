/*
this is a dummy medical health summary from the ai.
In the final product the json is given by the python backend.

*/

final Map<String, dynamic> dummyMedicalData = {
  "patient_demographics": {
    "name": "Sarah Johnson",
    "age": 32,
    "sex": "Female",
    "dateOfBirth": "1993-05-15"
  },
  "chief_complaint": {
    "main_complaint": "Sudden onset severe lower abdominal pain",
    "duration": "4 hours",
    "onset": "While watching TV"
  },
  "S_Symptoms_Pain": {
    "symptoms": [
      {
        "symptom_description": "Sharp, cramping pain",
        "location": "Lower right quadrant of abdomen",
        "quality": "Stabbing, intermittent, intense",
        "onset": "2025-11-25 17:00:00",
        "duration": "4 hours (waxing and waning)",
        "severity_scale_1_10": 9,
        "specific_notes": "Radiates slightly to the back. Accompanied by nausea and chills."
      },
      {
        "symptom_description": "Nausea",
        "location": "Stomach/generalized",
        "quality": "Queasy, waves",
        "onset": "2025-11-25 17:30:00",
        "duration": "3.5 hours",
        "severity_scale_1_10": 7,
        "specific_notes": "No vomiting reported."
      }
    ]
  },
  "A_Allergies": {
    "allergy_pass_available": false,
    "allergies": [
      {
        "substance": "Penicillin",
        "reaction_type": "Anaphylaxis (swelling, hives)",
        "reaction_severity": "Severe",
        "treatment_required": "Epinephrine (childhood)",
        "specific_notes": "Avoids all Beta-lactam antibiotics."
      }
    ]
  },
  "M_Medications": {
    "routine_medications": [
      {
        "name": "Levothyroxine",
        "dosage": "50 mcg",
        "frequency": "Once daily",
        "since_when_taken": "2020-01-01"
      },
      {
        "name": "Oral Contraceptive (Yaz)",
        "dosage": "1 tablet",
        "frequency": "Once daily",
        "since_when_taken": "2024-03-01"
      }
    ]
  },
  "P_Past_Medical_History": {
    "pre_existing_conditions": [
      {
        "condition_name": "Hypothyroidism",
        "notes": "Diagnosed 5 years ago, well controlled with medication."
      },
      {
        "condition_name": "Mild Asthma",
        "notes": "Childhood asthma, no exacerbations in over 10 years."
      }
    ],
    "surgical_history": [
      {
        "procedure_name": "Appendectomy",
        "notes": "Laproscopic removal, age 18 (2011)."
      }
    ],
    "implanted_devices": [
      {
        "device_name": "None",
        "notes": "No pacemakers, ports, or artificial joints."
      }
    ]
  },
  "L_Lasts": {
    "last_meal_time": "2025-11-25 19:00:00",
    "last_meal_content": "Light soup and toast (small amount)",
    "last_bowel_movement": "2025-11-25 09:00:00 (Normal)",
    "last_menstruation_lmp": "2025-11-01",
    "last_hospital_stay": "2015 (Fractured ankle)"
  },
  "E_Event": {
    "mechanism_of_injury": "N/A (Non-traumatic)",
    "contextual_circumstances": "Pain started suddenly while relaxing on the couch. No preceding activity, stress, or unusual food intake. Husband called emergency services."
  },
  "R_Risks": {
    "key_term": "Risks (Including Pregnancy)",
    "accompanying_risks": ["Possible ectopic pregnancy due to abdominal pain (despite oral contraception)"],
    "pregnancy_status": "Unknown / Not tested"
  },
  "red_flags": {
    "present": true,
    "flags": ["Acute, severe abdominal pain (Level 9/10)", "Nausea/Chills suggesting infection or acute process"]
  }
};