#!/usr/bin/env python3
"""
Multi-Agent Orchestrator - OpenAI Agents Pattern Implementation
Author: Wallestars Team
Version: 1.0.0

Based on: https://github.com/openai/openai-cookbook/blob/main/examples/orchestrating_agents.py
"""

import os
import sys
import json
import asyncio
from typing import List, Dict, Optional, Any
from dataclasses import dataclass
from datetime import datetime
from anthropic import Anthropic


@dataclass
class Message:
    """Message structure for agent communication"""
    role: str  # 'user', 'assistant', 'system'
    content: str
    metadata: Optional[Dict] = None
    timestamp: Optional[str] = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now().isoformat()


@dataclass
class AgentConfig:
    """Configuration for an agent"""
    name: str
    role: str
    instructions: str
    model: str = "claude-sonnet-4-20250514"
    max_tokens: int = 4096
    temperature: float = 0.7


class BaseAgent:
    """Base class for all agents"""
    
    def __init__(self, config: AgentConfig, client: Anthropic):
        self.config = config
        self.client = client
        self.conversation_history: List[Message] = []
    
    def _build_system_prompt(self) -> str:
        """Build system prompt with agent role and instructions"""
        return f"""You are {self.config.name}, {self.config.role}.

{self.config.instructions}

Current date: {datetime.now().strftime('%Y-%m-%d')}"""
    
    async def process(self, user_input: str, context: Optional[Dict] = None) -> str:
        """Process user input and return response"""
        # Add user message to history
        self.conversation_history.append(Message(role='user', content=user_input))
        
        # Build messages for Claude
        messages = [
            {'role': msg.role, 'content': msg.content}
            for msg in self.conversation_history
            if msg.role != 'system'
        ]
        
        # Add context if provided
        if context:
            context_str = f"\n\nAdditional Context:\n{json.dumps(context, indent=2)}"
            messages[-1]['content'] += context_str
        
        try:
            response = self.client.messages.create(
                model=self.config.model,
                max_tokens=self.config.max_tokens,
                temperature=self.config.temperature,
                system=self._build_system_prompt(),
                messages=messages
            )
            
            assistant_message = response.content[0].text
            
            # Add to history
            self.conversation_history.append(
                Message(role='assistant', content=assistant_message)
            )
            
            return assistant_message
        
        except Exception as e:
            error_msg = f"Error in {self.config.name}: {str(e)}"
            print(f"❌ {error_msg}", file=sys.stderr)
            return error_msg
    
    def clear_history(self):
        """Clear conversation history"""
        self.conversation_history = []


class RouterAgent(BaseAgent):
    """Router Agent - Determines which specialist agent should handle the task"""
    
    def __init__(self, client: Anthropic):
        config = AgentConfig(
            name="Router Agent",
            role="a task routing specialist",
            instructions="""Your job is to analyze incoming requests and determine which specialist should handle them.

Available specialists:
1. CODE_SPECIALIST - For code analysis, implementation, debugging, refactoring
2. DATA_SPECIALIST - For data analysis, database queries, statistics, reports
3. DEVOPS_SPECIALIST - For deployment, infrastructure, monitoring, CI/CD
4. DOCUMENTATION_SPECIALIST - For writing docs, guides, explanations
5. GENERAL - For general questions or when no specialist fits

Respond with ONLY a JSON object:
{
  "specialist": "CODE_SPECIALIST",
  "reasoning": "Brief explanation why",
  "priority": "high|medium|low"
}""",
            temperature=0.3  # Lower temperature for more consistent routing
        )
        super().__init__(config, client)
    
    async def route(self, user_input: str) -> Dict:
        """Route request to appropriate specialist"""
        response = await self.process(user_input)
        
        try:
            # Extract JSON from response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start != -1 and json_end != 0:
                json_str = response[json_start:json_end]
                routing_decision = json.loads(json_str)
                return routing_decision
            else:
                # Fallback
                return {
                    "specialist": "GENERAL",
                    "reasoning": "Could not parse routing decision",
                    "priority": "medium"
                }
        except json.JSONDecodeError:
            return {
                "specialist": "GENERAL",
                "reasoning": "Failed to decode routing response",
                "priority": "medium"
            }


