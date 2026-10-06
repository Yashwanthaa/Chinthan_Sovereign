##CHINTHAN Sovereign ⚡ Autonomous Local AI Workbench

CHINTHAN Sovereign is a privacy-first, fully local AI workbench powered by Next.js, FastAPI, and Ollama.

## 🚀 Features
- **Local LLM Engine Integration**: Dynamically query locally served Ollama models (`qwen2.5vl`, `deepseek-r1`, `qwen2.5-coder`).
- **Workbench Modes**: Seamlessly toggle between single-turn Agent tasks and continuous Chat workflows.
- **Vision Support**: Upload images for local multimodal processing.
- **Zero Third-Party API Dependence**: 100% private, low-latency processing on local hardware.

## 🛠️ Architecture & Tech Stack
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Python 3.11+, FastAPI, Uvicorn, Pydantic
- **AI Engine**: Ollama REST API (`http://127.0.0.1:11434`)

## 🚦 Local Quickstart

### Prerequisites
- Install [Ollama](https://ollama.com/) and pull a model:
  ```bash
  ollama run qwen2.5vl:3b
