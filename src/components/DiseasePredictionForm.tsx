import { useState, useRef, useEffect } from "react";
import { Search, AlertCircle, CheckCircle, X, Zap, RotateCcw, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { analyzeSymptomsAI, PredictionResult } from "@/services/symptomEngine";
import { severityStyles } from "@/constants/severityLevels";
import { isGeminiAvailable } from "@/services/geminiClient";
import { moderateInput } from "@/utils/contentModeration";

// ── Confidence arc gauge ──────────────────────────────────────────
function ConfidenceRing({ value }: { value: number }) {
  const r = 28, cx = 36, cy = 36, stroke = 6;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 75 ? '#10B981' : value >= 50 ? '#F59E0B' : '#EF4444';
  return (
    <div className="flex flex-col items-center">
      <svg width={cx * 2} height={cy * 2}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor"
          strokeWidth={stroke} className="text-muted/30" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color}
          strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize="13" fontWeight="bold" fill={color}>
          {value}%
        </text>
      </svg>
      <span className="text-[10px] text-muted-foreground">confidence</span>
    </div>
  );
}

// ── Condition prevalence lookup ───────────────────────────────────
const PREVALENCE: Record<string, string> = {
  'Common Cold': 'Very common — ~1 billion cases per year worldwide',
  'Influenza': 'Common — affects ~10% of the global population annually',
  'Migraine': 'Common — affects ~15% of people worldwide',
  'Hypertension': 'Very common — affects 1 in 3 adults globally',
  'Diabetes': 'Common — 422 million people have it worldwide',
  'Anxiety Disorder': 'Common — affects ~284 million people worldwide',
  'Gastroenteritis': 'Very common — billions of cases per year',
  'Allergic Rhinitis': 'Common — affects ~400 million people globally',
  'Asthma': 'Common — affects ~262 million people worldwide',
  'COVID-19': 'Highly variable — depends on current local outbreak',
};
const getPrevalence = (disease: string): string | null => {
  const key = Object.keys(PREVALENCE).find(k =>
    disease.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(disease.toLowerCase().split(' ')[0])
  );
  return key ? PREVALENCE[key] : null;
};

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

  const handleReset = () => {
    setFormData({ age: '', gender: '', symptoms: [], duration: '', severity: '' });
    setPrediction(null);
  };
  const handlePredict = async () => {
    const ageNum = parseInt(formData.age);
    if (!formData.age || isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      toast.warning("Please provide a valid age", { description: "Enter a number between 0 and 120." });
      return;
    }
    if (!formData.gender) {
      toast.warning("Please select a gender", { description: "Gender is required for accurate predictions." });
      return;
    }
    if (formData.symptoms.length === 0) {
      toast.warning("Please select at least one symptom", { description: "Select the symptoms you are experiencing to get a prediction." });
      return;
    }

    // Check for inappropriate content in any free text (duration/severity)
    const allText = [formData.duration, formData.severity].filter(Boolean).join(' ');
    if (allText && moderateInput(allText).status === 'inappropriate') {
      toast.error("Inappropriate content detected", {
        description: "HealthAI can only assist with health-related information.",
        duration: 5000,
      });
      return;
    }

    // BUG-08: Clear the old prediction immediately when starting a new one
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
    // Only allow empty string or valid integers between 0 and 120
    if (val === '' || (/^\d+$/.test(val) && Number(val) >= 0 && Number(val) <= 120)) {
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
                min="0"
                max="120"
                step="1"
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
          <CardContent className="space-y-4" id="prediction-result">
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">{prediction.disease}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={severityStyles[prediction.severity]}>
                    {prediction.severity.toUpperCase()}
                  </Badge>
                </div>
                {getPrevalence(prediction.disease) && (
                  <p className="text-xs text-muted-foreground mt-2">
                    📊 {getPrevalence(prediction.disease)}
                  </p>
                )}
              </div>
              <ConfidenceRing value={prediction.probability} />
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

            {/* Print & Reset actions */}
            <div className="pt-2 border-t border-border flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="flex-1 gap-2 text-muted-foreground hover:text-foreground"
              >
                <Printer className="w-4 h-4" /> Save / Print
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1 gap-2 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-4 h-4" />
                New Prediction
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}