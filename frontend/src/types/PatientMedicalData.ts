export interface Symptom {
  description: string;
  location: string;
  severity: string;
  duration: string;
  pain: number;
}

export interface MedicalCondition {
  condition: string;
  since: string;
  notes: string;
}

export interface HealthSummary {
  historyOfPresentIllness: {
    keySymptoms: Symptom[];
  };
  medicalHistory: {
    conditions: MedicalCondition[];
  };
}