import { useState } from "react";
import { Search, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface PredictionResult {
  disease: string;
  probability: number;
  reasoning: string;
  severity: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export function DiseasePredictionForm() {
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    symptoms: [] as string[],
    duration: '',
    severity: ''
  });
  
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const commonSymptoms = [
    'Fever', 'Headache', 'Cough', 'Sore throat', 'Body aches',
    'Nausea', 'Vomiting', 'Diarrhea', 'Fatigue', 'Dizziness',
    'Shortness of breath', 'Chest pain', 'Abdominal pain', 'Skin rash'
  ];

  const handleSymptomChange = (symptom: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      symptoms: checked
        ? [...prev.symptoms, symptom]
        : prev.symptoms.filter(s => s !== symptom)
    }));
  };

  const analyzeSymptoms = (symptoms: string[], age: number, gender: string): PredictionResult => {
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

  const handlePredict = async () => {
    if (!formData.age || !formData.gender || formData.symptoms.length === 0) {
      return;
    }

    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const result = analyzeSymptoms(formData.symptoms, parseInt(formData.age), formData.gender);
      setPrediction(result);
      setIsLoading(false);
    }, 1500);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-success text-success-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'high': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-soft border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Search className="w-5 h-5 text-primary" />
            Disease Prediction Form
          </CardTitle>
          <CardDescription>
            Please provide your information and symptoms for AI-powered health analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="Enter your age"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                className="border-border focus:ring-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                <SelectTrigger className="border-border focus:ring-primary">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Symptoms Selection */}
          <div className="space-y-3">
            <Label>Select your symptoms</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {commonSymptoms.map((symptom) => (
                <div key={symptom} className="flex items-center space-x-2">
                  <Checkbox
                    id={symptom}
                    checked={formData.symptoms.includes(symptom)}
                    onCheckedChange={(checked) => handleSymptomChange(symptom, checked as boolean)}
                    className="border-border data-[state=checked]:bg-primary"
                  />
                  <Label htmlFor={symptom} className="text-sm font-normal cursor-pointer">
                    {symptom}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Symptom Duration</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
                <SelectTrigger className="border-border focus:ring-primary">
                  <SelectValue placeholder="How long have you had symptoms?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-2 days">1-2 days</SelectItem>
                  <SelectItem value="3-7 days">3-7 days</SelectItem>
                  <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                  <SelectItem value="more than 2 weeks">More than 2 weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="severity">Symptom Severity</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}>
                <SelectTrigger className="border-border focus:ring-primary">
                  <SelectValue placeholder="Rate severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handlePredict}
            disabled={isLoading || !formData.age || !formData.gender || formData.symptoms.length === 0}
            className="w-full bg-gradient-primary hover:shadow-glow transition-spring shadow-medical"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Predict Disease
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Prediction Results */}
      {prediction && (
        <Card className="shadow-soft border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              {prediction.severity === 'high' ? (
                <AlertCircle className="w-5 h-5 text-destructive" />
              ) : (
                <CheckCircle className="w-5 h-5 text-success" />
              )}
              Prediction Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">{prediction.disease}</h3>
              <div className="flex items-center gap-2">
                <Badge className={getSeverityColor(prediction.severity)} variant="secondary">
                  {prediction.severity.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="border-primary text-primary">
                  {prediction.probability}% confidence
                </Badge>
              </div>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <h4 className="font-medium mb-2 text-foreground">Reasoning:</h4>
              <p className="text-muted-foreground text-sm">{prediction.reasoning}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 text-foreground">Recommendations:</h4>
              <ul className="space-y-2">
                {prediction.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-foreground">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {prediction.severity === 'high' && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive font-medium text-sm">
                  ⚠️ These symptoms may indicate a serious condition. Please seek immediate medical attention.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}