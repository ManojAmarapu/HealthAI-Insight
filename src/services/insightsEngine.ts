export interface HealthInsightsData {
    userQuery: string;
    recommendations: string[];
    riskFactors: string[];
    preventiveMeasures: string[];
    lifestyle: string[];
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
    } else if (input.includes("diabetes") || input.includes("blood sugar") || input.includes("glucose")) {
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
    } else {
        // General health insights
        return {
            userQuery: userInput,
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
    }
};
