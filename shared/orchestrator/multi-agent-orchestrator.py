"""
Multi-Agent Orchestrator System
================================

Implements OpenAI Agents pattern with Router, Memory, and Supervisor agents.
Coordinates between multiple AI agents for complex task execution.

Architecture:
- Router Agent: Routes tasks to appropriate specialist agents
- Memory Agent: Manages context and conversation history
- Supervisor Agent: Monitors and coordinates agent execution
- Specialist Agents: Task-specific agents (Eva, Social Media, etc.)
"""

import os
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class AgentType(Enum):
    """Types of agents in the system."""
    ROUTER = "router"
    MEMORY = "memory"
    SUPERVISOR = "supervisor"
    EVA = "eva"
    SOCIAL_MEDIA = "social_media"
    ANALYTICS = "analytics"
    DEPLOYMENT = "deployment"


class AgentStatus(Enum):
    """Agent execution status."""
    IDLE = "idle"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    WAITING = "waiting"


class BaseAgent:
    """Base class for all agents."""
    
    def __init__(self, agent_id: str, agent_type: AgentType):
        """
        Initialize base agent.
        
        Args:
            agent_id: Unique agent identifier
            agent_type: Type of agent
        """
        self.agent_id = agent_id
        self.agent_type = agent_type
        self.status = AgentStatus.IDLE
        self.created_at = datetime.now()
        self.last_activity = datetime.now()
        
        logger.info(f"Initialized {agent_type.value} agent: {agent_id}")
    
    def update_activity(self):
        """Update last activity timestamp."""
        self.last_activity = datetime.now()
    
    def get_info(self) -> Dict:
        """Get agent information."""
        return {
            "agent_id": self.agent_id,
            "agent_type": self.agent_type.value,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
            "last_activity": self.last_activity.isoformat()
        }


class RouterAgent(BaseAgent):
    """
    Router Agent - Routes tasks to appropriate specialist agents.
    """
    
    def __init__(self, agent_id: str = "router-001"):
        super().__init__(agent_id, AgentType.ROUTER)
        self.routing_rules = self._load_routing_rules()
    
    def _load_routing_rules(self) -> Dict:
        """Load routing rules for task distribution."""
        return {
            "social_media": {
                "keywords": ["instagram", "telegram", "facebook", "twitter", "post", "message"],
                "agent": AgentType.SOCIAL_MEDIA
            },
            "analytics": {
                "keywords": ["analyze", "report", "metrics", "statistics", "performance"],
                "agent": AgentType.ANALYTICS
            },
            "deployment": {
                "keywords": ["deploy", "update", "release", "vps", "docker"],
                "agent": AgentType.DEPLOYMENT
            },
            "eva": {
                "keywords": ["decide", "process", "context", "ai", "intelligent"],
                "agent": AgentType.EVA
            }
        }
    
    def route_task(self, task: Dict) -> AgentType:
        """
        Route task to appropriate agent based on content.
        
        Args:
            task: Task dictionary with description and requirements
            
        Returns:
            Agent type to handle the task
        """
        self.status = AgentStatus.PROCESSING
        self.update_activity()
        
        task_description = task.get("description", "").lower()
        
        # Score each agent type
        scores = {}
        for rule_name, rule in self.routing_rules.items():
            score = sum(1 for keyword in rule["keywords"] 
                       if keyword in task_description)
            if score > 0:
                scores[rule["agent"]] = score
        
        # Select agent with highest score
        if scores:
            selected_agent = max(scores.items(), key=lambda x: x[1])[0]
            logger.info(f"Routed task to {selected_agent.value} (score: {scores[selected_agent]})")
        else:
            # Default to Eva for general tasks
            selected_agent = AgentType.EVA
            logger.info(f"Routed task to default agent: {selected_agent.value}")
        
        self.status = AgentStatus.COMPLETED
        return selected_agent
    
    def add_routing_rule(self, name: str, keywords: List[str], agent: AgentType):
        """Add a new routing rule."""
        self.routing_rules[name] = {
            "keywords": keywords,
            "agent": agent
        }
        logger.info(f"Added routing rule: {name} -> {agent.value}")


class MemoryAgent(BaseAgent):
    """
    Memory Agent - Manages context and conversation history.
    """
    
    def __init__(self, agent_id: str = "memory-001"):
        super().__init__(agent_id, AgentType.MEMORY)
        self.memory_store = {}
        self.conversation_history = []
        self.max_history_length = 100
    
    def store_context(self, key: str, context: Any):
        """
        Store context in memory.
        
        Args:
            key: Context key
            context: Context data
        """
        self.memory_store[key] = {
            "data": context,
            "timestamp": datetime.now().isoformat()
        }
        self.update_activity()
        logger.debug(f"Stored context: {key}")
    
    def retrieve_context(self, key: str) -> Optional[Any]:
        """
        Retrieve context from memory.
        
        Args:
            key: Context key
            
        Returns:
            Context data or None
        """
        entry = self.memory_store.get(key)
        if entry:
            self.update_activity()
            return entry["data"]
        return None
    
    def add_to_history(self, interaction: Dict):
        """
        Add interaction to conversation history.
        
        Args:
            interaction: Interaction dictionary
        """
        self.conversation_history.append({
            **interaction,
            "timestamp": datetime.now().isoformat()
        })
        
        # Limit history length
        if len(self.conversation_history) > self.max_history_length:
            self.conversation_history = self.conversation_history[-self.max_history_length:]
        
        self.update_activity()
    
    def get_recent_history(self, count: int = 10) -> List[Dict]:
        """Get recent conversation history."""
        return self.conversation_history[-count:]
    
    def clear_memory(self):
        """Clear all memory."""
        self.memory_store = {}
        self.conversation_history = []
        logger.info("Memory cleared")


