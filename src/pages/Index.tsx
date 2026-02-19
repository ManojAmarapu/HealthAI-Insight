import { ChatInterface } from "@/components/ChatInterface";
import heroImage from "@/assets/medical-hero.jpg";

const Index = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl shadow-medical">
        <div 
          className="h-64 bg-cover bg-center bg-gradient-medical flex items-center justify-center"
          style={{ backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.8), rgba(16, 185, 129, 0.8)), url(${heroImage})` }}
        >
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to HealthAI
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto">
              Your intelligent healthcare companion for medical guidance and health insights
            </p>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Start Your Health Consultation</h2>
          <p className="text-muted-foreground">
            Ask me about symptoms, get health advice, or explore our prediction and treatment tools.
          </p>
        </div>
        <ChatInterface />
      </div>
    </div>
  );
};

export default Index;
