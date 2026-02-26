import { SeverityLevel } from "@/constants/severityLevels";

export interface PredictionResult {
    disease: string;
    probability: number;
    reasoning: string;
    severity: SeverityLevel;
    recommendations: string[];
}

export const analyzeSymptoms = (symptoms: string[], age: number, gender: string): PredictionResult => {
    const symptomSet = new Set(symptoms.map(s => s.toLowerCase()));

    // Simple rule-based prediction logic
    if (symptomSet.has('fever') && symptomSet.has('cough') && symptomSet.has('sore throat')) {
        return {
            disease: 'Common Cold/Flu',
            probability: 85,
            reasoning: 'The combination of fever, cough, and sore throat are classic symptoms of viral upper respiratory infections.',
            severity: 'medium',
            recommendations: [
                'Get plenty of rest and stay hydrated',
                'Use throat lozenges for sore throat relief',
                'Monitor temperature and seek medical care if fever exceeds 103°F',
                'Consider over-the-counter pain relievers as needed'
            ]
        };
    }

    if (symptomSet.has('headache') && symptomSet.has('nausea') && symptomSet.has('dizziness')) {
        return {
            disease: 'Migraine',
            probability: 75,
            reasoning: 'Headache combined with nausea and dizziness suggests a possible migraine episode.',
            severity: 'medium',
            recommendations: [
                'Rest in a dark, quiet room',
                'Apply cold compress to forehead',
                'Stay hydrated and avoid known triggers',
                'Consider consulting a neurologist if episodes are frequent'
            ]
        };
    }

    if (symptomSet.has('abdominal pain') && symptomSet.has('nausea') && symptomSet.has('vomiting')) {
        return {
            disease: 'Gastroenteritis',
            probability: 80,
            reasoning: 'Abdominal pain with nausea and vomiting indicates possible gastroenteritis or stomach flu.',
            severity: 'medium',
            recommendations: [
                'Stay hydrated with clear fluids',
                'Follow the BRAT diet (Bananas, Rice, Applesauce, Toast)',
                'Avoid dairy and fatty foods temporarily',
                'Seek medical attention if symptoms persist beyond 48 hours'
            ]
        };
    }

    if (symptomSet.has('chest pain') && symptomSet.has('shortness of breath')) {
        return {
            disease: 'Possible Cardiac/Respiratory Issue',
            probability: 70,
            reasoning: 'Chest pain with shortness of breath requires immediate medical evaluation to rule out serious conditions.',
            severity: 'high',
            recommendations: [
                'SEEK IMMEDIATE MEDICAL ATTENTION',
                'Call emergency services if symptoms are severe',
                'Do not drive yourself to the hospital',
                'Have someone accompany you to medical facility'
            ]
        };
    }

    // Default prediction for other symptom combinations
    return {
        disease: 'General Viral Infection',
        probability: 60,
        reasoning: 'Based on the symptoms provided, this appears to be a mild viral infection or general malaise.',
        severity: 'low',
        recommendations: [
            'Get adequate rest and sleep',
            'Stay well hydrated',
            'Monitor symptoms for any changes',
            'Consult healthcare provider if symptoms worsen or persist'
        ]
    };
};
