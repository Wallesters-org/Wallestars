# Wallestars

Copilot ChatGPT Project Manager - An AI-powered project management tool that helps you organize tasks and projects with intelligent assistance.

## Features

- 📋 Create and manage multiple projects
- ✅ Add and track tasks with priorities
- 🤖 AI-powered task suggestions (optional ChatGPT integration)
- 📊 Project summaries and analytics
- 💡 Intelligent next-step recommendations
- 🔧 Simple command-line interface

## Installation

### Requirements

- Python 3.8 or higher
- pip (Python package manager)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/Wallesters-org/Wallestars.git
cd Wallestars
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Install the package in development mode:
```bash
pip install -e .
```

### Optional: ChatGPT Integration

To enable AI-powered features, you need an OpenAI API key:

1. Get an API key from [OpenAI](https://platform.openai.com)
2. Create a `.env` file in the project root:
```bash
echo "OPENAI_API_KEY=your-api-key-here" > .env
```

**Note:** The project works without an API key, but AI features will use fallback responses.

## Usage

### Command-Line Interface

#### Create a new project:
```bash
python -m wallestars.cli create "My Project" --description "A sample project"
```

#### List all projects:
```bash
python -m wallestars.cli list
```

#### Add a task to a project:
```bash
python -m wallestars.cli add-task "My Project" "Setup environment" --priority high
```

#### Show project details:
```bash
python -m wallestars.cli show "My Project"
```

#### Get project summary:
```bash
python -m wallestars.cli summary
```

#### Get AI-powered suggestions (requires API key):
```bash
python -m wallestars.cli suggest "My Project"
```

### Python API

You can also use Wallestars as a Python library:

```python
from wallestars import ProjectManager
from wallestars.project_manager import Task
from wallestars.chatgpt_assistant import ChatGPTAssistant

# Create a project manager
pm = ProjectManager()

# Create a project
project = pm.create_project("My Project", "Building something awesome")

# Add tasks
task1 = Task("Setup development environment", priority="high")
task2 = Task("Write documentation", priority="medium")
project.add_task(task1)
project.add_task(task2)

# Get summary
summary = pm.get_summary()
print(f"Total tasks: {summary['total_tasks']}")

# Use AI assistant (optional)
assistant = ChatGPTAssistant()
if assistant.is_available():
    suggestions = assistant.generate_task_suggestions("Build a web app")
    print(suggestions)
```

## Testing

Run the test suite:

```bash
pytest tests/
```

Run tests with coverage:

```bash
pytest tests/ --cov=wallestars --cov-report=html
```

Run specific test file:

```bash
pytest tests/test_project_manager.py -v
```

## Project Structure

```
Wallestars/
├── src/
│   └── wallestars/
│       ├── __init__.py
│       ├── project_manager.py      # Core project management logic
│       ├── chatgpt_assistant.py    # AI assistant integration
│       └── cli.py                  # Command-line interface
├── tests/
│   ├── __init__.py
│   ├── test_project_manager.py
│   └── test_chatgpt_assistant.py
├── .gitignore
├── requirements.txt
├── setup.py
└── README.md
```

## Architecture

### Core Components

1. **ProjectManager**: Central management system for all projects
2. **Project**: Container for related tasks with metadata
3. **Task**: Individual work items with status tracking
4. **ChatGPTAssistant**: Optional AI integration for intelligent suggestions

### Design Principles

- Simple and intuitive API
- Optional AI features (works without API key)
- Comprehensive test coverage
- Minimal dependencies
- Command-line first approach

## Examples

### Example 1: Quick Start

```bash
# Create a project
python -m wallestars.cli create "Website Redesign" --description "Redesign company website"

# Add some tasks
python -m wallestars.cli add-task "Website Redesign" "Design mockups" --priority high
python -m wallestars.cli add-task "Website Redesign" "Implement frontend" --priority high
python -m wallestars.cli add-task "Website Redesign" "Write tests" --priority medium

# Check the project
python -m wallestars.cli show "Website Redesign"
```

### Example 2: Using Python API

```python
from wallestars import ProjectManager
from wallestars.project_manager import Task

pm = ProjectManager()
project = pm.create_project("API Development")

tasks = [
    Task("Design API endpoints", priority="high"),
    Task("Implement authentication", priority="high"),
    Task("Write API documentation", priority="medium"),
    Task("Add rate limiting", priority="low")
]

for task in tasks:
    project.add_task(task)

# Complete some tasks
project.tasks[0].complete()
project.tasks[1].complete()

# Check progress
summary = pm.get_summary()
print(f"Progress: {summary['completed_tasks']}/{summary['total_tasks']} tasks completed")
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/Wallesters-org/Wallestars).
