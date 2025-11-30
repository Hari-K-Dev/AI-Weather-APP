import vertexai
from vertexai.generative_models import GenerativeModel, Part, Content
from vertexai.language_models import TextEmbeddingModel
from typing import AsyncGenerator
from ..config import get_settings
from ..models import ChatMessage

settings = get_settings()


class VertexAIService:
    def __init__(self):
        # Initialize Vertex AI with project and location
        # Uses Application Default Credentials (ADC) automatically
        if settings.gcp_project_id:
            vertexai.init(
                project=settings.gcp_project_id,
                location=settings.gcp_location
            )

        self.model_name = settings.gemini_model
        self.embedding_model_name = settings.embedding_model
        self._generative_model = None
        self._embedding_model = None

    @property
    def generative_model(self) -> GenerativeModel:
        if self._generative_model is None:
            self._generative_model = GenerativeModel(self.model_name)
        return self._generative_model

    @property
    def embedding_model(self) -> TextEmbeddingModel:
        if self._embedding_model is None:
            self._embedding_model = TextEmbeddingModel.from_pretrained(
                self.embedding_model_name
            )
        return self._embedding_model

    async def check_health(self) -> bool:
        """Check if Vertex AI is accessible"""
        try:
            # Try to get model info as a health check
            _ = self.generative_model
            return True
        except Exception:
            return False

    async def embed(self, text: str) -> list[float]:
        """Generate embeddings using Vertex AI text-embedding-004"""
        try:
            embeddings = self.embedding_model.get_embeddings([text])
            return embeddings[0].values
        except Exception as e:
            raise RuntimeError(f"Embedding generation failed: {str(e)}")

    async def generate_stream(
        self,
        system_prompt: str,
        user_message: str,
        history: list[ChatMessage] = None
    ) -> AsyncGenerator[str, None]:
        """Generate streaming response from Gemini"""

        # Build conversation history for Gemini
        contents = []

        if history:
            for msg in history[-6:]:  # Keep last 6 messages for context
                role = "user" if msg.role == "user" else "model"
                contents.append(
                    Content(
                        role=role,
                        parts=[Part.from_text(msg.content)]
                    )
                )

        # Add current user message with system prompt context
        full_user_message = f"{system_prompt}\n\nUser question: {user_message}"
        contents.append(
            Content(
                role="user",
                parts=[Part.from_text(full_user_message)]
            )
        )

        # Configure generation parameters
        generation_config = {
            "temperature": settings.gemini_temperature,
            "max_output_tokens": settings.gemini_max_output_tokens,
        }

        try:
            # Stream response from Gemini
            response = self.generative_model.generate_content(
                contents,
                generation_config=generation_config,
                stream=True
            )

            for chunk in response:
                if chunk.text:
                    yield chunk.text

        except Exception as e:
            yield f"Error generating response: {str(e)}"

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