class MemoryAgent(BaseAgent):
    """Memory Agent - Maintains context and retrieves relevant information"""
    
    def __init__(self, client: Anthropic):
        config = AgentConfig(
            name="Memory Agent",
            role="a memory and context manager",
            instructions="""Your job is to maintain context across conversations and retrieve relevant information.

You have access to:
1. Conversation history
2. Project context (files, structure, goals)
3. User preferences and patterns

When asked for context, provide:
- Relevant previous conversations
- Important project details
- User's stated goals and preferences
- Any patterns you've noticed

Format your response as structured data when possible.""",
            max_tokens=8000  # Larger context window
        )
        super().__init__(config, client)
        self.long_term_memory: List[Dict] = []
    
    def store_memory(self, memory: Dict):
        """Store important information in long-term memory"""
        memory['stored_at'] = datetime.now().isoformat()
        self.long_term_memory.append(memory)
    
    async def retrieve_context(self, query: str) -> Dict:
        """Retrieve relevant context for a query"""
        context_prompt = f"""Based on the query: "{query}"

Provide relevant context from what you know. Include:
1. Related previous conversations
2. Relevant project details
3. Any important patterns or preferences

Stored memories: {len(self.long_term_memory)} items

Respond with structured JSON."""
        
        response = await self.process(context_prompt)
        
        return {
            'retrieved_context': response,
            'memory_count': len(self.long_term_memory),
            'conversation_length': len(self.conversation_history)
        }


class SupervisorAgent(BaseAgent):
    """Supervisor Agent - Oversees task execution and ensures quality"""
    
    def __init__(self, client: Anthropic):
        config = AgentConfig(
            name="Supervisor Agent",
            role="a task supervisor and quality controller",
            instructions="""Your job is to supervise task execution and ensure quality.

Responsibilities:
1. Review specialist responses for quality and completeness
2. Identify if additional steps are needed
3. Coordinate between multiple specialists if needed
4. Provide final approval or request revisions

When reviewing a response, provide:
{
  "approved": true/false,
  "feedback": "specific feedback",
  "next_steps": ["action1", "action2"],
  "requires_revision": false
}""",
            temperature=0.4
        )
        super().__init__(config, client)
    
    async def review(self, specialist_response: str, original_request: str) -> Dict:
        """Review specialist's response"""
        review_prompt = f"""Original Request: {original_request}

Specialist Response: {specialist_response}

Review this response for quality, completeness, and accuracy."""
        
        response = await self.process(review_prompt)
        
        try:
            # Try to extract JSON
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start != -1 and json_end != 0:
                return json.loads(response[json_start:json_end])
        except:
            pass
        
        # Fallback
        return {
            "approved": True,
            "feedback": response,
            "next_steps": [],
            "requires_revision": False
        }


class SpecialistAgent(BaseAgent):
    """Generic Specialist Agent"""
    
    def __init__(self, specialist_type: str, client: Anthropic):
        instructions = self._get_instructions(specialist_type)
        
        config = AgentConfig(
            name=f"{specialist_type.replace('_', ' ').title()}",
            role=f"a {specialist_type.lower().replace('_', ' ')}",
            instructions=instructions,
            max_tokens=8000
        )
        super().__init__(config, client)
        self.specialist_type = specialist_type
    
    def _get_instructions(self, specialist_type: str) -> str:
        """Get specialized instructions based on type"""
        instructions = {
            "CODE_SPECIALIST": """You are an expert software engineer.

Skills:
- Code analysis and review
- Implementation of features
- Debugging and troubleshooting
- Refactoring and optimization
- Best practices and patterns

Provide clear, working code with explanations.""",
            
            "DATA_SPECIALIST": """You are a data analysis expert.

Skills:
- Data analysis and visualization
- Database queries (SQL, NoSQL)
- Statistical analysis
- Report generation
- Data transformation

Provide insights with supporting data.""",
            
            "DEVOPS_SPECIALIST": """You are a DevOps and infrastructure expert.

Skills:
- Deployment automation
- Infrastructure as Code
- Monitoring and alerting
- CI/CD pipelines
- Cloud platforms (AWS, Azure, GCP)

Provide practical, production-ready solutions.""",
            
            "DOCUMENTATION_SPECIALIST": """You are a technical documentation expert.

Skills:
- Technical writing
- API documentation
- User guides
- Architecture diagrams
- Code documentation

Provide clear, comprehensive documentation.""",
            
            "GENERAL": """You are a helpful AI assistant.

Provide thoughtful, accurate responses to general questions."""
        }
        
        return instructions.get(specialist_type, instructions["GENERAL"])


