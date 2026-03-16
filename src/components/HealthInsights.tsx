import { useState, useMemo } from "react";
import { TrendingUp, Activity, Heart, Brain, BarChart3, AlertTriangle, Target, Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { SimpleBarChart, SimpleLineChart, SimplePieChart } from "./SimpleCharts";
import { useHealthInsights } from "@/hooks/useHealthInsights";
import { moderateHealthFormInput } from "@/utils/contentModeration";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// D1: Health score arc gauge
function HealthScoreRing({ score }: { score: number }) {
  const r = 44, cx = 56, cy = 56, stroke = 8;
  const circumference = Math.PI * r; // half circle
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#10B981' : score >= 45 ? '#F59E0B' : '#EF4444';
  const label = score >= 70 ? 'Good' : score >= 45 ? 'Fair' : 'Needs Attention';
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={cx * 2} height={cy + 20} viewBox={`0 0 ${cx * 2} ${cy + 20}`}>
        {/* Background arc */}
        <path d={`M ${stroke / 2} ${cy} A ${r} ${r} 0 0 1 ${cx * 2 - stroke / 2} ${cy}`}
          fill="none" stroke="currentColor" strokeWidth={stroke} className="text-muted/30"
          strokeLinecap="round" />
        {/* Filled arc */}
        <path d={`M ${stroke / 2} ${cy} A ${r} ${r} 0 0 1 ${cx * 2 - stroke / 2} ${cy}`}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="26" fontWeight="bold" fill={color}>
          {score}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="11" fill="currentColor" className="text-muted-foreground">
          / 100
        </text>
      </svg>
      <span className="text-xs font-semibold" style={{ color }}>{label}</span>
      <span className="text-[10px] text-muted-foreground">Health Score</span>
    </div>
  );
}

