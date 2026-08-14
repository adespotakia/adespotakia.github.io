
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Send, PlusCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  isCurrentUser: boolean;
}

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Initializing with some mock messages
  useEffect(() => {
    const initialMessages: Message[] = [
      {
        id: "1",
        content: "Καλώς ήρθατε στη συνομιλία της κοινότητας Βοήθεια Αδέσποτων!",
        sender: "system",
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        isCurrentUser: false,
      },
      {
        id: "2",
        content: "Εδώ μπορείτε να συζητήσετε για θέματα σχετικά με τα αδέσποτα ζώα, να ζητήσετε βοήθεια και να μοιραστείτε εμπειρίες.",
        sender: "system",
        timestamp: new Date(Date.now() - 86000000),
        isCurrentUser: false,
      },
      {
        id: "3",
        content: "Γεια! Χρειάζομαι βοήθεια με ένα αδέσποτο γατάκι που βρήκα.",
        sender: "cat_lover",
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        isCurrentUser: false,
      },
      {
        id: "4",
        content: "Γεια σου! Τι βοήθεια χρειάζεσαι;",
        sender: "dog_friend",
        timestamp: new Date(Date.now() - 3000000),
        isCurrentUser: false,
      },
    ];
    
    setMessages(initialMessages);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: user?.username || "guest",
      timestamp: new Date(),
      isCurrentUser: true,
    };

    setMessages([...messages, message]);
    setNewMessage("");

    // Simulate typing from another user
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const response: Message = {
        id: (Date.now() + 1).toString(),
        content: "Ευχαριστώ για το μήνυμά σας! Κάποιο μέλος της κοινότητας θα σας απαντήσει σύντομα.",
        sender: "support",
        timestamp: new Date(),
        isCurrentUser: false,
      };
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("el-GR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Σήμερα";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Χθες";
    } else {
      return date.toLocaleDateString("el-GR");
    }
  };

  // Group messages by date
  const groupedMessages: { [key: string]: Message[] } = messages.reduce(
    (groups, message) => {
      const date = formatDate(message.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    },
    {} as { [key: string]: Message[] }
  );

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date} className="space-y-4">
            <div className="flex justify-center">
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {date}
              </span>
            </div>
            
            {dateMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] ${
                    message.isCurrentUser
                      ? "bg-strays-orange text-white rounded-t-lg rounded-bl-lg"
                      : "bg-gray-100 text-gray-800 rounded-t-lg rounded-br-lg"
                  } p-3 shadow-sm`}
                >
                  {!message.isCurrentUser && message.sender !== "system" && (
                    <div className="flex items-center mb-1">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback className="text-xs">
                          {message.sender.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium">{message.sender}</span>
                    </div>
                  )}
                  <div>{message.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      message.isCurrentUser ? "text-white/80" : "text-gray-500"
                    } text-right`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 p-3 rounded-t-lg rounded-br-lg shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef}></div>
      </div>
      
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => {
              toast({
                title: "Λειτουργία σε εξέλιξη",
                description: "Η αποστολή εικόνων θα είναι διαθέσιμη σύντομα!",
              });
            }}
          >
            <PlusCircle className="h-5 w-5 text-gray-500" />
          </Button>
          <Input
            placeholder="Γράψτε ένα μήνυμα..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
          />
          <Button
            type="button"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className={`${newMessage.trim() ? "bg-strays-orange hover:bg-strays-dark-orange" : "bg-gray-300"}`}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
