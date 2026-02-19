import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm HealthAI, your personal healthcare assistant. I can help you with health questions, symptoms analysis, and general medical information. How can I assist you today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('headache') || lowerMessage.includes('head')) {
      return "For headaches, I recommend: 1) Stay hydrated - drink plenty of water, 2) Get adequate rest in a quiet, dark room, 3) Apply a cold or warm compress, 4) Consider over-the-counter pain relievers like acetaminophen or ibuprofen. If headaches persist or worsen, please consult a healthcare professional.";
    }
    
    if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
      return "For fever management: 1) Stay hydrated with water, clear broths, or electrolyte solutions, 2) Rest is crucial for recovery, 3) Use light clothing and keep room cool, 4) Consider fever reducers like acetaminophen or ibuprofen if needed. Seek medical attention if fever exceeds 103°F (39.4°C) or persists for more than 3 days.";
    }
    
    if (lowerMessage.includes('cold') || lowerMessage.includes('cough') || lowerMessage.includes('sneezing')) {
      return "For cold symptoms: 1) Get plenty of rest to help your immune system fight the virus, 2) Stay hydrated with warm liquids like tea or soup, 3) Use a humidifier or breathe steam from hot shower, 4) Gargle with salt water for sore throat. Most colds resolve within 7-10 days. See a doctor if symptoms worsen or last longer than 2 weeks.";
    }
    
    if (lowerMessage.includes('stomach') || lowerMessage.includes('nausea') || lowerMessage.includes('digestive')) {
      return "For digestive issues: 1) Try the BRAT diet (Bananas, Rice, Applesauce, Toast), 2) Stay hydrated with small, frequent sips of water, 3) Avoid dairy, fatty, or spicy foods temporarily, 4) Consider ginger tea for nausea. If symptoms persist beyond 24-48 hours or you have severe pain, please consult a healthcare provider.";
    }
    
    if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia')) {
      return "For better sleep: 1) Maintain a consistent sleep schedule, 2) Create a relaxing bedtime routine, 3) Keep your bedroom cool, dark, and quiet, 4) Avoid screens 1 hour before bed, 5) Limit caffeine after 2 PM. If sleep problems persist, consider consulting a sleep specialist.";
    }
    
    return "Thank you for your question. While I can provide general health information, it's important to remember that I'm an AI assistant and cannot replace professional medical advice. For specific symptoms or concerns, please consult with a qualified healthcare professional. Is there anything else about general health and wellness I can help you with?";
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        text: generateAIResponse(inputMessage),
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <Card className="flex-1 mb-4 border-border shadow-soft">
        <ScrollArea ref={scrollAreaRef} className="h-[500px] p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'ai' && (
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center shadow-medical flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg p-3 shadow-soft ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p className={`text-xs mt-2 opacity-70 ${
                    message.sender === 'user' ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                
                {message.sender === 'user' && (
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center shadow-soft flex-shrink-0">
                    <User className="w-4 h-4 text-accent-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center shadow-medical flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="bg-card border border-border rounded-lg p-3 shadow-soft">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Message Input */}
      <Card className="p-4 border-border shadow-soft">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your health concerns..."
            className="flex-1 border-border focus:ring-primary"
            disabled={isTyping}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={isTyping || !inputMessage.trim()}
            className="bg-gradient-primary hover:shadow-glow transition-spring shadow-medical px-6"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}