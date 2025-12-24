"""
Tests for the ChatGPT Assistant module
"""

import pytest
from wallestars.chatgpt_assistant import ChatGPTAssistant


class TestChatGPTAssistant:
    """Tests for ChatGPTAssistant class"""
    
    def test_create_assistant_without_api_key(self):
        """Test creating assistant without API key"""
        assistant = ChatGPTAssistant()
        # Should not fail, but AI features won't be available
        assert assistant is not None
    
    def test_is_available_without_api_key(self):
        """Test availability check without API key"""
        assistant = ChatGPTAssistant(api_key=None)
        assert assistant.is_available() is False
    
    def test_generate_task_suggestions_fallback(self):
        """Test task suggestions with fallback (no API key)"""
        assistant = ChatGPTAssistant(api_key=None)
        suggestions = assistant.generate_task_suggestions("Build a web app")
        
        # Should return default suggestions
        assert isinstance(suggestions, list)
        assert len(suggestions) > 0
        assert "Define project requirements" in suggestions
    
    def test_analyze_project_status_fallback(self):
        """Test project analysis with fallback (no API key)"""
        assistant = ChatGPTAssistant(api_key=None)
        
        summary = {
            "total_projects": 1,
            "total_tasks": 10,
            "completed_tasks": 5,
            "pending_tasks": 5
        }
        
        analysis = assistant.analyze_project_status(summary)
        
        assert isinstance(analysis, str)
        assert len(analysis) > 0
        assert "50%" in analysis or "progress" in analysis.lower()
    
    def test_analyze_empty_project(self):
        """Test analyzing project with no tasks"""
        assistant = ChatGPTAssistant(api_key=None)
        
        summary = {
            "total_projects": 1,
            "total_tasks": 0,
            "completed_tasks": 0,
            "pending_tasks": 0
        }
        
        analysis = assistant.analyze_project_status(summary)
        
        assert isinstance(analysis, str)
        assert "No tasks" in analysis or "no tasks" in analysis
    
    def test_analyze_completed_project(self):
        """Test analyzing fully completed project"""
        assistant = ChatGPTAssistant(api_key=None)
        
        summary = {
            "total_projects": 1,
            "total_tasks": 10,
            "completed_tasks": 10,
            "pending_tasks": 0
        }
        
        analysis = assistant.analyze_project_status(summary)
        
        assert isinstance(analysis, str)
        assert "Great" in analysis or "completed" in analysis.lower()
    
    def test_suggest_next_steps_no_tasks(self):
        """Test suggesting next steps with no pending tasks"""
        assistant = ChatGPTAssistant(api_key=None)
        
        suggestion = assistant.suggest_next_steps([])
        
        assert isinstance(suggestion, str)
        assert "No pending" in suggestion or "Great work" in suggestion
    
    def test_suggest_next_steps_with_tasks(self):
        """Test suggesting next steps with pending tasks"""
        assistant = ChatGPTAssistant(api_key=None)
        
        pending_tasks = [
            {"title": "Setup database", "priority": "high"},
            {"title": "Write docs", "priority": "low"}
        ]
        
        suggestion = assistant.suggest_next_steps(pending_tasks)
        
        assert isinstance(suggestion, str)
        assert len(suggestion) > 0
    
    def test_suggest_next_steps_high_priority(self):
        """Test that high priority tasks are mentioned"""
        assistant = ChatGPTAssistant(api_key=None)
        
        pending_tasks = [
            {"title": "Write docs", "priority": "low"},
            {"title": "Fix critical bug", "priority": "high"}
        ]
        
        suggestion = assistant.suggest_next_steps(pending_tasks)
        
        assert isinstance(suggestion, str)
        assert "high" in suggestion.lower() or "Fix critical bug" in suggestion
