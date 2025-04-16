import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock medical database
const medicalDatabase = {
  "fever": {
    symptoms: ["High body temperature", "Sweating", "Chills", "Headache", "Muscle aches"],
    treatments: ["Paracetamol", "Ibuprofen", "Rest", "Fluids"],
    medications: ["Paracetamol 500mg", "Ibuprofen 400mg"]
  },
  "headache": {
    symptoms: ["Pain in head or neck", "Throbbing or constant pain", "Sensitivity to light or sound"],
    treatments: ["Pain relievers", "Rest in a dark room", "Cold compress"],
    medications: ["Aspirin", "Ibuprofen", "Paracetamol"]
  },
  "cough": {
    symptoms: ["Persistent cough", "Sore throat", "Runny nose", "Congestion"],
    treatments: ["Cough medicine", "Throat lozenges", "Rest", "Warm fluids"],
    medications: ["Dextromethorphan", "Guaifenesin", "Honey and lemon tea"]
  },
  "nausea": {
    symptoms: ["Queasy stomach", "Vomiting", "Dizziness", "Loss of appetite"],
    treatments: ["Anti-nausea medication", "Small, frequent meals", "Clear fluids"],
    medications: ["Ondansetron", "Promethazine", "Ginger tea"]
  },
  "chest pain": {
    symptoms: ["Pressure or pain in chest", "Shortness of breath", "Radiating pain to arm or jaw"],
    treatments: ["Immediate medical attention - potential cardiac emergency", "Aspirin if heart attack suspected"],
    medications: ["Aspirin 325mg (if directed by medical professional)"]
  },
  "allergic reaction": {
    symptoms: ["Rash", "Hives", "Swelling", "Difficulty breathing", "Itching"],
    treatments: ["Antihistamines", "Epinephrine for severe reactions", "Removal of allergen"],
    medications: ["Diphenhydramine (Benadryl)", "Cetirizine", "Epinephrine auto-injector for anaphylaxis"]
  },
  "fracture": {
    symptoms: ["Pain", "Swelling", "Bruising", "Deformity", "Inability to use affected limb"],
    treatments: ["Immobilization", "Pain management", "X-ray and proper medical care"],
    medications: ["Paracetamol", "Ibuprofen", "Prescribed pain medication"]
  },
  "burn": {
    symptoms: ["Pain", "Redness", "Blistering", "Swelling", "White or charred skin (severe)"],
    treatments: ["Cool water", "Do not use ice", "Cover with sterile, non-stick bandage", "Medical attention for serious burns"],
    medications: ["Aloe vera gel", "Paracetamol", "Ibuprofen", "Silver sulfadiazine cream for serious burns"]
  }
};

interface Message {
  text: string;
  sender: "user" | "bot";
  timestamp: number;
}

const MedicalChatbot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! I'm your medical assistant. How can I help you today?",
      sender: "bot",
      timestamp: Date.now()
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (input.trim() === "") return;
    
    // Add user message
    const userMessage: Message = {
      text: input.trim(),
      sender: "user",
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);
    
    // Simulate bot thinking and response
    setTimeout(() => {
      const botResponse = generateBotResponse(userMessage.text);
      setMessages(prev => [...prev, botResponse]);
      setIsThinking(false);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds for realism
  };

  const generateBotResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase();
    let responseText = "";
    
    // Check if input contains any keywords from our database
    const matchedConditions: string[] = [];
    
    Object.keys(medicalDatabase).forEach(condition => {
      if (input.includes(condition)) {
        matchedConditions.push(condition);
      }
    });
    
    if (matchedConditions.length > 0) {
      // Found one or more matching conditions
      responseText = "Based on your message, I can provide some basic information:\n\n";
      
      matchedConditions.forEach(condition => {
        const data = medicalDatabase[condition as keyof typeof medicalDatabase];
        responseText += `For ${condition}:\n`;
        responseText += `Common symptoms: ${data.symptoms.join(", ")}\n`;
        responseText += `Suggested treatments: ${data.treatments.join(", ")}\n`;
        responseText += `Potential medications: ${data.medications.join(", ")}\n\n`;
      });
      
      responseText += "Remember: This is basic information and not a substitute for professional medical advice. Please consult a healthcare provider for proper diagnosis and treatment.";
    } else if (input.includes("help") || input.includes("what can you do")) {
      responseText = "I can provide basic medical information for common conditions like fever, headache, cough, nausea, chest pain, allergic reactions, fractures, and burns. Just mention your symptoms or condition, and I'll try to help with general information.";
    } else if (
      input.includes("hello") || 
      input.includes("hi") || 
      input.includes("hey") || 
      input.includes("greetings")
    ) {
      responseText = "Hello! How can I assist you with your medical questions today?";
    } else if (input.includes("thank")) {
      responseText = "You're welcome! Is there anything else I can help you with?";
    } else if (input.includes("bye") || input.includes("goodbye")) {
      responseText = "Goodbye! Take care and stay healthy. Feel free to return if you have more questions.";
    } else {
      responseText = "I don't have specific information about that. I can provide basic details about common conditions like fever, headache, cough, nausea, chest pain, allergic reactions, fractures, and burns. Could you provide more details about your symptoms?";
    }
    
    return {
      text: responseText,
      sender: "bot",
      timestamp: Date.now()
    };
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-grow overflow-y-auto mb-4 pr-2">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              <div className="flex items-center mb-1">
                {message.sender === "user" ? (
                  <>
                    <span className="text-xs opacity-90">You</span>
                    <User size={14} className="ml-1" />
                  </>
                ) : (
                  <>
                    <Bot size={14} className="mr-1" />
                    <span className="text-xs opacity-90">Medical Assistant</span>
                  </>
                )}
              </div>
              <p className="text-sm whitespace-pre-line">{message.text}</p>
            </div>
          </div>
        ))}
        
        {isThinking && (
          <div className="flex justify-start mb-4">
            <div className="bg-secondary text-secondary-foreground rounded-lg p-3 flex items-center">
              <Loader2 size={16} className="animate-spin mr-2" />
              <span className="text-sm">Thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="mt-auto flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your medical question..."
          className="input-field flex-grow"
          disabled={isThinking}
        />
        <Button
          type="submit"
          className="flex-shrink-0"
          disabled={isThinking || input.trim() === ""}
        >
          <Send size={18} />
        </Button>
      </form>
    </div>
  );
};

export default MedicalChatbot;
