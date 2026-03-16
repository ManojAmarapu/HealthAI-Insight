import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Zap, Trash2, Copy, Mic, MicOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getAIResponse, generateAIResponse, ChatMessage } from "@/services/chatEngine";
import { isGeminiAvailable } from "@/services/geminiClient";
import { moderateInput } from "@/utils/contentModeration";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string; // ISO string so it serializes to localStorage
  followUps?: string[];
}

const CHAR_LIMIT = 500;

// ------------------------------------------------------------------
// Follow-up suggestion chips — topic-based
// ------------------------------------------------------------------
const FOLLOW_UPS: Record<string, string[]> = {
  fever: ["How long should a fever last?", "What foods help during a fever?", "When should I go to the ER?"],
  headache: ["What triggers chronic headaches?", "Could it be a migraine?", "Are there natural remedies?"],
  diabetes: ["What foods should diabetics avoid?", "How is blood sugar tested?", "What medications are used?"],
  sleep: ["How many hours of sleep is ideal?", "Does napping affect night sleep?", "What causes insomnia?"],
  anxiety: ["What's the 5-4-3-2-1 grounding technique?", "Can anxiety cause physical symptoms?", "What therapies help most?"],
  cold: ["How long does a cold last?", "Is there a cure for the common cold?", "Cold vs flu — what's the difference?"],
  heart: ["What are early signs of heart disease?", "How can I lower cholesterol naturally?", "What's a healthy resting heart rate?"],
  default: ["Tell me more about this", "What are common complications?", "When should I see a doctor?"],
};

function getFollowUps(text: string): string[] {
  const t = text.toLowerCase();
  if (t.includes("fever") || t.includes("temperature")) return FOLLOW_UPS.fever;
  if (t.includes("headache") || t.includes("migraine")) return FOLLOW_UPS.headache;
  if (t.includes("diabetes") || t.includes("blood sugar") || t.includes("glucose")) return FOLLOW_UPS.diabetes;
  if (t.includes("sleep") || t.includes("insomnia")) return FOLLOW_UPS.sleep;
  if (t.includes("anxiet") || t.includes("stress") || t.includes("panic")) return FOLLOW_UPS.anxiety;
  if (t.includes("cold") || t.includes("cough") || t.includes("flu")) return FOLLOW_UPS.cold;
  if (t.includes("heart") || t.includes("cholesterol") || t.includes("blood pressure")) return FOLLOW_UPS.heart;
  return FOLLOW_UPS.default;
}

// ------------------------------------------------------------------
// Markdown renderer (bold, numbered lists, bullets)
// ------------------------------------------------------------------
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  lines.forEach((line, idx) => {
    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
    const bulletMatch = line.match(/^[-•*]\s+(.*)/);
    const renderInline = (raw: string) =>
      raw.split(/(\*\*.*?\*\*)/g).map((p, i) =>
        p.startsWith('**') && p.endsWith('**')
          ? <strong key={i}>{p.slice(2, -2)}</strong>
          : p
      );
    if (numMatch) {
      elements.push(
        <div key={idx} className="flex gap-2 text-sm leading-relaxed">
          <span className="font-semibold text-primary flex-shrink-0">{numMatch[1]}.</span>
          <span>{renderInline(numMatch[2])}</span>
        </div>
      );
    } else if (bulletMatch) {
      elements.push(
        <div key={idx} className="flex gap-2 text-sm leading-relaxed">
          <span className="text-primary flex-shrink-0 mt-1">•</span>
          <span>{renderInline(bulletMatch[1])}</span>
        </div>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={idx} className="h-1" />);
    } else {
      elements.push(<p key={idx} className="text-sm leading-relaxed">{renderInline(line)}</p>);
    }
  });
  return <div className="space-y-1">{elements}</div>;
}

// ------------------------------------------------------------------
// Copy button for AI messages
// ------------------------------------------------------------------
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };
  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 p-1 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground"
      title="Copy response"
    >
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

// ------------------------------------------------------------------
// Main component
// ------------------------------------------------------------------
const WELCOME_TEXT = "Hello! I'm HealthAI, your personal healthcare assistant powered by Google Gemini AI. I can help you with health questions, symptoms analysis, medication guidance, and general medical information. How can I assist you today?";

const makeWelcome = (): Message => ({
  id: 1,
  text: WELCOME_TEXT,
  sender: 'ai',
  timestamp: new Date().toISOString(),
});

const QUICK_PROMPTS = [
  "I have a fever and sore throat",
  "What are symptoms of diabetes?",
  "Tips for better sleep",
  "How to manage stress naturally",
];

