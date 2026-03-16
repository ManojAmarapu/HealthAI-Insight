import { useState } from "react";
import { User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Props { onComplete: () => void; }

export function WelcomeNameModal({ onComplete }: Props) {
  const [, setUserName] = useLocalStorage<string>("healthai_user_name", "");
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (name.trim()) setUserName(name.trim());
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <User className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground mb-2">What should I call you?</h2>
          <p className="text-muted-foreground text-sm">I'll use your name to personalize your experience. You can skip this.</p>
        </div>
        <Input
          autoFocus
          placeholder="Your name (e.g. Alex)"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 30))}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="text-center"
        />
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onComplete}>Skip</Button>
          <Button className="flex-1 gap-2" onClick={handleSubmit}>
            Continue <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
