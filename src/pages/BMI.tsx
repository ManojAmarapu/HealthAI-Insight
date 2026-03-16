import { useState, useEffect } from "react";
import { Calculator, RotateCcw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isGeminiAvailable, getGeminiModel } from "@/services/geminiClient";

interface BMIResult {
  bmi: number;
  category: string;
  color: string;
  description: string;
  tips: string[];
}

function calculateBMI(weight: number, height: number, isMetric: boolean): BMIResult {
  const bmi = isMetric
    ? weight / ((height / 100) ** 2)
    : (703 * weight) / (height ** 2);

  const rounded = Math.round(bmi * 10) / 10;

  if (bmi < 18.5) return {
    bmi: rounded, category: "Underweight", color: "text-blue-500",
    description: "Your BMI is below the healthy range.",
    tips: ["Eat calorie-dense nutritious foods", "Consider strength training to build muscle", "Consult a doctor if you're losing weight unintentionally", "Eat more frequent, smaller meals throughout the day"]
  };
  if (bmi < 25) return {
    bmi: rounded, category: "Normal weight", color: "text-green-500",
    description: "Great! Your BMI is within the healthy range.",
    tips: ["Maintain your current healthy habits", "Exercise 150 min/week for optimal health", "Eat a balanced diet with vegetables, protein & whole grains", "Stay hydrated — aim for 8 glasses of water daily"]
  };
  if (bmi < 30) return {
    bmi: rounded, category: "Overweight", color: "text-yellow-500",
    description: "Your BMI is slightly above the healthy range.",
    tips: ["Aim for 30 min of moderate exercise daily", "Reduce processed foods and added sugars", "Try portion control — use smaller plates", "Consider speaking with a nutritionist"]
  };
  return {
    bmi: rounded, category: "Obese", color: "text-red-500",
    description: "Your BMI is significantly above the healthy range.",
    tips: ["Consult your doctor before starting any weight loss program", "Start with low-impact exercise like walking or swimming", "Focus on sustainable diet changes, not crash diets", "Consider professional support from a dietitian or health coach"]
  };
}

// ── Gemini personalized BMI tips ──────────────────────────────────
async function fetchGeminiTips(bmi: number, category: string, unit: string): Promise<string[]> {
  const prompt = `A user has a BMI of ${bmi} (${unit} units), which puts them in the "${category}" category.
Give exactly 4 personalized, actionable health tips for someone in this BMI category.
Return ONLY a JSON array of 4 strings, no markdown, no extra text.
Example: ["Tip 1", "Tip 2", "Tip 3", "Tip 4"]`;
  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim().replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const tips = JSON.parse(raw) as string[];
    if (Array.isArray(tips) && tips.length > 0) return tips;
  } catch { /* fall through to static tips */ }
  return [];
}

