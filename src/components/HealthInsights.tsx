import { useState } from "react";
import { TrendingUp, Activity, Heart, Brain, BarChart3, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SimpleBarChart, SimpleLineChart, SimplePieChart } from "./SimpleCharts";

export function HealthInsights() {
  const [userInput, setUserInput] = useState<string>("");
  const [customInsights, setCustomInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Sample data for charts
  const commonConditionsData = [
    { name: 'Common Cold', cases: 45, color: '#3B82F6' },
    { name: 'Headache', cases: 32, color: '#10B981' },
    { name: 'Fever', cases: 28, color: '#F59E0B' },
    { name: 'Stomach Issues', cases: 18, color: '#EF4444' },
    { name: 'Minor Injuries', cases: 12, color: '#8B5CF6' }
  ];

  const monthlyTrendsData = [
    { month: 'Jan', consultations: 120 },
    { month: 'Feb', consultations: 98 },
    { month: 'Mar', consultations: 156 },
    { month: 'Apr', consultations: 134 },
    { month: 'May', consultations: 145 },
    { month: 'Jun', consultations: 167 }
  ];

  const ageGroupData = [
    { group: '0-18', percentage: 25 },
    { group: '19-35', percentage: 35 },
    { group: '36-50', percentage: 25 },
    { group: '51+', percentage: 15 }
  ];

  const healthMetrics = [
    {
      title: "Total Consultations",
      value: "1,248",
      change: "+12.5%",
      trend: "up",
      icon: Activity,
      color: "text-primary"
    },
    {
      title: "Resolved Cases",
      value: "1,156",
      change: "+8.2%",
      trend: "up",
      icon: Heart,
      color: "text-success"
    },
    {
      title: "Avg Response Time",
      value: "2.3 min",
      change: "-15.3%",
      trend: "down",
      icon: Brain,
      color: "text-info"
    },
    {
      title: "User Satisfaction",
      value: "94.7%",
      change: "+2.1%",
      trend: "up",
      icon: TrendingUp,
      color: "text-accent"
    }
  ];

  const generateInsights = () => {
    if (!userInput.trim()) return;
    
    setIsLoading(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const input = userInput.toLowerCase();
      let insights = {
        userQuery: userInput,
        recommendations: [],
        riskFactors: [],
        preventiveMeasures: [],
        lifestyle: []
      };
      
      if (input.includes("heart") || input.includes("cardiac") || input.includes("chest")) {
        insights = {
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
        insights = {
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
        insights = {
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
      
      setCustomInsights(insights);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-soft border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="w-5 h-5 text-primary" />
            Health Insights Dashboard
          </CardTitle>
          <CardDescription>
            Get personalized health insights and analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tell me about your health concerns or goals</label>
              <Textarea
                placeholder="Describe your health situation... (e.g., 'I want to improve my heart health', 'I'm at risk for diabetes', 'I want general wellness advice')"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="min-h-[80px] border-border focus:ring-primary resize-none"
              />
            </div>
            <Button 
              onClick={generateInsights}
              disabled={!userInput.trim() || isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Generating Insights...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Generate Health Insights
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {customInsights && (
        <div className="space-y-6">
          <Card className="shadow-soft border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Personalized Health Insights</CardTitle>
              <CardDescription>Based on: "{customInsights.userQuery}"</CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recommendations */}
            <Card className="shadow-soft border-border bg-gradient-to-br from-success/5 to-success/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <Heart className="w-5 h-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {customInsights.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0" />
                      <span className="text-foreground">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Risk Factors */}
            <Card className="shadow-soft border-border bg-gradient-to-br from-warning/5 to-warning/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warning">
                  <AlertTriangle className="w-5 h-5" />
                  Risk Factors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {customInsights.riskFactors.map((risk: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0" />
                      <span className="text-foreground">{risk}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Preventive Measures */}
            <Card className="shadow-soft border-border bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Brain className="w-5 h-5" />
                  Preventive Measures
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {customInsights.preventiveMeasures.map((measure: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-foreground">{measure}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Lifestyle Changes */}
            <Card className="shadow-soft border-border bg-gradient-to-br from-accent/5 to-accent/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent">
                  <Activity className="w-5 h-5" />
                  Lifestyle Changes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {customInsights.lifestyle.map((lifestyle: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                      <span className="text-foreground">{lifestyle}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {healthMetrics.map((metric, index) => (
          <Card key={index} className="shadow-soft border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{metric.value}</p>
                  <div className="flex items-center mt-2">
                    <Badge 
                      variant={metric.trend === 'up' ? 'default' : 'secondary'}
                      className={`text-xs ${
                        metric.trend === 'up' 
                          ? 'bg-success/10 text-success border-success/20' 
                          : 'bg-info/10 text-info border-info/20'
                      }`}
                    >
                      {metric.change}
                    </Badge>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-primary shadow-medical`}>
                  <metric.icon className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Common Conditions */}
        <Card className="shadow-soft border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Most Common Conditions</CardTitle>
            <CardDescription>Distribution of health consultations by condition type</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={commonConditionsData} />
          </CardContent>
        </Card>

        {/* Age Group Distribution */}
        <Card className="shadow-soft border-border">
          <CardHeader>
            <CardTitle className="text-foreground">User Age Distribution</CardTitle>
            <CardDescription>Breakdown of users by age groups</CardDescription>
          </CardHeader>
          <CardContent>
            <SimplePieChart data={ageGroupData} />
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card className="shadow-soft border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Monthly Consultation Trends</CardTitle>
          <CardDescription>Number of health consultations over the past 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <SimpleLineChart data={monthlyTrendsData} />
        </CardContent>
      </Card>

      {/* Health Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="shadow-soft border-border bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-2">💧 Hydration Reminder</h3>
            <p className="text-sm text-muted-foreground">
              Drink at least 8 glasses of water daily to maintain optimal health and energy levels.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-border bg-gradient-to-br from-success/5 to-success/10">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-2">🚶 Daily Exercise</h3>
            <p className="text-sm text-muted-foreground">
              30 minutes of moderate exercise daily can significantly improve your overall health.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-border bg-gradient-to-br from-accent/5 to-accent/10">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-2">😴 Quality Sleep</h3>
            <p className="text-sm text-muted-foreground">
              Aim for 7-9 hours of quality sleep each night for better immune function and mental health.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}