# RAG MODEL IMPLEMENTATION - Wallestars

## Преглед

Този документ описва имплементацията на RAG (Retrieval-Augmented Generation) модел за Wallestars проекта, интегриран с n8n workflow автоматизация.

---

## Архитектура на RAG Модела

### Основни Компоненти

```
┌─────────────────────────────────────────────────────────────┐
│                   RAG MODEL СИСТЕМА                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. ВХОДЕН СЛОЙ (Input Layer)                               │
│     ├── Приемане на заявки (queries)                        │
│     ├── Обработка на документи                              │
│     ├── Векторизация на текст                               │
│     └── Индексиране в база данни                            │
│                                                               │
│  2. RETRIEVAL КОМПОНЕНТ                                      │
│     ├── Semantic search                                      │
│     ├── Vector similarity search                             │
│     ├── Context ranking                                      │
│     └── Релевантност filtering                              │
│                                                               │
│  3. AUGMENTATION СЛОЙ                                        │
│     ├── Context injection                                    │
│     ├── Prompt engineering                                   │
│     ├── Query expansion                                      │
│     └── Context optimization                                 │
│                                                               │
│  4. GENERATION КОМПОНЕНТ                                     │
│     ├── LLM интеграция                                      │
│     ├── Response generation                                  │
│     ├── Quality validation                                   │
│     └── Output formatting                                    │
│                                                               │
│  5. n8n WORKFLOW INTEGRATION                                 │
│     ├── Автоматизация на процеси                            │
│     ├── API endpoints                                        │
│     ├── Data pipeline управление                            │
│     └── Monitoring и logging                                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## n8n Workflow Интеграция

### Workflow URL
**Production Workflow**: https://n8n.srv1201204.hstgr.cloud/workflow/pyFT2zCaIPc8KcR0

### Основни Функции на Workflow

#### 1. Document Processing Pipeline
```javascript
{
  "workflow_name": "RAG_Document_Processor",
  "triggers": [
    "Webhook приемане на документи",
    "Scheduled document refresh",
    "Manual trigger за reindexing"
  ],
  "steps": [
    {
      "step": "Document Ingestion",
      "action": "Приемане и валидация на документи",
      "output": "validated_documents"
    },
    {
      "step": "Text Extraction",
      "action": "Извличане на текст от различни формати",
      "supported_formats": ["PDF", "DOCX", "TXT", "MD", "HTML"]
    },
    {
      "step": "Chunking",
      "action": "Разделяне на документи на chunks",
      "chunk_size": 1000,
      "chunk_overlap": 200
    },
    {
      "step": "Embedding Generation",
      "action": "Генериране на vector embeddings",
      "model": "text-embedding-ada-002 или text-embedding-3-small"
    },
    {
      "step": "Vector Storage",
      "action": "Съхранение в vector database",
      "database": "Pinecone/Weaviate/Qdrant"
    }
  ]
}
```

#### 2. Query Processing Pipeline
```javascript
{
  "workflow_name": "RAG_Query_Handler",
  "triggers": [
    "API webhook за заявки",
    "Real-time user queries"
  ],
  "steps": [
    {
      "step": "Query Reception",
      "action": "Приемане на потребителска заявка",
      "validation": "Query validation и sanitization"
    },
    {
      "step": "Query Embedding",
      "action": "Векторизация на заявката",
      "model": "същия като за документите"
    },
    {
      "step": "Similarity Search",
      "action": "Търсене на релевантни документи",
      "top_k": 5,
      "similarity_threshold": 0.75
    },
    {
      "step": "Context Assembly",
      "action": "Съставяне на контекст за LLM",
      "max_context_length": 4000
    },
    {
      "step": "LLM Generation",
      "action": "Генериране на отговор",
      "model": "GPT-4 или Claude-3",
      "temperature": 0.7
    },
    {
      "step": "Response Formatting",
      "action": "Форматиране и връщане на отговор",
      "include_sources": true
    }
  ]
}
```

### n8n Конфигурация

#### Credentials Setup
```json
{
  "openai_api": {
    "api_key": "YOUR_OPENAI_API_KEY",
    "organization": "your-org-id"
  },
  "anthropic_api": {
    "api_key": "YOUR_ANTHROPIC_API_KEY"
  },
  "vector_db": {
    "api_key": "YOUR_VECTOR_DB_API_KEY",
    "environment": "YOUR_ENVIRONMENT",
    "index_name": "wallestars-rag-index"
  },
  "webhook_auth": {
    "type": "Bearer Token",
    "token": "YOUR_WEBHOOK_SECRET"
  }
}
```

#### Webhook Endpoints

**Document Upload Endpoint**
```
POST https://n8n.srv1201204.hstgr.cloud/webhook/rag-upload
Content-Type: application/json

