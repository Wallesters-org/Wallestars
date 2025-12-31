# CLAUDE AGENT IMPLEMENTATION - Wallestars

## Преглед

Този документ описва имплементацията на Claude AI Agent в Wallestars проекта, използвайки Anthropic API. Claude предоставя мощни възможности за разсъждение, анализ и изпълнение на сложни задачи.

---

## Защо Claude Agent?

### Предимства на Claude
- **Дълъг контекст**: Claude 3 поддържа до 200K tokens context window
- **Високо качество**: Отлично разсъждение и разбиране на сложни задачи
- **Безопасност**: Built-in safety features и responsible AI
- **Multimodal**: Поддръжка на текст и изображения
- **Reliable**: Consistent и predictable outputs

### Сравнение Claude vs GPT-4

| Feature | Claude 3 Opus | Claude 3 Sonnet | GPT-4 Turbo |
|---------|---------------|-----------------|-------------|
| Context Window | 200K tokens | 200K tokens | 128K tokens |
| Speed | Medium | Fast | Medium |
| Cost | Higher | Medium | Higher |
| Reasoning | Excellent | Very Good | Excellent |
| Code Generation | Excellent | Very Good | Excellent |

---

## Архитектура на Claude Agent

```
┌─────────────────────────────────────────────────────────────┐
│                   CLAUDE AGENT СИСТЕМА                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. AGENT INTERFACE                                          │
│     ├── API Gateway                                          │
│     ├── Request handler                                      │
│     ├── Session management                                   │
│     └── Authentication                                       │
│                                                               │
│  2. CORE AGENT ENGINE                                        │
│     ├── Claude API integration                               │
│     ├── Prompt management                                    │
│     ├── Context tracking                                     │
│     ├── Memory система                                       │
│     └── Tool использование                                    │
│                                                               │
│  3. TOOL СИСТЕМА                                             │
│     ├── Code execution                                       │
│     ├── File operations                                      │
│     ├── Web search                                           │
│     ├── API calls                                            │
│     └── Database queries                                     │
│                                                               │
│  4. INTEGRATION LAYER                                        │
│     ├── RAG system integration                               │
│     ├── EVA system connectivity                              │
│     ├── n8n workflow triggers                                │
│     └── External APIs                                        │
│                                                               │
│  5. MONITORING & LOGGING                                     │
│     ├── Usage tracking                                       │
│     ├── Performance metrics                                  │
│     ├── Error handling                                       │
│     └── Audit logs                                           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Anthropic API Setup

### API Key Configuration

```bash
# .env файл
ANTHROPIC_API_KEY=sk-ant-api03-...

# Optional configurations
ANTHROPIC_MODEL=claude-3-opus-20240229  # или claude-3-sonnet-20240229
ANTHROPIC_MAX_TOKENS=4096
ANTHROPIC_TEMPERATURE=0.7
```

### Достъп до API Key
1. Регистрирайте се на https://console.anthropic.com/
2. Генерирайте API key от Settings > API Keys
3. Запазете key-а сигурно в environment variables
4. Никога не commit-вайте API keys в git!

---

## Python Implementation

### Basic Claude Client

```python
import os
from anthropic import Anthropic, HUMAN_PROMPT, AI_PROMPT

class ClaudeClient:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv('ANTHROPIC_API_KEY')
        self.client = Anthropic(api_key=self.api_key)
        self.model = os.getenv('ANTHROPIC_MODEL', 'claude-3-opus-20240229')
        
    def send_message(self, message: str, system: str = None, max_tokens: int = 4096) -> str:
        """Изпраща съобщение до Claude и получава отговор"""
        try:
            messages = [{"role": "user", "content": message}]
            
            response = self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                system=system,
                messages=messages
            )
            
            return response.content[0].text
            
        except Exception as e:
            print(f"Error: {e}")
            return None
    
    def chat(self, messages: list, system: str = None, max_tokens: int = 4096) -> dict:
        """Multi-turn conversation с Claude"""
        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                system=system,
                messages=messages
            )
            
            return {
                "content": response.content[0].text,
                "model": response.model,
                "usage": {
                    "input_tokens": response.usage.input_tokens,
                    "output_tokens": response.usage.output_tokens
                },
                "stop_reason": response.stop_reason
            }
            
        except Exception as e:
            return {"error": str(e)}
```

### Advanced Claude Agent with Tools

```python
from typing import List, Dict, Callable
import json

