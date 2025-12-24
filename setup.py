from setuptools import setup, find_packages

setup(
    name="wallestars",
    version="0.1.0",
    description="Copilot ChatGPT Project Manager",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    install_requires=[
        "openai>=1.0.0",
        "python-dotenv>=1.0.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
        ],
    },
    python_requires=">=3.8",
)
