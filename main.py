from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import requests

app = FastAPI(title="CHINTHAN Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = "http://127.0.0.1:11434"

class ChatRequest(BaseModel):
    prompt: str
    model: str = "qwen2.5:3b"
    mode: str = "Agent"
    image_base64: Optional[str] = None

@app.get("/api/models")
def get_models():
    try:
        res = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        if res.status_code == 200:
            models_data = res.json().get("models", [])
            model_names = [m["name"] for m in models_data]
            if model_names:
                return {"models": model_names}
    except Exception:
        pass
    return {"models": ["qwen2.5:3b", "qwen2.5-coder:3b", "deepseek-r1:1.5b", "qwen2.5vl:3b"]}

@app.post("/api/chat")
def chat(payload: ChatRequest):
    ollama_payload = {
        "model": payload.model,
        "prompt": payload.prompt,
        "stream": False
    }
    if payload.image_base64:
        ollama_payload["images"] = [payload.image_base64]

    try:
        res = requests.post(f"{OLLAMA_URL}/api/generate", json=ollama_payload, timeout=120)
        if res.status_code == 200:
            return {"response": res.json().get("response", "No output from model.")}
        else:
            raise HTTPException(status_code=500, detail=f"Ollama error: {res.text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to connect to Ollama: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)