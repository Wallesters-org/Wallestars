#!/usr/bin/env python3
"""
Demo script showing Wallestars Project Manager functionality
"""

from wallestars import ProjectManager
from wallestars.project_manager import Task
from wallestars.chatgpt_assistant import ChatGPTAssistant


def main():
    print("=" * 60)
    print("Wallestars - Copilot ChatGPT Project Manager Demo")
    print("=" * 60)
    print()
    
    # Initialize project manager
    pm = ProjectManager()
    assistant = ChatGPTAssistant()
    
    print("📋 Creating projects...")
    print()
    
    # Create first project
    project1 = pm.create_project(
        "Website Redesign",
        "Redesign company website with modern UI"
    )
    print(f"✓ Created project: {project1.name}")
    
    # Create second project
    project2 = pm.create_project(
        "Mobile App",
        "Develop iOS and Android mobile application"
    )
    print(f"✓ Created project: {project2.name}")
    print()
    
    # Add tasks to first project
    print("📝 Adding tasks to Website Redesign...")
    tasks1 = [
        Task("Design new mockups", "Create modern UI designs", "high"),
        Task("Implement responsive layout", "Make site mobile-friendly", "high"),
        Task("Update content", "Refresh all website copy", "medium"),
        Task("SEO optimization", "Improve search rankings", "medium"),
        Task("Performance testing", "Test load times", "low")
    ]
    
    for task in tasks1:
        project1.add_task(task)
        print(f"  • Added: {task.title} [{task.priority}]")
    print()
    
    # Add tasks to second project
    print("📝 Adding tasks to Mobile App...")
    tasks2 = [
        Task("Setup development environment", "Configure React Native", "high"),
        Task("Implement authentication", "Add login/signup", "high"),
        Task("Design app screens", "Create UI mockups", "medium")
    ]
    
    for task in tasks2:
        project2.add_task(task)
        print(f"  • Added: {task.title} [{task.priority}]")
    print()
    
    # Complete some tasks
    print("✅ Completing some tasks...")
    project1.tasks[0].complete()
    project1.tasks[1].complete()
    project2.tasks[0].complete()
    print(f"  • Completed: {project1.tasks[0].title}")
    print(f"  • Completed: {project1.tasks[1].title}")
    print(f"  • Completed: {project2.tasks[0].title}")
    print()
    
    # List all projects
    print("📚 All Projects:")
    for project_name in pm.list_projects():
        print(f"  • {project_name}")
    print()
    
    # Show project details
    print("🔍 Project Details: Website Redesign")
    print(f"   Description: {project1.description}")
    print(f"   Total tasks: {len(project1.tasks)}")
    print(f"   Completed: {len(project1.get_tasks('completed'))}")
    print(f"   Pending: {len(project1.get_tasks('pending'))}")
    print()
    print("   Tasks:")
    for task in project1.tasks:
        status_icon = "✓" if task.status == "completed" else "○"
        print(f"     {status_icon} [{task.priority:>6}] {task.title}")
    print()
    
    # Get overall summary
    print("📊 Overall Summary:")
    summary = pm.get_summary()
    print(f"   Total Projects: {summary['total_projects']}")
    print(f"   Total Tasks: {summary['total_tasks']}")
    print(f"   Completed: {summary['completed_tasks']}")
    print(f"   Pending: {summary['pending_tasks']}")
    
    if summary['total_tasks'] > 0:
        completion_rate = (summary['completed_tasks'] / summary['total_tasks']) * 100
        print(f"   Completion Rate: {completion_rate:.1f}%")
    print()
    
    # AI Assistant demo
    print("🤖 AI Assistant Features:")
    print(f"   AI Available: {assistant.is_available()}")
    
    if not assistant.is_available():
        print("   Note: Set OPENAI_API_KEY environment variable to enable AI features")
    print()
    
    # Get AI analysis (fallback mode)
    print("💡 AI Analysis:")
    analysis = assistant.analyze_project_status(summary)
    print(f"   {analysis}")
    print()
    
    # Get task suggestions
    print("💡 Task Suggestions for new project:")
    suggestions = assistant.generate_task_suggestions("Build a machine learning pipeline")
    for i, suggestion in enumerate(suggestions[:5], 1):
        print(f"   {i}. {suggestion}")
    print()
    
    # Get next steps
    pending_tasks = [t.to_dict() for t in project1.get_tasks("pending")]
    if pending_tasks:
        print("🎯 AI Suggestion for next steps:")
        next_step = assistant.suggest_next_steps(pending_tasks)
        print(f"   {next_step}")
        print()
    
    print("=" * 60)
    print("Demo completed! All features working correctly.")
    print("=" * 60)


if __name__ == "__main__":
    main()
