"""
IT Support Assistant: AI-Powered Co-Pilot for Support Engineers

Core RAG system with OpenAI integration for intelligent IT support assistance
"""

import os
import json
import numpy as np
from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import openai
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv
import logging
from datetime import datetime
import uuid

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# OpenAI configuration
openai.api_key = os.getenv('OPENAI_API_KEY')

class ITSupportRAG:
    def __init__(self):
        self.knowledge_base = []
        self.embeddings = []
        self.load_knowledge_base()
        
    def load_knowledge_base(self):
        """Load knowledge base from JSON file or create sample data"""
        try:
            with open('knowledge_base.json', 'r') as f:
                data = json.load(f)
                self.knowledge_base = data.get('articles', [])
                self.embeddings = np.array(data.get('embeddings', []))
                logger.info(f"Loaded {len(self.knowledge_base)} KB articles")
        except FileNotFoundError:
            logger.info("No existing knowledge base found, creating sample data...")
            self.create_sample_knowledge_base()
            
    def create_sample_knowledge_base(self):
        """Create sample IT support knowledge base"""
        sample_articles = [
            {
                "id": "KB001",
                "title": "Windows Blue Screen of Death (BSOD) Troubleshooting",
                "category": "Windows",
                "content": "Blue Screen of Death errors indicate critical system failures. Common causes include driver issues, hardware problems, and corrupted system files. Solutions: 1) Boot in Safe Mode 2) Update or rollback drivers 3) Run memory diagnostic 4) Check hard drive health 5) Restore system to previous working state. For IRQL_NOT_LESS_OR_EQUAL errors, focus on driver updates.",
                "tags": ["BSOD", "Windows", "Drivers", "Hardware", "Critical"]
            },
            {
                "id": "KB002", 
                "title": "Mac System Won't Boot - Startup Issues",
                "category": "Mac",
                "content": "Mac startup problems can be caused by corrupted system files, hardware failures, or software conflicts. Troubleshooting steps: 1) Reset NVRAM/PRAM (Cmd+Option+P+R) 2) Boot in Safe Mode (hold Shift) 3) Run Disk Utility from Recovery Mode 4) Reinstall macOS if necessary 5) Check hardware connections. For spinning wheel issues, often disk-related.",
                "tags": ["Mac", "Startup", "Boot", "NVRAM", "Recovery"]
            },
            {
                "id": "KB003",
                "title": "Network Connectivity Issues Resolution",
                "category": "Network", 
                "content": "Network connectivity problems affect productivity. Systematic approach: 1) Check physical connections 2) Restart network adapter 3) Flush DNS cache (ipconfig /flushdns) 4) Reset network stack 5) Update network drivers 6) Check firewall settings 7) Contact ISP if external. For intermittent issues, check for interference.",
                "tags": ["Network", "Connectivity", "DNS", "Firewall", "Drivers"]
            },
            {
                "id": "KB004",
                "title": "Printer Not Responding - Universal Fix Guide",
                "category": "Hardware",
                "content": "Printer issues are common in office environments. Resolution steps: 1) Check power and cable connections 2) Clear print queue 3) Restart print spooler service 4) Update printer drivers 5) Run printer troubleshooter 6) Check ink/toner levels 7) Clean print heads. For network printers, verify IP configuration.",
                "tags": ["Printer", "Hardware", "Drivers", "Spooler", "Network"]
            },
            {
                "id": "KB005",
                "title": "Email Client Configuration and Troubleshooting",
                "category": "Email",
                "content": "Email setup and issues resolution for Outlook and other clients. Common problems: 1) Incorrect server settings (IMAP/POP3/SMTP) 2) Authentication failures 3) SSL/TLS configuration 4) Firewall blocking ports 5) Corrupted profile. Solutions include recreating profiles, checking server settings, and verifying credentials.",
                "tags": ["Email", "Outlook", "IMAP", "SMTP", "Configuration"]
            },
            {
                "id": "KB006",
                "title": "Slow Computer Performance Optimization",
                "category": "Performance",
                "content": "System slowdown affects user productivity. Optimization steps: 1) Check resource usage in Task Manager 2) Disable startup programs 3) Run disk cleanup 4) Defragment hard drive 5) Scan for malware 6) Update drivers 7) Add more RAM if needed 8) Clean temporary files. Monitor CPU and memory usage patterns.",
                "tags": ["Performance", "Optimization", "Memory", "CPU", "Cleanup"]
            }
        ]
        
        self.knowledge_base = sample_articles
        self.generate_embeddings()
        self.save_knowledge_base()
        
    def generate_embeddings(self):
        """Generate embeddings for knowledge base articles using OpenAI"""
        embeddings = []
        
        for article in self.knowledge_base:
            text = f"{article['title']} {article['content']}"
            try:
                response = openai.embeddings.create(
                    input=text,
                    model="text-embedding-ada-002"
                )
                embedding = response.data[0].embedding
                embeddings.append(embedding)
                logger.info(f"Generated embedding for {article['id']}")
            except Exception as e:
                logger.error(f"Error generating embedding for {article['id']}: {e}")
                # Fallback: create random embedding for offline capability
                embeddings.append(np.random.rand(1536).tolist())
                
        self.embeddings = np.array(embeddings) if embeddings else np.array([])
        
    def save_knowledge_base(self):
        """Save knowledge base and embeddings to JSON for offline access"""
        data = {
            "articles": self.knowledge_base,
            "embeddings": self.embeddings.tolist() if len(self.embeddings) > 0 else [],
            "last_updated": datetime.now().isoformat()
        }
        
        with open('knowledge_base.json', 'w') as f:
            json.dump(data, f, indent=2)
        logger.info("Knowledge base saved to JSON")
        
    def search_knowledge_base(self, query, top_k=3):
        """Search knowledge base using semantic similarity"""
        try:
            # Generate embedding for query
            response = openai.embeddings.create(
                input=query,
                model="text-embedding-ada-002"
            )
            query_embedding = np.array(response.data[0].embedding).reshape(1, -1)
            
            # Calculate similarities
            similarities = cosine_similarity(query_embedding, self.embeddings)[0]
            
            # Get top-k results
            top_indices = np.argsort(similarities)[::-1][:top_k]
            
            results = []
            for idx in top_indices:
                article = self.knowledge_base[idx].copy()
                article['relevance_score'] = float(similarities[idx])
                results.append(article)
                
            return results
            
        except Exception as e:
            logger.error(f"Error in knowledge base search: {e}")
            # Fallback: return random articles for offline demo
            return self.knowledge_base[:top_k]
            
    def summarize_incident(self, incident_text):
        """Summarize incident using GPT-4"""
        try:
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system", 
                        "content": "You are an IT support expert. Summarize the incident concisely, identifying key issues and priority level."
                    },
                    {
                        "role": "user",
                        "content": f"Incident details: {incident_text}"
                    }
                ],
                max_tokens=200
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error summarizing incident: {e}")
            return "Summary unavailable - operating in offline mode"
            
    def generate_solution(self, incident_summary, relevant_kb):
        """Generate solution using RAG approach"""
        try:
            kb_context = "\n".join([f"KB{i+1}: {kb['content']}" for i, kb in enumerate(relevant_kb)])
            
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an IT support assistant. Use the provided knowledge base articles to suggest solutions. Always cite relevant KB articles."
                    },
                    {
                        "role": "user", 
                        "content": f"Incident: {incident_summary}\n\nRelevant KB Articles:\n{kb_context}\n\nProvide step-by-step solution:"
                    }
                ],
                max_tokens=400
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error generating solution: {e}")
            return "Solution generation unavailable - please refer to knowledge base articles manually"

