import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { getAIResponse, generateAIResponse, ChatMessage } from "@/services/chatEngine";
import { isGeminiAvailable } from "@/services/geminiClient";

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
      text: "Hello! I'm HealthAI, your personal healthcare assistant powered by Google Gemini AI. I can help you with health questions, symptoms analysis, medication guidance, and general medical information. How can I assist you today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  // Gemini conversation history (parallel to messages state)
  const conversationHistoryRef = useRef<ChatMessage[]>([]);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => { isMountedRef.current = false; };
  }, []);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const viewport =
        scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') ||
        scrollAreaRef.current.querySelector('[data-slot="scroll-area-viewport"]') ||
        scrollAreaRef.current;
      viewport.scrollTop = viewport.scrollHeight;
    }
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSendMessage = useCallback(async () => {
    // BUG-07: Capture current input synchronously before any state updates
    const currentMessage = inputMessage;
    
    if (!currentMessage.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now(),
      text: currentMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    // Add to Gemini history
    conversationHistoryRef.current.push({
      role: "user",
      parts: [{ text: currentMessage }]
    });

    try {
      // Call Gemini with full conversation history (or fallback if no key)
      const responseText = await getAIResponse(currentMessage, conversationHistoryRef.current.slice(0, -1));

      if (!isMountedRef.current) return;

      const aiMsg: Message = {
        id: Date.now() + 1,
        text: responseText,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);

      // Add AI response to history for next turn
      conversationHistoryRef.current.push({
        role: "model",
        parts: [{ text: responseText }]
      });

      // Keep history to last 20 turns to avoid token limits
      if (conversationHistoryRef.current.length > 20) {
        conversationHistoryRef.current = conversationHistoryRef.current.slice(-20);
      }
    } catch {
      if (!isMountedRef.current) return;
      // Ultimate fallback if even the fallback throws
      const fallbackText = generateAIResponse(currentMessage);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: fallbackText,
        sender: 'ai',
        timestamp: new Date()
      }]);
    } finally {
      if (isMountedRef.current) setIsTyping(false);
    }
  }, [inputMessage, isTyping]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const geminiActive = isGeminiAvailable();

  return (
    <div className="flex flex-col h-full">
      {/* AI Status Badge */}
      <div className="flex justify-end mb-2">
        {geminiActive ? (
          <Badge className="bg-green-500 text-white gap-1 text-xs">
            <Zap className="w-3 h-3" /> Gemini AI Active
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs text-muted-foreground gap-1">
            <Zap className="w-3 h-3" /> Add API key to enable AI
          </Badge>
        )}
      </div>

      {/* Chat Messages */}
      <Card className="flex-1 mb-4 border-border shadow-soft">
        <ScrollArea ref={scrollAreaRef} className="h-[360px] sm:h-[440px] md:h-[500px] p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'ai' && (
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center shadow-medical flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-lg p-3 shadow-soft ${message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border'}`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  <p className={`text-xs mt-2 opacity-70 ${message.sender === 'user' ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
            onKeyDown={handleKeyDown}
            placeholder={geminiActive ? "Ask me anything about your health..." : "Ask me about your health concerns..."}
            className="flex-1 border-border focus:ring-primary"
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isTyping || !inputMessage.trim()}
            className="bg-gradient-primary hover:shadow-glow transition-spring shadow-medical px-6 min-h-[44px]"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}