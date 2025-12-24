#!/usr/bin/env python3
"""
Command-line interface for Wallestars Project Manager
"""

import argparse
import sys
from wallestars.project_manager import ProjectManager, Task
from wallestars.chatgpt_assistant import ChatGPTAssistant


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(description="Wallestars - Copilot ChatGPT Project Manager")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Create project command
    create_parser = subparsers.add_parser("create", help="Create a new project")
    create_parser.add_argument("name", help="Project name")
    create_parser.add_argument("--description", "-d", default="", help="Project description")
    
    # List projects command
    subparsers.add_parser("list", help="List all projects")
    
    # Add task command
    task_parser = subparsers.add_parser("add-task", help="Add a task to a project")
    task_parser.add_argument("project", help="Project name")
    task_parser.add_argument("title", help="Task title")
    task_parser.add_argument("--description", "-d", default="", help="Task description")
    task_parser.add_argument("--priority", "-p", choices=["low", "medium", "high"], default="medium", help="Task priority")
    
    # Show project command
    show_parser = subparsers.add_parser("show", help="Show project details")
    show_parser.add_argument("name", help="Project name")
    
    # Summary command
    subparsers.add_parser("summary", help="Show summary of all projects")
    
    # AI suggestions command
    suggest_parser = subparsers.add_parser("suggest", help="Get AI-powered task suggestions")
    suggest_parser.add_argument("project", help="Project name")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return 0
    
    # Initialize project manager
    pm = ProjectManager()
    assistant = ChatGPTAssistant()
    
    try:
        if args.command == "create":
            project = pm.create_project(args.name, args.description)
            print(f"✓ Created project: {args.name}")
            
            if args.description and assistant.is_available():
                print("\nGenerating task suggestions...")
                suggestions = assistant.generate_task_suggestions(args.description)
                if suggestions:
                    print("\nSuggested tasks:")
                    for i, suggestion in enumerate(suggestions, 1):
                        print(f"  {i}. {suggestion}")
        
        elif args.command == "list":
            projects = pm.list_projects()
            if projects:
                print(f"Projects ({len(projects)}):")
                for project in projects:
                    print(f"  • {project}")
            else:
                print("No projects yet. Create one with: wallestars create <name>")
        
        elif args.command == "add-task":
            project = pm.get_project(args.project)
            if not project:
                print(f"Error: Project '{args.project}' not found")
                return 1
            
            task = Task(args.title, args.description, args.priority)
            project.add_task(task)
            print(f"✓ Added task '{args.title}' to project '{args.project}'")
        
        elif args.command == "show":
            project = pm.get_project(args.name)
            if not project:
                print(f"Error: Project '{args.name}' not found")
                return 1
            
            print(f"\nProject: {project.name}")
            print(f"Description: {project.description}")
            print(f"Created: {project.created_at.strftime('%Y-%m-%d %H:%M')}")
            
            tasks = project.get_tasks()
            if tasks:
                print(f"\nTasks ({len(tasks)}):")
                for task in tasks:
                    status_icon = "✓" if task.status == "completed" else "○"
                    print(f"  {status_icon} [{task.priority}] {task.title}")
                    if task.description:
                        print(f"      {task.description}")
            else:
                print("\nNo tasks yet.")
        
        elif args.command == "summary":
            summary = pm.get_summary()
            print(f"\nProject Summary:")
            print(f"  Total Projects: {summary['total_projects']}")
            print(f"  Total Tasks: {summary['total_tasks']}")
            print(f"  Completed: {summary['completed_tasks']}")
            print(f"  Pending: {summary['pending_tasks']}")
            
            if assistant.is_available():
                print("\nAI Analysis:")
                analysis = assistant.analyze_project_status(summary)
                print(f"  {analysis}")
        
        elif args.command == "suggest":
            project = pm.get_project(args.project)
            if not project:
                print(f"Error: Project '{args.project}' not found")
                return 1
            
            if not assistant.is_available():
                print("AI assistant not available. Set OPENAI_API_KEY to enable.")
                return 1
            
            pending_tasks = [t.to_dict() for t in project.get_tasks("pending")]
            if pending_tasks:
                suggestion = assistant.suggest_next_steps(pending_tasks)
                print(f"\nAI Suggestion:\n{suggestion}")
            else:
                print("No pending tasks in this project.")
        
        return 0
    
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
