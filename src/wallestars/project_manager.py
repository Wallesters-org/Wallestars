"""
Project Manager module for managing tasks and projects using ChatGPT
"""

from typing import List, Dict, Optional
from datetime import datetime


class Task:
    """Represents a single task in the project"""
    
    def __init__(self, title: str, description: str = "", priority: str = "medium"):
        self.title = title
        self.description = description
        self.priority = priority
        self.status = "pending"
        self.created_at = datetime.now()
        self.completed_at = None
    
    def complete(self):
        """Mark task as completed"""
        self.status = "completed"
        self.completed_at = datetime.now()
    
    def to_dict(self) -> Dict:
        """Convert task to dictionary"""
        return {
            "title": self.title,
            "description": self.description,
            "priority": self.priority,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }


class Project:
    """Represents a project containing multiple tasks"""
    
    def __init__(self, name: str, description: str = ""):
        self.name = name
        self.description = description
        self.tasks: List[Task] = []
        self.created_at = datetime.now()
    
    def add_task(self, task: Task):
        """Add a task to the project"""
        self.tasks.append(task)
    
    def get_tasks(self, status: Optional[str] = None) -> List[Task]:
        """Get tasks, optionally filtered by status"""
        if status:
            return [task for task in self.tasks if task.status == status]
        return self.tasks
    
    def to_dict(self) -> Dict:
        """Convert project to dictionary"""
        return {
            "name": self.name,
            "description": self.description,
            "tasks": [task.to_dict() for task in self.tasks],
            "created_at": self.created_at.isoformat()
        }


class ProjectManager:
    """Main project manager class for managing multiple projects"""
    
    def __init__(self):
        self.projects: Dict[str, Project] = {}
    
    def create_project(self, name: str, description: str = "") -> Project:
        """Create a new project"""
        if name in self.projects:
            raise ValueError(f"Project '{name}' already exists")
        
        project = Project(name, description)
        self.projects[name] = project
        return project
    
    def get_project(self, name: str) -> Optional[Project]:
        """Get a project by name"""
        return self.projects.get(name)
    
    def list_projects(self) -> List[str]:
        """List all project names"""
        return list(self.projects.keys())
    
    def delete_project(self, name: str) -> bool:
        """Delete a project by name"""
        if name in self.projects:
            del self.projects[name]
            return True
        return False
    
    def get_all_tasks(self) -> List[Dict]:
        """Get all tasks from all projects"""
        all_tasks = []
        for project_name, project in self.projects.items():
            for task in project.tasks:
                task_dict = task.to_dict()
                task_dict["project"] = project_name
                all_tasks.append(task_dict)
        return all_tasks
    
    def get_summary(self) -> Dict:
        """Get a summary of all projects and tasks"""
        total_tasks = 0
        completed_tasks = 0
        
        for project in self.projects.values():
            total_tasks += len(project.tasks)
            completed_tasks += len([t for t in project.tasks if t.status == "completed"])
        
        return {
            "total_projects": len(self.projects),
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "pending_tasks": total_tasks - completed_tasks
        }
