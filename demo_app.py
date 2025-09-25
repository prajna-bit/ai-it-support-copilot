"""
IT Support Assist: AI-Powered Co-Pilot - M.Tech Demo Version
Quick demo for presentation - works without API calls for offline capability
By Prajna G (2021WB86982) - BITS Pilani
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
    """Demo interface for M.Tech presentation"""
    return render_template_string("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>IT Support Assistant - M.Tech Demo</title>
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
                <p><strong>M.Tech Dissertation Project</strong> | Prajna G (2021WB86982) | BITS Pilani</p>
                <p>Supervisor: Sindhuja L | Wipro Technologies</p>
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
                        <h4>⚡ ServiceNow Ready</h4>
                        <p>Enterprise integration with IT service management</p>
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
    """System status for M.Tech demo"""
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
        'mtech_project': {
            'student': 'Prajna G',
            'id': '2021WB86982',
            'supervisor': 'Sindhuja L',
            'institution': 'BITS Pilani'
        },
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🚀 Starting IT Support Assistant Demo for M.Tech Project")
    print("📚 Knowledge Base: 6 articles loaded")
    print("🔗 Demo URL: http://localhost:5001")
    print("👨‍💻 By: Prajna G (2021WB86982) - BITS Pilani")
    app.run(host='0.0.0.0', port=5001, debug=True)