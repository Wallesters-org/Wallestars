"""
ChatGPT integration for AI-powered project management assistance
"""

import os
from typing import List, Dict, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class ChatGPTAssistant:
    """ChatGPT assistant for project management"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.client = None
        
        # Only initialize if API key is provided
        if self.api_key:
            try:
                import openai
                self.client = openai.OpenAI(api_key=self.api_key)
            except ImportError:
                print("Warning: OpenAI library not installed. Install with: pip install openai")
    
    def is_available(self) -> bool:
        """Check if ChatGPT is available (API key configured)"""
        return self.client is not None
    
    def generate_task_suggestions(self, project_description: str) -> List[str]:
        """Generate task suggestions for a project using ChatGPT"""
        if not self.is_available():
            return [
                "Define project requirements",
                "Set up development environment",
                "Implement core functionality",
                "Write tests",
                "Document the project"
            ]
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful project manager assistant. Generate a list of 5-7 specific tasks for the given project."},
                    {"role": "user", "content": f"Generate tasks for this project: {project_description}"}
                ],
                max_tokens=300
            )
            
            content = response.choices[0].message.content
            # Parse the response to extract tasks
            tasks = [line.strip('- ').strip() for line in content.split('\n') if line.strip().startswith('-') or line.strip().startswith('•')]
            return tasks[:7] if tasks else ["Define project scope", "Plan implementation"]
            
        except Exception as e:
            print(f"Error generating tasks: {e}")
            return ["Define project scope", "Plan implementation"]
    
    def analyze_project_status(self, summary: Dict) -> str:
        """Analyze project status and provide insights"""
        if not self.is_available():
            total = summary.get("total_tasks", 0)
            completed = summary.get("completed_tasks", 0)
            
            if total == 0:
                return "No tasks yet. Consider adding some tasks to get started."
            
            completion_rate = (completed / total * 100) if total > 0 else 0
            
            if completion_rate == 100:
                return "Great job! All tasks are completed."
            elif completion_rate >= 50:
                return f"Good progress! {completion_rate:.0f}% of tasks completed."
            else:
                return f"Project is in early stages. {completion_rate:.0f}% completed."
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful project manager. Analyze the project status and provide brief insights."},
                    {"role": "user", "content": f"Project summary: {summary}"}
                ],
                max_tokens=150
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"Error analyzing status: {e}")
            return "Unable to analyze project status at this time."
    
    def suggest_next_steps(self, pending_tasks: List[Dict]) -> str:
        """Suggest next steps based on pending tasks"""
        if not pending_tasks:
            return "No pending tasks. Great work! Consider planning the next phase."
        
        if not self.is_available():
            high_priority = [t for t in pending_tasks if t.get("priority") == "high"]
            if high_priority:
                return f"Focus on high-priority tasks: {high_priority[0].get('title')}"
            return f"Start with: {pending_tasks[0].get('title')}"
        
        try:
            task_list = "\n".join([f"- {t.get('title')} (Priority: {t.get('priority')})" for t in pending_tasks[:5]])
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful project manager. Suggest which task to work on next and why."},
                    {"role": "user", "content": f"Pending tasks:\n{task_list}"}
                ],
                max_tokens=100
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"Error suggesting next steps: {e}")
            return f"Consider starting with: {pending_tasks[0].get('title')}"
