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
  },
  {
    id: "KB007",
    title: "VPN Connection Problems and Solutions",
    category: "Network",
    content: "VPN connectivity issues affect remote work productivity. Common problems: 1) Check internet connection first 2) Verify VPN credentials 3) Try different VPN servers 4) Disable firewall temporarily 5) Update VPN client software 6) Clear DNS cache 7) Restart network adapters 8) Check for IP conflicts. For corporate VPNs, contact IT admin for server status.",
    tags: ["VPN", "Remote Work", "Network", "Authentication", "Security"]
  },
  {
    id: "KB008",
    title: "Windows Update Stuck or Failing",
    category: "Windows",
    content: "Windows Update failures can cause security vulnerabilities. Troubleshooting: 1) Run Windows Update Troubleshooter 2) Restart Windows Update services 3) Clear SoftwareDistribution folder 4) Use DISM and SFC commands 5) Download updates manually 6) Check disk space availability 7) Temporarily disable antivirus 8) Reset Windows Update components using command line tools.",
    tags: ["Windows Update", "System Updates", "Security", "Troubleshooting"]
  },
  {
    id: "KB009",
    title: "Password Reset and Account Lockout Issues",
    category: "Security",
    content: "Account access problems require immediate attention. Resolution steps: 1) Verify account status in Active Directory 2) Check for multiple failed login attempts 3) Reset password using admin tools 4) Unlock account if needed 5) Clear cached credentials 6) Verify password policy compliance 7) Check for time synchronization issues 8) Update security questions if available.",
    tags: ["Password", "Account", "Security", "Active Directory", "Authentication"]
  },
  {
    id: "KB010",
    title: "Hard Drive Corruption and Data Recovery",
    category: "Hardware",
    content: "Hard drive issues can lead to data loss. Emergency procedures: 1) Stop using the drive immediately 2) Run CHKDSK for minor corruption 3) Use disk diagnostic tools 4) Attempt data recovery software 5) Check physical connections 6) Boot from external media 7) Professional data recovery for critical files 8) Implement backup verification protocols.",
    tags: ["Hard Drive", "Data Recovery", "Corruption", "Backup", "Critical"]
  },
  {
    id: "KB011",
    title: "Wi-Fi Authentication and Connection Problems", 
    category: "Network",
    content: "Wireless connectivity issues in enterprise environments. Solutions: 1) Forget and reconnect to network 2) Update wireless drivers 3) Check enterprise authentication settings 4) Verify certificates and profiles 5) Reset network stack 6) Check for MAC address filtering 7) Update wireless adapter firmware 8) Use ethernet cable for temporary access.",
    tags: ["Wi-Fi", "Wireless", "Authentication", "Enterprise", "Drivers"]
  },
  {
    id: "KB012",
    title: "Software Installation and Compatibility Issues",
    category: "Software",
    content: "Application deployment problems affect user productivity. Resolution: 1) Check system requirements compatibility 2) Run as administrator 3) Disable antivirus during installation 4) Clear temporary installation files 5) Use compatibility mode for older software 6) Check for conflicting applications 7) Repair Windows Installer service 8) Use MSI installation packages when available.",
    tags: ["Software", "Installation", "Compatibility", "Applications", "Deployment"]
  },
  {
    id: "KB013",
    title: "Database Connection Timeout and Performance",
    category: "Database", 
    content: "Database connectivity affects business applications. Troubleshooting: 1) Check database server status 2) Verify connection strings 3) Test network connectivity to database server 4) Check database logs for errors 5) Optimize query performance 6) Verify user permissions 7) Check connection pool settings 8) Monitor database resource usage and locks.",
    tags: ["Database", "Connection", "Performance", "SQL", "Server"]
  },
  {
    id: "KB014",
    title: "Mobile Device MDM Enrollment Problems",
    category: "Mobile",
    content: "Mobile Device Management enrollment issues. Steps: 1) Verify device compatibility with MDM 2) Check network connectivity 3) Clear device management profiles 4) Re-enroll device in MDM system 5) Verify user permissions in MDM console 6) Check certificate validity 7) Update device OS to latest version 8) Factory reset as last resort with proper data backup.",
    tags: ["Mobile", "MDM", "Enrollment", "BYOD", "Security"]
  },
  {
    id: "KB015",
    title: "Server Memory and CPU High Usage Alerts",
    category: "Server",
    content: "Server performance monitoring and optimization. Actions: 1) Identify top resource-consuming processes 2) Check for memory leaks in applications 3) Review server performance baselines 4) Implement process monitoring 5) Schedule server maintenance windows 6) Optimize database queries 7) Add more RAM or CPU if hardware limitation 8) Implement load balancing for high-traffic applications.",
    tags: ["Server", "Performance", "Memory", "CPU", "Monitoring"]
  },
  {
    id: "KB016",
    title: "Microsoft Teams Audio and Video Issues",
    category: "Communication",
    content: "Teams meeting problems affect remote collaboration. Solutions: 1) Check microphone and camera permissions 2) Update Teams application 3) Test audio/video in Teams settings 4) Clear Teams cache and cookies 5) Restart Teams application 6) Check firewall and proxy settings 7) Use Teams web version as backup 8) Update audio/video drivers.",
    tags: ["Teams", "Audio", "Video", "Meetings", "Communication"]
  },
  {
    id: "KB017",
    title: "Ransomware Detection and Response Protocol",
    category: "Security",
    content: "Ransomware incident response procedures. Immediate actions: 1) Isolate infected systems from network 2) Do not pay ransom demands 3) Identify ransomware variant 4) Check backup integrity and availability 5) Run anti-malware scans on clean systems 6) Document incident for forensics 7) Restore from clean backups 8) Implement additional security measures to prevent reinfection.",
    tags: ["Ransomware", "Security", "Incident Response", "Malware", "Critical"]
  },
  {
    id: "KB018",
    title: "SharePoint Access Denied and Permission Issues",
    category: "Collaboration",
    content: "SharePoint permission problems affect document collaboration. Resolution: 1) Check user permissions in SharePoint admin 2) Verify group memberships 3) Clear browser cache and cookies 4) Try incognito/private browsing mode 5) Check SharePoint service health 6) Re-authenticate user credentials 7) Grant appropriate permission levels 8) Check for site collection administrator rights.",
    tags: ["SharePoint", "Permissions", "Access", "Collaboration", "Documents"]
  },
  {
    id: "KB019",
    title: "USB Device Not Recognized or Malfunctioning",
    category: "Hardware",
    content: "USB connectivity problems with peripherals. Troubleshooting: 1) Try different USB ports 2) Test device on another computer 3) Update USB drivers 4) Check Device Manager for errors 5) Uninstall and reinstall USB controllers 6) Run Hardware and Devices troubleshooter 7) Check USB power management settings 8) Disable USB selective suspend.",
    tags: ["USB", "Hardware", "Peripherals", "Drivers", "Device Manager"]
  },
  {
    id: "KB020",
    title: "Exchange Server Mailbox Full and Email Delivery Issues",
    category: "Email",
    content: "Exchange mailbox storage and delivery problems. Solutions: 1) Check mailbox storage quota limits 2) Archive old emails to reduce size 3) Empty deleted items folder 4) Check mail routing and connectors 5) Verify DNS MX records 6) Test email flow with message tracking 7) Check Exchange service health 8) Implement mailbox size policies and user training.",
    tags: ["Exchange", "Mailbox", "Storage", "Email Delivery", "Server"]
  },
  {
    id: "KB021",
    title: "Linux Server SSH Connection and Permission Denied",
    category: "Linux",
    content: "SSH access problems on Linux servers. Troubleshooting: 1) Check SSH service status (systemctl status ssh) 2) Verify user account exists and password 3) Check SSH configuration file permissions 4) Review /var/log/auth.log for errors 5) Verify firewall rules (iptables/ufw) 6) Check SSH key permissions (chmod 600) 7) Test SSH connection with verbose output 8) Verify SELinux/AppArmor policies.",
    tags: ["Linux", "SSH", "Server", "Permissions", "Authentication"]
  },
  {
    id: "KB022",
    title: "Backup System Failure and Recovery Procedures",
    category: "Backup",
    content: "Backup system failures require immediate attention. Actions: 1) Check backup software logs for errors 2) Verify backup storage space availability 3) Test backup media integrity 4) Check network connectivity to backup destinations 5) Verify backup schedules and policies 6) Test restore procedures on non-production data 7) Document backup failure incidents 8) Implement redundant backup strategies.",
    tags: ["Backup", "Recovery", "Data Protection", "Storage", "Critical"]
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
      
      // First filter by category if specified
      if (category && category !== 'all') {
        results = results.filter(kb => kb.category.toLowerCase() === (category as string).toLowerCase());
      }
      
      // Then apply search query if provided
      if (query && query.trim()) {
        results = searchKnowledgeBaseFromList(results, query as string);
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
  
  // Handle basic conversational queries first
  if (msgLower.match(/^(hi|hello|hey|good morning|good afternoon|good evening)(!|\.|\s)*$/)) {
    return `👋 **Hello! Welcome to your AI IT Support Assistant!**

I'm here to help you with all your IT support needs. Here's what I can do for you:

🔧 **Incident Analysis** - Describe any IT issue and I'll analyze it with priority assessment
📚 **Knowledge Base Search** - Find troubleshooting guides and solutions  
🎫 **ServiceNow Integration** - View and analyze incidents with AI recommendations
📖 **Learning & Training** - Generate quizzes to test your IT knowledge

**Try asking me about:**
• "My computer is running slow"
• "Email not working" 
• "Blue screen error"
• "Network connectivity issues"
• "Help with printer problems"

How can I assist you today?`;
  }

  if (msgLower.match(/^(help|what can you do|commands|options|how to use|guide)(!|\.|\s)*$/)) {
    return `🤖 **AI Support Assistant - Help Guide**

**What I can help you with:**

🔍 **Incident Analysis & Troubleshooting**
• Describe any IT problem and I'll provide intelligent analysis
• Get priority assessment and step-by-step solutions
• Access relevant knowledge base articles automatically

📋 **Available Commands & Features:**
• **"help"** - Show this help guide
• **"hi/hello"** - Get a friendly greeting and overview
• **Describe any IT issue** - Get instant analysis and recommendations

**Knowledge Areas I Cover:**
• 🪟 Windows issues (BSOD, performance, crashes)
• 🍎 Mac system problems (boot issues, startup problems)  
• 🌐 Network connectivity (DNS, WiFi, adapter issues)
• 📧 Email configuration (Outlook, SMTP, authentication)
• 🖨️ Printer problems (drivers, spooler, connectivity)
• ⚡ Performance optimization (slow systems, freezing)

**Tips for Best Results:**
• Be specific about your problem
• Include error messages if you have them
• Mention what you were doing when the issue occurred

Ready to help solve your IT challenges! What's the issue?`;
  }

  if (msgLower.match(/^(thanks|thank you|bye|goodbye|good bye)(!|\.|\s)*$/)) {
    return `✨ **You're welcome!**

I'm always here to help with your IT support needs. Feel free to come back anytime you have:
• Technical issues to troubleshoot
• Questions about IT procedures  
• Need for incident analysis
• Any other IT support challenges

Have a great day, and remember - no IT problem is too big or small! 👋`;
  }

  // If it's a very short query that doesn't seem technical, provide guidance
  if (msgLower.length < 10 && !msgLower.match(/(error|issue|problem|slow|crash|blue|network|email|printer)/)) {
    return `🤔 **I'd love to help!**

Could you provide more details about the IT issue you're experiencing? 

**For better assistance, try describing:**
• What specific problem you're having
• What device or system is affected  
• Any error messages you're seeing
• When the issue started

**Example queries:**
• "My laptop won't start up"
• "Getting email authentication errors"
• "Blue screen when I boot Windows"
• "Network connection keeps dropping"

What IT challenge can I help you solve?`;
  }
  
  // Analyze the incident type for technical queries
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

// Helper function to search within a pre-filtered list of articles
function searchKnowledgeBaseFromList(articles: any[], query: string, limit: number = 20) {
  const queryWords = query.toLowerCase().split(/\s+/);
  const results: Array<{ score: number; article: any }> = [];
  
  for (const article of articles) {
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