import { SeverityLevel } from "@/constants/severityLevels";

export interface PredictionResult {
    disease: string;
    probability: number;
    reasoning: string;
    severity: SeverityLevel;
    recommendations: string[];
}

// BUG-11: Age and gender are now integrated into the prediction logic
export const analyzeSymptoms = (symptoms: string[], age: number, gender: string): PredictionResult => {
    const symptomSet = new Set(symptoms.map(s => s.toLowerCase()));
    const isElderly = age >= 65;
    const isChild = age <= 12;

    // Chest pain + shortness of breath — elevated risk for elderly
    if (symptomSet.has('chest pain') && symptomSet.has('shortness of breath')) {
        return {
            disease: 'Possible Cardiac/Respiratory Issue',
            probability: isElderly ? 85 : 70,
            reasoning: `Chest pain with shortness of breath requires immediate medical evaluation to rule out serious conditions.${isElderly ? ' The risk is elevated given your age group.' : ''}`,
            severity: 'high',
            recommendations: [
                'SEEK IMMEDIATE MEDICAL ATTENTION',
                'Call emergency services if symptoms are severe',
                'Do not drive yourself to the hospital',
                'Have someone accompany you to medical facility'
            ]
        };
    }

    // Fever + cough + sore throat
    if (symptomSet.has('fever') && symptomSet.has('cough') && symptomSet.has('sore throat')) {
        // Children with fever are managed differently
        const childNote = isChild ? ' For children, always consult a paediatrician before giving any medication.' : '';
        return {
            disease: 'Common Cold/Flu',
            probability: 85,
            reasoning: `The combination of fever, cough, and sore throat are classic symptoms of viral upper respiratory infections.${childNote}`,
            severity: isChild ? 'medium' : 'medium',
            recommendations: [
                'Get plenty of rest and stay hydrated',
                'Use throat lozenges for sore throat relief',
                `Monitor temperature and seek medical care if fever exceeds ${isChild ? '100.4°F (38°C)' : '103°F (39.4°C)'}`,
                isChild
                    ? 'Do NOT give aspirin to children — use paediatric acetaminophen as directed'
                    : 'Consider over-the-counter pain relievers as needed'
            ]
        };
    }

    // Headache + nausea + dizziness
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

    // Abdominal pain + nausea + vomiting
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

    // Default — age/gender-aware suggestion
    const elderlyNote = isElderly ? ' At your age, it is important to see a doctor sooner rather than later to rule out underlying conditions.' : '';
    const genderNote = gender === 'female'
        ? ' Some symptoms in women can present differently from typical presentations; please consult a doctor if symptoms persist.'
        : '';

    return {
        disease: 'General Viral Infection',
        probability: 60,
        reasoning: `Based on the symptoms provided, this appears to be a mild viral infection or general malaise.${elderlyNote}${genderNote}`,
        severity: isElderly ? 'medium' : 'low',
        recommendations: [
            'Get adequate rest and sleep',
            'Stay well hydrated',
            'Monitor symptoms for any changes',
            isElderly
                ? 'Consult your healthcare provider promptly if symptoms do not improve within 24 hours'
                : 'Consult healthcare provider if symptoms worsen or persist'
        ]
    };
};
