from .vertex_ai import VertexAIService
from .qdrant import QdrantService
from ..utils.chunker import chunk_text
from ..config import get_settings

settings = get_settings()


class RAGService:
    def __init__(self, vertex_ai: VertexAIService, qdrant: QdrantService):
        self.vertex_ai = vertex_ai
        self.qdrant = qdrant

    async def get_context(self, query: str) -> list[dict]:
        """Retrieve relevant context for a query"""
        # Embed the query
        query_vector = await self.vertex_ai.embed(query)

        # Search for similar documents
        results = await self.qdrant.search(
            query_vector,
            limit=settings.qdrant_top_k
        )

        # Filter by minimum score threshold
        filtered = [r for r in results if r["score"] > 0.3]

        return filtered

    async def ingest(self, content: str, source: str) -> int:
        """Ingest content into the knowledge base"""
        # Chunk the content
        chunks = chunk_text(content, chunk_size=500, overlap=50)

        if not chunks:
            return 0

        # Generate embeddings for each chunk
        vectors = []
        payloads = []

        for chunk in chunks:
            vector = await self.vertex_ai.embed(chunk)
            vectors.append(vector)
            payloads.append({
                "content": chunk,
                "source": source
            })

        # Upsert to Qdrant
        count = await self.qdrant.upsert(vectors, payloads)

        return count
