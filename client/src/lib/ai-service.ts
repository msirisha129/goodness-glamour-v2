import { apiRequest } from "./queryClient";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatSession {
  sessionId: string;
  conversationId?: string;
  messages: ChatMessage[];
}

export interface ChatResponse {
  response: string;
  conversationId: string;
  sessionId: string;
}

export interface ServiceRecommendation {
  serviceId: string;
  serviceName: string;
  reason: string;
  priority: number;
}

/**
 * AI Service class for handling all AI-related interactions
 */
export class AIService {
  private static instance: AIService;
  private sessions: Map<string, ChatSession> = new Map();

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Generate a unique session ID
   */
  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Send a message to the AI assistant
   */
  async sendMessage(
    sessionId: string,
    message: string,
    conversationId?: string
  ): Promise<ChatResponse> {
    try {
      const response = await apiRequest("POST", "/api/ai/chat", {
        message,
        sessionId,
        conversationId
      });

      const data = await response.json();

      // Update local session
      this.updateSession(sessionId, {
        role: "user",
        content: message,
        timestamp: new Date().toISOString()
      });

      this.updateSession(sessionId, {
        role: "assistant", 
        content: data.response,
        timestamp: new Date().toISOString()
      });

      return data;
    } catch (error) {
      console.error("AI chat error:", error);
      throw new Error("Failed to communicate with AI assistant");
    }
  }

  /**
   * Update session with new message
   */
  private updateSession(sessionId: string, message: ChatMessage): void {
    const session = this.sessions.get(sessionId) || {
      sessionId,
      messages: []
    };

    session.messages.push(message);
    this.sessions.set(sessionId, session);
  }

  /**
   * Get session history
   */
  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Clear session history
   */
  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * Start a conversation about a specific service
   */
  async startServiceConversation(
    sessionId: string,
    serviceName: string
  ): Promise<ChatResponse> {
    const message = `I'm interested in learning more about ${serviceName}. Can you tell me more details about this service?`;
    return this.sendMessage(sessionId, message);
  }

  /**
   * Start booking conversation for specific service
   */
  async startBookingConversation(
    sessionId: string,
    serviceName: string
  ): Promise<ChatResponse> {
    const message = `I would like to book ${serviceName}. Can you help me schedule an appointment?`;
    return this.sendMessage(sessionId, message);
  }

  /**
   * Get service recommendations based on user preferences
   */
  async getServiceRecommendations(
    sessionId: string,
    preferences: {
      category?: "women" | "kids";
      priceRange?: [number, number];
      timeAvailable?: number; // minutes
      occasion?: string;
    }
  ): Promise<ServiceRecommendation[]> {
    let message = "I need service recommendations. ";

    if (preferences.category) {
      message += `I'm looking for ${preferences.category === "women" ? "women's" : "kids"} services. `;
    }

    if (preferences.priceRange) {
      message += `My budget is between ₹${preferences.priceRange[0]} and ₹${preferences.priceRange[1]}. `;
    }

    if (preferences.timeAvailable) {
      message += `I have about ${preferences.timeAvailable} minutes available. `;
    }

    if (preferences.occasion) {
      message += `This is for ${preferences.occasion}. `;
    }

    message += "What services would you recommend?";

    try {
      const response = await this.sendMessage(sessionId, message);
      
      // In a real implementation, you might parse the AI response to extract
      // structured recommendations. For now, we'll return a simple format.
      return this.parseRecommendationsFromResponse(response.response);
    } catch (error) {
      console.error("Failed to get recommendations:", error);
      return [];
    }
  }

  /**
   * Parse AI response to extract service recommendations
   * This is a simplified implementation
   */
  private parseRecommendationsFromResponse(response: string): ServiceRecommendation[] {
    // In a real implementation, you would use NLP or structured AI responses
    // to extract specific service recommendations
    const recommendations: ServiceRecommendation[] = [];
    
    // Simple keyword matching for demonstration
    const services = [
      { id: "hair-cut", name: "Hair Cut & Styling", keywords: ["haircut", "cut", "styling"] },
      { id: "hair-color", name: "Hair Coloring", keywords: ["color", "coloring", "highlights", "balayage"] },
      { id: "hair-spa", name: "Hair Spa", keywords: ["spa", "treatment", "conditioning"] },
      { id: "kids-cut", name: "Kids Haircut", keywords: ["kids", "children", "child"] }
    ];

    const lowerResponse = response.toLowerCase();
    
    services.forEach((service, index) => {
      const mentioned = service.keywords.some(keyword => lowerResponse.includes(keyword));
      if (mentioned) {
        recommendations.push({
          serviceId: service.id,
          serviceName: service.name,
          reason: "Mentioned in AI recommendation",
          priority: index + 1
        });
      }
    });

    return recommendations;
  }