{
  "document": {
    "title": "Document Title",
    "content": "Document content text...",
    "metadata": {
      "source": "source_name",
      "date": "2025-12-31",
      "tags": ["tag1", "tag2"]
    }
  }
}
```

**Query Endpoint**
```
POST https://n8n.srv1201204.hstgr.cloud/webhook/rag-query
Content-Type: application/json

{
  "query": "Какво е RAG модел?",
  "user_id": "user_123",
  "options": {
    "top_k": 5,
    "include_sources": true,
    "language": "bulgarian"
  }
}
```

---

## Vector Database Setup

### Препоръчани Решения

#### 1. Pinecone (Препоръчва се)
```python
import pinecone

pinecone.init(
    api_key="YOUR_API_KEY",
    environment="YOUR_ENVIRONMENT"
)

# Създаване на index
index = pinecone.Index("wallestars-rag")

# Добавяне на vectors
index.upsert(
    vectors=[
        ("doc_1", [0.1, 0.2, ...], {"text": "content", "source": "doc1.pdf"}),
        ("doc_2", [0.3, 0.4, ...], {"text": "content", "source": "doc2.pdf"})
    ]
)

# Търсене
results = index.query(
    vector=[0.1, 0.2, ...],
    top_k=5,
    include_metadata=True
)
```

#### 2. Weaviate (Open Source)
```python
import weaviate

client = weaviate.Client("http://localhost:8080")

# Създаване на schema
schema = {
    "classes": [{
        "class": "Document",
        "vectorizer": "text2vec-openai",
        "properties": [
            {"name": "content", "dataType": ["text"]},
            {"name": "source", "dataType": ["string"]},
            {"name": "timestamp", "dataType": ["date"]}
        ]
    }]
}

client.schema.create(schema)
```

---

## LLM Интеграция

### OpenAI Integration
```python
from openai import OpenAI

client = OpenAI(api_key="YOUR_API_KEY")

