import httpx
from typing import AsyncGenerator
import json
from ..config import get_settings
from ..models import ChatMessage

settings = get_settings()


class OllamaService:
    def __init__(self):
        self.base_url = settings.ollama_base_url
        self.model = settings.ollama_model
        self.embed_model = settings.ollama_embed_model

    async def check_health(self) -> bool:
        """Check if Ollama is running"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/api/tags",
                    timeout=5.0
                )
                return response.status_code == 200
        except:
            return False

    async def embed(self, text: str) -> list[float]:
        """Generate embeddings using nomic-embed-text"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/api/embeddings",
                json={
                    "model": self.embed_model,
                    "prompt": text
                },
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            return data["embedding"]

    async def generate_stream(
        self,
        system_prompt: str,
        user_message: str,
        history: list[ChatMessage] = None
    ) -> AsyncGenerator[str, None]:
        """Generate streaming response from Ollama"""

        # Build messages array
        messages = [{"role": "system", "content": system_prompt}]

        if history:
            for msg in history[-6:]:  # Keep last 6 messages for context
                messages.append({
                    "role": msg.role,
                    "content": msg.content
                })

        messages.append({"role": "user", "content": user_message})

        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/api/chat",
                json={
                    "model": self.model,
                    "messages": messages,
                    "stream": True,
                    "options": {
                        "num_ctx": settings.ollama_num_ctx,
                        "num_predict": settings.ollama_num_predict,
                        "temperature": settings.ollama_temperature,
                    }
                },
                timeout=60.0
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line:
                        try:
                            data = json.loads(line)
                            if "message" in data:
                                content = data["message"].get("content", "")
                                if content:
                                    yield content
                            if data.get("done"):
                                break
                        except json.JSONDecodeError:
                            continue

    async def generate(
        self,
        system_prompt: str,
        user_message: str,
        history: list[ChatMessage] = None
    ) -> str:
        """Generate non-streaming response"""
        full_response = ""
        async for chunk in self.generate_stream(
            system_prompt, user_message, history
        ):
            full_response += chunk
        return full_response
