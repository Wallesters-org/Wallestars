# AUTOPILOT API INTEGRATION - Wallestars

## Преглед

Този документ описва интеграцията на Autopilot API в Wallestars проекта, с фокус върху bulk add contacts функционалността.

**API Reference**: https://autopilot.docs.apiary.io/#reference/api-methods/bulk-add-contacts

---

## Какво е Autopilot?

**Autopilot** е marketing automation платформа, която предоставя:
- Email marketing automation
- Customer journey management
- Contact management
- Segmentation и personalization
- Analytics и reporting

---

## API Authentication

### API Key Setup

```bash
# Environment variables
AUTOPILOT_API_KEY=your_api_key_here
AUTOPILOT_APP_URL=https://api2.autopilothq.com/v1
```

### Authentication Method

Autopilot използва API key authentication чрез header:

```bash
autopilotapikey: YOUR_API_KEY
```

---

## Bulk Add Contacts

### API Endpoint

```
POST https://api2.autopilothq.com/v1/contacts
```

### Request Format

#### Headers

```http
POST /v1/contacts HTTP/1.1
Host: api2.autopilothq.com
Content-Type: application/json
autopilotapikey: YOUR_API_KEY
```

#### Request Body

```json
{
  "contacts": [
    {
      "Email": "user1@example.com",
      "FirstName": "John",
      "LastName": "Doe",
      "Company": "Example Corp",
      "Phone": "+1234567890",
      "LeadSource": "Website",
      "Status": "Lead",
      "custom": {
        "string--Custom--Field": "Custom Value",
        "integer--Age": 30,
        "boolean--IsActive": true,
        "date--SignupDate": "2025-12-31T00:00:00.000Z"
      },
      "_autopilot_list": "contactlist_XXXX-XXXX-XXXX-XXXX"
    },
    {
      "Email": "user2@example.com",
      "FirstName": "Jane",
      "LastName": "Smith",
      "Company": "Tech Inc",
      "Phone": "+0987654321",
      "custom": {
        "string--Department": "Engineering"
      }
    }
  ]
}
```

### Response Format

#### Success Response (200 OK)

```json
{
  "contacts": [
    {
      "contact_id": "person_XXXX-XXXX-XXXX-XXXX",
      "Email": "user1@example.com",
      "Status": "Lead"
    },
    {
      "contact_id": "person_YYYY-YYYY-YYYY-YYYY",
      "Email": "user2@example.com",
      "Status": "Lead"
    }
  ],
  "total_contacts": 2,
  "success_count": 2,
  "error_count": 0
}
```

#### Error Response (400 Bad Request)

```json
{
  "error": "Invalid request",
  "details": [
    {
      "contact": "user3@example.com",
      "error": "Email already exists"
    }
  ]
}
```

---

## Python Implementation

### Basic Client

```python
import os
import requests
from typing import List, Dict, Optional

class AutopilotClient:
    """Client за Autopilot API"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv('AUTOPILOT_API_KEY')
        self.base_url = "https://api2.autopilothq.com/v1"
        self.headers = {
            "Content-Type": "application/json",
            "autopilotapikey": self.api_key
        }
    
    def _request(self, method: str, endpoint: str, data: dict = None) -> dict:
        """Internal request method"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = requests.request(
                method=method,
                url=url,
                headers=self.headers,
                json=data,
                timeout=30
            )
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.HTTPError as e:
            return {
                "error": str(e),
                "status_code": response.status_code,
                "response": response.text
            }
        except Exception as e:
            return {
                "error": str(e)
            }
    
    def add_contact(self, contact: dict) -> dict:
        """Add single contact"""
        return self._request("POST", "/contact", data=contact)
    
    def bulk_add_contacts(self, contacts: List[dict]) -> dict:
        """
        Add multiple contacts at once
        
        Args:
            contacts: List of contact dictionaries
            
        Returns:
            Response dictionary with results
        """
        data = {"contacts": contacts}
        return self._request("POST", "/contacts", data=data)
    
    def get_contact(self, contact_id: str) -> dict:
        """Get contact by ID"""
        return self._request("GET", f"/contact/{contact_id}")
    
    def update_contact(self, contact_id: str, data: dict) -> dict:
        """Update existing contact"""
        return self._request("PUT", f"/contact/{contact_id}", data=data)
    
    def delete_contact(self, contact_id: str) -> dict:
        """Delete contact"""
        return self._request("DELETE", f"/contact/{contact_id}")
    
    def search_contacts(self, query: str) -> dict:
        """Search contacts"""
        return self._request("GET", f"/contacts/search/{query}")
    
    def add_to_list(self, list_id: str, contact_id: str) -> dict:
        """Add contact to list"""
        data = {"contact_id": contact_id}
        return self._request("POST", f"/list/{list_id}/contact", data=data)
```

