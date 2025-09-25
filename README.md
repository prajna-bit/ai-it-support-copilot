# IT Support Assistant - AI-Powered Co-Pilot for Support Engineers

**M.Tech Dissertation Project**  
**Student:** Prajna G (2021WB86982)  
**Institution:** BITS Pilani  

## 🎯 Project Overview

This project demonstrates an **AI-powered IT Support Assistant** using **Large Language Models (LLM)** and **Offline Retrieval-Augmented Generation (RAG)** to help support engineers efficiently handle incidents, search knowledge bases, and get contextual recommendations.

## 🚀 Key Features Demonstrated

### 🧠 **Core AI Capabilities**
- **LLM Integration**: GPT-4 powered incident analysis and intelligent summarization
- **RAG System**: Retrieval-Augmented Generation with semantic knowledge search  
- **Offline Capabilities**: Local knowledge base storage for outage scenarios

### 🏢 **Enterprise Integration**
- **ServiceNow Simulation**: Mock ITSM with incident management and AI analysis
- **Knowledge Base**: Comprehensive IT support articles with intelligent search
- **Incident Analysis**: Smart categorization and solution recommendations

### 📚 **Learning & Improvement**
- **AI Quiz System**: Interactive quizzes generated from knowledge base content
- **Performance Analytics**: Detailed scoring with personalized learning recommendations  
- **Feedback Loop**: User feedback system with analytics dashboard for continuous AI improvement

## 🛠 **Tech Stack**

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS + shadcn/ui components
- TanStack Query for state management
- Wouter for routing

**Backend:**
- Node.js with Express.js
- Python Flask (for AI/ML components)
- OpenAI API (GPT-4 & text-embedding-ada-002)
- PostgreSQL with Neon serverless

**AI/ML:**
- OpenAI GPT-4 for LLM capabilities
- Text embeddings for semantic search
- Scikit-learn for similarity calculations
- Custom RAG implementation

## 📋 **Setup Instructions for Local Development**

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Git

### 1. Clone the Repository
```bash
git clone <your-github-repo-url>
cd it-support-assistant
```

### 2. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install Python dependencies  
pip install flask flask-cors openai python-dotenv scikit-learn numpy
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
SESSION_SECRET=your_session_secret_here
```

### 4. Run the Application

**Option A: Full Stack Application (Recommended for Demo)**
```bash
npm run dev
```
- Access at: `http://localhost:5000`
- Features: Complete TypeScript app with chat interface, dashboard, and all M.Tech features

**Option B: Python Demo System (Standalone)**
```bash
python demo_app.py
```
- Access at: `http://localhost:5001`  
- Features: Standalone Python demo with all AI features in one interface

## 🎓 **For M.Tech Presentation**

### **Demonstrating Key Features:**

1. **Incident Summarization Bot**
   - Navigate to `/chat` in the main app
   - Enter an incident description
   - Show AI-powered analysis and recommendations

2. **RAG Knowledge Search**
   - Use the search functionality
   - Demonstrate semantic search capabilities
   - Show relevance scoring and source citations

3. **ServiceNow Integration**
   - Access the integration simulation
   - Show incident creation and AI analysis
   - Demonstrate enterprise ITSM workflows

4. **Learning Quizzes**
   - Generate AI-powered quizzes
   - Show performance analytics
   - Demonstrate personalized recommendations

5. **Feedback Analytics**
   - Submit feedback on AI responses
   - View analytics dashboard
   - Show continuous improvement capabilities

### **Architecture Highlights:**

- **Offline RAG**: System works without internet for critical scenarios
- **Scalable Design**: Microservices architecture with clear separation of concerns
- **Production Ready**: Includes authentication, session management, and security features
- **Enterprise Integration**: ServiceNow simulation shows real-world applicability

## 📊 **M.Tech Research Contributions**

1. **Novel RAG Architecture**: Offline-capable retrieval system for IT support scenarios
2. **LLM Integration**: Practical application of GPT-4 for incident analysis
3. **Continuous Learning**: Feedback loop system for AI improvement
4. **Enterprise Readiness**: Production-grade architecture with ITSM integration

## 🔧 **Project Structure**

```
├── client/                 # React TypeScript frontend
│   ├── src/
│   │   ├── pages/         # Main application pages
│   │   ├── components/    # Reusable UI components
│   │   └── lib/          # Utilities and configurations
├── server/                # Node.js Express backend
├── shared/                # Shared TypeScript schemas
├── app.py                 # Python AI/ML backend
├── demo_app.py           # Standalone Python demo
└── README.md             # This file
```

## 🏆 **Academic Evaluation Points**

- **Technical Innovation**: Novel offline RAG implementation
- **Practical Application**: Real-world IT support use case
- **AI/ML Integration**: Sophisticated LLM and embedding usage
- **Software Engineering**: Production-grade architecture and code quality
- **User Experience**: Professional UI/UX design
- **Scalability**: Enterprise-ready design patterns

## 📞 **Contact**

**Student:** Prajna G  
**Roll No:** 2021WB86982  
**Institution:** BITS Pilani  
**Project:** IT Support Assist: AI-Powered Co-Pilot for Support Engineers Using LLM and Offline RAG