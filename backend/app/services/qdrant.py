from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.exceptions import UnexpectedResponse
import uuid
from ..config import get_settings

settings = get_settings()


class QdrantService:
    def __init__(self):
        self.client = QdrantClient(
            host=settings.qdrant_host,
            port=settings.qdrant_port
        )
        self.collection_name = settings.qdrant_collection
        self._ensure_collection()

    def _ensure_collection(self):
        """Create collection if it doesn't exist"""
        try:
            self.client.get_collection(self.collection_name)
        except (UnexpectedResponse, Exception):
            try:
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=models.VectorParams(
                        size=768,  # nomic-embed-text dimension
                        distance=models.Distance.COSINE
                    )
                )
            except:
                pass  # Collection might already exist

    async def check_health(self) -> bool:
        """Check if Qdrant is running"""
        try:
            self.client.get_collections()
            return True
        except:
            return False

    async def upsert(
        self,
        vectors: list[list[float]],
        payloads: list[dict]
    ) -> int:
        """Insert vectors with metadata"""
        points = [
            models.PointStruct(
                id=str(uuid.uuid4()),
                vector=vector,
                payload=payload
            )
            for vector, payload in zip(vectors, payloads)
        ]

        self.client.upsert(
            collection_name=self.collection_name,
            points=points
        )
        return len(points)

    async def search(
        self,
        query_vector: list[float],
        limit: int = None
    ) -> list[dict]:
        """Search for similar vectors"""
        if limit is None:
            limit = settings.qdrant_top_k

        results = self.client.query_points(
            collection_name=self.collection_name,
            query=query_vector,
            limit=limit
        )

        return [
            {
                "source": r.payload.get("source", ""),
                "content": r.payload.get("content", ""),
                "score": r.score
            }
            for r in results.points
        ]

    async def delete_collection(self):
        """Delete the collection (for testing/reset)"""
        try:
            self.client.delete_collection(self.collection_name)
            self._ensure_collection()
        except:
            pass

    async def count(self) -> int:
        """Get count of vectors in collection"""
        try:
            info = self.client.get_collection(self.collection_name)
            return info.points_count
        except:
            return 0