### Advanced Contact Manager

```python
import logging
from typing import List, Dict, Optional
from dataclasses import dataclass
from datetime import datetime

logger = logging.getLogger(__name__)

@dataclass
class Contact:
    """Contact data model"""
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company: Optional[str] = None
    phone: Optional[str] = None
    lead_source: Optional[str] = None
    status: Optional[str] = "Lead"
    custom_fields: Optional[dict] = None
    list_id: Optional[str] = None
    
    def to_autopilot_format(self) -> dict:
        """Convert to Autopilot API format"""
        contact_dict = {
            "Email": self.email,
        }
        
        if self.first_name:
            contact_dict["FirstName"] = self.first_name
        if self.last_name:
            contact_dict["LastName"] = self.last_name
        if self.company:
            contact_dict["Company"] = self.company
        if self.phone:
            contact_dict["Phone"] = self.phone
        if self.lead_source:
            contact_dict["LeadSource"] = self.lead_source
        if self.status:
            contact_dict["Status"] = self.status
        
        if self.custom_fields:
            contact_dict["custom"] = self.custom_fields
        
        if self.list_id:
            contact_dict["_autopilot_list"] = self.list_id
            
        return contact_dict

class AutopilotContactManager:
    """Advanced contact management"""
    
    def __init__(self, client: AutopilotClient):
        self.client = client
        
    def bulk_import_contacts(
        self,
        contacts: List[Contact],
        batch_size: int = 100
    ) -> Dict[str, any]:
        """
        Import contacts in batches
        
        Args:
            contacts: List of Contact objects
            batch_size: Number of contacts per batch (max 100)
            
        Returns:
            Summary of import results
        """
        total_contacts = len(contacts)
        successful = 0
        failed = 0
        errors = []
        
        # Process in batches
        for i in range(0, total_contacts, batch_size):
            batch = contacts[i:i + batch_size]
            
            # Convert to Autopilot format
            autopilot_contacts = [c.to_autopilot_format() for c in batch]
            
            # Send batch
            logger.info(f"Sending batch {i//batch_size + 1}: {len(autopilot_contacts)} contacts")
            result = self.client.bulk_add_contacts(autopilot_contacts)
            
            if "error" in result:
                logger.error(f"Batch failed: {result['error']}")
                failed += len(batch)
                errors.append({
                    "batch": i//batch_size + 1,
                    "error": result["error"]
                })
            else:
                batch_success = result.get("success_count", len(batch))
                batch_failed = result.get("error_count", 0)
                successful += batch_success
                failed += batch_failed
                
                if batch_failed > 0:
                    errors.append({
                        "batch": i//batch_size + 1,
                        "details": result.get("details", [])
                    })
        
        return {
            "total": total_contacts,
            "successful": successful,
            "failed": failed,
            "success_rate": (successful / total_contacts * 100) if total_contacts > 0 else 0,
            "errors": errors
        }
    
    def import_from_csv(self, csv_file_path: str, list_id: str = None) -> dict:
        """
        Import contacts from CSV file
        
        CSV Format:
        email,first_name,last_name,company,phone,lead_source
        """
        import csv
        
        contacts = []
        
        with open(csv_file_path, 'r') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                contact = Contact(
                    email=row.get('email'),
                    first_name=row.get('first_name'),
                    last_name=row.get('last_name'),
                    company=row.get('company'),
                    phone=row.get('phone'),
                    lead_source=row.get('lead_source', 'CSV Import'),
                    list_id=list_id
                )
                contacts.append(contact)
        
        logger.info(f"Loaded {len(contacts)} contacts from CSV")
        return self.bulk_import_contacts(contacts)
    
    def sync_with_database(self, db_query_func, list_id: str = None) -> dict:
        """
        Sync contacts from database to Autopilot
        
        Args:
            db_query_func: Function that returns list of contact dicts
            list_id: Optional list ID to add contacts to
        """
        # Get contacts from database
        db_contacts = db_query_func()
        
        # Convert to Contact objects
        contacts = []
        for db_contact in db_contacts:
            contact = Contact(
                email=db_contact.get('email'),
                first_name=db_contact.get('first_name'),
                last_name=db_contact.get('last_name'),
                company=db_contact.get('company'),
                phone=db_contact.get('phone'),
                lead_source='Database Sync',
                custom_fields={
                    "integer--User--ID": db_contact.get('id'),
                    "date--Created--At": db_contact.get('created_at')
                },
                list_id=list_id
            )
            contacts.append(contact)
        
        logger.info(f"Syncing {len(contacts)} contacts from database")
        return self.bulk_import_contacts(contacts)
```

