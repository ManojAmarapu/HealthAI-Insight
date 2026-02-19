import { ChatInterface } from "@/components/ChatInterface";

const Chat = () => {
  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">AI Health Chat</h1>
        <p className="text-muted-foreground">
          Ask me anything about your health concerns, symptoms, or general wellness questions.
        </p>
      </div>
      <ChatInterface />
    </div>
  );
};

export default Chat;