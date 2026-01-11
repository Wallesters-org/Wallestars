# How to Use the Prompt Generator

## Quick Start Guide

The Prompt Generator has been successfully added to Wallestars Control Center. Here's how to use it:

### Step 1: Access the Feature
1. Open Wallestars Control Center in your browser (`http://localhost:5173` in development)
2. Look for "Prompt Generator" in the sidebar (with a ✨ Sparkles icon)
3. Click to open the Prompt Generator page

### Step 2: Choose Your Language
- Click **"English"** for the English version
- Click **"Български"** for the Bulgarian version

### Step 3: Copy the Prompt
- Click the **"Copy to Clipboard"** button (top right of the prompt area)
- The button will change to "Copied!" to confirm
- Alternatively, click **"Download"** to save as a `.md` file

### Step 4: Use with Anthropic Console
1. Go to [Anthropic Console Workbench](https://console.anthropic.com/workbench/)
2. Paste the copied prompt into the Prompt Generator
3. Let Claude generate a detailed, comprehensive prompt for your Spark app
4. Review and refine the generated prompt as needed

### Step 5: Create Your Spark App
Use the final generated prompt to create a Spark application that:
- Accepts links to AI chats, markdown files, agent sessions, and more
- Extracts and visualizes information beautifully
- Provides interactive decision-making interfaces
- Records user choices and builds decision trees
- Exports results in multiple formats (JSON, MD, YAML, PDF, HTML, Script)
- Generates QR codes for easy access to results

## What You Get

The meta-prompt you copy describes a comprehensive Spark application specification including:

✅ **Input Processing** - Handle multiple types of links and sources
✅ **Information Analysis** - Extract key topics, decisions, and patterns
✅ **Visual Interface** - Cards, charts, timelines, and mind maps
✅ **Interactive Options** - Contextual buttons and decision points
✅ **Response Recording** - Complete decision tree with timestamps
✅ **Multi-Format Export** - 6 different export formats
✅ **QR Code Generation** - For easy result sharing
✅ **Progress Tracking** - Dynamic state management

## File Locations

If you need to modify the prompts:
- English version: `prompts/spark-app-generator-prompt.md`
- Bulgarian version: `prompts/spark-app-generator-prompt-bg.md`
- Component code: `src/pages/PromptGenerator.jsx`
- Full documentation: `PROMPT_GENERATOR_DOCS.md`

## Purpose of This Feature

This feature was created based on the GitHub issue requesting help with generating a prompt for Anthropic's Console to create a Spark visual app. The app should:

> "Приемане на линкове които водят към определен ai чат, md file, agent session или друго... Нашата цел е да създадем скрипт, който да следва добрите практики за създаването на github 'Spark' визуален app който очертава извлечената информация и генерира визуално обобщение..."

Translation: Accept links to AI chats, MD files, agent sessions, etc., and create a script following best practices for GitHub Spark visual apps that outlines extracted information and generates visual summaries with interactive options, exports to various formats, and creates QR codes.

## Benefits

1. **Saves Time**: No need to write a complex prompt from scratch
2. **Comprehensive**: Covers all aspects of a professional Spark app
3. **Best Practices**: Follows established patterns for Spark development
4. **Bilingual**: Available in English and Bulgarian
5. **Easy to Use**: Simple copy-paste workflow
6. **Well Documented**: Clear structure and examples

## Support

For more details, see:
- `PROMPT_GENERATOR_DOCS.md` - Full technical documentation (in this directory)
- `../README.md` - General project documentation
- GitHub Issues - For questions or feature requests

---

**Ready to create amazing Spark applications! 🚀**