function BMIGauge({ bmi }: { bmi: number }) {
  const clampedBMI = Math.min(Math.max(bmi, 10), 45);
  const percent = ((clampedBMI - 10) / 35) * 100;
  const categories = [
    { label: "Under", end: 18.5, color: "#3B82F6" },
    { label: "Normal", end: 25, color: "#10B981" },
    { label: "Overweight", end: 30, color: "#F59E0B" },
    { label: "Obese", end: 45, color: "#EF4444" },
  ];

  return (
    <div className="space-y-2">
      <div className="relative h-4 rounded-full overflow-hidden flex">
        {categories.map((cat, i) => {
          const start = i === 0 ? 10 : categories[i - 1].end;
          const w = ((cat.end - start) / 35) * 100;
          return <div key={i} style={{ width: `${w}%`, backgroundColor: cat.color }} />;
        })}
        {/* Pointer */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-foreground rounded-full shadow-lg transition-all duration-700"
          style={{ left: `calc(${percent}% - 2px)` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
        <span>Underweight</span><span>Normal</span><span>Overweight</span><span>Obese</span>
      </div>
    </div>
  );
}

const BMI = () => {
  const [isMetric, setIsMetric] = useState(true);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [result, setResult] = useState<BMIResult | null>(null);
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [tipsLoading, setTipsLoading] = useState(false);
  const geminiOn = isGeminiAvailable();

  // Fetch Gemini tips when result changes
  useEffect(() => {
    if (!result || !geminiOn) return;
    setTipsLoading(true);
    setAiTips([]);
    fetchGeminiTips(result.bmi, result.category, isMetric ? "metric" : "imperial")
      .then(tips => { if (tips.length > 0) setAiTips(tips); })
      .finally(() => setTipsLoading(false));
  }, [result]);

  const handleCalculate = () => {
    const w = parseFloat(weight), h = parseFloat(height);
    if (!w || !h || w <= 0 || h <= 0) return;
    setResult(calculateBMI(w, h, isMetric));
  };

  const handleReset = () => {
    setWeight(""); setHeight(""); setResult(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">BMI Calculator</h1>
        <p className="text-muted-foreground text-sm">Calculate your Body Mass Index and get personalized health tips.</p>
      </div>

      <Card className="shadow-soft border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Calculator className="w-5 h-5 text-primary" /> Calculate Your BMI
          </CardTitle>
          <CardDescription>Enter your height and weight below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Unit toggle */}
          <div className="flex gap-2">
            {["Metric (kg/cm)", "Imperial (lbs/in)"].map((label, i) => (
              <button key={i} onClick={() => { setIsMetric(i === 0); setResult(null); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isMetric === (i === 0) ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}>
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Weight ({isMetric ? "kg" : "lbs"})</Label>
              <Input type="number" placeholder={isMetric ? "70" : "154"} value={weight}
                onChange={(e) => setWeight(e.target.value)} min={1} />
            </div>
            <div className="space-y-2">
              <Label>Height ({isMetric ? "cm" : "inches"})</Label>
              <Input type="number" placeholder={isMetric ? "170" : "67"} value={height}
                onChange={(e) => setHeight(e.target.value)} min={1} />
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleCalculate} className="flex-1 bg-primary hover:bg-primary/90">
              Calculate BMI
            </Button>
            {result && (
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <RotateCcw className="w-4 h-4" /> Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className="shadow-soft border-border">
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-foreground mb-2">{result.bmi}</div>
              <Badge className={`text-sm px-4 py-1 ${
                result.category === 'Normal weight' ? 'bg-green-500 text-white' :
                result.category === 'Underweight' ? 'bg-blue-500 text-white' :
                result.category === 'Overweight' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
              }`}>{result.category}</Badge>
              <p className="text-muted-foreground text-sm mt-3">{result.description}</p>
            </div>

            <BMIGauge bmi={result.bmi} />

            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                {geminiOn ? <Zap className="w-4 h-4 text-primary" /> : "💡"}
                {geminiOn ? "AI Personalized Tips" : "Personalized Tips"}
                {tipsLoading && <span className="text-xs text-muted-foreground font-normal">(Generating...)</span>}
              </h4>
              <ul className="space-y-2">
                {(aiTips.length > 0 ? aiTips : result.tips).map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-foreground">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-muted-foreground border-t border-border pt-4">
              Note: BMI is a screening tool, not a diagnostic measure. It doesn't account for muscle mass, bone density, or body composition. Consult a healthcare provider for a comprehensive health assessment.
            </p>
          </CardContent>
        </Card>
      )}

      {/* BMI Reference Table */}
      <Card className="shadow-soft border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-base">BMI Reference Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {[
              { range: "Below 18.5", category: "Underweight", color: "bg-blue-500" },
              { range: "18.5 – 24.9", category: "Normal weight ✓", color: "bg-green-500" },
              { range: "25.0 – 29.9", category: "Overweight", color: "bg-yellow-500" },
              { range: "30.0 and above", category: "Obese", color: "bg-red-500" },
            ].map((row) => (
              <div key={row.range} className="flex items-center justify-between py-2.5">
                <span className="text-sm font-medium text-foreground">{row.range}</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${row.color}`} />
                  <span className="text-sm text-muted-foreground">{row.category}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BMI;