def generate_response(query, context):
    prompt = f"""
    Контекст: {context}
    
    Въпрос: {query}
    
    Моля, отговори на въпроса на български език, базирайки се на предоставения контекст.
    Ако информацията не е достатъчна, кажи това ясно.
    """
    
    response = client.chat.completions.create(
        model="gpt-4-turbo-preview",
        messages=[
            {"role": "system", "content": "Ти си полезен асистент, който отговаря на български език."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=1000
    )
    
    return response.choices[0].message.content
```

### Anthropic Claude Integration
```python
from anthropic import Anthropic

client = Anthropic(api_key="YOUR_ANTHROPIC_API_KEY")

def generate_response_claude(query, context):
    prompt = f"""
    Контекст: {context}
    
    Въпрос: {query}
    
    Моля, отговори на въпроса на български език, базирайки се на предоставения контекст.
    """
    
    response = client.messages.create(
        model="claude-3-opus-20240229",
        max_tokens=1000,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    
    return response.content[0].text
```

---

## Имплементационен Code

### Python RAG Implementation

#### 1. Document Processor
```python
import os
from typing import List, Dict
from openai import OpenAI
import numpy as np

class DocumentProcessor:
    def __init__(self, openai_api_key: str):
        self.client = OpenAI(api_key=openai_api_key)
        
    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """Разделя текст на chunks с overlap"""
        chunks = []
        start = 0
        text_length = len(text)
        
        while start < text_length:
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append(chunk)
            start += chunk_size - overlap
            
        return chunks
    
    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Генерира embeddings за списък от текстове"""
        embeddings = []
        
        for text in texts:
            response = self.client.embeddings.create(
                model="text-embedding-3-small",
                input=text
            )
            embeddings.append(response.data[0].embedding)
            
        return embeddings
    
    def process_document(self, document: str, metadata: Dict) -> List[Dict]:
        """Обработва документ и връща chunks с embeddings"""
        chunks = self.chunk_text(document)
        embeddings = self.generate_embeddings(chunks)
        
        processed_chunks = []
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            processed_chunks.append({
                "chunk_id": f"{metadata.get('doc_id', 'unknown')}_{i}",
                "text": chunk,
                "embedding": embedding,
                "metadata": metadata
            })
            
        return processed_chunks
```

#### 2. RAG Query Handler
```python
class RAGQueryHandler:
    def __init__(self, openai_api_key: str, vector_db):
        self.client = OpenAI(api_key=openai_api_key)
        self.vector_db = vector_db
        
    def query_embedding(self, query: str) -> List[float]:
        """Генерира embedding за заявка"""
        response = self.client.embeddings.create(
            model="text-embedding-3-small",
            input=query
        )
        return response.data[0].embedding
    
    def retrieve_context(self, query: str, top_k: int = 5) -> List[Dict]:
        """Извлича релевантен контекст от vector DB"""
        query_vector = self.query_embedding(query)
        results = self.vector_db.search(query_vector, top_k=top_k)
        return results
    
    def generate_answer(self, query: str, context: List[Dict]) -> Dict:
        """Генерира отговор с LLM"""
        context_text = "\n\n".join([
            f"Източник {i+1}: {doc['text']}"
            for i, doc in enumerate(context)
        ])
        
        prompt = f"""
        Базирайки се на следния контекст, моля отговори на въпроса на български език.
        
        Контекст:
        {context_text}
        
        Въпрос: {query}
        
        Отговор:
        """
        
        response = self.client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": "Ти си експертен асистент за Wallestars проекта."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        return {
            "answer": response.choices[0].message.content,
            "sources": [doc['metadata'] for doc in context],
            "confidence": self._calculate_confidence(context)
        }
    
    def _calculate_confidence(self, context: List[Dict]) -> float:
        """Изчислява confidence score базиран на similarity scores"""
        if not context:
            return 0.0
        scores = [doc.get('score', 0) for doc in context]
        return sum(scores) / len(scores)
```

#### 3. Complete RAG System
```python
class WallestarsRAGSystem:
    def __init__(self, openai_api_key: str, vector_db_config: Dict):
        self.doc_processor = DocumentProcessor(openai_api_key)
        self.query_handler = RAGQueryHandler(openai_api_key, vector_db_config)
        
    def add_document(self, document: str, metadata: Dict) -> Dict:
        """Добавя документ в RAG системата"""
        try:
            chunks = self.doc_processor.process_document(document, metadata)
            
            # Store in vector DB
            for chunk in chunks:
                self.vector_db.upsert(
                    id=chunk['chunk_id'],
                    vector=chunk['embedding'],
                    metadata={
                        'text': chunk['text'],
                        **chunk['metadata']
                    }
                )
            
            return {
                "status": "success",
                "chunks_added": len(chunks),
                "document_id": metadata.get('doc_id')
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    def query(self, question: str, options: Dict = None) -> Dict:
        """Извършва RAG query"""
        try:
            options = options or {}
            top_k = options.get('top_k', 5)
            
            # Retrieve relevant context
            context = self.query_handler.retrieve_context(question, top_k)
            
            # Generate answer
            result = self.query_handler.generate_answer(question, context)
            
            return {
                "status": "success",
                "query": question,
                **result
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
```

---

## n8n Workflow Configuration

### Пълна n8n Workflow Setup

#### Node 1: Webhook Trigger
```json
{
  "name": "Document Upload Webhook",
  "type": "n8n-nodes-base.webhook",
  "parameters": {
    "path": "rag-upload",
    "responseMode": "responseNode",
    "authentication": "headerAuth"
  }
}
```

#### Node 2: Document Processing
```json
{
  "name": "Process Document",
  "type": "n8n-nodes-base.code",
  "parameters": {
    "language": "python",
    "code": "# Python code за обработка на документ\nimport json\n\ndocument = $input.item.json['document']\n# Process document chunks\n# Generate embeddings\nreturn {'processed': True, 'chunks': chunks}"
  }
}
```

#### Node 3: Vector DB Storage
```json
{
  "name": "Store in Pinecone",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "https://api.pinecone.io/vectors/upsert",
    "authentication": "headerAuth",
    "sendBody": true,
    "bodyParameters": {
      "vectors": "={{ $json.embeddings }}"
    }
  }
}
```

#### Node 4: Response
```json
{
  "name": "Send Response",
  "type": "n8n-nodes-base.respondToWebhook",
  "parameters": {
    "respondWith": "json",
    "responseBody": {
      "status": "success",
      "message": "Document processed successfully"
    }
  }
}
```

---

## API Documentation

### REST API Endpoints

#### 1. Add Document
```
POST /api/rag/documents
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

Request:
{
  "document": {
    "title": "Документ заглавие",
    "content": "Съдържание на документа...",
    "metadata": {
      "source": "manual_upload",
      "category": "documentation",
      "tags": ["tag1", "tag2"]
    }
  }
}

Response:
{
  "status": "success",
  "document_id": "doc_123456",
  "chunks_created": 15,
  "timestamp": "2025-12-31T12:00:00Z"
}
```

#### 2. Query RAG System
```
POST /api/rag/query
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

Request:
{
  "query": "Как работи RAG модела?",
  "options": {
    "top_k": 5,
    "include_sources": true,
    "language": "bulgarian"
  }
}

Response:
{
  "status": "success",
  "answer": "RAG моделът работи чрез...",
  "sources": [
    {
      "document_id": "doc_123",
      "title": "RAG Documentation",
      "relevance_score": 0.92
    }
  ],
  "confidence": 0.87,
  "timestamp": "2025-12-31T12:00:00Z"
}
```

#### 3. List Documents
```
GET /api/rag/documents?limit=10&offset=0
Authorization: Bearer YOUR_API_KEY

Response:
{
  "status": "success",
  "documents": [
    {
      "id": "doc_123",
      "title": "Document Title",
      "created_at": "2025-12-31T12:00:00Z",
      "chunks_count": 15
    }
  ],
  "total": 100,
  "limit": 10,
  "offset": 0
}
```

---

## Deployment и Configuration

### Environment Variables
```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...

# Anthropic Configuration (за Claude)
ANTHROPIC_API_KEY=sk-ant-...

# Vector Database Configuration
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=us-west1-gcp
PINECONE_INDEX_NAME=wallestars-rag

# n8n Configuration
N8N_WEBHOOK_URL=https://n8n.srv1201204.hstgr.cloud
N8N_WEBHOOK_SECRET=...

# Application Configuration
RAG_CHUNK_SIZE=1000
RAG_CHUNK_OVERLAP=200
RAG_TOP_K=5
RAG_CONFIDENCE_THRESHOLD=0.75
```

### Docker Deployment
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  rag-api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - PINECONE_API_KEY=${PINECONE_API_KEY}
    volumes:
      - ./data:/app/data
    restart: unless-stopped

  weaviate:
    image: semitechnologies/weaviate:latest
    ports:
      - "8080:8080"
    environment:
      - AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true
      - PERSISTENCE_DATA_PATH=/var/lib/weaviate
    volumes:
      - weaviate_data:/var/lib/weaviate

volumes:
  weaviate_data:
```

---

## Мониторинг и Оптимизация

### Performance Metrics
- Query latency (средно време за отговор)
- Retrieval accuracy (precision и recall)
- Context relevance scores
- LLM token usage
- Cache hit rates

### Logging Configuration
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('rag_system.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger('wallestars_rag')
```

---

## Best Practices

1. **Chunk Size Optimization**: Експериментирай с chunk size (500-2000 tokens)
2. **Embedding Model Selection**: Използвай text-embedding-3-small за speed или text-embedding-3-large за accuracy
3. **Context Window Management**: Внимавай да не превишиш LLM context limits
4. **Caching**: Кеширай често използвани queries и embeddings
5. **Error Handling**: Имплементирай robust error handling и fallbacks
6. **Security**: Винаги валидирай и sanitize user inputs
7. **Rate Limiting**: Имплементирай rate limiting за API endpoints
8. **Monitoring**: Continuously monitor performance и quality metrics

---

## Следващи Стъпки

1. [ ] Setup vector database (Pinecone/Weaviate)
2. [ ] Конфигуриране на n8n workflows
3. [ ] Имплементация на Python RAG system
4. [ ] Създаване на API endpoints
5. [ ] Testing с реални документи
6. [ ] Deployment на production
7. [ ] Мониторинг и оптимизация
8. [ ] Интеграция с EVA система

---

## Ресурси и Референции

- **n8n Workflow**: https://n8n.srv1201204.hstgr.cloud/workflow/pyFT2zCaIPc8KcR0
- **OpenAI Embeddings API**: https://platform.openai.com/docs/guides/embeddings
- **Anthropic Claude API**: https://docs.anthropic.com/claude/reference/getting-started
- **Pinecone Documentation**: https://docs.pinecone.io/
- **Weaviate Documentation**: https://weaviate.io/developers/weaviate
- **RAG Best Practices**: https://www.pinecone.io/learn/retrieval-augmented-generation/
