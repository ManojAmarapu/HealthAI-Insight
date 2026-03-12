import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Zap, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAIResponse, generateAIResponse, ChatMessage } from "@/services/chatEngine";
import { isGeminiAvailable } from "@/services/geminiClient";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const CHAR_LIMIT = 500;

const QUICK_PROMPTS = [
  "I have a fever and sore throat",
  "What are symptoms of diabetes?",
  "Tips for better sleep",
  "How to manage stress naturally",
];

const WELCOME_MESSAGE: Message = {
  id: 1,
  text: "Hello! I'm HealthAI, your personal healthcare assistant powered by Google Gemini AI. I can help you with health questions, symptoms analysis, medication guidance, and general medical information. How can I assist you today?",
  sender: 'ai',
  timestamp: new Date(),
};

/** Lightweight markdown → JSX: handles **bold**, numbered lists, bullet points */
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, lineIdx) => {
    // Detect list items (numbered or bullet)
    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
    const bulletMatch = line.match(/^[-•*]\s+(.*)/);

    const renderInline = (raw: string): React.ReactNode => {
      const parts = raw.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });
    };

    if (numMatch) {
      elements.push(
        <div key={lineIdx} className="flex gap-2 text-sm leading-relaxed">
          <span className="font-semibold text-primary flex-shrink-0">{numMatch[1]}.</span>
          <span>{renderInline(numMatch[2])}</span>
        </div>
      );
    } else if (bulletMatch) {
      elements.push(
        <div key={lineIdx} className="flex gap-2 text-sm leading-relaxed">
          <span className="text-primary flex-shrink-0 mt-1">•</span>
          <span>{renderInline(bulletMatch[1])}</span>
        </div>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={lineIdx} className="h-1" />);
    } else {
      elements.push(
        <p key={lineIdx} className="text-sm leading-relaxed">
          {renderInline(line)}
        </p>
      );
    }
  });

  return <div className="space-y-1">{elements}</div>;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const conversationHistoryRef = useRef<ChatMessage[]>([]);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => { isMountedRef.current = false; };
  }, []);

  // FIX-02: Reliable scroll using scrollIntoView on a bottom anchor element
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = useCallback(async (text: string) => {
    const currentMessage = text.trim();
    if (!currentMessage || isTyping) return;

    const userMsg: Message = {
      id: Date.now(),
      text: currentMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    conversationHistoryRef.current.push({
      role: "user",
      parts: [{ text: currentMessage }]
    });

    try {
      const responseText = await getAIResponse(currentMessage, conversationHistoryRef.current.slice(0, -1));
      if (!isMountedRef.current) return;

      const aiMsg: Message = {
        id: Date.now() + 1,
        text: responseText,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);

      conversationHistoryRef.current.push({
        role: "model",
        parts: [{ text: responseText }]
      });

      if (conversationHistoryRef.current.length > 20) {
        conversationHistoryRef.current = conversationHistoryRef.current.slice(-20);
      }
    } catch {
      if (!isMountedRef.current) return;
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
  }, [isTyping]);

  const handleSendMessage = useCallback(() => {
    sendMessage(inputMessage);
  }, [inputMessage, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([{ ...WELCOME_MESSAGE, id: Date.now(), timestamp: new Date() }]);
    conversationHistoryRef.current = [];
    setInputMessage("");
  };

  const geminiActive = isGeminiAvailable();
  const isOnlyWelcome = messages.length === 1;
  const charsLeft = CHAR_LIMIT - inputMessage.length;

  return (
    <div className="flex flex-col h-full">
      {/* Header row: AI Status + Clear button */}
      <div className="flex items-center justify-between mb-2">
        {geminiActive ? (
          <Badge className="bg-green-500 text-white gap-1 text-xs">
            <Zap className="w-3 h-3" /> Gemini AI Active
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs text-muted-foreground gap-1">
            <Zap className="w-3 h-3" /> Add API key to enable AI
          </Badge>
        )}
        {messages.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            className="text-xs text-muted-foreground hover:text-destructive gap-1 h-7 px-2"
            title="Clear conversation"
          >
            <Trash2 className="w-3 h-3" /> Clear Chat
          </Button>
        )}
      </div>

      {/* Chat Messages */}
      <Card className="flex-1 mb-4 border-border shadow-soft overflow-hidden">
        <div className="h-[360px] sm:h-[440px] md:h-[500px] overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'ai' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-md flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                <div className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${message.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-card border border-border rounded-bl-sm'}`}
                >
                  {message.sender === 'ai'
                    ? renderMarkdown(message.text)
                    : <p className="text-sm leading-relaxed">{message.text}</p>
                  }
                  <p className={`text-[10px] mt-2 opacity-60 ${message.sender === 'user' ? 'text-primary-foreground text-right' : 'text-muted-foreground'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.sender === 'user' && (
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center shadow-soft flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-accent-foreground" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-md flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                    </div>
                    <span className="text-xs text-muted-foreground">HealthAI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={bottomRef} />
          </div>
        </div>
      </Card>

      {/* Quick Prompts — shown only on the welcome screen */}
      {isOnlyWelcome && !isTyping && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary bg-primary/5 hover:bg-primary/15 hover:border-primary/60 transition-all cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <Card className="p-3 border-border shadow-soft">
        <div className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <Input
              value={inputMessage}
              onChange={(e) => {
                if (e.target.value.length <= CHAR_LIMIT) setInputMessage(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder={geminiActive ? "Ask me anything about your health..." : "Ask me about your health concerns..."}
              className="flex-1 border-border focus:ring-primary pr-16"
              disabled={isTyping}
              maxLength={CHAR_LIMIT}
            />
            {/* Character counter — shown when near limit */}
            {inputMessage.length > CHAR_LIMIT * 0.7 && (
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono ${charsLeft < 50 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {charsLeft}
              </span>
            )}
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={isTyping || !inputMessage.trim()}
            className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg transition-all shadow-md px-5 min-h-[44px] rounded-xl"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}