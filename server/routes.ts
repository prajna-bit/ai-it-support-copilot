import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Sample knowledge base for demo
const KNOWLEDGE_BASE = [
  {
    id: "KB001",
    title: "Windows Blue Screen of Death (BSOD) Troubleshooting",
    category: "Windows",
    content: "Blue Screen of Death errors indicate critical system failures. Common causes include driver issues, hardware problems, and corrupted system files. Solutions: 1) Boot in Safe Mode 2) Update or rollback drivers 3) Run memory diagnostic 4) Check hard drive health 5) Restore system to previous working state. For IRQL_NOT_LESS_OR_EQUAL errors, focus on driver updates.",
    tags: ["BSOD", "Windows", "Drivers", "Hardware", "Critical"]
  },
  {
    id: "KB002", 
    title: "Mac System Won't Boot - Startup Issues",
    category: "Mac",
    content: "Mac startup problems can be caused by corrupted system files, hardware failures, or software conflicts. Troubleshooting steps: 1) Reset NVRAM/PRAM (Cmd+Option+P+R) 2) Boot in Safe Mode (hold Shift) 3) Run Disk Utility from Recovery Mode 4) Reinstall macOS if necessary 5) Check hardware connections. For spinning wheel issues, often disk-related.",
    tags: ["Mac", "Startup", "Boot", "NVRAM", "Recovery"]
  },
  {
    id: "KB003",
    title: "Network Connectivity Issues Resolution",
    category: "Network", 
    content: "Network connectivity problems affect productivity. Systematic approach: 1) Check physical connections 2) Restart network adapter 3) Flush DNS cache (ipconfig /flushdns) 4) Reset network stack 5) Update network drivers 6) Check firewall settings 7) Contact ISP if external. For intermittent issues, check for interference.",
    tags: ["Network", "Connectivity", "DNS", "Firewall", "Drivers"]
  },
  {
    id: "KB004",
    title: "Printer Not Responding - Universal Fix Guide",
    category: "Hardware",
    content: "Printer issues are common in office environments. Resolution steps: 1) Check power and cable connections 2) Clear print queue 3) Restart print spooler service 4) Update printer drivers 5) Run printer troubleshooter 6) Check ink/toner levels 7) Clean print heads. For network printers, verify IP configuration.",
    tags: ["Printer", "Hardware", "Drivers", "Spooler", "Network"]
  },
  {
    id: "KB005",
    title: "Email Client Configuration and Troubleshooting",
    category: "Email",
    content: "Email setup and issues resolution for Outlook and other clients. Common problems: 1) Incorrect server settings (IMAP/POP3/SMTP) 2) Authentication failures 3) SSL/TLS configuration 4) Firewall blocking ports 5) Corrupted profile. Solutions include recreating profiles, checking server settings, and verifying credentials.",
    tags: ["Email", "Outlook", "IMAP", "SMTP", "Configuration"]
  },
  {
    id: "KB006",
    title: "Slow Computer Performance Optimization",
    category: "Performance",
    content: "System slowdown affects user productivity. Optimization steps: 1) Check resource usage in Task Manager 2) Disable startup programs 3) Run disk cleanup 4) Defragment hard drive 5) Scan for malware 6) Update drivers 7) Add more RAM if needed 8) Clean temporary files. Monitor CPU and memory usage patterns.",
    tags: ["Performance", "Optimization", "Memory", "CPU", "Cleanup"]
  }
];