export function HealthInsights() {
  const [userInput, setUserInput] = useState<string>("");
  const [lastQueriedInput, setLastQueriedInput] = useState<string>("");
  const { data: customInsights, loading: isLoading, generateInsights } = useHealthInsights();

  // D2: Goal setting — persisted in localStorage
  const [savedGoal, setSavedGoal] = useLocalStorage<string>("healthai_health_goal", "");
  const [goalDone, setGoalDone] = useLocalStorage<boolean>("healthai_goal_done", false);
  const [goalInput, setGoalInput] = useState("");
  // Sample data for charts
  const commonConditionsData = useMemo(() => [
    { name: 'Common Cold', cases: 45, color: '#3B82F6' },
    { name: 'Headache', cases: 32, color: '#10B981' },
    { name: 'Fever', cases: 28, color: '#F59E0B' },
    { name: 'Stomach Issues', cases: 18, color: '#EF4444' },
    { name: 'Minor Injuries', cases: 12, color: '#8B5CF6' }
  ], []);

  const monthlyTrendsData = useMemo(() => [
    { month: 'Jan', consultations: 120 },
    { month: 'Feb', consultations: 98 },
    { month: 'Mar', consultations: 156 },
    { month: 'Apr', consultations: 134 },
    { month: 'May', consultations: 145 },
    { month: 'Jun', consultations: 167 }
  ], []);

  const ageGroupData = useMemo(() => [
    { group: '0-18', percentage: 25 },
    { group: '19-35', percentage: 35 },
    { group: '36-50', percentage: 25 },
    { group: '51+', percentage: 15 }
  ], []);

  const healthMetrics = useMemo(() => [
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
  ], []);

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
              onClick={() => {
                // BUG-18: Store the queried input so we can compare on next click
                const trimmed = userInput.trim();
                if (!trimmed) return;

                // Moderation: check for inappropriate or gibberish input
                const mod = moderateHealthFormInput(trimmed);
                if (mod.status === 'inappropriate') {
                  toast.error("Inappropriate content", {
                    description: "Please describe your health goals or concerns. HealthAI is a health assistant.",
                    duration: 5000,
                  });
                  return;
                }
                if (mod.status === 'gibberish') {
                  toast.warning("Please provide a meaningful input", {
                    description: "Describe your health situation, goals, or concerns clearly (e.g. 'I want to improve my heart health').",
                    duration: 5000,
                  });
                  return;
                }

                setLastQueriedInput(userInput);
                generateInsights(userInput);
              }}
                // BUG-18: Disable if loading, empty, or exactly matches last successful run
                disabled={!userInput.trim() || isLoading || (userInput.trim() === lastQueriedInput.trim() && customInsights !== null)}
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
            {/* UX-06: Hint when same query is blocked */}
            {userInput.trim() === lastQueriedInput.trim() && customInsights !== null && !isLoading && (
              <p className="text-xs text-muted-foreground text-center">
                ✓ Insights already generated for this query. Edit your input to run again.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {customInsights && (
        <div className="space-y-6">
          {/* D1: Health Score */}
          {customInsights.healthScore !== undefined && (
            <Card className="shadow-soft border-border">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <HealthScoreRing score={customInsights.healthScore} />
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-semibold text-foreground text-lg mb-1">Your Personal Health Score</h3>
                    <p className="text-sm text-muted-foreground">
                      Based on your health profile and the insights generated, this score reflects your current wellness relative to your concern.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 italic">Score is for guidance only — not a medical assessment.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <Card className="shadow-soft border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Personalized Health Insights</CardTitle>
              <CardDescription>
                {customInsights.isGeneric
                  ? <>General wellness insights — try mentioning a specific topic (e.g. "heart health", "diabetes", "sleep") for tailored advice.</>  
                  : <>Based on: "{customInsights.userQuery}"</>}
              </CardDescription>
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
                {isLoading ? (
                  <div className="space-y-2 py-2">
                    <Skeleton className="h-4 w-[90%]" />
                    <Skeleton className="h-4 w-[75%]" />
                    <Skeleton className="h-4 w-[85%]" />
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {customInsights.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0" />
                        <span className="text-foreground">{rec}</span>
                      </li>
                    ))}
                  </ul>
                )}
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
                {isLoading ? (
                  <div className="space-y-2 py-2">
                    <Skeleton className="h-4 w-[80%]" />
                    <Skeleton className="h-4 w-[60%]" />
                    <Skeleton className="h-4 w-[70%]" />
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {customInsights.riskFactors.map((risk: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0" />
                        <span className="text-foreground">{risk}</span>
                      </li>
                    ))}
                  </ul>
                )}
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
                {isLoading ? (
                  <div className="space-y-2 py-2">
                    <Skeleton className="h-4 w-[85%]" />
                    <Skeleton className="h-4 w-[75%]" />
                    <Skeleton className="h-4 w-[90%]" />
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {customInsights.preventiveMeasures.map((measure: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span className="text-foreground">{measure}</span>
                      </li>
                    ))}
                  </ul>
                )}
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
                {isLoading ? (
                  <div className="space-y-2 py-2">
                    <Skeleton className="h-4 w-[80%]" />
                    <Skeleton className="h-4 w-[85%]" />
                    <Skeleton className="h-4 w-[65%]" />
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {customInsights.lifestyle.map((lifestyle: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                        <span className="text-foreground">{lifestyle}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {healthMetrics.map((metric, index) => (
          <Card key={index} className="shadow-soft border-border">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{metric.value}</p>
                  <div className="flex items-center mt-2">
                    <Badge
                      // variant={metric.trend === 'up' ? 'default' : 'secondary'}
                      className={`text-xs ${metric.trend === 'up'
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
        {/* Section label */}
        <div className="lg:col-span-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Analytics Overview</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Sample data for illustration</span>
        </div>
        {/* Most Common Conditions */}
        <Card className="shadow-soft border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Most Common Conditions</CardTitle>
            <CardDescription>Distribution of health consultations by condition type</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="w-full h-[300px]" /> : <SimpleBarChart data={commonConditionsData} />}
          </CardContent>
        </Card>

        {/* Age Group Distribution */}
        <Card className="shadow-soft border-border">
          <CardHeader>
            <CardTitle className="text-foreground">User Age Distribution</CardTitle>
            <CardDescription>Breakdown of users by age groups</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="w-full h-[300px]" /> : <SimplePieChart data={ageGroupData} />}
          </CardContent>
        </Card>
      </div>

      {/* D2: Goal Setting */}
      <Card className="shadow-soft border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            My Health Goal
          </CardTitle>
          <CardDescription>Set one health goal and track it here — saved to your device.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {savedGoal ? (
            <div className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${goalDone ? 'bg-success/5 border-success/20' : 'bg-muted/40 border-border'}`}>
              <button onClick={() => setGoalDone(!goalDone)} className="flex-shrink-0">
                {goalDone
                  ? <Trophy className="w-6 h-6 text-yellow-500" />
                  : <Target className="w-6 h-6 text-primary" />}
              </button>
              <span className={`flex-1 font-medium text-sm ${goalDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {savedGoal}
              </span>
              <Button variant="ghost" size="sm" onClick={() => { setSavedGoal(""); setGoalDone(false); setGoalInput(""); }}
                className="text-xs text-muted-foreground h-7 px-2">
                Change
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Walk 30 minutes every day"
                value={goalInput}
                onChange={e => setGoalInput(e.target.value.slice(0, 100))}
                onKeyDown={e => { if (e.key === 'Enter' && goalInput.trim()) { setSavedGoal(goalInput.trim()); setGoalDone(false); }}}
              />
              <Button onClick={() => { if (goalInput.trim()) { setSavedGoal(goalInput.trim()); setGoalDone(false); }}}
                disabled={!goalInput.trim()} className="shrink-0">
                Save Goal
              </Button>
            </div>
          )}
          {goalDone && savedGoal && (
            <p className="text-xs text-success font-medium">🎉 Congratulations on achieving your goal!</p>
          )}
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card className="shadow-soft border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Monthly Consultation Trends</CardTitle>
          <CardDescription>Number of health consultations over the past 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="w-full h-[300px]" /> : <SimpleLineChart data={monthlyTrendsData} />}
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