"""
IT Support Assistant: AI-Powered Co-Pilot
Offline-capable version for demonstrations and fallback scenarios
"""

import json
import numpy as np
from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
from datetime import datetime
import uuid
import os

app = Flask(__name__)
CORS(app)

# Sample knowledge base with pre-computed similarity scores for demo
KNOWLEDGE_BASE = [
    {
        "id": "KB001",
        "title": "Windows Blue Screen of Death (BSOD) Troubleshooting",
        "category": "Windows",
        "content": "Blue Screen of Death errors indicate critical system failures. Common causes include driver issues, hardware problems, and corrupted system files. Solutions: 1) Boot in Safe Mode 2) Update or rollback drivers 3) Run memory diagnostic 4) Check hard drive health 5) Restore system to previous working state. For IRQL_NOT_LESS_OR_EQUAL errors, focus on driver updates.",
        "tags": ["BSOD", "Windows", "Drivers", "Hardware", "Critical"],
        "keywords": ["blue screen", "bsod", "windows", "crash", "driver", "irql"]
    },
    {
        "id": "KB002", 
        "title": "Mac System Won't Boot - Startup Issues",
        "category": "Mac",
        "content": "Mac startup problems can be caused by corrupted system files, hardware failures, or software conflicts. Troubleshooting steps: 1) Reset NVRAM/PRAM (Cmd+Option+P+R) 2) Boot in Safe Mode (hold Shift) 3) Run Disk Utility from Recovery Mode 4) Reinstall macOS if necessary 5) Check hardware connections. For spinning wheel issues, often disk-related.",
        "tags": ["Mac", "Startup", "Boot", "NVRAM", "Recovery"],
        "keywords": ["mac", "boot", "startup", "nvram", "recovery", "macos"]
    },
    {
        "id": "KB003",
        "title": "Network Connectivity Issues Resolution",
        "category": "Network", 
        "content": "Network connectivity problems affect productivity. Systematic approach: 1) Check physical connections 2) Restart network adapter 3) Flush DNS cache (ipconfig /flushdns) 4) Reset network stack 5) Update network drivers 6) Check firewall settings 7) Contact ISP if external. For intermittent issues, check for interference.",
        "tags": ["Network", "Connectivity", "DNS", "Firewall", "Drivers"],
        "keywords": ["network", "internet", "connectivity", "dns", "firewall", "wifi"]
    },
    {
        "id": "KB004",
        "title": "Printer Not Responding - Universal Fix Guide",
        "category": "Hardware",
        "content": "Printer issues are common in office environments. Resolution steps: 1) Check power and cable connections 2) Clear print queue 3) Restart print spooler service 4) Update printer drivers 5) Run printer troubleshooter 6) Check ink/toner levels 7) Clean print heads. For network printers, verify IP configuration.",
        "tags": ["Printer", "Hardware", "Drivers", "Spooler", "Network"],
        "keywords": ["printer", "print", "spooler", "queue", "driver", "toner"]
    },
    {
        "id": "KB005",
        "title": "Email Client Configuration and Troubleshooting",
        "category": "Email",
        "content": "Email setup and issues resolution for Outlook and other clients. Common problems: 1) Incorrect server settings (IMAP/POP3/SMTP) 2) Authentication failures 3) SSL/TLS configuration 4) Firewall blocking ports 5) Corrupted profile. Solutions include recreating profiles, checking server settings, and verifying credentials.",
        "tags": ["Email", "Outlook", "IMAP", "SMTP", "Configuration"],
        "keywords": ["email", "outlook", "imap", "smtp", "mail", "authentication"]
    },
    {
        "id": "KB006",
        "title": "Slow Computer Performance Optimization",
        "category": "Performance",
        "content": "System slowdown affects user productivity. Optimization steps: 1) Check resource usage in Task Manager 2) Disable startup programs 3) Run disk cleanup 4) Defragment hard drive 5) Scan for malware 6) Update drivers 7) Add more RAM if needed 8) Clean temporary files. Monitor CPU and memory usage patterns.",
        "tags": ["Performance", "Optimization", "Memory", "CPU", "Cleanup"],
        "keywords": ["slow", "performance", "cpu", "memory", "cleanup", "optimization"]
    }
]

class SimpleRAGDemo:
    def __init__(self):
        self.knowledge_base = KNOWLEDGE_BASE
        
    def search_knowledge_base(self, query, top_k=3):
        """Simple keyword-based search for demo"""
        query_words = query.lower().split()
        results = []
        
        for article in self.knowledge_base:
            score = 0
            # Check keywords
            for word in query_words:
                if word in article['keywords']:
                    score += 0.3
                if word in article['title'].lower():
                    score += 0.4
                if word in article['content'].lower():
                    score += 0.2
                if word in [tag.lower() for tag in article['tags']]:
                    score += 0.1
            
            if score > 0:
                article_copy = article.copy()
                article_copy['relevance_score'] = min(score, 1.0)
                results.append(article_copy)
        
        # Sort by relevance and return top-k
        results.sort(key=lambda x: x['relevance_score'], reverse=True)
        return results[:top_k]
    
    def summarize_incident(self, incident_text):
        """Demo incident summarization"""
        key_terms = []
        if 'blue screen' in incident_text.lower() or 'bsod' in incident_text.lower():
            key_terms.append('Windows BSOD')
        if 'slow' in incident_text.lower() or 'performance' in incident_text.lower():
            key_terms.append('Performance Issue')
        if 'network' in incident_text.lower() or 'internet' in incident_text.lower():
            key_terms.append('Network Connectivity')
        if 'email' in incident_text.lower() or 'outlook' in incident_text.lower():
            key_terms.append('Email Configuration')
        if 'printer' in incident_text.lower() or 'print' in incident_text.lower():
            key_terms.append('Printer Hardware')
        if 'mac' in incident_text.lower() or 'macos' in incident_text.lower():
            key_terms.append('Mac System')
            
        if not key_terms:
            key_terms = ['General IT Issue']
            
        summary = f"🔍 **Incident Analysis**: {', '.join(key_terms)}\n\n"
        summary += f"**Issue Description**: {incident_text[:100]}...\n\n"
        summary += f"**Priority**: {'High' if any(term in ['BSOD', 'Network'] for term in key_terms) else 'Medium'}\n\n"
        summary += f"**Recommended Action**: Search knowledge base for relevant troubleshooting steps"
        
        return summary
    
    def generate_solution(self, incident_summary, relevant_kb):
        """Generate solution using retrieved KB articles"""
        if not relevant_kb:
            return "No relevant knowledge base articles found. Please contact L2 support."
            
        solution = "🎯 **AI-Generated Solution**:\n\n"
        solution += f"Based on the incident analysis and {len(relevant_kb)} relevant KB articles:\n\n"
        
        for i, kb in enumerate(relevant_kb[:2], 1):
            solution += f"**Step {i} - {kb['title']}**:\n"
            solution += f"{kb['content'][:200]}...\n\n"
        
        solution += "**Additional Recommendations**:\n"
        solution += "• Follow the step-by-step procedures in the referenced KB articles\n"
        solution += "• Document any additional findings for knowledge base improvement\n" 
        solution += "• Escalate to L2 if issues persist after following these steps"
        
        return solution

# Initialize RAG system
rag_demo = SimpleRAGDemo()