export function ChatInterface() {
  // ── Persisted state ───────────────────────────────────────────────
  const [storedMessages, setStoredMessages] = useLocalStorage<Message[]>(
    "healthai_chat_messages",
    [makeWelcome()]
  );
  const [userName] = useLocalStorage<string>("healthai_user_name", "");

  const [messages, setMessages] = useState<Message[]>(() =>
    storedMessages.length > 0 ? storedMessages : [makeWelcome()]
  );
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const conversationHistoryRef = useRef<ChatMessage[]>([]);
  const isMountedRef = useRef(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    return () => { isMountedRef.current = false; };
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    setStoredMessages(messages);
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isTyping]);

  // ── Voice input (Web Speech API) ─────────────────────────────────
  const toggleVoice = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice input not supported", { description: "Try Chrome or Edge for voice input." });
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Voice input error", { description: "Please try speaking again." });
    };
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(prev => (prev ? `${prev} ${transcript}` : transcript).slice(0, CHAR_LIMIT));
    };
    recognition.start();
  }, [isListening]);

  // ── Send message ─────────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    const currentMessage = text.trim();
    if (!currentMessage || isTyping) return;

    // Content moderation
    if (moderateInput(currentMessage).status === 'inappropriate') {
      toast.error("Content not allowed", {
        description: "HealthAI is designed for health and wellness topics only.",
        duration: 5000,
      });
      return;
    }

    const userMsg: Message = {
      id: Date.now(),
      text: currentMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    conversationHistoryRef.current.push({ role: "user", parts: [{ text: currentMessage }] });

    try {
      const responseText = await getAIResponse(currentMessage, conversationHistoryRef.current.slice(0, -1));
      if (!isMountedRef.current) return;

      const aiMsg: Message = {
        id: Date.now() + 1,
        text: responseText,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        followUps: getFollowUps(responseText + currentMessage),
      };
      setMessages(prev => [...prev, aiMsg]);
      conversationHistoryRef.current.push({ role: "model", parts: [{ text: responseText }] });
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
        timestamp: new Date().toISOString(),
        followUps: getFollowUps(currentMessage),
      }]);
    } finally {
      if (isMountedRef.current) setIsTyping(false);
    }
  }, [isTyping]);

  const handleSendMessage = useCallback(() => sendMessage(inputMessage), [inputMessage, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  const handleClearChat = () => {
    const fresh = makeWelcome();
    setMessages([fresh]);
    setStoredMessages([fresh]);
    conversationHistoryRef.current = [];
    setInputMessage("");
  };

  const geminiActive = isGeminiAvailable();
  const isOnlyWelcome = messages.length === 1;
  const charsLeft = CHAR_LIMIT - inputMessage.length;
  const greeting = userName ? `Hi ${userName}! ` : "";

  return (
    <div className="space-y-4">
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {geminiActive ? (
            <Badge className="bg-green-500 text-white gap-1 text-xs">
              <Zap className="w-3 h-3" /> Gemini AI Active
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs text-muted-foreground gap-1">
              <Zap className="w-3 h-3" /> Add API key to enable AI
            </Badge>
          )}
          {userName && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {greeting}How can I help you today?
            </span>
          )}
        </div>
        {messages.length > 1 && (
          <Button variant="ghost" size="sm" onClick={handleClearChat}
            className="text-xs text-muted-foreground hover:text-destructive gap-1 h-7 px-2">
            <Trash2 className="w-3 h-3" /> Clear Chat
          </Button>
        )}
      </div>

      {/* Messages */}
      <Card className="border-border shadow-soft">
        <div className="p-4 space-y-4">
          {messages.map((message, msgIdx) => (
            <div key={message.id}>
              <div className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.sender === 'ai' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-md flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                <div className={`relative group max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-card border border-border rounded-bl-sm'
                }`}>
                  {message.sender === 'ai'
                    ? renderMarkdown(message.text)
                    : <p className="text-sm leading-relaxed">{message.text}</p>
                  }
                  {message.sender === 'ai' && <CopyButton text={message.text} />}
                  <p className={`text-[10px] mt-2 opacity-60 ${
                    message.sender === 'user' ? 'text-primary-foreground text-right' : 'text-muted-foreground'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.sender === 'user' && (
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center shadow-soft flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-accent-foreground" />
                  </div>
                )}
              </div>

              {/* Follow-up chips — show on last AI message only */}
              {message.sender === 'ai' && message.followUps && msgIdx === messages.length - 1 && !isTyping && (
                <div className="mt-3 ml-11 flex flex-wrap gap-2">
                  {message.followUps.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-xs px-3 py-1.5 rounded-full border border-primary/25 text-primary bg-primary/5 hover:bg-primary/15 hover:border-primary/50 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing */}
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
          <div ref={bottomRef} />
        </div>
      </Card>

      {/* Quick prompts */}
      {isOnlyWelcome && !isTyping && (
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((p) => (
              <button key={p} onClick={() => sendMessage(p)}
                className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary bg-primary/5 hover:bg-primary/15 hover:border-primary/60 transition-all cursor-pointer">
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="sticky bottom-0 pb-2 bg-background pt-1">
        <Card className="p-3 border-border shadow-soft">
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <Input
                value={inputMessage}
                onChange={(e) => { if (e.target.value.length <= CHAR_LIMIT) setInputMessage(e.target.value); }}
                onKeyDown={handleKeyDown}
                placeholder={geminiActive ? "Ask me anything about your health..." : "Ask me about your health..."}
                className="border-border focus:ring-primary pr-16"
                disabled={isTyping}
                maxLength={CHAR_LIMIT}
              />
              {inputMessage.length > CHAR_LIMIT * 0.7 && (
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono ${charsLeft < 50 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {charsLeft}
                </span>
              )}
            </div>
            {/* Voice input button */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleVoice}
              disabled={isTyping}
              className={`transition-all ${isListening ? 'bg-red-50 border-red-300 text-red-500 dark:bg-red-950/30' : ''}`}
              title={isListening ? "Stop listening" : "Voice input"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={isTyping || !inputMessage.trim()}
              className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg transition-all shadow-md px-5 min-h-[44px] rounded-xl"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          {isListening && (
            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Listening... speak now
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}