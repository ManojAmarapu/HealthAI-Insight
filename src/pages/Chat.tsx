import { ChatInterface } from "@/components/ChatInterface";

const Chat = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">AI Health Chat</h1>
        <p className="text-muted-foreground text-sm">
          Ask me anything about your health — symptoms, treatments, tips, or just chat!
        </p>
      </div>
      {/* flex-1 min-h-0: fills remaining height; min-h-0 prevents overflow in flex children */}
      <div className="flex-1 min-h-0">
        <ChatInterface />
      </div>
    </div>
  );
};

export default Chat;