---

## FastAPI Integration

### REST API Endpoints

```python
from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import os

app = FastAPI(title="Wallestars Autopilot Integration")

# Initialize Autopilot client
autopilot_client = AutopilotClient(
    api_key=os.getenv('AUTOPILOT_API_KEY')
)
contact_manager = AutopilotContactManager(autopilot_client)

# Models
class ContactCreate(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company: Optional[str] = None
    phone: Optional[str] = None
    lead_source: Optional[str] = "API"
    custom_fields: Optional[dict] = None
    list_id: Optional[str] = None

class BulkContactCreate(BaseModel):
    contacts: List[ContactCreate]

class ContactResponse(BaseModel):
    status: str
    contact_id: Optional[str] = None
    message: Optional[str] = None

# Endpoints
@app.post("/api/contacts/single", response_model=ContactResponse)
async def add_single_contact(contact: ContactCreate):
    """Add single contact to Autopilot"""
    try:
        contact_obj = Contact(
            email=contact.email,
            first_name=contact.first_name,
            last_name=contact.last_name,
            company=contact.company,
            phone=contact.phone,
            lead_source=contact.lead_source,
            custom_fields=contact.custom_fields,
            list_id=contact.list_id
        )
        
        result = autopilot_client.add_contact(contact_obj.to_autopilot_format())
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return ContactResponse(
            status="success",
            contact_id=result.get("contact_id"),
            message="Contact added successfully"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/contacts/bulk")
async def add_bulk_contacts(
    bulk_request: BulkContactCreate,
    background_tasks: BackgroundTasks
):
    """Add multiple contacts to Autopilot"""
    try:
        contacts = [
            Contact(
                email=c.email,
                first_name=c.first_name,
                last_name=c.last_name,
                company=c.company,
                phone=c.phone,
                lead_source=c.lead_source,
                custom_fields=c.custom_fields,
                list_id=c.list_id
            )
            for c in bulk_request.contacts
        ]
        
        # Process in background for large batches
        if len(contacts) > 100:
            background_tasks.add_task(
                contact_manager.bulk_import_contacts,
                contacts
            )
            return {
                "status": "processing",
                "message": f"Processing {len(contacts)} contacts in background",
                "total": len(contacts)
            }
        else:
            result = contact_manager.bulk_import_contacts(contacts)
            return {
                "status": "success",
                **result
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/contacts/import-csv")
async def import_from_csv(
    csv_file_path: str,
    list_id: Optional[str] = None,
    background_tasks: BackgroundTasks = None
):
    """Import contacts from CSV file"""
    try:
        if background_tasks:
            background_tasks.add_task(
                contact_manager.import_from_csv,
                csv_file_path,
                list_id
            )
            return {
                "status": "processing",
                "message": "CSV import started in background"
            }
        else:
            result = contact_manager.import_from_csv(csv_file_path, list_id)
            return {
                "status": "success",
                **result
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/contacts/{contact_id}")
async def get_contact(contact_id: str):
    """Get contact details"""
    try:
        result = autopilot_client.get_contact(contact_id)
        
        if "error" in result:
            raise HTTPException(status_code=404, detail="Contact not found")
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Autopilot Integration API"
    }
```