class ClaudeAgent:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv('ANTHROPIC_API_KEY')
        self.client = Anthropic(api_key=self.api_key)
        self.model = 'claude-3-opus-20240229'
        self.conversation_history = []
        self.tools = {}
        self.system_prompt = None
        
    def register_tool(self, name: str, func: Callable, description: str):
        """Регистрира tool който агента може да използва"""
        self.tools[name] = {
            "function": func,
            "description": description
        }
    
    def set_system_prompt(self, prompt: str):
        """Задава system prompt за агента"""
        self.system_prompt = prompt
    
    def _generate_tools_description(self) -> str:
        """Генерира описание на достъпни tools за Claude"""
        if not self.tools:
            return ""
        
        tools_desc = "\n\nДостъпни инструменти:\n"
        for name, tool in self.tools.items():
            tools_desc += f"- {name}: {tool['description']}\n"
        
        tools_desc += """
За да използваш инструмент, отговори във формат:
<tool_use>
<tool_name>име_на_инструмента</tool_name>
<parameters>
{
  "param1": "value1",
  "param2": "value2"
}
</parameters>
</tool_use>
"""
        return tools_desc
    
    def _parse_tool_use(self, response: str) -> Dict:
        """Parse tool use от Claude response"""
        if "<tool_use>" not in response:
            return None
        
        try:
            tool_start = response.find("<tool_name>") + len("<tool_name>")
            tool_end = response.find("</tool_name>")
            tool_name = response[tool_start:tool_end].strip()
            
            params_start = response.find("<parameters>") + len("<parameters>")
            params_end = response.find("</parameters>")
            params_str = response[params_start:params_end].strip()
            
            parameters = json.loads(params_str)
            
            return {
                "tool_name": tool_name,
                "parameters": parameters
            }
        except Exception as e:
            print(f"Error parsing tool use: {e}")
            return None
    
    def _execute_tool(self, tool_name: str, parameters: Dict) -> str:
        """Изпълнява tool с дадени параметри"""
        if tool_name not in self.tools:
            return f"Error: Tool '{tool_name}' не съществува"
        
        try:
            result = self.tools[tool_name]["function"](**parameters)
            return str(result)
        except Exception as e:
            return f"Error executing tool: {e}"
    
    def process_message(self, user_message: str, max_iterations: int = 5) -> Dict:
        """
        Обработва съобщение с възможност за multiple tool uses
        """
        self.conversation_history.append({
            "role": "user",
            "content": user_message
        })
        
        iterations = 0
        final_response = ""
        
        while iterations < max_iterations:
            iterations += 1
            
            # Добавяне на tools description към system prompt
            system = self.system_prompt or "Ти си полезен AI асистент."
            system += self._generate_tools_description()
            
            # Получаване на отговор от Claude
            response = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                system=system,
                messages=self.conversation_history
            )
            
            assistant_message = response.content[0].text
            
            # Проверка дали Claude иска да използва tool
            tool_use = self._parse_tool_use(assistant_message)
            
            if tool_use is None:
                # Няма tool use, това е финалния отговор
                final_response = assistant_message
                self.conversation_history.append({
                    "role": "assistant",
                    "content": assistant_message
                })
                break
            
            # Изпълнение на tool
            tool_result = self._execute_tool(
                tool_use["tool_name"],
                tool_use["parameters"]
            )
            
            # Добавяне на tool result към conversation
            self.conversation_history.append({
                "role": "assistant",
                "content": assistant_message
            })
            
            self.conversation_history.append({
                "role": "user",
                "content": f"Tool result:\n{tool_result}"
            })
        
        return {
            "response": final_response,
            "iterations": iterations,
            "conversation_history": self.conversation_history
        }
    
    def reset_conversation(self):
        """Reset conversation history"""
        self.conversation_history = []
```

### Example Tools Implementation

```python
import subprocess
import requests
from pathlib import Path

