"""
Tests for the Project Manager module
"""

import pytest
from wallestars.project_manager import Task, Project, ProjectManager


class TestTask:
    """Tests for Task class"""
    
    def test_create_task(self):
        """Test creating a task"""
        task = Task("Test Task", "Test description", "high")
        assert task.title == "Test Task"
        assert task.description == "Test description"
        assert task.priority == "high"
        assert task.status == "pending"
        assert task.completed_at is None
    
    def test_task_default_priority(self):
        """Test task with default priority"""
        task = Task("Test Task")
        assert task.priority == "medium"
    
    def test_complete_task(self):
        """Test completing a task"""
        task = Task("Test Task")
        assert task.status == "pending"
        
        task.complete()
        assert task.status == "completed"
        assert task.completed_at is not None
    
    def test_task_to_dict(self):
        """Test converting task to dictionary"""
        task = Task("Test Task", "Description", "high")
        task_dict = task.to_dict()
        
        assert task_dict["title"] == "Test Task"
        assert task_dict["description"] == "Description"
        assert task_dict["priority"] == "high"
        assert task_dict["status"] == "pending"
        assert "created_at" in task_dict


class TestProject:
    """Tests for Project class"""
    
    def test_create_project(self):
        """Test creating a project"""
        project = Project("Test Project", "Test description")
        assert project.name == "Test Project"
        assert project.description == "Test description"
        assert len(project.tasks) == 0
    
    def test_add_task_to_project(self):
        """Test adding tasks to a project"""
        project = Project("Test Project")
        task1 = Task("Task 1")
        task2 = Task("Task 2")
        
        project.add_task(task1)
        project.add_task(task2)
        
        assert len(project.tasks) == 2
        assert project.tasks[0].title == "Task 1"
        assert project.tasks[1].title == "Task 2"
    
    def test_get_all_tasks(self):
        """Test getting all tasks"""
        project = Project("Test Project")
        task1 = Task("Task 1")
        task2 = Task("Task 2")
        
        project.add_task(task1)
        project.add_task(task2)
        
        all_tasks = project.get_tasks()
        assert len(all_tasks) == 2
    
    def test_get_tasks_by_status(self):
        """Test getting tasks filtered by status"""
        project = Project("Test Project")
        task1 = Task("Task 1")
        task2 = Task("Task 2")
        task3 = Task("Task 3")
        
        project.add_task(task1)
        project.add_task(task2)
        project.add_task(task3)
        
        task1.complete()
        task2.complete()
        
        pending = project.get_tasks("pending")
        completed = project.get_tasks("completed")
        
        assert len(pending) == 1
        assert len(completed) == 2
        assert pending[0].title == "Task 3"
    
    def test_project_to_dict(self):
        """Test converting project to dictionary"""
        project = Project("Test Project", "Description")
        task = Task("Task 1")
        project.add_task(task)
        
        project_dict = project.to_dict()
        
        assert project_dict["name"] == "Test Project"
        assert project_dict["description"] == "Description"
        assert len(project_dict["tasks"]) == 1
        assert "created_at" in project_dict


class TestProjectManager:
    """Tests for ProjectManager class"""
    
    def test_create_project_manager(self):
        """Test creating a project manager"""
        pm = ProjectManager()
        assert len(pm.projects) == 0
    
    def test_create_project(self):
        """Test creating a project through manager"""
        pm = ProjectManager()
        project = pm.create_project("Test Project", "Description")
        
        assert project.name == "Test Project"
        assert project.description == "Description"
        assert len(pm.projects) == 1
    
    def test_create_duplicate_project(self):
        """Test that creating duplicate project raises error"""
        pm = ProjectManager()
        pm.create_project("Test Project")
        
        with pytest.raises(ValueError, match="already exists"):
            pm.create_project("Test Project")
    
    def test_get_project(self):
        """Test getting a project by name"""
        pm = ProjectManager()
        pm.create_project("Test Project")
        
        project = pm.get_project("Test Project")
        assert project is not None
        assert project.name == "Test Project"
        
        missing_project = pm.get_project("Missing")
        assert missing_project is None
    
    def test_list_projects(self):
        """Test listing all projects"""
        pm = ProjectManager()
        pm.create_project("Project 1")
        pm.create_project("Project 2")
        pm.create_project("Project 3")
        
        projects = pm.list_projects()
        assert len(projects) == 3
        assert "Project 1" in projects
        assert "Project 2" in projects
        assert "Project 3" in projects
    
    def test_delete_project(self):
        """Test deleting a project"""
        pm = ProjectManager()
        pm.create_project("Test Project")
        
        assert len(pm.projects) == 1
        
        result = pm.delete_project("Test Project")
        assert result is True
        assert len(pm.projects) == 0
        
        result = pm.delete_project("Missing Project")
        assert result is False
    
    def test_get_all_tasks(self):
        """Test getting all tasks from all projects"""
        pm = ProjectManager()
        
        project1 = pm.create_project("Project 1")
        project2 = pm.create_project("Project 2")
        
        task1 = Task("Task 1")
        task2 = Task("Task 2")
        task3 = Task("Task 3")
        
        project1.add_task(task1)
        project1.add_task(task2)
        project2.add_task(task3)
        
        all_tasks = pm.get_all_tasks()
        
        assert len(all_tasks) == 3
        assert all_tasks[0]["project"] == "Project 1"
        assert all_tasks[2]["project"] == "Project 2"
    
    def test_get_summary(self):
        """Test getting summary of all projects"""
        pm = ProjectManager()
        
        project1 = pm.create_project("Project 1")
        project2 = pm.create_project("Project 2")
        
        task1 = Task("Task 1")
        task2 = Task("Task 2")
        task3 = Task("Task 3")
        
        project1.add_task(task1)
        project1.add_task(task2)
        project2.add_task(task3)
        
        task1.complete()
        task2.complete()
        
        summary = pm.get_summary()
        
        assert summary["total_projects"] == 2
        assert summary["total_tasks"] == 3
        assert summary["completed_tasks"] == 2
        assert summary["pending_tasks"] == 1
    
    def test_empty_summary(self):
        """Test summary with no projects"""
        pm = ProjectManager()
        summary = pm.get_summary()
        
        assert summary["total_projects"] == 0
        assert summary["total_tasks"] == 0
        assert summary["completed_tasks"] == 0
        assert summary["pending_tasks"] == 0