---

## n8n Workflow Integration

### Workflow Node Configuration

#### Node 1: Webhook Trigger
```json
{
  "name": "Contact Webhook",
  "type": "n8n-nodes-base.webhook",
  "parameters": {
    "path": "autopilot-contact",
    "responseMode": "responseNode"
  }
}
```

#### Node 2: Transform Data
```json
{
  "name": "Format Contact",
  "type": "n8n-nodes-base.function",
  "parameters": {
    "functionCode": "const contact = {\n  Email: $json.email,\n  FirstName: $json.first_name,\n  LastName: $json.last_name,\n  Company: $json.company\n};\n\nreturn { contact };"
  }
}
```

#### Node 3: HTTP Request to Autopilot
```json
{
  "name": "Add to Autopilot",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "https://api2.autopilothq.com/v1/contact",
    "authentication": "genericCredentialType",
    "genericAuthType": "httpHeaderAuth",
    "sendHeaders": true,
    "headerParameters": {
      "autopilotapikey": "={{ $credentials.autopilotApiKey }}"
    },
    "sendBody": true,
    "bodyParameters": "={{ $json.contact }}"
  }
}
```

---

## Integration със Wallestars Системи

### RAG System Integration

```python
class AutopilotRAGIntegration:
    """Integrate Autopilot с RAG system"""
    
    def __init__(self, autopilot_client, rag_system):
        self.autopilot = autopilot_client
        self.rag = rag_system
    
    def enrich_contact_with_knowledge(self, contact_email: str) -> dict:
        """Обогатяване на контакт с информация от RAG"""
        # Get contact from Autopilot
        contact = self.autopilot.search_contacts(contact_email)
        
        if not contact or "error" in contact:
            return {"error": "Contact not found"}
        
        # Query RAG за relevant information
        query = f"What do we know about {contact.get('FirstName')} {contact.get('LastName')} from {contact.get('Company')}?"
        rag_result = self.rag.query(query)
        
        # Update contact с enriched data
        if rag_result.get("status") == "success":
            custom_fields = {
                "string--RAG--Insights": rag_result.get("answer"),
                "date--Last--Enriched": datetime.now().isoformat()
            }
            
            self.autopilot.update_contact(
                contact.get("contact_id"),
                {"custom": custom_fields}
            )
        
        return rag_result
```

### EVA System Integration

```python
class AutopilotEVAIntegration:
    """Integrate Autopilot с EVA system"""
    
    def __init__(self, autopilot_client):
        self.autopilot = autopilot_client
    
    def personalized_contact_import(self, contacts: List[dict], user_profile: dict) -> dict:
        """Import contacts с EVA персонализация"""
        
        # EVA анализира контакта и добавя personalization
        enriched_contacts = []
        
        for contact_data in contacts:
            # EVA контекстуален анализ
            eva_context = self._eva_analyze_contact(contact_data, user_profile)
            
            # Създаване на Contact с enriched data
            contact = Contact(
                email=contact_data['email'],
                first_name=contact_data.get('first_name'),
                last_name=contact_data.get('last_name'),
                custom_fields={
                    "string--EVA--Context": eva_context.get("context_summary"),
                    "string--Personalization--Level": eva_context.get("personalization_level"),
                    "integer--Priority--Score": eva_context.get("priority_score")
                }
            )
            enriched_contacts.append(contact)
        
        # Bulk import
        manager = AutopilotContactManager(self.autopilot)
        return manager.bulk_import_contacts(enriched_contacts)
    
    def _eva_analyze_contact(self, contact: dict, user_profile: dict) -> dict:
        """EVA анализ на контакт"""
        # Implement EVA logic
        return {
            "context_summary": "Analyzed by EVA",
            "personalization_level": "high",
            "priority_score": 85
        }
```