class AgentTools:
    @staticmethod
    def execute_code(code: str, language: str = "python") -> str:
        """Изпълнява код"""
        try:
            if language == "python":
                result = subprocess.run(
                    ["python", "-c", code],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                return result.stdout if result.returncode == 0 else result.stderr
            else:
                return "Unsupported language"
        except Exception as e:
            return f"Error: {e}"
    
    @staticmethod
    def read_file(filepath: str) -> str:
        """Чете съдържание на файл"""
        try:
            path = Path(filepath)
            if path.exists():
                return path.read_text()
            else:
                return f"File not found: {filepath}"
        except Exception as e:
            return f"Error reading file: {e}"
    
    @staticmethod
    def write_file(filepath: str, content: str) -> str:
        """Записва съдържание във файл"""
        try:
            path = Path(filepath)
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content)
            return f"Successfully wrote to {filepath}"
        except Exception as e:
            return f"Error writing file: {e}"
    
    @staticmethod
    def web_search(query: str) -> str:
        """Извършва web search (simplified)"""
        # Тук може да се интегрира Google Search API, DuckDuckGo API и др.
        return f"Search results for: {query}\n(Implement actual search API here)"
    
    @staticmethod
    def api_call(url: str, method: str = "GET", data: dict = None) -> str:
        """Прави API call"""
        try:
            if method == "GET":
                response = requests.get(url)
            elif method == "POST":
                response = requests.post(url, json=data)
            else:
                return f"Unsupported method: {method}"
            
            return response.text
        except Exception as e:
            return f"Error: {e}"
```

### Complete Agent Setup

```python
# Инициализация на агент
agent = ClaudeAgent(api_key=os.getenv('ANTHROPIC_API_KEY'))

# Настройка на system prompt
agent.set_system_prompt("""
Ти си Claude Agent за Wallestars проекта. Твоята задача е да помагаш с:
- Анализ на код и документация
- Изпълнение на задачи
- Automation и scripting
- Отговаряне на въпроси на български език

Винаги бъди точен, професионален и полезен.
""")

# Регистриране на tools
agent.register_tool(
    "execute_code",
    AgentTools.execute_code,
    "Изпълнява Python код и връща резултата"
)

agent.register_tool(
    "read_file",
    AgentTools.read_file,
    "Чете съдържание на файл"
)

agent.register_tool(
    "write_file",
    AgentTools.write_file,
    "Записва текст във файл"
)

agent.register_tool(
    "web_search",
    AgentTools.web_search,
    "Търси информация в интернет"
)

# Използване на агента
result = agent.process_message(
    "Моля, прочети файла config.json и покажи ми съдържанието"
)

print(result["response"])
```

---

## FastAPI Integration

### API Server Implementation

```python
from fastapi import FastAPI, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List
import os

app = FastAPI(title="Claude Agent API")

# Models
class MessageRequest(BaseModel):
    message: str
    system_prompt: Optional[str] = None
    max_tokens: Optional[int] = 4096
    
class ChatRequest(BaseModel):
    messages: List[dict]
    system_prompt: Optional[str] = None
    max_tokens: Optional[int] = 4096

class AgentRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    use_tools: Optional[bool] = True

# Authentication
def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != os.getenv("API_SECRET_KEY"):
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_api_key

# In-memory session storage (use Redis in production)
agent_sessions = {}

def get_agent_session(session_id: str) -> ClaudeAgent:
    if session_id not in agent_sessions:
        agent = ClaudeAgent()
        agent.set_system_prompt("""
        Ти си AI асистент за Wallestars проекта.
        Помагаш с разработка, документация и automation.
        """)
        agent_sessions[session_id] = agent
    return agent_sessions[session_id]

