import { ChatInterface } from "@/components/ChatInterface";

const Chat = () => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">AI Health Chat</h1>
        <p className="text-muted-foreground text-sm">
          Ask me anything about your health — symptoms, treatments, tips, or just chat!
        </p>
      </div>
      <ChatInterface />
    </div>
  );
};

export default Chat;