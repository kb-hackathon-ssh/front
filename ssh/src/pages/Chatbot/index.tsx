import Header from '@/components/Layout/Header';
import Chatbot from '@/pages/Chatbot/components/chatbot';
export default function ChatbotPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Chatbot />
      </main>
    </div>
  );
}