# Endpoints
@app.post("/api/claude/message")
async def send_message(
    request: MessageRequest,
    api_key: str = Depends(verify_api_key)
):
    """Изпраща единично съобщение до Claude"""
    try:
        client = ClaudeClient()
        response = client.send_message(
            message=request.message,
            system=request.system_prompt,
            max_tokens=request.max_tokens
        )
        
        return {
            "status": "success",
            "response": response
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/claude/chat")
async def chat(
    request: ChatRequest,
    api_key: str = Depends(verify_api_key)
):
    """Multi-turn conversation с Claude"""
    try:
        client = ClaudeClient()
        response = client.chat(
            messages=request.messages,
            system=request.system_prompt,
            max_tokens=request.max_tokens
        )
        
        return {
            "status": "success",
            **response
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/agent/process")
async def process_agent_message(
    request: AgentRequest,
    api_key: str = Depends(verify_api_key)
):
    """Процесира съобщение с пълната Agent система"""
    try:
        session_id = request.session_id or "default"
        agent = get_agent_session(session_id)
        
        result = agent.process_message(request.message)
        
        return {
            "status": "success",
            "session_id": session_id,
            **result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/agent/reset/{session_id}")
async def reset_agent_session(
    session_id: str,
    api_key: str = Depends(verify_api_key)
):
    """Reset agent session"""
    if session_id in agent_sessions:
        agent_sessions[session_id].reset_conversation()
        return {"status": "success", "message": "Session reset"}
    return {"status": "success", "message": "Session not found"}

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Claude Agent API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## n8n Integration

### n8n Workflow for Claude Agent

#### Node 1: Webhook Trigger
```json
{
  "name": "Claude Agent Webhook",
  "type": "n8n-nodes-base.webhook",
  "parameters": {
    "path": "claude-agent",
    "responseMode": "responseNode",
    "authentication": "headerAuth"
  }
}
```

#### Node 2: Call Claude API
```json
{
  "name": "Claude Agent Call",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "http://localhost:8000/api/agent/process",
    "authentication": "headerAuth",
    "sendHeaders": true,
    "headerParameters": {
      "X-API-Key": "={{ $env.API_SECRET_KEY }}"
    },
    "sendBody": true,
    "bodyParameters": {
      "message": "={{ $json.message }}",
      "session_id": "={{ $json.session_id }}",
      "use_tools": true
    }
  }
}
```

#### Node 3: Process Response
```json
{
  "name": "Format Response",
  "type": "n8n-nodes-base.code",
  "parameters": {
    "language": "javascript",
    "code": "const response = $input.item.json;\nreturn {\n  status: 'success',\n  answer: response.response,\n  iterations: response.iterations\n};"
  }
}
```

---

## Integration with RAG System

```python
class ClaudeRAGAgent(ClaudeAgent):
    def __init__(self, api_key: str = None, rag_system=None):
        super().__init__(api_key)
        self.rag_system = rag_system
        
        # Register RAG tool
        self.register_tool(
            "search_knowledge_base",
            self._search_kb,
            "Търси информация в knowledge base използвайки RAG"
        )
    
    def _search_kb(self, query: str, top_k: int = 5) -> str:
        """Търси в RAG knowledge base"""
        if self.rag_system is None:
            return "RAG system not configured"
        
        result = self.rag_system.query(query, {"top_k": top_k})
        
        if result["status"] == "success":
            answer = result["answer"]
            sources = "\n".join([
                f"- {s.get('title', 'Unknown')} (score: {s.get('relevance_score', 'N/A')})"
                for s in result.get("sources", [])
            ])
            return f"Answer: {answer}\n\nSources:\n{sources}"
        else:
            return f"Error: {result.get('error', 'Unknown error')}"

# Usage
rag_system = WallestarsRAGSystem(
    openai_api_key=os.getenv('OPENAI_API_KEY'),
    vector_db_config={}
)

claude_rag_agent = ClaudeRAGAgent(
    api_key=os.getenv('ANTHROPIC_API_KEY'),
    rag_system=rag_system
)

response = claude_rag_agent.process_message(
    "Какво е RAG модел? Потърси в knowledge base."
)
```

---

## Integration with EVA System

```python
class ClaudeEVAAgent(ClaudeAgent):
    """Claude Agent интегриран с EVA система"""
    
    def __init__(self, api_key: str = None):
        super().__init__(api_key)
        
        self.set_system_prompt("""
        Ти си EVA (Enhanced Virtual Assistant) базиран на Claude.
        Твоята цел е да предоставяш персонализирано потребителско взаимодействие.
        
        Принципи:
        1. Контекстуално анализиране на входни данни
        2. Персонализирано изпълнение на задачи
        3. Адаптация към индивидуални нужди
        4. Поддържане на консистентност
        
        Винаги отговаряй на български език освен ако не е поискано друго.
        """)
        
        # Register EVA-specific tools
        self.register_tool(
            "analyze_context",
            self._analyze_context,
            "Анализира контекст и потребителски нужди"
        )
        
        self.register_tool(
            "personalize_response",
            self._personalize_response,
            "Персонализира отговор базиран на user profile"
        )
    
    def _analyze_context(self, input_data: dict) -> str:
        """Анализира контекст"""
        # Implement context analysis logic
        return f"Context analyzed: {input_data}"
    
    def _personalize_response(self, response: str, user_profile: dict) -> str:
        """Персонализира отговор"""
        # Implement personalization logic
        return response
```

---

## Security Best Practices

### 1. API Key Management
```python
# ❌ ЛОШО - Не hardcode API keys
client = Anthropic(api_key="sk-ant-api03-...")

# ✅ ДОБРО - Използвай environment variables
client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
```

### 2. Input Validation
```python
from pydantic import BaseModel, validator

class SafeMessageRequest(BaseModel):
    message: str
    
    @validator('message')
    def validate_message(cls, v):
        if len(v) > 10000:
            raise ValueError('Message too long')
        if any(bad in v.lower() for bad in ['<script>', 'javascript:']):
            raise ValueError('Invalid content')
        return v
```

### 3. Rate Limiting
```python
from fastapi import FastAPI, Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/claude/message")
@limiter.limit("10/minute")
async def send_message(request: Request, ...):
    # Your code here
    pass
```

---

## Monitoring and Logging

```python
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('claude_agent.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger('claude_agent')

class MonitoredClaudeAgent(ClaudeAgent):
    def process_message(self, user_message: str, **kwargs):
        start_time = datetime.now()
        
        logger.info(f"Processing message: {user_message[:100]}...")
        
        try:
            result = super().process_message(user_message, **kwargs)
            
            duration = (datetime.now() - start_time).total_seconds()
            logger.info(f"Message processed in {duration:.2f}s")
            
            return result
            
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            raise
```

---

## Cost Optimization

### Token Usage Tracking

```python
class CostTracker:
    # Pricing (as of 2024)
    PRICING = {
        "claude-3-opus-20240229": {
            "input": 15.00 / 1_000_000,   # $15 per 1M tokens
            "output": 75.00 / 1_000_000   # $75 per 1M tokens
        },
        "claude-3-sonnet-20240229": {
            "input": 3.00 / 1_000_000,    # $3 per 1M tokens
            "output": 15.00 / 1_000_000   # $15 per 1M tokens
        }
    }
    
    def __init__(self):
        self.total_input_tokens = 0
        self.total_output_tokens = 0
        self.model = "claude-3-opus-20240229"
    
    def track_usage(self, input_tokens: int, output_tokens: int):
        self.total_input_tokens += input_tokens
        self.total_output_tokens += output_tokens
    
    def get_cost(self) -> float:
        pricing = self.PRICING[self.model]
        input_cost = self.total_input_tokens * pricing["input"]
        output_cost = self.total_output_tokens * pricing["output"]
        return input_cost + output_cost
    
    def get_report(self) -> dict:
        return {
            "input_tokens": self.total_input_tokens,
            "output_tokens": self.total_output_tokens,
            "total_cost_usd": round(self.get_cost(), 4),
            "model": self.model
        }
```

---

## Deployment

### Docker Deployment

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Environment variables
ENV ANTHROPIC_API_KEY=""
ENV API_SECRET_KEY=""

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  claude-agent:
    build: .
    ports:
      - "8000:8000"
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - API_SECRET_KEY=${API_SECRET_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./logs:/app/logs
      - ./data:/app/data
    restart: unless-stopped
    networks:
      - wallestars-network

networks:
  wallestars-network:
    driver: bridge
```

---

## Testing

```python
import pytest
from claude_agent import ClaudeAgent

@pytest.fixture
def agent():
    return ClaudeAgent(api_key=os.getenv('ANTHROPIC_API_KEY_TEST'))

def test_basic_message(agent):
    result = agent.process_message("Здравей!")
    assert result["response"] is not None
    assert len(result["response"]) > 0

def test_tool_usage(agent):
    agent.register_tool(
        "test_tool",
        lambda x: f"Result: {x}",
        "Test tool"
    )
    
    result = agent.process_message("Използвай test_tool с параметър 'hello'")
    assert "Result: hello" in str(result)

def test_conversation_history(agent):
    agent.process_message("Здравей, казвам се Иван")
    result = agent.process_message("Как се казвам?")
    assert "Иван" in result["response"]
```

---

## Best Practices

1. **Always use environment variables** за API keys
2. **Implement proper error handling** и logging
3. **Use rate limiting** за production deployments
4. **Monitor token usage** и costs
5. **Validate all inputs** преди да ги изпращаш до Claude
6. **Cache responses** когато е възможно
7. **Use appropriate models** - Sonnet за speed, Opus за quality
8. **Implement timeouts** за API calls
9. **Test thoroughly** преди deployment
10. **Keep system prompts clear** и concise

---

## Следващи Стъпки

- [ ] Setup Anthropic API account и генериране на API key
- [ ] Имплементация на базов Claude client
- [ ] Създаване на agent система с tools
- [ ] Интеграция с RAG система
- [ ] Интеграция с EVA система
- [ ] Deployment на production
- [ ] Monitoring и optimization
- [ ] Documentation за end users

---

## Ресурси

- **Anthropic Documentation**: https://docs.anthropic.com/
- **Claude API Reference**: https://docs.anthropic.com/claude/reference/
- **Best Practices**: https://docs.anthropic.com/claude/docs/intro-to-claude
- **Responsible Use**: https://www.anthropic.com/index/claude-character
