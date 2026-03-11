export interface HealthInsightsData {
    userQuery: string;
    recommendations: string[];
    riskFactors: string[];
    preventiveMeasures: string[];
    lifestyle: string[];
    // BUG-10: Track whether the insight is personalized or generic
    isGeneric?: boolean;
}

export const generateCustomInsights = (userInput: string): HealthInsightsData => {
    const input = userInput.toLowerCase();

    if (input.includes("heart") || input.includes("cardiac") || input.includes("chest")) {
        return {
            userQuery: userInput,
            recommendations: [
                "Monitor blood pressure regularly",
                "Maintain a heart-healthy diet low in sodium",
                "Exercise for 30 minutes daily",
                "Limit alcohol consumption",
                "Quit smoking if applicable"
            ],
            riskFactors: [
                "High cholesterol",
                "High blood pressure",
                "Sedentary lifestyle",
                "Smoking",
                "Family history"
            ],
            preventiveMeasures: [
                "Regular cardiovascular checkups",
                "Stress management techniques",
                "Mediterranean diet",
                "Adequate sleep (7-9 hours)"
            ],
            lifestyle: [
                "Walk 10,000 steps daily",
                "Practice deep breathing",
                "Stay hydrated",
                "Limit processed foods"
            ]
        };
    }

    if (input.includes("diabetes") || input.includes("blood sugar") || input.includes("glucose") || input.includes("insulin")) {
        return {
            userQuery: userInput,
            recommendations: [
                "Monitor blood glucose levels regularly",
                "Follow a balanced, low-carb diet",
                "Exercise regularly to improve insulin sensitivity",
                "Take medications as prescribed",
                "Maintain a healthy weight"
            ],
            riskFactors: [
                "Obesity",
                "Family history of diabetes",
                "Sedentary lifestyle",
                "High blood pressure",
                "Age over 45"
            ],
            preventiveMeasures: [
                "Regular HbA1c testing",
                "Annual eye exams",
                "Foot care routine",
                "Blood pressure monitoring"
            ],
            lifestyle: [
                "Meal planning and portion control",
                "Regular sleep schedule",
                "Stress reduction activities",
                "Stay hydrated with water"
            ]
        };
    }

    // BUG-10: Added more specific categories before falling through to generic
    if (input.includes("sleep") || input.includes("insomnia") || input.includes("fatigue") || input.includes("tired")) {
        return {
            userQuery: userInput,
            recommendations: [
                "Maintain a consistent sleep schedule (same wake time daily)",
                "Create a relaxing bedtime routine",
                "Limit caffeine after 2 PM",
                "Avoid screens 1 hour before bed",
                "Keep bedroom cool, dark, and quiet"
            ],
            riskFactors: [
                "Irregular sleep schedule",
                "High stress or anxiety",
                "Excessive caffeine or alcohol",
                "Screen time before bed",
                "Underlying sleep disorders"
            ],
            preventiveMeasures: [
                "Sleep hygiene education",
                "Cognitive Behavioral Therapy for insomnia (CBT-I)",
                "Regular physical activity (not close to bedtime)",
                "Stress management practices"
            ],
            lifestyle: [
                "Practice relaxation techniques before bed",
                "Use blue-light-blocking glasses in the evening",
                "Spend time outdoors in natural light",
                "Avoid naps longer than 20 minutes"
            ]
        };
    }

    if (input.includes("weight") || input.includes("obesity") || input.includes("diet") || input.includes("nutrition")) {
        return {
            userQuery: userInput,
            recommendations: [
                "Aim for gradual weight loss (0.5–1 kg per week)",
                "Increase vegetables and fibre-rich foods",
                "Reduce ultra-processed food and sugary drinks",
                "Practice mindful eating",
                "Consult a registered dietitian for a personalised plan"
            ],
            riskFactors: [
                "High-calorie, low-nutrient diet",
                "Sedentary lifestyle",
                "Hormonal imbalances",
                "Emotional or stress eating",
                "Genetic factors"
            ],
            preventiveMeasures: [
                "Regular health weight-ins",
                "Tracking food intake with an app",
                "Annual metabolic panel tests",
                "Setting realistic, sustainable goals"
            ],
            lifestyle: [
                "Cook more meals at home",
                "Choose stairs over lifts when possible",
                "Eat slowly and without distractions",
                "Plan meals ahead to avoid impulse eating"
            ]
        };
    }

    if (input.includes("mental") || input.includes("anxiety") || input.includes("stress") || input.includes("depression") || input.includes("mood")) {
        return {
            userQuery: userInput,
            recommendations: [
                "Speak with a licensed mental health professional",
                "Practice mindfulness or meditation daily",
                "Maintain social connections with trusted people",
                "Establish a consistent daily routine",
                "Limit news and social media consumption"
            ],
            riskFactors: [
                "Chronic stress",
                "Social isolation",
                "Poor sleep",
                "Lack of physical activity",
                "Unhealthy coping mechanisms"
            ],
            preventiveMeasures: [
                "Regular therapy or counselling sessions",
                "Stress-reduction techniques (yoga, breathing)",
                "Annual mental health check-ins",
                "Building a strong support network"
            ],
            lifestyle: [
                "Exercise 30 minutes most days",
                "Journal thoughts and feelings daily",
                "Spend time in nature",
                "Prioritise sleep and recovery"
            ]
        };
    }

    // BUG-10: Generic fallback now clearly marked and message updated in the UI
    return {
        userQuery: userInput,
        isGeneric: true,
        recommendations: [
            "Maintain a balanced diet with fruits and vegetables",
            "Exercise regularly for overall fitness",
            "Get adequate sleep (7-9 hours nightly)",
            "Stay hydrated throughout the day",
            "Schedule regular health checkups"
        ],
        riskFactors: [
            "Sedentary lifestyle",
            "Poor diet habits",
            "Chronic stress",
            "Lack of sleep",
            "Smoking or excessive alcohol"
        ],
        preventiveMeasures: [
            "Annual health screenings",
            "Vaccination updates",
            "Mental health check-ins",
            "Preventive dental care"
        ],
        lifestyle: [
            "Practice mindfulness or meditation",
            "Social connections and support",
            "Limit screen time before bed",
            "Spend time outdoors daily"
        ]
    };
};