class SupervisorAgent(BaseAgent):
    """
    Supervisor Agent - Monitors and coordinates agent execution.
    """
    
    def __init__(self, agent_id: str = "supervisor-001"):
        super().__init__(agent_id, AgentType.SUPERVISOR)
        self.active_tasks = {}
        self.completed_tasks = []
        self.failed_tasks = []
    
    def register_task(self, task_id: str, task: Dict, assigned_agent: AgentType):
        """
        Register a new task for supervision.
        
        Args:
            task_id: Unique task identifier
            task: Task details
            assigned_agent: Agent assigned to task
        """
        self.active_tasks[task_id] = {
            "task": task,
            "assigned_agent": assigned_agent.value,
            "status": AgentStatus.PROCESSING.value,
            "started_at": datetime.now().isoformat(),
            "completed_at": None,
            "result": None
        }
        self.update_activity()
        logger.info(f"Registered task {task_id} with {assigned_agent.value}")
    
    def update_task_status(self, task_id: str, status: AgentStatus, result: Optional[Any] = None):
        """
        Update task status.
        
        Args:
            task_id: Task identifier
            status: New status
            result: Task result (if completed)
        """
        if task_id not in self.active_tasks:
            logger.warning(f"Task {task_id} not found")
            return
        
        task_data = self.active_tasks[task_id]
        task_data["status"] = status.value
        
        if status == AgentStatus.COMPLETED:
            task_data["completed_at"] = datetime.now().isoformat()
            task_data["result"] = result
            self.completed_tasks.append(task_data)
            del self.active_tasks[task_id]
            logger.info(f"Task {task_id} completed successfully")
            
        elif status == AgentStatus.FAILED:
            task_data["completed_at"] = datetime.now().isoformat()
            task_data["error"] = result
            self.failed_tasks.append(task_data)
            del self.active_tasks[task_id]
            logger.error(f"Task {task_id} failed: {result}")
        
        self.update_activity()
    
    def get_active_tasks(self) -> Dict:
        """Get all active tasks."""
        return self.active_tasks
    
    def get_task_summary(self) -> Dict:
        """Get summary of all tasks."""
        return {
            "active": len(self.active_tasks),
            "completed": len(self.completed_tasks),
            "failed": len(self.failed_tasks),
            "total": len(self.active_tasks) + len(self.completed_tasks) + len(self.failed_tasks)
        }


class MultiAgentOrchestrator:
    """
    Multi-Agent Orchestrator - Coordinates all agents.
    """
    
    def __init__(self):
        """Initialize orchestrator with core agents."""
        self.router = RouterAgent()
        self.memory = MemoryAgent()
        self.supervisor = SupervisorAgent()
        self.specialist_agents = {}
        
        logger.info("Multi-Agent Orchestrator initialized")
    
    def execute_task(self, task: Dict) -> Dict:
        """
        Execute a task using the agent system.
        
        Args:
            task: Task dictionary with description and requirements
            
        Returns:
            Task execution result
        """
        task_id = f"task-{datetime.now().timestamp()}"
        
        logger.info(f"Executing task {task_id}: {task.get('description', 'N/A')}")
        
        # 1. Router determines which agent to use
        assigned_agent = self.router.route_task(task)
        
        # 2. Store task context in memory
        self.memory.store_context(task_id, task)
        
        # 3. Register with supervisor
        self.supervisor.register_task(task_id, task, assigned_agent)
        
        # 4. Execute task (simplified - would delegate to actual agent)
        try:
            # This is where you'd call the actual specialist agent
            result = {
                "status": "success",
                "message": f"Task routed to {assigned_agent.value}",
                "agent": assigned_agent.value,
                "task_id": task_id
            }
            
            # 5. Update supervisor
            self.supervisor.update_task_status(task_id, AgentStatus.COMPLETED, result)
            
            # 6. Add to history
            self.memory.add_to_history({
                "task_id": task_id,
                "task": task,
                "result": result
            })
            
            return result
            
        except Exception as e:
            logger.error(f"Task execution failed: {e}")
            self.supervisor.update_task_status(task_id, AgentStatus.FAILED, str(e))
            return {
                "status": "failed",
                "error": str(e),
                "task_id": task_id
            }
    
    def get_system_status(self) -> Dict:
        """Get overall system status."""
        return {
            "router": self.router.get_info(),
            "memory": {
                **self.memory.get_info(),
                "stored_contexts": len(self.memory.memory_store),
                "history_length": len(self.memory.conversation_history)
            },
            "supervisor": {
                **self.supervisor.get_info(),
                "tasks": self.supervisor.get_task_summary()
            }
        }


def main():
    """Example usage of Multi-Agent Orchestrator."""
    # Initialize orchestrator
    orchestrator = MultiAgentOrchestrator()
    
    # Example tasks
    tasks = [
        {
            "description": "Post a message to Instagram about new product launch",
            "requirements": {"platform": "instagram", "type": "post"}
        },
        {
            "description": "Analyze user engagement metrics from last week",
            "requirements": {"type": "analytics", "timeframe": "7days"}
        },
        {
            "description": "Deploy latest updates to VPS",
            "requirements": {"type": "deployment", "target": "vps"}
        }
    ]
    
    # Execute tasks
    for task in tasks:
        result = orchestrator.execute_task(task)
        print(f"\n✅ Task Result:")
        print(json.dumps(result, indent=2))
    
    # Get system status
    print("\n📊 System Status:")
    print(json.dumps(orchestrator.get_system_status(), indent=2))


if __name__ == "__main__":
    main()