---

## Best Practices

### 1. Rate Limiting

```python
import time
from functools import wraps

def rate_limit(calls_per_second=10):
    """Rate limiting decorator"""
    min_interval = 1.0 / calls_per_second
    last_called = [0.0]
    
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            elapsed = time.time() - last_called[0]
            wait_time = min_interval - elapsed
            
            if wait_time > 0:
                time.sleep(wait_time)
            
            result = func(*args, **kwargs)
            last_called[0] = time.time()
            return result
        
        return wrapper
    return decorator

class RateLimitedAutopilotClient(AutopilotClient):
    @rate_limit(calls_per_second=10)
    def _request(self, *args, **kwargs):
        return super()._request(*args, **kwargs)
```

### 2. Error Handling

```python
from tenacity import retry, stop_after_attempt, wait_exponential

class ResilientAutopilotClient(AutopilotClient):
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10)
    )
    def _request(self, *args, **kwargs):
        return super()._request(*args, **kwargs)
```

### 3. Data Validation

```python
from pydantic import BaseModel, EmailStr, validator

class ValidatedContact(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    
    @validator('first_name', 'last_name')
    def name_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()
```

---

## Testing

```python
import pytest
from unittest.mock import Mock, patch

@pytest.fixture
def autopilot_client():
    return AutopilotClient(api_key="test_key")

def test_add_contact(autopilot_client):
    with patch.object(autopilot_client, '_request') as mock_request:
        mock_request.return_value = {
            "contact_id": "person_123",
            "Email": "test@example.com"
        }
        
        contact = {
            "Email": "test@example.com",
            "FirstName": "Test"
        }
        
        result = autopilot_client.add_contact(contact)
        
        assert result["contact_id"] == "person_123"
        assert result["Email"] == "test@example.com"

def test_bulk_add_contacts(autopilot_client):
    with patch.object(autopilot_client, '_request') as mock_request:
        mock_request.return_value = {
            "success_count": 2,
            "error_count": 0
        }
        
        contacts = [
            {"Email": "test1@example.com"},
            {"Email": "test2@example.com"}
        ]
        
        result = autopilot_client.bulk_add_contacts(contacts)
        
        assert result["success_count"] == 2
        assert result["error_count"] == 0
```

---

## Deployment

### Environment Configuration

```bash
# .env
AUTOPILOT_API_KEY=your_api_key_here
AUTOPILOT_DEFAULT_LIST_ID=contactlist_XXXX-XXXX-XXXX-XXXX
AUTOPILOT_RATE_LIMIT=10
```

### Docker Deployment

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV AUTOPILOT_API_KEY=""

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Мониторинг

```python
import logging
from datetime import datetime

class AutopilotMetrics:
    def __init__(self):
        self.total_requests = 0
        self.successful_requests = 0
        self.failed_requests = 0
        self.total_contacts_added = 0
        
    def record_request(self, success: bool, contacts_count: int = 0):
        self.total_requests += 1
        if success:
            self.successful_requests += 1
            self.total_contacts_added += contacts_count
        else:
            self.failed_requests += 1
    
    def get_stats(self) -> dict:
        return {
            "total_requests": self.total_requests,
            "successful_requests": self.successful_requests,
            "failed_requests": self.failed_requests,
            "success_rate": self.successful_requests / self.total_requests if self.total_requests > 0 else 0,
            "total_contacts_added": self.total_contacts_added
        }
```

---

## Ресурси

- **API Documentation**: https://autopilot.docs.apiary.io/
- **Bulk Add Contacts**: https://autopilot.docs.apiary.io/#reference/api-methods/bulk-add-contacts
- **API Authentication**: https://autopilot.docs.apiary.io/#introduction/authentication
- **Rate Limits**: Check API documentation за current limits

---

## Следващи Стъпки

- [ ] Setup Autopilot account и API key
- [ ] Имплементация на Python client
- [ ] Създаване на FastAPI endpoints
- [ ] n8n workflow configuration
- [ ] Integration с RAG system
- [ ] Integration с EVA system
- [ ] Testing с real data
- [ ] Deployment на production