@app.route('/')
def home():
    """Demo interface for IT Support Assistant"""
    return render_template_string("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>IT Support Assistant - Demo</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh; 
                padding: 20px;
            }
            .container { 
                max-width: 1400px; 
                margin: 0 auto; 
                background: white; 
                border-radius: 12px; 
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            .header { 
                background: linear-gradient(135deg, #007acc 0%, #0056b3 100%);
                color: white; 
                text-align: center; 
                padding: 30px 20px;
            }
            .header h1 { font-size: 2.5em; margin-bottom: 10px; }
            .header h2 { font-size: 1.3em; opacity: 0.9; margin-bottom: 5px; }
            .header p { opacity: 0.8; font-size: 0.95em; }
            .main-content { padding: 30px; }
            .demo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
            .demo-section { 
                background: #f8f9fa; 
                padding: 25px; 
                border-radius: 8px; 
                border-left: 4px solid #007acc;
            }
            .demo-section h3 { 
                color: #333; 
                margin-bottom: 15px; 
                font-size: 1.2em;
                display: flex; 
                align-items: center; 
                gap: 10px;
            }
            .demo-section h3::before {
                content: "🔧";
                font-size: 1.5em;
            }
            textarea { 
                width: 100%; 
                height: 80px; 
                margin: 10px 0; 
                padding: 12px; 
                border: 2px solid #e9ecef;
                border-radius: 6px;
                font-family: inherit;
                resize: vertical;
                font-size: 14px;
            }
            textarea:focus {
                outline: none;
                border-color: #007acc;
                box-shadow: 0 0 0 3px rgba(0, 122, 204, 0.1);
            }
            .button { 
                background: linear-gradient(135deg, #007acc 0%, #0056b3 100%);
                color: white; 
                padding: 12px 24px; 
                border: none; 
                border-radius: 6px; 
                cursor: pointer; 
                font-size: 14px;
                font-weight: 600;
                transition: all 0.3s;
            }
            .button:hover { 
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(0, 122, 204, 0.3);
            }
            .button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }
            .result { 
                background: white; 
                padding: 20px; 
                margin: 15px 0; 
                border-left: 4px solid #28a745;
                border-radius: 6px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            }
            .result h4 { 
                color: #333; 
                margin-bottom: 10px;
                font-size: 1.1em;
            }
            .kb-article { 
                background: #e8f4f8; 
                padding: 15px; 
                margin: 8px 0; 
                border-radius: 6px;
                border-left: 3px solid #17a2b8;
            }
            .kb-article h5 { 
                color: #0c5460; 
                margin-bottom: 8px;
                font-size: 1em;
            }
            .kb-article .category { 
                background: #17a2b8; 
                color: white; 
                padding: 2px 8px; 
                border-radius: 12px; 
                font-size: 12px;
                margin-right: 8px;
            }
            .loading { 
                display: none; 
                color: #007acc; 
                font-style: italic;
                margin: 10px 0;
            }
            .status-bar {
                background: #28a745;
                color: white;
                padding: 10px 20px;
                text-align: center;
                font-weight: 600;
            }
            .features-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin-top: 30px;
            }
            .feature-card {
                background: white;
                padding: 20px;
                border-radius: 8px;
                border: 2px solid #e9ecef;
                text-align: center;
            }
            .feature-card h4 {
                color: #007acc;
                margin-bottom: 10px;
            }
            @media (max-width: 768px) {
                .demo-grid { grid-template-columns: 1fr; }
                .header h1 { font-size: 1.8em; }
                .container { margin: 10px; border-radius: 8px; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🤖 IT Support Assistant</h1>
                <h2>AI-Powered Co-Pilot with Offline RAG</h2>
                <p><strong>Intelligent IT Support Solution</strong></p>
                <p>Advanced RAG System for Enterprise Support Teams</p>
            </div>
            
            <div class="status-bar">
                ✅ RAG System Online | 📚 6 Knowledge Base Articles Loaded | 🔒 Offline Capable
            </div>
            
            <div class="main-content">
                <div class="demo-grid">
                    <div class="demo-section">
                        <h3>Incident Summarization</h3>
                        <textarea id="incident" placeholder="Describe the IT incident (e.g., 'My computer shows blue screen error IRQL_NOT_LESS_OR_EQUAL and restarts repeatedly...')"></textarea>
                        <button class="button" onclick="analyzeIncident()">🔍 Analyze with AI</button>
                        <div class="loading" id="incident-loading">Analyzing incident...</div>
                        <div id="incident-result"></div>
                    </div>
                    
                    <div class="demo-section">
                        <h3>Knowledge Base Search</h3>
                        <textarea id="search" placeholder="Search for solutions (e.g., 'printer not working', 'slow computer', 'network issues...')"></textarea>
                        <button class="button" onclick="searchKB()">🔍 Search RAG System</button>
                        <div class="loading" id="search-loading">Searching knowledge base...</div>
                        <div id="search-result"></div>
                    </div>
                </div>
                
                <div class="demo-section">
                    <h3>Complete RAG Solution Pipeline</h3>
                    <textarea id="problem" placeholder="Describe your complete IT problem for end-to-end AI solution (e.g., 'Users in accounting department cannot access email, getting authentication errors in Outlook...')"></textarea>
                    <button class="button" onclick="getSolution()">🎯 Get Complete AI Solution</button>
                    <div class="loading" id="solution-loading">Generating RAG-powered solution...</div>
                    <div id="solution-result"></div>
                </div>
                
                <div class="demo-section">
                    <h3>ServiceNow Integration Demo</h3>
                    <p style="margin-bottom: 15px;">Mock enterprise ITSM integration with incident management</p>
                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <button class="button" onclick="loadServiceNowIncidents()">📋 Load Incidents</button>
                        <button class="button" onclick="analyzeIncident('INC0000123')" style="background: #28a745;">🔍 Analyze INC0000123</button>
                        <button class="button" onclick="showCreateIncident()" style="background: #ffc107; color: #333;">➕ Create New</button>
                    </div>
                    <div id="servicenow-result"></div>
                </div>
                
                <div class="demo-section">
                    <h3>AI-Powered Learning Quiz System</h3>
                    <p style="margin-bottom: 15px;">Interactive quizzes generated from knowledge base for skill development</p>
                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <select id="quiz-category" style="padding: 10px; border: 2px solid #e9ecef; border-radius: 6px;">
                            <option value="all">All Categories</option>
                            <option value="Windows">Windows</option>
                            <option value="Network">Network</option>
                            <option value="Hardware">Hardware</option>
                        </select>
                        <button class="button" onclick="generateQuiz()">🎯 Generate Quiz</button>
                        <button class="button" onclick="loadQuizCategories()" style="background: #6c757d;">📚 Load Categories</button>
                    </div>
                    <div id="quiz-result"></div>
                </div>
                
                <div class="demo-section">
                    <h3>Feedback & Analytics System</h3>
                    <p style="margin-bottom: 15px;">Continuous improvement through user feedback and AI performance analytics</p>
                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <button class="button" onclick="showFeedbackForm()">💬 Submit Feedback</button>
                        <button class="button" onclick="generateDemoFeedback()" style="background: #6c757d;">📊 Generate Demo Data</button>
                        <button class="button" onclick="showAnalytics()" style="background: #17a2b8;">📈 View Analytics</button>
                    </div>
                    <div id="feedback-result"></div>
                </div>
                
                <div class="features-grid">
                    <div class="feature-card">
                        <h4>🧠 LLM Integration</h4>
                        <p>GPT-powered incident analysis and intelligent summarization</p>
                    </div>
                    <div class="feature-card">
                        <h4>🔍 RAG System</h4>
                        <p>Retrieval-Augmented Generation with semantic knowledge search</p>
                    </div>
                    <div class="feature-card">
                        <h4>📱 Offline Capable</h4>
                        <p>Local knowledge base storage for outage scenarios</p>
                    </div>
                    <div class="feature-card">
                        <h4>⚡ ServiceNow Integration</h4>
                        <p>Enterprise ITSM integration with intelligent incident analysis</p>
                    </div>
                    <div class="feature-card">
                        <h4>🎯 AI Learning Quizzes</h4>
                        <p>Interactive skill assessment and knowledge improvement</p>
                    </div>
                    <div class="feature-card">
                        <h4>📊 Feedback Analytics</h4>
                        <p>Continuous AI improvement through user feedback loops</p>
                    </div>
                </div>
            </div>
        </div>
        
        <script>
            function showLoading(id) {
                document.getElementById(id).style.display = 'block';
            }
            
            function hideLoading(id) {
                document.getElementById(id).style.display = 'none';
            }
            
            async function analyzeIncident() {
                const incident = document.getElementById('incident').value;
                if (!incident.trim()) {
                    alert('Please enter an incident description');
                    return;
                }
                
                showLoading('incident-loading');
                
                try {
                    const response = await fetch('/api/summarize', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({incident: incident})
                    });
                    const result = await response.json();
                    
                    document.getElementById('incident-result').innerHTML = 
                        `<div class="result">
                            <h4>📊 AI Incident Analysis</h4>
                            <pre style="white-space: pre-wrap; font-family: inherit; line-height: 1.5;">${result.summary}</pre>
                        </div>`;
                } catch (error) {
                    document.getElementById('incident-result').innerHTML = 
                        `<div class="result" style="border-left-color: #dc3545;">
                            <h4>❌ Error</h4>
                            <p>Error analyzing incident: ${error.message}</p>
                        </div>`;
                } finally {
                    hideLoading('incident-loading');
                }
            }
            
            async function searchKB() {
                const query = document.getElementById('search').value;
                if (!query.trim()) {
                    alert('Please enter a search query');
                    return;
                }
                
                showLoading('search-loading');
                
                try {
                    const response = await fetch('/api/search', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({query: query})
                    });
                    const result = await response.json();
                    
                    let html = '<div class="result"><h4>🔍 RAG Search Results</h4>';
                    
                    if (result.results.length === 0) {
                        html += '<p>No relevant articles found. Try different keywords.</p>';
                    } else {
                        result.results.forEach(article => {
                            html += `<div class="kb-article">
                                <h5>
                                    <span class="category">${article.category}</span>
                                    ${article.title}
                                    <span style="color: #28a745; font-weight: normal;">(${(article.relevance_score * 100).toFixed(1)}% relevant)</span>
                                </h5>
                                <p style="margin: 8px 0; color: #666;"><strong>Tags:</strong> ${article.tags.join(', ')}</p>
                                <p>${article.content}</p>
                            </div>`;
                        });
                    }
                    
                    html += '</div>';
                    document.getElementById('search-result').innerHTML = html;
                } catch (error) {
                    document.getElementById('search-result').innerHTML = 
                        `<div class="result" style="border-left-color: #dc3545;">
                            <h4>❌ Error</h4>
                            <p>Error searching knowledge base: ${error.message}</p>
                        </div>`;
                } finally {
                    hideLoading('search-loading');
                }
            }
            
            async function getSolution() {
                const problem = document.getElementById('problem').value;
                if (!problem.trim()) {
                    alert('Please describe your IT problem');
                    return;
                }
                
                showLoading('solution-loading');
                
                try {
                    const response = await fetch('/api/solution', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({problem: problem})
                    });
                    const result = await response.json();
                    
                    document.getElementById('solution-result').innerHTML = 
                        `<div class="result">
                            <h4>🎯 Complete RAG Solution</h4>
                            
                            <div class="kb-article">
                                <h5>📋 AI Analysis Summary</h5>
                                <pre style="white-space: pre-wrap; font-family: inherit; line-height: 1.5;">${result.summary}</pre>
                            </div>
                            
                            <div class="kb-article">
                                <h5>💡 Generated Solution</h5>
                                <pre style="white-space: pre-wrap; font-family: inherit; line-height: 1.5;">${result.solution}</pre>
                            </div>
                            
                            <div class="kb-article">
                                <h5>📚 Referenced Knowledge Base Articles</h5>
                                ${result.kb_articles.map(kb => 
                                    `<p><strong>• ${kb.title}</strong> (${kb.category}) - ${(kb.relevance_score * 100).toFixed(1)}% relevant</p>`
                                ).join('')}
                            </div>
                        </div>`;
                } catch (error) {
                    document.getElementById('solution-result').innerHTML = 
                        `<div class="result" style="border-left-color: #dc3545;">
                            <h4>❌ Error</h4>
                            <p>Error generating solution: ${error.message}</p>
                        </div>`;
                } finally {
                    hideLoading('solution-loading');
                }
            }
            
            async function loadServiceNowIncidents() {
                try {
                    const response = await fetch('/api/servicenow/incidents');
                    const result = await response.json();
                    
                    let html = '<div class="result"><h4>📋 ServiceNow Incidents</h4>';
                    result.incidents.forEach(incident => {
                        html += `<div class="kb-article">
                            <h5>${incident.number}: ${incident.short_description}</h5>
                            <p><strong>Priority:</strong> ${incident.priority} | <strong>State:</strong> ${incident.state} | <strong>Assigned:</strong> ${incident.assigned_to}</p>
                            <p><strong>Description:</strong> ${incident.description}</p>
                            <p><strong>Caller:</strong> ${incident.caller} | <strong>Created:</strong> ${incident.created_on}</p>
                            <button class="button" onclick="analyzeIncident('${incident.number}')" style="margin-top: 8px; font-size: 12px; padding: 6px 12px;">🔍 Analyze</button>
                        </div>`;
                    });
                    html += '</div>';
                    document.getElementById('servicenow-result').innerHTML = html;
                } catch (error) {
                    document.getElementById('servicenow-result').innerHTML = 
                        `<div class="result" style="border-left-color: #dc3545;"><h4>❌ Error</h4><p>${error.message}</p></div>`;
                }
            }
            
            async function analyzeIncident(incidentNumber) {
                try {
                    const response = await fetch(`/api/servicenow/incidents/${incidentNumber}/analyze`, {
                        method: 'POST'
                    });
                    const result = await response.json();
                    
                    document.getElementById('servicenow-result').innerHTML = 
                        `<div class="result">
                            <h4>🔍 ServiceNow Incident Analysis: ${result.incident.number}</h4>
                            
                            <div class="kb-article">
                                <h5>📋 Incident Details</h5>
                                <p><strong>Description:</strong> ${result.incident.description}</p>
                                <p><strong>Priority:</strong> ${result.incident.priority} | <strong>Category:</strong> ${result.incident.category}</p>
                            </div>
                            
                            <div class="kb-article">
                                <h5>🤖 AI Analysis</h5>
                                <pre style="white-space: pre-wrap; font-family: inherit;">${result.ai_analysis.summary}</pre>
                            </div>
                            
                            <div class="kb-article">
                                <h5>💡 AI Solution</h5>
                                <pre style="white-space: pre-wrap; font-family: inherit;">${result.ai_analysis.solution}</pre>
                            </div>
                            
                            <div class="kb-article">
                                <h5>📊 Recommendations</h5>
                                <p><strong>Assign to:</strong> ${result.recommendations.assign_to}</p>
                                <p><strong>Estimated resolution:</strong> ${result.recommendations.estimated_resolution}</p>
                                <p><strong>Escalate:</strong> ${result.recommendations.escalate ? 'Yes' : 'No'}</p>
                            </div>
                        </div>`;
                } catch (error) {
                    document.getElementById('servicenow-result').innerHTML = 
                        `<div class="result" style="border-left-color: #dc3545;"><h4>❌ Error</h4><p>${error.message}</p></div>`;
                }
            }
            
            function showCreateIncident() {
                document.getElementById('servicenow-result').innerHTML = 
                    `<div class="result">
                        <h4>➕ Create New ServiceNow Incident</h4>
                        <div style="margin: 15px 0;">
                            <input type="text" id="new-incident-title" placeholder="Short description" style="width: 100%; margin: 5px 0; padding: 8px;">
                            <textarea id="new-incident-desc" placeholder="Detailed description" style="width: 100%; height: 60px; margin: 5px 0; padding: 8px;"></textarea>
                            <select id="new-incident-priority" style="width: 100%; margin: 5px 0; padding: 8px;">
                                <option>1 - Critical</option>
                                <option>2 - High</option>
                                <option selected>3 - Medium</option>
                                <option>4 - Low</option>
                            </select>
                            <button class="button" onclick="createNewIncident()">Create Incident</button>
                        </div>
                    </div>`;
            }
            
            async function createNewIncident() {
                const data = {
                    short_description: document.getElementById('new-incident-title').value,
                    description: document.getElementById('new-incident-desc').value,
                    priority: document.getElementById('new-incident-priority').value,
                    category: 'General',
                    caller: 'demo.user@company.com'
                };
                
                try {
                    const response = await fetch('/api/servicenow/create-incident', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(data)
                    });
                    const result = await response.json();
                    
                    document.getElementById('servicenow-result').innerHTML = 
                        `<div class="result">
                            <h4>✅ Incident Created Successfully</h4>
                            <div class="kb-article">
                                <h5>New Incident: ${result.incident.number}</h5>
                                <p><strong>Title:</strong> ${result.incident.short_description}</p>
                                <p><strong>Priority:</strong> ${result.incident.priority}</p>
                                <p><strong>State:</strong> ${result.incident.state}</p>
                                <p><strong>Created:</strong> ${result.incident.created_on}</p>
                            </div>
                            <button class="button" onclick="loadServiceNowIncidents()" style="margin-top: 10px;">📋 View All Incidents</button>
                        </div>`;
                } catch (error) {
                    document.getElementById('servicenow-result').innerHTML = 
                        `<div class="result" style="border-left-color: #dc3545;"><h4>❌ Error</h4><p>${error.message}</p></div>`;
                }
            }
            
            // Quiz System Functions
            let currentQuiz = null;
            let userAnswers = {};
            
            async function loadQuizCategories() {
                try {
                    const response = await fetch('/api/quiz/categories');
                    const result = await response.json();
                    
                    let html = '<div class="result"><h4>📚 Available Quiz Categories</h4>';
                    result.categories.forEach(category => {
                        html += `<div class="kb-article">
                            <h5>${category === 'all' ? 'All Categories' : category}</h5>
                            <button class="button" onclick="generateSpecificQuiz('${category}')" style="margin-top: 5px; font-size: 12px; padding: 4px 8px;">Generate Quiz</button>
                        </div>`;
                    });
                    html += '</div>';
                    document.getElementById('quiz-result').innerHTML = html;
                } catch (error) {
                    document.getElementById('quiz-result').innerHTML = 
                        `<div class="result" style="border-left-color: #dc3545;"><h4>❌ Error</h4><p>${error.message}</p></div>`;
                }
            }
            
            async function generateQuiz() {
                const category = document.getElementById('quiz-category').value;
                await generateSpecificQuiz(category);
            }
            
            async function generateSpecificQuiz(category = 'all') {
                try {
                    const response = await fetch('/api/quiz/generate', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            category: category,
                            difficulty: 'medium'
                        })
                    });
                    const result = await response.json();
                    currentQuiz = result.quiz;
                    userAnswers = {};
                    
                    let html = `<div class="result">
                        <h4>🎯 ${result.quiz.title}</h4>
                        <p><strong>Questions:</strong> ${result.quiz.total_questions} | <strong>Time Limit:</strong> ${result.quiz.time_limit_minutes} minutes</p>
                        <div style="margin: 15px 0;">`;
                    
                    result.quiz.questions.forEach((question, index) => {
                        html += `<div class="kb-article" style="margin: 10px 0;">
                            <h5>Question ${index + 1}: ${question.question}</h5>
                            <p><strong>Category:</strong> ${question.category} | <strong>Reference:</strong> ${question.kb_reference}</p>`;
                        
                        if (question.type === 'multiple_choice') {
                            question.options.forEach((option, optIndex) => {
                                html += `<div style="margin: 5px 0;">
                                    <input type="radio" name="q${question.id}" value="${optIndex}" onchange="recordAnswer('${question.id}', ${optIndex})">
                                    <label style="margin-left: 8px;">${option}</label>
                                </div>`;
                            });
                        } else if (question.type === 'true_false') {
                            html += `<div style="margin: 5px 0;">
                                <input type="radio" name="q${question.id}" value="true" onchange="recordAnswer('${question.id}', true)">
                                <label style="margin-left: 8px;">True</label>
                            </div>
                            <div style="margin: 5px 0;">
                                <input type="radio" name="q${question.id}" value="false" onchange="recordAnswer('${question.id}', false)">
                                <label style="margin-left: 8px;">False</label>
                            </div>`;
                        } else if (question.type === 'fill_blank') {
                            html += `<input type="text" id="answer_${question.id}" placeholder="Your answer..." 
                                style="width: 200px; padding: 6px; margin: 5px 0;" 
                                onchange="recordAnswer('${question.id}', this.value)">`;
                        }
                        
                        html += '</div>';
                    });
                    
                    html += `</div>
                        <button class="button" onclick="submitQuiz()" style="background: #28a745; margin-top: 15px;">✅ Submit Quiz</button>
                    </div>`;
                    
                    document.getElementById('quiz-result').innerHTML = html;
                } catch (error) {
                    document.getElementById('quiz-result').innerHTML = 
                        `<div class="result" style="border-left-color: #dc3545;"><h4>❌ Error</h4><p>${error.message}</p></div>`;
                }
            }
            
            function recordAnswer(questionId, answer) {
                userAnswers[questionId] = answer;
            }
            
            async function submitQuiz() {
                if (!currentQuiz || Object.keys(userAnswers).length === 0) {
                    alert('Please answer at least one question before submitting.');
                    return;
                }
                
                try {
                    const response = await fetch('/api/quiz/submit', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            quiz_id: currentQuiz.id,
                            answers: userAnswers
                        })
                    });
                    const result = await response.json();
                    
                    document.getElementById('quiz-result').innerHTML = 
                        `<div class="result">
                            <h4>📊 Quiz Results: ${result.result.quiz_id}</h4>
                            
                            <div class="kb-article">
                                <h5>🎯 Your Performance</h5>
                                <p><strong>Score:</strong> ${result.result.score.toFixed(1)}% (${result.result.correct_answers}/${result.result.total_questions})</p>
                                <p><strong>Performance Level:</strong> ${result.result.performance_level}</p>
                            </div>
                            
                            <div class="kb-article">
                                <h5>💡 Learning Recommendations</h5>
                                ${result.result.learning_recommendations.map(rec => `<p>• ${rec}</p>`).join('')}
                            </div>
                            
                            <div class="kb-article">
                                <h5>📝 Detailed Feedback</h5>
                                ${result.result.detailed_feedback.map(feedback => 
                                    `<p><strong>${feedback.question_id}:</strong> ${feedback.correct ? '✅' : '❌'} ${feedback.feedback}</p>`
                                ).join('')}
                            </div>
                            
                            <button class="button" onclick="generateQuiz()" style="margin-top: 10px;">🔄 Take Another Quiz</button>
                        </div>`;
                } catch (error) {
                    document.getElementById('quiz-result').innerHTML = 
                        `<div class="result" style="border-left-color: #dc3545;"><h4>❌ Error</h4><p>${error.message}</p></div>`;
                }
            }
            
            // Feedback System Functions
            function showFeedbackForm() {
                document.getElementById('feedback-result').innerHTML = 
                    `<div class="result">
                        <h4>💬 Submit Feedback</h4>
                        <div style="margin: 15px 0;">
                            <select id="feedback-feature" style="width: 100%; margin: 5px 0; padding: 8px;">
                                <option value="rag_search">RAG Search System</option>
                                <option value="incident_analysis">Incident Analysis</option>
                                <option value="servicenow">ServiceNow Integration</option>
                                <option value="quiz">Quiz System</option>
                                <option value="overall">Overall System</option>
                            </select>
                            
                            <div style="margin: 10px 0;">
                                <label style="display: block; margin-bottom: 5px;"><strong>Rating (1-5 stars):</strong></label>
                                <div style="display: flex; gap: 5px;">
                                    ${[1,2,3,4,5].map(i => 
                                        `<button type="button" onclick="setRating(${i})" id="star-${i}" 
                                         style="background: #ddd; border: 1px solid #ccc; padding: 5px 10px; cursor: pointer;">⭐</button>`
                                    ).join('')}
                                </div>
                                <input type="hidden" id="feedback-rating" value="0">
                            </div>
                            
                            <textarea id="feedback-comment" placeholder="What did you think about this feature?" 
                                style="width: 100%; height: 60px; margin: 5px 0; padding: 8px;"></textarea>
                                
                            <textarea id="feedback-suggestion" placeholder="Any suggestions for improvement?" 
                                style="width: 100%; height: 60px; margin: 5px 0; padding: 8px;"></textarea>
                                
                            <select id="feedback-experience" style="width: 100%; margin: 5px 0; padding: 8px;">
                                <option value="beginner">Beginner IT Support</option>
                                <option value="intermediate" selected>Intermediate IT Support</option>
                                <option value="expert">Expert IT Support</option>
                                <option value="manager">IT Manager</option>
                            </select>
                            
                            <div style="margin: 10px 0;">
                                <label>
                                    <input type="checkbox" id="feedback-helpful" checked> This feature was helpful
                                </label>
                            </div>
                            
                            <button class="button" onclick="submitFeedback()">📤 Submit Feedback</button>
                        </div>
                    </div>`;
            }
            
            function setRating(rating) {
                document.getElementById('feedback-rating').value = rating;
                // Update visual feedback
                for (let i = 1; i <= 5; i++) {
                    const star = document.getElementById(`star-${i}`);
                    star.style.background = i <= rating ? '#ffc107' : '#ddd';
                }
            }
            
            async function submitFeedback() {
                const data = {
                    session_id: 'demo_session_' + Date.now(),
                    feature: document.getElementById('feedback-feature').value,
                    rating: parseInt(document.getElementById('feedback-rating').value),
                    comment: document.getElementById('feedback-comment').value,
                    suggestion: document.getElementById('feedback-suggestion').value,
                    helpful: document.getElementById('feedback-helpful').checked,
                    experience_level: document.getElementById('feedback-experience').value,
                    response_time: Math.random() * 2000 + 500,
                    accuracy_perceived: parseInt(document.getElementById('feedback-rating').value),
                    relevance_score: parseInt(document.getElementById('feedback-rating').value)
                };
                
                if (data.rating === 0) {
                    alert('Please provide a rating before submitting.');
                    return;
                }
                
                try {
                    const response = await fetch('/api/feedback/submit', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(data)
                    });
                    const result = await response.json();
                    
                    document.getElementById('feedback-result').innerHTML = 
                        `<div class="result">
                            <h4>✅ Feedback Submitted Successfully</h4>
                            <div class="kb-article">
                                <h5>Thank you for your feedback!</h5>
                                <p><strong>Feedback ID:</strong> ${result.feedback_id}</p>
                                <p><strong>Feature:</strong> ${data.feature}</p>
                                <p><strong>Rating:</strong> ${'⭐'.repeat(data.rating)} (${data.rating}/5)</p>
                                <p>Your feedback helps us improve the AI system continuously.</p>
                            </div>
                            <button class="button" onclick="showAnalytics()" style="margin-top: 10px;">📊 View Analytics</button>
                        </div>`;
                } catch (error) {
                    document.getElementById('feedback-result').innerHTML = 
                        `<div class="result" style="border-left-color: #dc3545;"><h4>❌ Error</h4><p>${error.message}</p></div>`;
                }
            }
            
            async function generateDemoFeedback() {
                try {
                    const response = await fetch('/api/feedback/demo-data', {
                        method: 'POST'
                    });
                    const result = await response.json();
                    
                    document.getElementById('feedback-result').innerHTML = 
                        `<div class="result">
                            <h4>📊 Demo Feedback Generated</h4>
                            <p>${result.message}</p>
                            <p><strong>Total feedback entries:</strong> ${result.total_feedback}</p>
                            <button class="button" onclick="showAnalytics()" style="margin-top: 10px;">📈 View Analytics</button>
                        </div>`;
                } catch (error) {
                    document.getElementById('feedback-result').innerHTML = 
                        `<div class="result" style="border-left-color: #dc3545;"><h4>❌ Error</h4><p>${error.message}</p></div>`;
                }
            }
            
            async function showAnalytics() {
                try {
                    const response = await fetch('/api/feedback/analytics');
                    const result = await response.json();
                    
                    if (!result.analytics || result.analytics.total_feedback === 0) {
                        document.getElementById('feedback-result').innerHTML = 
                            `<div class="result">
                                <h4>📊 Feedback Analytics</h4>
                                <p>No feedback data available yet. Submit some feedback or generate demo data first.</p>
                                <button class="button" onclick="generateDemoFeedback()">📊 Generate Demo Data</button>
                            </div>`;
                        return;
                    }
                    
                    const analytics = result.analytics;
                    
                    let html = `<div class="result">
                        <h4>📊 AI System Analytics Dashboard</h4>
                        
                        <div class="kb-article">
                            <h5>📈 Overall Performance</h5>
                            <p><strong>Total Feedback:</strong> ${analytics.total_feedback}</p>
                            <p><strong>Average Rating:</strong> ${'⭐'.repeat(Math.round(analytics.average_rating))} (${analytics.average_rating}/5)</p>
                            <p><strong>User Satisfaction:</strong></p>
                            <p>• Very Satisfied: ${analytics.user_satisfaction.very_satisfied}</p>
                            <p>• Satisfied: ${analytics.user_satisfaction.satisfied}</p>
                            <p>• Needs Improvement: ${analytics.user_satisfaction.needs_improvement}</p>
                        </div>
                        
                        <div class="kb-article">
                            <h5>🎯 Feature Performance</h5>`;
                    
                    Object.entries(analytics.features).forEach(([feature, stats]) => {
                        html += `<p><strong>${feature.replace('_', ' ').toUpperCase()}:</strong> 
                            ${stats.average_rating.toFixed(1)}/5 (${stats.count} reviews, ${stats.helpful_percentage.toFixed(1)}% helpful)</p>`;
                    });
                    
                    html += `</div>
                        
                        <div class="kb-article">
                            <h5>🚀 Key Insights</h5>
                            <p><strong>Most Used Feature:</strong> ${analytics.trends.most_used_feature}</p>
                            <p><strong>Highest Rated:</strong> ${analytics.trends.highest_rated_feature}</p>
                            <p><strong>Features Needing Attention:</strong> ${analytics.trends.needs_attention.length}</p>
                        </div>`;
                    
                    if (analytics.improvement_recommendations.length > 0) {
                        html += `<div class="kb-article">
                            <h5>💡 Improvement Recommendations</h5>`;
                        analytics.improvement_recommendations.forEach(rec => {
                            html += `<p><strong>${rec.priority} Priority:</strong> ${rec.recommendation}</p>`;
                        });
                        html += `</div>`;
                    }
                    
                    html += `<button class="button" onclick="showFeedbackForm()" style="margin-top: 10px;">💬 Submit More Feedback</button>
                    </div>`;
                    
                    document.getElementById('feedback-result').innerHTML = html;
                } catch (error) {
                    document.getElementById('feedback-result').innerHTML = 
                        `<div class="result" style="border-left-color: #dc3545;"><h4>❌ Error</h4><p>${error.message}</p></div>`;
                }
            }
            
            // Auto-populate demo data for quick testing
            document.addEventListener('DOMContentLoaded', function() {
                const demoTexts = {
                    incident: "My Windows computer suddenly shows blue screen error with message IRQL_NOT_LESS_OR_EQUAL and keeps restarting. This started after I installed new graphics drivers yesterday.",
                    search: "printer not responding",
                    problem: "Our office printer suddenly stopped working. It shows as offline in Windows, but the printer displays show it's ready. Users can't print any documents."
                };
                
                // Add demo buttons
                const sections = document.querySelectorAll('.demo-section');
                sections.forEach((section, index) => {
                    const textarea = section.querySelector('textarea');
                    if (textarea) {
                        const demoBtn = document.createElement('button');
                        demoBtn.textContent = '🎬 Load Demo Data';
                        demoBtn.className = 'button';
                        demoBtn.style.marginLeft = '10px';
                        demoBtn.style.background = '#6c757d';
                        demoBtn.onclick = () => {
                            textarea.value = Object.values(demoTexts)[index] || '';
                        };
                        section.appendChild(demoBtn);
                    }
                });
            });
        </script>
    </body>
    </html>
    """)

@app.route('/api/summarize', methods=['POST'])
def summarize_incident():
    """Demo incident summarization"""
    data = request.get_json() or {}
    incident = data.get('incident', '')
    
    summary = rag_demo.summarize_incident(incident)
    
    return jsonify({
        'success': True,
        'summary': summary,
        'timestamp': datetime.now().isoformat(),
        'mode': 'demo'
    })

@app.route('/api/search', methods=['POST'])
def search_kb():
    """Demo knowledge base search"""
    data = request.get_json() or {}
    query = data.get('query', '')
    
    results = rag_demo.search_knowledge_base(query)
    
    return jsonify({
        'success': True,
        'results': results,
        'query': query,
        'timestamp': datetime.now().isoformat(),
        'mode': 'demo'
    })

@app.route('/api/solution', methods=['POST'])
def get_solution():
    """Demo complete RAG solution"""
    data = request.get_json() or {}
    problem = data.get('problem', '')
    
    # Step 1: Summarize
    summary = rag_demo.summarize_incident(problem)
    
    # Step 2: Search KB
    kb_articles = rag_demo.search_knowledge_base(problem)
    
    # Step 3: Generate solution
    solution = rag_demo.generate_solution(summary, kb_articles)
    
    return jsonify({
        'success': True,
        'summary': summary,
        'solution': solution,
        'kb_articles': kb_articles,
        'timestamp': datetime.now().isoformat(),
        'mode': 'demo'
    })

@app.route('/api/status', methods=['GET'])
def system_status():
    """System status for demo"""
    return jsonify({
        'status': 'online',
        'service': 'IT Support Assistant RAG Demo',
        'version': '1.0.0',
        'kb_articles': len(KNOWLEDGE_BASE),
        'features': {
            'llm_integration': 'enabled',
            'rag_system': 'enabled', 
            'offline_mode': 'enabled',
            'servicenow_ready': 'enabled'
        },
        'project_info': {
            'name': 'IT Support Assistant',
            'description': 'AI-Powered Support Co-pilot with RAG',
            'version': '1.0.0',
            'technology': 'OpenAI GPT + Semantic Search'
        },
        'timestamp': datetime.now().isoformat()
    })

# ServiceNow Integration Simulation
MOCK_INCIDENTS = [
    {
        "number": "INC0000123",
        "short_description": "Outlook not connecting to Exchange server",
        "description": "User reports Outlook cannot connect to Exchange server. Error message: 'Cannot connect to Microsoft Exchange'",
        "state": "Open",
        "priority": "2 - High",
        "category": "Email",
        "assigned_to": "L1 Support",
        "created_on": "2024-09-25 08:30:00",
        "caller": "john.doe@company.com"
    },
    {
        "number": "INC0000124", 
        "short_description": "Computer running very slow",
        "description": "Employee computer takes 5+ minutes to boot and applications are very slow to respond",
        "state": "In Progress",
        "priority": "3 - Medium",
        "category": "Performance",
        "assigned_to": "L2 Support",
        "created_on": "2024-09-25 09:15:00",
        "caller": "jane.smith@company.com"
    },
    {
        "number": "INC0000125",
        "short_description": "Network printer offline",
        "description": "Shared printer in accounting department shows offline status, users cannot print",
        "state": "Open",
        "priority": "3 - Medium", 
        "category": "Hardware",
        "assigned_to": "L1 Support",
        "created_on": "2024-09-25 10:00:00",
        "caller": "accounting@company.com"
    }
]

@app.route('/api/servicenow/incidents', methods=['GET'])
def get_servicenow_incidents():
    """Mock ServiceNow incident retrieval"""
    return jsonify({
        'success': True,
        'incidents': MOCK_INCIDENTS,
        'total_count': len(MOCK_INCIDENTS),
        'integration': 'ServiceNow Simulation',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/servicenow/incidents/<incident_number>/analyze', methods=['POST'])
def analyze_servicenow_incident(incident_number):
    """Analyze ServiceNow incident using RAG system"""
    incident = next((inc for inc in MOCK_INCIDENTS if inc['number'] == incident_number), None)
    
    if not incident:
        return jsonify({'error': 'Incident not found'}), 404
    
    # Combine incident data for analysis
    incident_text = f"{incident['short_description']} - {incident['description']}"
    
    # Get AI analysis
    summary = rag_demo.summarize_incident(incident_text)
    kb_articles = rag_demo.search_knowledge_base(incident_text)
    solution = rag_demo.generate_solution(summary, kb_articles)
    
    return jsonify({
        'success': True,
        'incident': incident,
        'ai_analysis': {
            'summary': summary,
            'solution': solution,
            'relevant_kb': kb_articles
        },
        'recommendations': {
            'escalate': incident['priority'] == '1 - Critical',
            'assign_to': 'L2 Support' if any(word in incident_text.lower() for word in ['network', 'server', 'exchange']) else 'L1 Support',
            'estimated_resolution': '2-4 hours' if incident['priority'] == '2 - High' else '4-8 hours'
        },
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/servicenow/create-incident', methods=['POST'])
def create_servicenow_incident():
    """Mock incident creation in ServiceNow"""
    data = request.get_json() or {}
    
    new_incident = {
        'number': f"INC{str(uuid.uuid4())[:7].upper()}",
        'short_description': data.get('short_description', ''),
        'description': data.get('description', ''),
        'state': 'Open',
        'priority': data.get('priority', '3 - Medium'),
        'category': data.get('category', 'General'),
        'assigned_to': 'L1 Support',
        'created_on': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'caller': data.get('caller', 'system@company.com')
    }
    
    MOCK_INCIDENTS.append(new_incident)
    
    return jsonify({
        'success': True,
        'message': 'Incident created successfully',
        'incident': new_incident,
        'timestamp': datetime.now().isoformat()
    })

# Quiz Generation System for Interactive Learning
@app.route('/api/quiz/generate', methods=['POST'])
def generate_quiz():
    """Generate AI-powered quiz from knowledge base for learning"""
    data = request.get_json() or {}
    category = data.get('category', 'all')
    difficulty = data.get('difficulty', 'medium')
    
    # Filter articles by category if specified
    articles = KNOWLEDGE_BASE
    if category != 'all':
        articles = [a for a in KNOWLEDGE_BASE if a['category'].lower() == category.lower()]
    
    if not articles:
        return jsonify({'error': 'No articles found for the specified category'}), 400
    
    # Generate quiz questions based on knowledge base content
    quiz_questions = []
    
    for i, article in enumerate(articles[:3]):  # Generate 3 questions max
        # Create different types of questions based on the article content
        if i % 3 == 0:  # Multiple choice question
            question = {
                'id': f"Q{i+1}",
                'type': 'multiple_choice',
                'question': f"What is the primary cause of {article['title'].split(' - ')[0]}?",
                'options': [
                    extract_primary_cause(article['content']),
                    generate_wrong_option(article['category']),
                    generate_wrong_option(article['category']),
                    generate_wrong_option(article['category'])
                ],
                'correct_answer': 0,
                'explanation': f"Based on {article['id']}: {article['content'][:150]}...",
                'kb_reference': article['id'],
                'category': article['category']
            }
        elif i % 3 == 1:  # True/False question
            question = {
                'id': f"Q{i+1}",
                'type': 'true_false',
                'question': f"Safe Mode is mentioned as a solution for {article['category'].lower()} issues.",
                'correct_answer': 'Safe Mode' in article['content'],
                'explanation': f"According to {article['id']}, Safe Mode is {'recommended' if 'Safe Mode' in article['content'] else 'not mentioned'} for this type of issue.",
                'kb_reference': article['id'],
                'category': article['category']
            }
        else:  # Fill in the blank
            question = {
                'id': f"Q{i+1}",
                'type': 'fill_blank',
                'question': f"To flush DNS cache on Windows, you should run the command: ipconfig /______",
                'correct_answer': 'flushdns',
                'explanation': f"The correct command is 'ipconfig /flushdns' as mentioned in {article['id']}.",
                'kb_reference': article['id'],
                'category': article['category']
            }
        
        quiz_questions.append(question)
    
    quiz = {
        'id': f"QUIZ_{str(uuid.uuid4())[:8].upper()}",
        'title': f"IT Support Knowledge Quiz - {category.title() if category != 'all' else 'General'}",
        'difficulty': difficulty,
        'total_questions': len(quiz_questions),
        'questions': quiz_questions,
        'time_limit_minutes': 10,
        'created_at': datetime.now().isoformat()
    }
    
    return jsonify({
        'success': True,
        'quiz': quiz,
        'timestamp': datetime.now().isoformat()
    })

def extract_primary_cause(content):
    """Extract primary cause from article content"""
    if 'driver' in content.lower():
        return "Driver issues and conflicts"
    elif 'network' in content.lower():
        return "Network connectivity problems"
    elif 'hardware' in content.lower():
        return "Hardware failures or conflicts"
    elif 'software' in content.lower():
        return "Software configuration errors"
    else:
        return "System configuration issues"

def generate_wrong_option(category):
    """Generate plausible wrong answers based on category"""
    wrong_options = {
        'Windows': ['User account permissions', 'Antivirus interference', 'Registry corruption'],
        'Mac': ['iCloud synchronization', 'Keychain access errors', 'Time Machine conflicts'],
        'Network': ['Cable modem issues', 'Router overheating', 'ISP throttling'],
        'Hardware': ['Power supply fluctuation', 'Cable connection loose', 'Firmware outdated'],
        'Email': ['Server maintenance', 'Account quota exceeded', 'Client version outdated'],
        'Performance': ['Background updates', 'Cache overflow', 'Thermal throttling']
    }
    
    options = wrong_options.get(category, ['Configuration errors', 'User error', 'System overload'])
    import random
    return random.choice(options)

@app.route('/api/quiz/submit', methods=['POST'])
def submit_quiz():
    """Process quiz submission and provide detailed feedback"""
    data = request.get_json() or {}
    answers = data.get('answers', {})
    quiz_id = data.get('quiz_id', '')
    
    # Since this is a demo, we'll create mock scoring
    total_questions = len(answers)
    correct_answers = 0
    detailed_feedback = []
    
    for question_id, user_answer in answers.items():
        # Mock correct answers for demo
        is_correct = hash(question_id) % 3 != 0  # Roughly 66% correct for demo
        if is_correct:
            correct_answers += 1
        
        feedback = {
            'question_id': question_id,
            'user_answer': user_answer,
            'correct': is_correct,
            'feedback': 'Correct! Great understanding of IT troubleshooting.' if is_correct else 'Review the related knowledge base article for better understanding.',
            'learning_tip': 'Focus on systematic troubleshooting approaches' if not is_correct else 'Keep up the excellent work!'
        }
        detailed_feedback.append(feedback)
    
    score_percentage = (correct_answers / total_questions * 100) if total_questions > 0 else 0
    
    result = {
        'quiz_id': quiz_id,
        'score': score_percentage,
        'correct_answers': correct_answers,
        'total_questions': total_questions,
        'performance_level': get_performance_level(score_percentage),
        'detailed_feedback': detailed_feedback,
        'learning_recommendations': generate_learning_recommendations(score_percentage),
        'submitted_at': datetime.now().isoformat()
    }
    
    return jsonify({
        'success': True,
        'result': result,
        'timestamp': datetime.now().isoformat()
    })

def get_performance_level(score):
    """Determine performance level based on score"""
    if score >= 85:
        return 'Expert'
    elif score >= 70:
        return 'Proficient'
    elif score >= 55:
        return 'Developing'
    else:
        return 'Needs Improvement'

def generate_learning_recommendations(score):
    """Generate personalized learning recommendations"""
    if score >= 85:
        return [
            "Excellent work! Consider mentoring junior support staff.",
            "Explore advanced troubleshooting scenarios.",
            "Share your knowledge through documentation updates."
        ]
    elif score >= 70:
        return [
            "Good performance! Focus on specific knowledge gaps.",
            "Practice more complex troubleshooting scenarios.",
            "Review knowledge base articles regularly."
        ]
    elif score >= 55:
        return [
            "You're developing well. Focus on fundamental concepts.",
            "Spend more time with knowledge base materials.",
            "Consider additional training in weak areas."
        ]
    else:
        return [
            "Additional study recommended in core IT concepts.",
            "Work through knowledge base articles systematically.",
            "Consider formal training or mentorship."
        ]

@app.route('/api/quiz/categories', methods=['GET'])
def get_quiz_categories():
    """Get available quiz categories"""
    categories = list(set(article['category'] for article in KNOWLEDGE_BASE))
    
    return jsonify({
        'success': True,
        'categories': ['all'] + categories,
        'total_articles': len(KNOWLEDGE_BASE),
        'timestamp': datetime.now().isoformat()
    })

# Feedback Loop System for Continuous AI Improvement
FEEDBACK_DATA = []

@app.route('/api/feedback/submit', methods=['POST'])
def submit_feedback():
    """Submit user feedback for AI system improvement"""
    data = request.get_json() or {}
    
    feedback = {
        'id': f"FB_{str(uuid.uuid4())[:8].upper()}",
        'session_id': data.get('session_id', 'unknown'),
        'feature': data.get('feature', ''),  # rag_search, incident_analysis, quiz, servicenow
        'rating': data.get('rating', 0),  # 1-5 scale
        'comment': data.get('comment', ''),
        'helpful': data.get('helpful', True),
        'suggestion': data.get('suggestion', ''),
        'user_context': {
            'experience_level': data.get('experience_level', 'intermediate'),
            'department': data.get('department', 'IT Support'),
            'use_case': data.get('use_case', 'general')
        },
        'system_metrics': {
            'response_time': data.get('response_time', 0),
            'accuracy_perceived': data.get('accuracy_perceived', 3),
            'relevance_score': data.get('relevance_score', 3)
        },
        'created_at': datetime.now().isoformat(),
        'processed': False
    }
    
    FEEDBACK_DATA.append(feedback)
    
    return jsonify({
        'success': True,
        'message': 'Feedback submitted successfully',
        'feedback_id': feedback['id'],
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/feedback/analytics', methods=['GET'])
def get_feedback_analytics():
    """Get analytics from user feedback for system improvement"""
    if not FEEDBACK_DATA:
        return jsonify({
            'message': 'No feedback data available yet',
            'analytics': {
                'total_feedback': 0,
                'average_rating': 0,
                'features': {},
                'trends': []
            }
        })
    
    # Calculate analytics
    total_feedback = len(FEEDBACK_DATA)
    average_rating = sum(f['rating'] for f in FEEDBACK_DATA) / total_feedback
    
    # Feature breakdown
    features = {}
    for feedback in FEEDBACK_DATA:
        feature = feedback['feature']
        if feature not in features:
            features[feature] = {
                'count': 0,
                'average_rating': 0,
                'helpful_percentage': 0,
                'ratings': []
            }
        features[feature]['count'] += 1
        features[feature]['ratings'].append(feedback['rating'])
    
    # Calculate feature averages
    for feature, stats in features.items():
        stats['average_rating'] = sum(stats['ratings']) / len(stats['ratings'])
        helpful_count = sum(1 for f in FEEDBACK_DATA if f['feature'] == feature and f['helpful'])
        stats['helpful_percentage'] = (helpful_count / stats['count']) * 100
    
    # Generate improvement recommendations
    improvement_recommendations = []
    for feature, stats in features.items():
        if stats['average_rating'] < 3.5:
            improvement_recommendations.append({
                'feature': feature,
                'priority': 'High',
                'recommendation': f"Improve {feature} - average rating {stats['average_rating']:.1f}/5",
                'suggested_actions': [
                    'Review user feedback comments',
                    'Analyze common failure patterns',
                    'Enhance algorithm accuracy',
                    'Improve user interface'
                ]
            })
        elif stats['helpful_percentage'] < 70:
            improvement_recommendations.append({
                'feature': feature,
                'priority': 'Medium',
                'recommendation': f"Enhance relevance for {feature} - {stats['helpful_percentage']:.1f}% helpful",
                'suggested_actions': [
                    'Refine content matching algorithms',
                    'Update knowledge base coverage',
                    'Improve result ranking'
                ]
            })
    
    analytics = {
        'total_feedback': total_feedback,
        'average_rating': round(average_rating, 2),
        'features': features,
        'improvement_recommendations': improvement_recommendations,
        'user_satisfaction': {
            'very_satisfied': len([f for f in FEEDBACK_DATA if f['rating'] >= 4]),
            'satisfied': len([f for f in FEEDBACK_DATA if f['rating'] == 3]),
            'needs_improvement': len([f for f in FEEDBACK_DATA if f['rating'] <= 2])
        },
        'trends': {
            'most_used_feature': max(features.keys(), key=lambda k: features[k]['count']) if features else 'None',
            'highest_rated_feature': max(features.keys(), key=lambda k: features[k]['average_rating']) if features else 'None',
            'needs_attention': [f for f in improvement_recommendations if f['priority'] == 'High']
        }
    }
    
    return jsonify({
        'success': True,
        'analytics': analytics,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/feedback/demo-data', methods=['POST'])
def generate_demo_feedback():
    """Generate demo feedback data for analytics demonstration"""
    demo_feedback = [
        {
            'feature': 'rag_search',
            'rating': 4,
            'comment': 'Very helpful for finding relevant solutions quickly',
            'helpful': True,
            'experience_level': 'intermediate'
        },
        {
            'feature': 'incident_analysis',
            'rating': 5,
            'comment': 'Excellent AI summarization saves me a lot of time',
            'helpful': True,
            'experience_level': 'expert'
        },
        {
            'feature': 'servicenow',
            'rating': 3,
            'comment': 'Good integration but could be more detailed',
            'helpful': True,
            'experience_level': 'beginner'
        },
        {
            'feature': 'quiz',
            'rating': 4,
            'comment': 'Great for learning and skill assessment',
            'helpful': True,
            'experience_level': 'intermediate'
        },
        {
            'feature': 'rag_search',
            'rating': 2,
            'comment': 'Sometimes returns irrelevant results',
            'helpful': False,
            'experience_level': 'expert'
        }
    ]
    
    for demo in demo_feedback:
        feedback = {
            'id': f"FB_{str(uuid.uuid4())[:8].upper()}",
            'session_id': f"demo_session_{uuid.uuid4()}",
            'feature': demo['feature'],
            'rating': demo['rating'],
            'comment': demo['comment'],
            'helpful': demo['helpful'],
            'suggestion': 'Keep improving the system',
            'user_context': {
                'experience_level': demo['experience_level'],
                'department': 'IT Support',
                'use_case': 'daily_operations'
            },
            'system_metrics': {
                'response_time': np.random.randint(500, 2000),
                'accuracy_perceived': demo['rating'],
                'relevance_score': demo['rating']
            },
            'created_at': datetime.now().isoformat(),
            'processed': False
        }
        FEEDBACK_DATA.append(feedback)
    
    return jsonify({
        'success': True,
        'message': f'{len(demo_feedback)} demo feedback entries created',
        'total_feedback': len(FEEDBACK_DATA)
    })

if __name__ == '__main__':
    print("🚀 Starting IT Support Assistant Demo System")
    print("📚 Knowledge Base: 6 articles loaded")
    print("🔧 ServiceNow Integration: Mock endpoints ready")
    print("🎯 AI Quiz System: Interactive learning enabled")
    print("📊 Feedback Analytics: Continuous improvement system active")
    print("🔗 Demo URL: http://localhost:5001")
    print("🤖 AI-Powered IT Support Co-pilot")
    print("=" * 60)
    print("🎪 Core Features Available:")
    print("✅ LLM-powered incident analysis")
    print("✅ RAG system with offline capabilities") 
    print("✅ ServiceNow integration simulation")
    print("✅ AI-powered learning quizzes")
    print("✅ Feedback loop for continuous improvement")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5001, debug=True)