  /**
   * Handle emergency or urgent booking requests
   */
  async handleUrgentBooking(
    sessionId: string,
    urgencyLevel: "same-day" | "next-day" | "asap"
  ): Promise<ChatResponse> {
    let message = "";
    
    switch (urgencyLevel) {
      case "asap":
        message = "I need an appointment as soon as possible today. Do you have any immediate availability?";
        break;
      case "same-day":
        message = "I need an appointment today. What time slots are available?";
        break;
      case "next-day":
        message = "I need an appointment tomorrow. Can you check availability?";
        break;
    }

    return this.sendMessage(sessionId, message);
  }

  /**
   * Get conversation summary for booking confirmation
   */
  getBookingSummary(sessionId: string): {
    services: string[];
    preferences: string[];
    specialRequests: string[];
  } {
    const session = this.getSession(sessionId);
    if (!session) {
      return { services: [], preferences: [], specialRequests: [] };
    }

    const userMessages = session.messages
      .filter(msg => msg.role === "user")
      .map(msg => msg.content);

    // Simple extraction logic - in production you'd use more sophisticated NLP
    const services = this.extractMentionedServices(userMessages);
    const preferences = this.extractPreferences(userMessages);
    const specialRequests = this.extractSpecialRequests(userMessages);

    return { services, preferences, specialRequests };
  }

  /**
   * Extract mentioned services from user messages
   */
  private extractMentionedServices(messages: string[]): string[] {
    const serviceKeywords = [
      "haircut", "cut", "styling", "coloring", "color", "highlights",
      "spa", "treatment", "massage", "blow dry", "keratin"
    ];

    const mentioned = new Set<string>();
    const text = messages.join(" ").toLowerCase();

    serviceKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        mentioned.add(keyword);
      }
    });

    return Array.from(mentioned);
  }

  /**
   * Extract user preferences from messages
   */
  private extractPreferences(messages: string[]): string[] {
    const preferenceKeywords = [
      "morning", "afternoon", "evening", "weekend", "weekday",
      "budget", "quick", "relaxing", "professional", "gentle"
    ];

    const mentioned = new Set<string>();
    const text = messages.join(" ").toLowerCase();

    preferenceKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        mentioned.add(keyword);
      }
    });

    return Array.from(mentioned);
  }

  /**
   * Extract special requests from messages
   */
  private extractSpecialRequests(messages: string[]): string[] {
    const requestKeywords = [
      "allergic", "sensitive", "pregnancy", "medical", "special needs",
      "organic", "natural", "specific products"
    ];

    const mentioned = new Set<string>();
    const text = messages.join(" ").toLowerCase();

    requestKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        mentioned.add(keyword);
      }
    });

    return Array.from(mentioned);
  }

  /**
   * Generate follow-up questions for better service recommendation
   */
  generateFollowUpQuestions(sessionId: string): string[] {
    const session = this.getSession(sessionId);
    if (!session || session.messages.length === 0) {
      return [
        "What type of hair service are you looking for?",
        "Is this for yourself or someone else?",
        "Do you have any specific time preferences?"
      ];
    }

    // Analyze conversation to suggest relevant follow-up questions
    const conversationText = session.messages
      .map(msg => msg.content)
      .join(" ")
      .toLowerCase();

    const questions: string[] = [];

    if (!conversationText.includes("budget") && !conversationText.includes("price")) {
      questions.push("What's your budget range for this service?");
    }

    if (!conversationText.includes("time") && !conversationText.includes("when")) {
      questions.push("When would you prefer to schedule the appointment?");
    }

    if (!conversationText.includes("address") && !conversationText.includes("location")) {
      questions.push("What's your address for the doorstep service?");
    }

    return questions;
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();

// Export utility functions
export function createChatSession(): string {
  return aiService.generateSessionId();
}

export async function sendChatMessage(
  sessionId: string,
  message: string,
  conversationId?: string
): Promise<ChatResponse> {
  return aiService.sendMessage(sessionId, message, conversationId);
}

export function getChatHistory(sessionId: string): ChatMessage[] {
  const session = aiService.getSession(sessionId);
  return session?.messages || [];
}
