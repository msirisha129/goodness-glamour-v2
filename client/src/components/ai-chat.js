import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
export default function AIChat({ isOpen, onClose, initialMessage, serviceId }) {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    const [conversationId, setConversationId] = useState(null);
    const scrollAreaRef = useRef(null);
    const { toast } = useToast();
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            // Add initial AI greeting
            const greeting = {
                role: "assistant",
                content: "Hello! Welcome to Goodness Glamour. Which service are you interested in today?",
                timestamp: new Date().toISOString()
            };
            setMessages([greeting]);
            // If there's an initial message, send it
            if (initialMessage) {
                setInputMessage(initialMessage);
                setTimeout(() => {
                    handleSendMessage(initialMessage);
                }, 500);
            }
        }
    }, [isOpen, initialMessage]);
    useEffect(() => {
        // Scroll to bottom when new messages are added
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages]);
    const chatMutation = useMutation({
        mutationFn: async (message) => {
            const response = await apiRequest("POST", "/api/ai/chat", {
                message,
                sessionId,
                conversationId
            });
            return response.json();
        },
        onSuccess: (data) => {
            const aiMessage = {
                role: "assistant",
                content: data.response,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, aiMessage]);
            setConversationId(data.conversationId);
        },
        onError: (error) => {
            console.error("Chat error:", error);
            const errorMessage = {
                role: "assistant",
                content: "I apologize, but I'm having trouble responding right now. Please call us at 9036626642 for immediate assistance.",
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
            toast({
                title: "Connection Error",
                description: "Unable to reach AI assistant. Please try again.",
                variant: "destructive",
            });
        }
    });
    const handleSendMessage = (messageText) => {
        const message = messageText || inputMessage.trim();
        if (!message || chatMutation.isPending)
            return;
        // Add user message
        const userMessage = {
            role: "user",
            content: message,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage("");
        // Send to AI
        chatMutation.mutate(message);
    };
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: _jsxs(DialogContent, { className: "max-w-md h-[600px] flex flex-col p-0 bg-slate-900/60 backdrop-blur-xl border border-slate-700 shadow-lg text-white [&>button]:hidden", "data-testid": "dialog-ai-chat", children: [_jsx(DialogHeader, { className: "bg-[#9F8383] text-white p-5 flex-shrink-0 relative", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-11 h-11 bg-white/20 rounded-full flex items-center justify-center mr-3", children: _jsx(Bot, { className: "h-5 w-5 text-white" }) }), _jsxs("div", { children: [_jsx(DialogTitle, { className: "text-base font-medium text-white", children: "Beauty Assistant" }), _jsxs("p", { className: "text-xs text-white/80 flex items-center", children: [_jsx("div", { className: "w-1.5 h-1.5 bg-green-300 rounded-full mr-2" }), "Online now"] })] })] }), _jsx("button", { onClick: onClose, className: "text-white hover:text-white/80 transition-colors p-2 hover:bg-white/10 rounded-full", "data-testid": "button-close-chat", children: _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }) }), _jsx(ScrollArea, { ref: scrollAreaRef, className: "flex-1 p-4 bg-transparent", "data-testid": "chat-messages", children: _jsxs("div", { className: "space-y-4", children: [messages.map((message, index) => (_jsxs("div", { className: `flex items-start ${message.role === "user" ? "justify-end" : "justify-start"}`, "data-testid": `message-${message.role}-${index}`, children: [message.role === "assistant" && (_jsx("div", { className: "w-9 h-9 bg-slate-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0", children: _jsx(Bot, { className: "h-5 w-5 text-white" }) })), _jsxs("div", { className: `max-w-[80%] ${message.role === "user"
                                            ? "bg-white/20 text-white"
                                            : "bg-white/10 text-white border border-white/10"} rounded-lg p-3 shadow-sm`, children: [_jsx("p", { className: "text-sm whitespace-pre-wrap", children: message.content }), _jsx("p", { className: `text-xs mt-1 ${message.role === "user" ? "text-white/70" : "text-white/60"}`, children: formatTime(message.timestamp) })] }), message.role === "user" && (_jsx("div", { className: "w-9 h-9 bg-slate-500 rounded-full flex items-center justify-center ml-3 flex-shrink-0", children: _jsx(User, { className: "h-5 w-5 text-white" }) }))] }, index))), chatMutation.isPending && (_jsxs("div", { className: "flex items-start justify-start", children: [_jsx("div", { className: "w-9 h-9 bg-white/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0", children: _jsx(Bot, { className: "h-5 w-5 text-white" }) }), _jsx("div", { className: "bg-white/10 text-white border border-white/10 rounded-lg p-3 shadow-sm", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Loader2, { className: "h-4 w-4 animate-spin mr-2 text-white/70" }), _jsx("span", { className: "text-sm", children: "Typing..." })] }) })] }))] }) }), _jsx("div", { className: "p-4 bg-white border-t border-slate-200 flex-shrink-0", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Input, { value: inputMessage, onChange: (e) => setInputMessage(e.target.value), onKeyPress: handleKeyPress, placeholder: "Type your message...", className: "flex-1 border-slate-300 focus:border-slate-500 focus:ring-slate-500 rounded-lg px-3 py-2 text-black", style: { color: '#000000' }, disabled: chatMutation.isPending, "data-testid": "input-chat-message" }), _jsx(Button, { onClick: () => handleSendMessage(), disabled: !inputMessage.trim() || chatMutation.isPending, size: "icon", className: "bg-slate-600 hover:bg-slate-700 text-white rounded-lg w-10 h-10", "data-testid": "button-send-message", children: _jsx(Send, { className: "h-4 w-4" }) })] }) })] }) }));
}
