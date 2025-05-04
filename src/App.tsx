import { useState } from "react";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useMutation } from "@tanstack/react-query";
import "./App.css";

// Define the structure of a message
interface Message {
  id: number;
  sender: "user1" | "user2" | "llm";
  text: string;
}

// Zod schema for parsing LLM response
const LlmResponseSchema = z.object({
  shouldRespond: z.string(), // Expecting "true" or "false"
  responseText: z.string(),
});
type LlmResponse = z.infer<typeof LlmResponseSchema>;

// Default prompt for the LLM
const DEFAULT_LLM_PROMPT = `You are a chat moderator LLM.
You will receive the last message sent in a conversation between User 1 and User 2.
Your task is to decide if you need to add a comment to the conversation based on the last message.
Respond ONLY with a JSON object matching this Zod schema:
\`\`\`typescript
{
  shouldRespond: z.string(), // "true" if you want to add a message, "false" otherwise
  responseText: z.string() // Your message text if shouldRespond is "true", otherwise an empty string
}
\`\`\`

Examples:

Last message: "That's not very nice."
Your JSON response: { "shouldRespond": "true", "responseText": "Let's keep the conversation respectful, please." }

Last message: "Hello there!"
Your JSON response: { "shouldRespond": "false", "responseText": "" }

---

Now, analyze the following last message:`;

function App() {
  const [apiKey, setApiKey] = useState("");
  const [llmPrompt, setLlmPrompt] = useState(DEFAULT_LLM_PROMPT);
  const [messages, setMessages] = useState<Message[]>([]);
  const [user1Input, setUser1Input] = useState("");
  const [user2Input, setUser2Input] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMessage = (sender: Message["sender"], text: string) => {
    setMessages((prev) => [...prev, { id: Date.now(), sender, text }]);
  };

  const llmMutation = useMutation<LlmResponse, Error, string>({
    // Type arguments: Response, Error, Input
    mutationFn: async (lastMessageText: string): Promise<LlmResponse> => {
      if (!apiKey) {
        throw new Error("API Key is missing.");
      }
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Corrected model name

        const promptWithContext = `${llmPrompt}\n${lastMessageText}`;

        const result = await model.generateContent(promptWithContext);
        const responseText = result.response.text();

        // Attempt to parse the JSON response
        try {
          // Extract JSON part more robustly
          const jsonMatch = responseText.match(/```json\n({.*?})\n```/s);
          let potentialJson = responseText.trim();
          if (jsonMatch && jsonMatch[1]) {
            potentialJson = jsonMatch[1];
          } else {
            // Fallback if markdown block not found, try direct parsing
            potentialJson = responseText.match(/{.*}/s)?.[0] ?? potentialJson;
          }

          const parsed = LlmResponseSchema.parse(JSON.parse(potentialJson));
          return parsed;
        } catch (parseError) {
          console.error(
            "Failed to parse LLM response:",
            responseText,
            parseError
          );
          // Try to gracefully handle non-JSON or malformed JSON
          if (
            responseText.toLowerCase().includes("respond") &&
            responseText.toLowerCase().includes("true")
          ) {
            return {
              shouldRespond: "true",
              responseText:
                "Moderator intervention needed (response format error).",
            };
          }
          // Default to no response on parse failure, but log the attempt
          console.warn("Returning default 'no response' due to parse error.");
          return { shouldRespond: "false", responseText: "" };
        }
      } catch (err) {
        console.error("Error calling Gemini API:", err);
        let errorMessage = "Failed to get response from LLM.";
        if (err instanceof Error) {
          errorMessage += ` Details: ${err.message}`;
        }
        setError(errorMessage); // Display error to user
        throw new Error(errorMessage); // Re-throw for react-query
      }
    },
    onSuccess: (data) => {
      setError(null); // Clear previous errors on success
      if (data.shouldRespond === "true" && data.responseText) {
        addMessage("llm", data.responseText);
      }
    },
    onError: (err: Error) => {
      console.error("LLM Mutation Error:", err);
      // Avoid setting error state here again if already set in mutationFn
      if (!error) {
        setError(`LLM Error: ${err.message}`);
      }
    },
  });

  const handleSendMessage = (sender: "user1" | "user2", text: string) => {
    if (!text.trim()) return;
    addMessage(sender, text);
    // Reset input field
    if (sender === "user1") setUser1Input("");
    if (sender === "user2") setUser2Input("");

    // Trigger LLM check
    llmMutation.mutate(text);
  };

  return (
    <div className="app-container">
      <h1>Moderated Chat</h1>

      <div className="settings">
        <button onClick={() => setSettingsOpen(!settingsOpen)}>
          {settingsOpen ? "Hide" : "Show"} Settings
        </button>
        {settingsOpen && (
          <div className="settings-content">
            <div>
              <label htmlFor="apiKey">Google AI API Key:</label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API Key"
              />
            </div>
            <div>
              <label htmlFor="llmPrompt">LLM Prompt:</label>
              <textarea
                id="llmPrompt"
                value={llmPrompt}
                onChange={(e) => setLlmPrompt(e.target.value)}
                rows={15}
                cols={80}
              />
            </div>
          </div>
        )}
      </div>

      {error && <div className="error-message">Error: {error}</div>}
      {llmMutation.isPending && (
        <div className="loading-message">LLM is thinking...</div>
      )}

      <div className="chat-display">
        {messages.map((msg) => (
          <div key={msg.id} className={`message message-${msg.sender}`}>
            <strong>
              {msg.sender === "llm" ? "Moderator" : msg.sender.toUpperCase()}:
            </strong>{" "}
            {msg.text}
          </div>
        ))}
      </div>

      <div className="input-areas">
        <div className="user-input">
          <textarea
            value={user1Input}
            onChange={(e) => setUser1Input(e.target.value)}
            placeholder="User 1 reply..."
            rows={3}
          />
          <button
            onClick={() => handleSendMessage("user1", user1Input)}
            disabled={llmMutation.isPending || !user1Input.trim()}
          >
            Send as User 1
          </button>
        </div>
        <div className="user-input">
          <textarea
            value={user2Input}
            onChange={(e) => setUser2Input(e.target.value)}
            placeholder="User 2 reply..."
            rows={3}
          />
          <button
            onClick={() => handleSendMessage("user2", user2Input)}
            disabled={llmMutation.isPending || !user2Input.trim()}
          >
            Send as User 2
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
