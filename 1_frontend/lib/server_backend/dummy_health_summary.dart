/*
this is a dummy medical health summary from the ai.
In the final product the json is given by the python backend.

*/


final Map<String, dynamic> dummyMedicalData = {
  "demographics": {
    "name": "Sarah Johnson",
    "age": 32,
    "sex": "Female",
    "dateOfBirth": "1993-08-14",
    "occupation": "Graphic Designer"
  },
  "chiefComplaint": {
    "mainComplaint": "Persistent headaches",
    "duration": "3 weeks",
    "onset": "Gradual"
  },
  "historyOfPresentIllness": {
    "keySymptoms": [
      {
        "description": "Throbbing headache mainly in the temples",
        "location": "Bilateral temporal region",
        "severity": "6/10",
        "duration": "Intermittent episodes lasting 2–3 hours"
      }
    ],
    "aggravatingFactors": ["Stress", "Loud noises", "Bright screens"],
    "alleviatingFactors": ["Rest", "Ibuprofen", "Dark room"]
  },
  "relevantHistory": {
    "pastMedicalHistory": [
      "Seasonal allergies",
      "Mild anxiety"
    ],
    "medications": [
      "Cetirizine 10mg daily",
      "Ibuprofen as needed"
    ],
    "allergies": ["Penicillin"],
    "familyHistory": {
      "mother": "Migraines",
      "father": "Hypertension"
    },
    "socialHistory": {
      "smoking": "Never",
      "alcohol": "Occasional",
      "exercise": "3 times per week"
    }
  },
  "redFlags": {
    "present": false,
    "flags": [
      {
        "symptomDescription": "Sudden severe headache (thunderclap)",
        "present": false,
        "urgency": "High"
      }
    ],
    "notes": "No neurological deficits reported"
  }
};