// Sample ServiceNow incidents
const SERVICENOW_INCIDENTS = [
  {
    number: "INC0012345",
    title: "User Cannot Access Email",
    description: "User reports unable to access Outlook email since this morning. Getting authentication errors.",
    priority: "2-High",
    status: "New",
    category: "Email",
    created: "2024-09-25T08:30:00Z"
  },
  {
    number: "INC0012346", 
    title: "Laptop Running Very Slow",
    description: "Employee laptop taking 10+ minutes to start, applications freezing frequently.",
    priority: "3-Medium",
    status: "In Progress",
    category: "Performance",
    created: "2024-09-25T09:15:00Z"
  },
  {
    number: "INC0012347",
    title: "Blue Screen Error on Workstation",
    description: "Desktop computer showing blue screen with IRQL_NOT_LESS_OR_EQUAL error on startup.",
    priority: "2-High", 
    status: "New",
    category: "Hardware",
    created: "2024-09-25T10:45:00Z"
  }
];

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Chat/AI Assistant API
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Search knowledge base for relevant articles
      const relevantKB = searchKnowledgeBase(message);
      
      // Create context for AI
      let context = "You are an IT support assistant. Help analyze this incident and provide solutions.\n\n";
      if (relevantKB.length > 0) {
        context += "Relevant knowledge base articles:\n";
        relevantKB.forEach(kb => {
          context += `- ${kb.title}: ${kb.content.substring(0, 200)}...\n`;
        });
        context += "\n";
      }
      context += `User incident: ${message}`;

      let response = "";
      
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an AI-powered IT support assistant. Provide helpful, professional responses to IT incidents and questions. Be concise but thorough."
            },
            {
              role: "user", 
              content: context
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        });

        response = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response at this time.";
      } catch (openaiError) {
        // Fallback AI response system for demo purposes
        response = generateFallbackResponse(message, relevantKB);
      }

      res.json({
        response,
        sources: relevantKB.map(kb => ({
          id: kb.id,
          title: kb.title,
          category: kb.category
        }))
      });

    } catch (error) {
      console.error("Chat API error:", error);
      res.status(500).json({ 
        error: "Failed to process chat request",
        response: "I'm experiencing technical difficulties. Please try again or contact your system administrator."
      });
    }
  });

  // Knowledge Base Search API
  app.get("/api/knowledge-base/search", (req, res) => {
    try {
      const { q: query, category } = req.query;
      
      let results = KNOWLEDGE_BASE;
      
      if (query) {
        results = searchKnowledgeBase(query as string);
      }
      
      if (category && category !== 'all') {
        results = results.filter(kb => kb.category.toLowerCase() === (category as string).toLowerCase());
      }
      
      res.json({
        articles: results,
        total: results.length
      });
    } catch (error) {
      console.error("Knowledge base search error:", error);
      res.status(500).json({ error: "Failed to search knowledge base" });
    }
  });

  // Get all knowledge base articles
  app.get("/api/knowledge-base", (req, res) => {
    try {
      res.json({
        articles: KNOWLEDGE_BASE,
        total: KNOWLEDGE_BASE.length
      });
    } catch (error) {
      console.error("Knowledge base API error:", error);
      res.status(500).json({ error: "Failed to fetch knowledge base" });
    }
  });

  // ServiceNow Integration - Get Incidents
  app.get("/api/servicenow/incidents", (req, res) => {
    try {
      res.json({
        incidents: SERVICENOW_INCIDENTS,
        total: SERVICENOW_INCIDENTS.length,
        integration: "ServiceNow Simulation"
      });
    } catch (error) {
      console.error("ServiceNow incidents API error:", error);
      res.status(500).json({ error: "Failed to fetch ServiceNow incidents" });
    }
  });

  // ServiceNow Integration - Analyze Incident
  app.post("/api/servicenow/incidents/:number/analyze", async (req, res) => {
    try {
      const { number } = req.params;
      const incident = SERVICENOW_INCIDENTS.find(inc => inc.number === number);
      
      if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
      }

      // Search relevant KB articles
      const relevantKB = searchKnowledgeBase(incident.description);
      
      // AI analysis
      const analysisPrompt = `Analyze this ServiceNow incident and provide recommendations:

Incident: ${incident.title}
Description: ${incident.description}
Category: ${incident.category}
Priority: ${incident.priority}

Provide a brief analysis and recommended next steps.`;

      let analysis = "";
      
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an IT support analyst. Analyze incidents and provide actionable recommendations."
            },
            {
              role: "user",
              content: analysisPrompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        });

        analysis = completion.choices[0]?.message?.content || "Analysis unavailable.";
      } catch (openaiError) {
        // Fallback analysis for ServiceNow incidents
        analysis = generateServiceNowAnalysis(incident, relevantKB);
      }

      res.json({
        incident,
        analysis,
        relevantKB: relevantKB.slice(0, 3),
        recommendations: [
          "Follow the step-by-step procedures in referenced KB articles",
          "Update incident status after each troubleshooting step", 
          "Escalate to L2 support if issue persists after following KB procedures"
        ]
      });

    } catch (error) {
      console.error("ServiceNow analyze error:", error);
      // Provide a basic fallback response even if other errors occur
      res.json({
        incident: {
          number: req.params.number || "INC000000",
          title: "IT Support Incident",
          description: "Incident analysis requested",
          category: "General",
          priority: "Medium",
          status: "Active"
        },
        analysis: "📋 **ServiceNow Incident Analysis**\n\nIncident requires investigation. Standard troubleshooting procedures recommended.",
        relevantKB: [],
        recommendations: [
          "Gather detailed information about the incident",
          "Follow standard troubleshooting procedures", 
          "Update incident status with findings"
        ]
      });
    }
  });

  // Quiz Generation API
  app.post("/api/quiz/generate", async (req, res) => {
    try {
      const { topic, difficulty = "medium" } = req.body;
      
      const quizPrompt = `Generate a technical IT support quiz with 5 multiple choice questions about: ${topic}
      
Difficulty level: ${difficulty}

Format as JSON with this structure:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
      "correct": 0,
      "explanation": "Brief explanation of correct answer"
    }
  ]
}`;

      let quizContent = "";
      
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a technical trainer. Generate educational IT support quizzes in valid JSON format."
            },
            {
              role: "user",
              content: quizPrompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.7,
        });

        quizContent = completion.choices[0]?.message?.content || "";
      } catch (openaiError) {
        console.log("Using fallback quiz generation due to OpenAI error");
        // Force fallback quiz generation by setting empty content
        quizContent = "";
      }
      let quiz;
      
      try {
        quiz = JSON.parse(quizContent);
      } catch (parseError) {
        // Fallback quiz generation
        quiz = generateFallbackQuiz(topic, difficulty);
      }

      res.json({
        topic,
        difficulty,
        ...quiz,
        id: `quiz-${Date.now()}`
      });

    } catch (error) {
      console.error("Quiz generation error:", error);
      res.status(500).json({ error: "Failed to generate quiz" });
    }
  });

  // Feedback API
  app.post("/api/feedback", (req, res) => {
    try {
      const { type, content, rating, feature } = req.body;
      
      // In a real app, this would save to database
      console.log("Feedback received:", { type, content, rating, feature, timestamp: new Date().toISOString() });
      
      res.json({
        message: "Feedback received successfully",
        id: `feedback-${Date.now()}`
      });
    } catch (error) {
      console.error("Feedback API error:", error);
      res.status(500).json({ error: "Failed to submit feedback" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Fallback quiz generation
function generateFallbackQuiz(topic: string, difficulty: string) {
  const topicLower = topic.toLowerCase();
  
  const questions = [];
  
  if (topicLower.includes("network")) {
    questions.push(
      {
        question: "What is the first step when troubleshooting network connectivity issues?",
        options: [
          "A) Replace the network cable",
          "B) Check physical connections and status lights", 
          "C) Update network drivers",
          "D) Reset the router"
        ],
        correct: 1,
        explanation: "Always start with basic physical checks before moving to software troubleshooting."
      },
      {
        question: "Which command is used to test connectivity to a specific IP address?",
        options: [
          "A) ipconfig", 
          "B) netstat",
          "C) ping",
          "D) tracert"
        ],
        correct: 2,
        explanation: "The ping command sends ICMP packets to test basic connectivity to a target."
      }
    );
  } else if (topicLower.includes("email")) {
    questions.push(
      {
        question: "What protocol is commonly used for sending emails?",
        options: [
          "A) IMAP",
          "B) POP3", 
          "C) SMTP",
          "D) HTTP"
        ],
        correct: 2,
        explanation: "SMTP (Simple Mail Transfer Protocol) is the standard for sending emails."
      }
    );
  } else if (topicLower.includes("printer")) {
    questions.push(
      {
        question: "What service controls print jobs in Windows?",
        options: [
          "A) Print Spooler",
          "B) Print Manager", 
          "C) Print Service",
          "D) Print Controller"
        ],
        correct: 0,
        explanation: "The Print Spooler service manages all print jobs and printer communications."
      }
    );
  } else {
    // Generic IT questions
    questions.push(
      {
        question: "What is the first step in any IT troubleshooting process?",
        options: [
          "A) Restart the system",
          "B) Identify and define the problem", 
          "C) Check for updates",
          "D) Contact technical support"
        ],
        correct: 1,
        explanation: "Properly defining the problem is essential before attempting any solutions."
      }
    );
  }
  
  // Add more questions based on difficulty
  if (difficulty === "hard" && questions.length === 1) {
    questions.push({
      question: `Advanced ${topic} troubleshooting often requires which approach?`,
      options: [
        "A) Random trial and error",
        "B) Systematic elimination of variables",
        "C) Immediate escalation", 
        "D) User re-training"
      ],
      correct: 1,
      explanation: "Advanced troubleshooting requires methodical isolation of variables to identify root causes."
    });
  }
  
  return { questions };
}

// Fallback ServiceNow analysis
function generateServiceNowAnalysis(incident: any, relevantKB: any[]): string {
  let analysis = `📋 **ServiceNow Incident Analysis**\n\n`;
  analysis += `**Incident**: ${incident.number} - ${incident.title}\n`;
  analysis += `**Priority**: ${incident.priority}\n`;
  analysis += `**Category**: ${incident.category}\n\n`;
  
  // Analyze based on incident content
  const description = incident.description.toLowerCase();
  
  if (description.includes("email") || description.includes("outlook")) {
    analysis += `**Analysis**: Email connectivity issue detected. Likely authentication or server configuration problem affecting user productivity.\n\n`;
    analysis += `**Impact**: ${incident.priority.includes("High") ? "High" : "Medium"} - User unable to access critical communication tools.\n\n`;
  } else if (description.includes("slow") || description.includes("performance")) {
    analysis += `**Analysis**: System performance degradation affecting user workflow. Requires immediate optimization.\n\n`;
    analysis += `**Impact**: Medium - Reduced productivity due to system slowdown.\n\n`;
  } else if (description.includes("blue screen") || description.includes("bsod")) {
    analysis += `**Analysis**: Critical system failure requiring immediate attention. Hardware or driver related issue.\n\n`;
    analysis += `**Impact**: High - Complete system unavailability affecting business operations.\n\n`;
  } else {
    analysis += `**Analysis**: General IT support incident requiring systematic troubleshooting approach.\n\n`;
    analysis += `**Impact**: ${incident.priority.includes("High") ? "High" : "Medium"} - Service disruption affecting user operations.\n\n`;
  }
  
  analysis += `**Recommended Actions**:\n`;
  
  if (relevantKB.length > 0) {
    analysis += `Based on ${relevantKB.length} relevant KB articles:\n`;
    relevantKB.slice(0, 2).forEach((kb, index) => {
      analysis += `${index + 1}. Follow procedures in "${kb.title}"\n`;
    });
  } else {
    analysis += `1. Gather additional diagnostic information\n`;
    analysis += `2. Follow standard troubleshooting procedures\n`;
    analysis += `3. Update incident with findings\n`;
  }
  
  analysis += `\n**Escalation**: ${incident.priority.includes("Critical") || incident.priority.includes("High") ? "Consider L2 escalation if not resolved within 2 hours" : "Escalate to L2 if standard procedures don't resolve"}`;
  
  return analysis;
}

// Fallback AI response system for demo purposes
function generateFallbackResponse(message: string, relevantKB: any[]): string {
  const msgLower = message.toLowerCase();
  
  // Analyze the incident type
  let incidentType = "general";
  let priority = "Medium";
  
  if (msgLower.includes("blue screen") || msgLower.includes("bsod") || msgLower.includes("crash")) {
    incidentType = "system_crash";
    priority = "High";
  } else if (msgLower.includes("slow") || msgLower.includes("performance") || msgLower.includes("freeze")) {
    incidentType = "performance";
    priority = "Medium";
  } else if (msgLower.includes("network") || msgLower.includes("internet") || msgLower.includes("wifi")) {
    incidentType = "network";
    priority = "High";
  } else if (msgLower.includes("email") || msgLower.includes("outlook") || msgLower.includes("mail")) {
    incidentType = "email";
    priority = "Medium";
  } else if (msgLower.includes("printer") || msgLower.includes("print")) {
    incidentType = "printer";
    priority = "Low";
  }

  let response = `🔍 **AI Incident Analysis**\n\n`;
  response += `**Incident Type**: ${incidentType.replace('_', ' ').toUpperCase()}\n`;
  response += `**Priority**: ${priority}\n\n`;
  
  response += `**Initial Assessment**: `;
  
  switch (incidentType) {
    case "system_crash":
      response += `Critical system failure detected. This typically indicates driver conflicts, hardware issues, or corrupted system files that require immediate attention.`;
      break;
    case "performance":
      response += `Performance degradation detected. This usually stems from resource constraints, background processes, or system optimization needs.`;
      break;
    case "network":
      response += `Network connectivity issue identified. This could be related to DNS, firewall, adapter configuration, or infrastructure problems.`;
      break;
    case "email":
      response += `Email configuration or authentication issue detected. This typically involves server settings, credentials, or client configuration problems.`;
      break;
    case "printer":
      response += `Printer connectivity or driver issue identified. This commonly involves driver updates, queue clearing, or network configuration.`;
      break;
    default:
      response += `General IT support incident requiring systematic troubleshooting approach.`;
  }
  
  response += `\n\n**Recommended Actions**:\n`;
  
  if (relevantKB.length > 0) {
    response += `Based on ${relevantKB.length} relevant knowledge base article(s):\n\n`;
    relevantKB.slice(0, 2).forEach((kb, index) => {
      response += `${index + 1}. **${kb.title}**\n`;
      response += `   ${kb.content.substring(0, 150)}...\n\n`;
    });
  } else {
    // Generic recommendations based on incident type
    switch (incidentType) {
      case "system_crash":
        response += `1. Boot system in Safe Mode\n2. Check for recent driver updates\n3. Run memory diagnostics\n4. Review Event Viewer logs\n`;
        break;
      case "performance":
        response += `1. Check Task Manager for resource usage\n2. Disable unnecessary startup programs\n3. Run disk cleanup and defragmentation\n4. Scan for malware\n`;
        break;
      case "network":
        response += `1. Check physical network connections\n2. Restart network adapter\n3. Flush DNS cache (ipconfig /flushdns)\n4. Reset TCP/IP stack\n`;
        break;
      case "email":
        response += `1. Verify server settings (IMAP/SMTP)\n2. Check credentials and authentication\n3. Test with different email client\n4. Review firewall/antivirus settings\n`;
        break;
      case "printer":
        response += `1. Check power and cable connections\n2. Clear print queue\n3. Update printer drivers\n4. Restart print spooler service\n`;
        break;
      default:
        response += `1. Gather detailed information about the issue\n2. Check event logs and error messages\n3. Test in different environments\n4. Document findings for escalation\n`;
    }
  }
  
  response += `\n**Next Steps**: If issue persists after following these procedures, escalate to L2 support with detailed troubleshooting logs.`;
  
  return response;
}

// Helper function to search knowledge base
function searchKnowledgeBase(query: string, limit: number = 5) {
  const queryWords = query.toLowerCase().split(/\s+/);
  const results: Array<{ score: number; article: any }> = [];
  
  for (const article of KNOWLEDGE_BASE) {
    let score = 0;
    const searchText = `${article.title} ${article.content} ${article.tags.join(' ')}`.toLowerCase();
    
    for (const word of queryWords) {
      if (searchText.includes(word)) {
        // Title matches score higher
        if (article.title.toLowerCase().includes(word)) {
          score += 3;
        }
        // Tag matches score medium
        if (article.tags.some(tag => tag.toLowerCase().includes(word))) {
          score += 2;
        }
        // Content matches score lower
        if (article.content.toLowerCase().includes(word)) {
          score += 1;
        }
      }
    }
    
    if (score > 0) {
      results.push({ score, article });
    }
  }
  
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => r.article);
}