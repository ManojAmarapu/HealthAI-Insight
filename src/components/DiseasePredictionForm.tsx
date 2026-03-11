import { useState, useRef, useEffect } from "react";
import { Search, AlertCircle, CheckCircle, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { analyzeSymptomsAI, PredictionResult } from "@/services/symptomEngine";
import { severityStyles } from "@/constants/severityLevels";
import { isGeminiAvailable } from "@/services/geminiClient";

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
  const isMountedRef = useRef(true);

  const commonSymptoms = [
    'Fever', 'Headache', 'Cough', 'Sore throat', 'Body aches',
    'Nausea', 'Vomiting', 'Diarrhea', 'Fatigue', 'Dizziness',
    'Shortness of breath', 'Chest pain', 'Abdominal pain', 'Skin rash'
  ];

  const geminiActive = isGeminiAvailable();

  useEffect(() => {
    return () => { isMountedRef.current = false; };
  }, []);

  const handleSymptomChange = (symptom: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      symptoms: checked
        ? [...prev.symptoms, symptom]
        : prev.symptoms.filter(s => s !== symptom)
    }));
  };

  const handleClearSymptoms = () => {
    setFormData(prev => ({ ...prev, symptoms: [] }));
  };

  const handlePredict = async () => {
    const ageNum = parseInt(formData.age);
    if (!formData.age || isNaN(ageNum) || ageNum < 0 || ageNum > 120) return;
    if (!formData.gender || formData.symptoms.length === 0) return;

    setPrediction(null);
    setIsLoading(true);

    try {
      // Auto-uses Gemini if key is configured, falls back to rule-based otherwise
      const result = await analyzeSymptomsAI(
        formData.symptoms,
        ageNum,
        formData.gender,
        formData.duration,
        formData.severity
      );
      if (isMountedRef.current) setPrediction(result);
    } catch {
      if (isMountedRef.current) setPrediction(null);
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || (Number(val) >= 0 && Number(val) <= 120)) {
      setFormData(prev => ({ ...prev, age: val }));
    }
  };

  const isFormValid =
    formData.age !== '' &&
    !isNaN(parseInt(formData.age)) &&
    parseInt(formData.age) >= 0 &&
    parseInt(formData.age) <= 120 &&
    !!formData.gender &&
    formData.symptoms.length > 0;

  return (
    <div className="space-y-6">
      <Card className="shadow-soft border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Search className="w-5 h-5 text-primary" />
            Disease Prediction Form
          </CardTitle>
          <CardDescription className="flex items-center justify-between flex-wrap gap-2">
            <span>Provide your symptoms and health information for AI-powered analysis</span>
            {geminiActive ? (
              <Badge className="bg-green-500 text-white gap-1 text-xs">
                <Zap className="w-3 h-3" /> Gemini AI
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-muted-foreground gap-1">
                <Zap className="w-3 h-3" /> Add API key for AI
              </Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age (0–120)</Label>
              <Input
                id="age"
                type="number"
                min={0}
                max={120}
                placeholder="Enter your age"
                value={formData.age}
                onChange={handleAgeChange}
                className="border-border focus:ring-primary"
              />
              {formData.age !== '' && (parseInt(formData.age) < 0 || parseInt(formData.age) > 120) && (
                <p className="text-xs text-destructive">Please enter a valid age between 0 and 120.</p>
              )}
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
            <div className="flex items-center justify-between">
              <Label>Select your symptoms</Label>
              {formData.symptoms.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSymptoms}
                  className="text-xs text-muted-foreground hover:text-destructive h-7 px-2 gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear All ({formData.symptoms.length})
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
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
            disabled={isLoading || !isFormValid}
            className="w-full bg-gradient-primary hover:shadow-glow transition-spring shadow-medical"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                {geminiActive ? "Analyzing with Gemini AI..." : "Analyzing..."}
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
            <div className="flex flex-wrap items-start gap-2">
              <h3 className="text-lg font-semibold text-foreground">{prediction.disease}</h3>
              <div className="flex items-center gap-2">
                <Badge className={severityStyles[prediction.severity]}>
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