class MultiAgentOrchestrator:
    """Main orchestrator managing multiple agents"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv('ANTHROPIC_API_KEY')
        
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not found in environment")
        
        self.client = Anthropic(api_key=self.api_key)
        
        # Initialize agents
        self.router = RouterAgent(self.client)
        self.memory = MemoryAgent(self.client)
        self.supervisor = SupervisorAgent(self.client)
        self.specialists: Dict[str, SpecialistAgent] = {}
    
    def _get_specialist(self, specialist_type: str) -> SpecialistAgent:
        """Get or create specialist agent"""
        if specialist_type not in self.specialists:
            self.specialists[specialist_type] = SpecialistAgent(
                specialist_type,
                self.client
            )
        return self.specialists[specialist_type]
    
    async def process_request(self, user_input: str, verbose: bool = False) -> Dict:
        """Process user request through multi-agent system"""
        
        if verbose:
            print(f"\n📥 Processing: {user_input[:100]}...")
        
        # Step 1: Route request
        if verbose:
            print("🔀 Router Agent analyzing...")
        
        routing = await self.router.route(user_input)
        
        if verbose:
            print(f"   → Routed to: {routing['specialist']}")
            print(f"   → Priority: {routing['priority']}")
            print(f"   → Reasoning: {routing['reasoning']}")
        
        # Step 2: Retrieve context
        if verbose:
            print("🧠 Memory Agent retrieving context...")
        
        context = await self.memory.retrieve_context(user_input)
        
        if verbose:
            print(f"   → Retrieved {context['memory_count']} memories")
        
        # Step 3: Specialist processes request
        specialist = self._get_specialist(routing['specialist'])
        
        if verbose:
            print(f"👨‍💼 {specialist.config.name} working...")
        
        specialist_response = await specialist.process(
            user_input,
            context={'routing': routing, 'memory': context}
        )
        
        # Step 4: Supervisor reviews
        if verbose:
            print("👮 Supervisor Agent reviewing...")
        
        review = await self.supervisor.review(specialist_response, user_input)
        
        if verbose:
            approved_icon = "✅" if review['approved'] else "⚠️"
            print(f"   {approved_icon} Approved: {review['approved']}")
        
        # Store in memory
        self.memory.store_memory({
            'request': user_input,
            'routing': routing,
            'response': specialist_response,
            'review': review
        })
        
        return {
            'request': user_input,
            'routing': routing,
            'specialist_response': specialist_response,
            'supervisor_review': review,
            'timestamp': datetime.now().isoformat()
        }
    
    def get_stats(self) -> Dict:
        """Get orchestrator statistics"""
        return {
            'active_specialists': len(self.specialists),
            'specialist_types': list(self.specialists.keys()),
            'memory_items': len(self.memory.long_term_memory),
            'router_conversations': len(self.router.conversation_history),
            'supervisor_conversations': len(self.supervisor.conversation_history)
        }


async def main():
    """CLI entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Multi-Agent Orchestrator - OpenAI Agents Pattern',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument('query', nargs='*', help='Query to process')
    parser.add_argument('--verbose', '-v', action='store_true', 
                       help='Verbose output')
    parser.add_argument('--stats', action='store_true', 
                       help='Show orchestrator statistics')
    parser.add_argument('--interactive', '-i', action='store_true', 
                       help='Interactive mode')
    
    args = parser.parse_args()
    
    try:
        orchestrator = MultiAgentOrchestrator()
        
        if args.stats:
            stats = orchestrator.get_stats()
            print(json.dumps(stats, indent=2))
            return 0
        
        if args.interactive:
            print("🤖 Multi-Agent Orchestrator - Interactive Mode")
            print("Type 'exit' to quit, 'stats' for statistics\n")
            
            while True:
                try:
                    query = input("You: ").strip()
                    
                    if query.lower() in ['exit', 'quit', 'q']:
                        print("Goodbye! 👋")
                        break
                    
                    if query.lower() == 'stats':
                        stats = orchestrator.get_stats()
                        print(json.dumps(stats, indent=2))
                        continue
                    
                    if not query:
                        continue
                    
                    result = await orchestrator.process_request(query, verbose=True)
                    print(f"\n💬 Response:\n{result['specialist_response']}\n")
                
                except KeyboardInterrupt:
                    print("\n\nGoodbye! 👋")
                    break
        
        elif args.query:
            query = ' '.join(args.query)
            result = await orchestrator.process_request(query, verbose=args.verbose)
            
            print(result['specialist_response'])
            
            if args.verbose:
                print(f"\n📊 Review: {result['supervisor_review']['feedback']}")
        
        else:
            parser.print_help()
            return 1
        
        return 0
    
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