# Initialize RAG system
rag_system = ITSupportRAG()

@app.route('/')
def home():
    """Main interface for IT Support Assistant"""
    return render_template_string("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>IT Support Assistant - RAG System</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
            .header { text-align: center; color: #333; border-bottom: 2px solid #007acc; padding-bottom: 20px; }
            .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
            .button { background: #007acc; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
            .button:hover { background: #005a99; }
            textarea { width: 100%; height: 100px; margin: 10px 0; padding: 10px; }
            .result { background: #f9f9f9; padding: 15px; margin: 10px 0; border-left: 4px solid #007acc; }
            .kb-article { background: #e8f4f8; padding: 10px; margin: 5px 0; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔧 IT Support Assistant</h1>
                <h2>AI-Powered Co-Pilot with Offline RAG</h2>
                <p><strong>Intelligent Enterprise IT Support Solution</strong></p>
                <p>Advanced RAG System for Support Teams</p>
            </div>
            
            <div class="section">
                <h3>📋 Incident Analysis & Summarization</h3>
                <textarea id="incident" placeholder="Describe the IT incident or issue..."></textarea>
                <button class="button" onclick="analyzeIncident()">Analyze Incident</button>
                <div id="incident-result"></div>
            </div>
            
            <div class="section">
                <h3>🔍 Knowledge Base Search</h3>
                <textarea id="search" placeholder="Search for solutions or troubleshooting steps..."></textarea>
                <button class="button" onclick="searchKB()">Search Knowledge Base</button>
                <div id="search-result"></div>
            </div>
            
            <div class="section">
                <h3>🤖 Complete RAG Solution</h3>
                <textarea id="problem" placeholder="Describe your complete IT problem for AI-powered solution..."></textarea>
                <button class="button" onclick="getSolution()">Get AI Solution</button>
                <div id="solution-result"></div>
            </div>
            
            <div class="section">
                <h3>📚 Available Knowledge Base Articles</h3>
                <button class="button" onclick="loadKB()">Load Knowledge Base</button>
                <div id="kb-list"></div>
            </div>
        </div>
        
        <script>
            async function analyzeIncident() {
                const incident = document.getElementById('incident').value;
                const response = await fetch('/api/summarize', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({incident: incident})
                });
                const result = await response.json();
                document.getElementById('incident-result').innerHTML = 
                    `<div class="result"><h4>📊 Incident Summary:</h4><p>${result.summary}</p></div>`;
            }
            
            async function searchKB() {
                const query = document.getElementById('search').value;
                const response = await fetch('/api/search', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({query: query})
                });
                const result = await response.json();
                let html = '<div class="result"><h4>🔍 Search Results:</h4>';
                result.results.forEach(article => {
                    html += `<div class="kb-article">
                        <h5>${article.title} (${(article.relevance_score * 100).toFixed(1)}% relevant)</h5>
                        <p><strong>Category:</strong> ${article.category}</p>
                        <p>${article.content}</p>
                    </div>`;
                });
                html += '</div>';
                document.getElementById('search-result').innerHTML = html;
            }
            
            async function getSolution() {
                const problem = document.getElementById('problem').value;
                const response = await fetch('/api/solution', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({problem: problem})
                });
                const result = await response.json();
                document.getElementById('solution-result').innerHTML = 
                    `<div class="result">
                        <h4>🎯 AI-Generated Solution:</h4>
                        <div class="kb-article"><h5>Summary:</h5><p>${result.summary}</p></div>
                        <div class="kb-article"><h5>Solution:</h5><p>${result.solution}</p></div>
                        <div class="kb-article"><h5>Referenced KB Articles:</h5>
                            ${result.kb_articles.map(kb => `<p>• ${kb.title} (${kb.category})</p>`).join('')}
                        </div>
                    </div>`;
            }
            
            async function loadKB() {
                const response = await fetch('/api/knowledge-base');
                const result = await response.json();
                let html = '<div class="result"><h4>📚 Knowledge Base Articles:</h4>';
                result.articles.forEach(article => {
                    html += `<div class="kb-article">
                        <h5>${article.id}: ${article.title}</h5>
                        <p><strong>Category:</strong> ${article.category}</p>
                        <p><strong>Tags:</strong> ${article.tags.join(', ')}</p>
                        <p>${article.content}</p>
                    </div>`;
                });
                html += '</div>';
                document.getElementById('kb-list').innerHTML = html;
            }
        </script>
    </body>
    </html>
    """)

@app.route('/api/summarize', methods=['POST'])
def summarize_incident():
    """Summarize incident using LLM"""
    data = request.get_json() or {}
    incident = data.get('incident', '')
    
    summary = rag_system.summarize_incident(incident)
    
    return jsonify({
        'success': True,
        'summary': summary,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/search', methods=['POST'])
def search_kb():
    """Search knowledge base using RAG"""
    data = request.get_json() or {}
    query = data.get('query', '')
    
    results = rag_system.search_knowledge_base(query)
    
    return jsonify({
        'success': True,
        'results': results,
        'query': query,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/solution', methods=['POST'])
def get_solution():
    """Get complete solution using RAG approach"""
    data = request.get_json() or {}
    problem = data.get('problem', '')
    
    # Step 1: Summarize the problem
    summary = rag_system.summarize_incident(problem)
    
    # Step 2: Search relevant KB articles
    kb_articles = rag_system.search_knowledge_base(problem)
    
    # Step 3: Generate solution using RAG
    solution = rag_system.generate_solution(summary, kb_articles)
    
    return jsonify({
        'success': True,
        'summary': summary,
        'solution': solution,
        'kb_articles': kb_articles,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/knowledge-base', methods=['GET'])
def get_knowledge_base():
    """Get all knowledge base articles"""
    return jsonify({
        'success': True,
        'articles': rag_system.knowledge_base,
        'total_articles': len(rag_system.knowledge_base),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/add-article', methods=['POST'])
def add_kb_article():
    """Add new knowledge base article"""
    data = request.get_json() or {}
    
    article = {
        'id': f"KB{str(uuid.uuid4())[:6].upper()}",
        'title': data.get('title', ''),
        'category': data.get('category', ''),
        'content': data.get('content', ''),
        'tags': data.get('tags', []),
        'created_at': datetime.now().isoformat()
    }
    
    rag_system.knowledge_base.append(article)
    rag_system.generate_embeddings()
    rag_system.save_knowledge_base()
    
    return jsonify({
        'success': True,
        'message': 'Article added successfully',
        'article_id': article['id']
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'IT Support Assistant RAG System',
        'version': '1.0.0',
        'kb_articles': len(rag_system.knowledge_base),
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    logger.info("Starting IT Support Assistant RAG System...")
    logger.info(f"Knowledge Base: {len(rag_system.knowledge_base)} articles loaded")
    app.run(host='0.0.0.0', port=5001, debug=True)