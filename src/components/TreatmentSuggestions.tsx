import { useState } from "react";
import { Stethoscope, Heart, AlertTriangle, Info, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Treatment {
  category: string;
  steps: string[];
  precautions: string[];
  whenToSeekHelp: string[];
}

interface TreatmentData {
  [key: string]: Treatment;
}

export function TreatmentSuggestions() {
  const [userInput, setUserInput] = useState<string>("");
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const treatmentData: TreatmentData = {
    "common-cold": {
      category: "Respiratory",
      steps: [
        "Get plenty of rest (7-9 hours of sleep)",
        "Stay hydrated with warm liquids (tea, soup, water)",
        "Use a humidifier or breathe steam from hot shower",
        "Gargle with warm salt water (1/2 tsp salt in 8 oz water)",
        "Consider throat lozenges for sore throat relief",
        "Use saline nasal spray or rinse for congestion"
      ],
      precautions: [
        "Do not use antibiotics (colds are viral infections)",
        "Avoid alcohol and smoking",
        "Don't share personal items like tissues or cups",
        "Wash hands frequently to prevent spread"
      ],
      whenToSeekHelp: [
        "Fever above 101.3°F (38.5°C) for more than 3 days",
        "Symptoms worsen after initial improvement",
        "Severe headache or sinus pain",
        "Difficulty breathing or wheezing",
        "Symptoms persist longer than 10 days"
      ]
    },
    "headache": {
      category: "Neurological",
      steps: [
        "Rest in a quiet, dark room",
        "Apply cold compress to forehead or warm compress to neck",
        "Stay hydrated - drink plenty of water",
        "Practice relaxation techniques or deep breathing",
        "Consider over-the-counter pain relievers (acetaminophen, ibuprofen)",
        "Massage temples and neck gently"
      ],
      precautions: [
        "Don't exceed recommended dosage of pain medications",
        "Avoid known triggers (certain foods, stress, lack of sleep)",
        "Don't take pain medications more than 2-3 times per week",
        "Avoid alcohol when experiencing headaches"
      ],
      whenToSeekHelp: [
        "Sudden, severe headache unlike any before",
        "Headache with fever, stiff neck, confusion",
        "Headache after head injury",
        "Progressive worsening over days or weeks",
        "Headache with vision changes or weakness"
      ]
    },
    "fever": {
      category: "General",
      steps: [
        "Rest and avoid strenuous activities",
        "Stay hydrated with water, clear broths, or electrolyte drinks",
        "Use light clothing and keep room temperature cool",
        "Take lukewarm baths or use damp cloths on forehead",
        "Consider fever reducers like acetaminophen or ibuprofen",
        "Monitor temperature regularly"
      ],
      precautions: [
        "Don't use alcohol rubs for cooling",
        "Avoid aspirin in children under 18",
        "Don't bundle up if you feel cold from fever",
        "Don't ignore accompanying symptoms"
      ],
      whenToSeekHelp: [
        "Temperature above 103°F (39.4°C)",
        "Fever lasting more than 3 days",
        "Severe symptoms like difficulty breathing",
        "Signs of dehydration",
        "Fever in infants under 3 months"
      ]
    },
    "stomach-upset": {
      category: "Gastrointestinal",
      steps: [
        "Follow BRAT diet (Bananas, Rice, Applesauce, Toast)",
        "Stay hydrated with small, frequent sips of clear fluids",
        "Try ginger tea or ginger candies for nausea",
        "Avoid dairy, fatty, and spicy foods temporarily",
        "Rest and avoid physical exertion",
        "Consider probiotics to restore gut balance"
      ],
      precautions: [
        "Avoid anti-diarrheal medications initially",
        "Don't eat solid foods if vomiting",
        "Avoid carbonated or caffeinated drinks",
        "Don't consume alcohol or tobacco"
      ],
      whenToSeekHelp: [
        "Severe dehydration signs (dizziness, dry mouth)",
        "Blood in vomit or stool",
        "High fever with stomach symptoms",
        "Severe abdominal pain",
        "Symptoms persist more than 48 hours"
      ]
    },
    "minor-cuts": {
      category: "First Aid",
      steps: [
        "Wash hands thoroughly before treating wound",
        "Apply gentle pressure with clean cloth to stop bleeding",
        "Clean the wound with water (avoid hydrogen peroxide)",
        "Apply antibiotic ointment if available",
        "Cover with sterile bandage or adhesive bandage",
        "Change dressing daily and keep wound dry"
      ],
      precautions: [
        "Don't use dirty materials on wound",
        "Avoid removing embedded objects",
        "Don't ignore signs of infection",
        "Avoid picking at scabs"
      ],
      whenToSeekHelp: [
        "Deep cuts that won't stop bleeding",
        "Signs of infection (redness, warmth, pus)",
        "Cuts on joints or that affect movement",
        "Animal or human bites",
        "Tetanus shot needed (last shot >5 years ago)"
      ]
    }
  };

  const generateTreatment = () => {
    if (!userInput.trim()) return;
    
    setIsLoading(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      // Simple keyword matching to provide relevant treatment
      const input = userInput.toLowerCase();
      let matchedTreatment = null;
      let category = "General";
      
      if (input.includes("cold") || input.includes("flu") || input.includes("cough") || input.includes("congestion")) {
        matchedTreatment = treatmentData["common-cold"];
      } else if (input.includes("headache") || input.includes("migraine") || input.includes("head pain")) {
        matchedTreatment = treatmentData["headache"];
      } else if (input.includes("fever") || input.includes("temperature") || input.includes("hot")) {
        matchedTreatment = treatmentData["fever"];
      } else if (input.includes("stomach") || input.includes("nausea") || input.includes("vomit") || input.includes("digestive")) {
        matchedTreatment = treatmentData["stomach-upset"];
      } else if (input.includes("cut") || input.includes("wound") || input.includes("bleeding") || input.includes("injury")) {
        matchedTreatment = treatmentData["minor-cuts"];
      } else {
        // Generate a general treatment response
        matchedTreatment = {
          category: "General",
          steps: [
            "Rest and avoid strenuous activities",
            "Stay hydrated with plenty of water",
            "Monitor symptoms and note any changes",
            "Apply ice or heat as appropriate for the condition",
            "Consider over-the-counter medications if needed",
            "Maintain good hygiene and hand washing"
          ],
          precautions: [
            "Don't ignore worsening symptoms",
            "Avoid self-medicating with strong medications",
            "Don't exceed recommended dosages",
            "Avoid activities that might worsen the condition"
          ],
          whenToSeekHelp: [
            "Symptoms worsen or don't improve in 24-48 hours",
            "Development of severe pain or discomfort",
            "Signs of infection or complications",
            "Difficulty breathing or swallowing",
            "Any concerning or unusual symptoms"
          ]
        };
      }
      
      setSelectedTreatment(matchedTreatment);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-soft border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Stethoscope className="w-5 h-5 text-primary" />
            Treatment Suggestions
          </CardTitle>
          <CardDescription>
            Select a condition to get first-aid and treatment recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Describe Your Symptoms or Condition</label>
              <Textarea
                placeholder="Tell me what you're feeling... (e.g., 'I have a headache and feel nauseous', 'I cut my finger while cooking', 'I have a fever and sore throat')"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="min-h-[100px] border-border focus:ring-primary resize-none"
              />
            </div>
            <Button 
              onClick={generateTreatment}
              disabled={!userInput.trim() || isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Analyzing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Get Treatment Suggestions
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedTreatment && (
        <Card className="shadow-soft border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-foreground">
                Treatment Recommendations
              </span>
              <Badge variant="outline" className="border-primary text-primary">
                {selectedTreatment.category}
              </Badge>
            </CardTitle>
            <CardDescription>
              Based on your symptoms: "{userInput}"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="treatment" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted">
                <TabsTrigger value="treatment" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Treatment Steps
                </TabsTrigger>
                <TabsTrigger value="precautions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Precautions
                </TabsTrigger>
                <TabsTrigger value="help" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  When to Seek Help
                </TabsTrigger>
              </TabsList>

              <TabsContent value="treatment" className="mt-6">
                <Card className="border-success/20 bg-success/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-success text-lg">
                      <Heart className="w-5 h-5" />
                      Recommended Treatment Steps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-3">
                      {selectedTreatment.steps.map((step, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center text-success-foreground text-sm font-semibold flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <span className="text-foreground text-sm leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="precautions" className="mt-6">
                <Card className="border-warning/20 bg-warning/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-warning text-lg">
                      <AlertTriangle className="w-5 h-5" />
                      Important Precautions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {selectedTreatment.precautions.map((precaution, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0" />
                          <span className="text-foreground text-sm leading-relaxed">{precaution}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="help" className="mt-6">
                <Card className="border-destructive/20 bg-destructive/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive text-lg">
                      <Info className="w-5 h-5" />
                      When to Seek Medical Help
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {selectedTreatment.whenToSeekHelp.map((warning, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0" />
                          <span className="text-foreground text-sm leading-relaxed font-medium">{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-6 p-4 bg-info/10 border border-info/20 rounded-lg">
              <p className="text-info text-sm font-medium flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                These suggestions are for general guidance only and should not replace professional medical advice. 
                Always consult with healthcare professionals for serious or persistent symptoms.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}