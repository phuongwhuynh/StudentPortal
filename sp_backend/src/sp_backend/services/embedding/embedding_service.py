import requests
from sp_backend.core.config import settings


class EmbeddingService:
    @staticmethod
    def get_embedding(text: str) -> list[float]:
        response = requests.post(
            settings.EMBEDDING_URL,
            json={
                "model": settings.EMBEDDING_MODEL,
                "prompt": text,
            },
            timeout=30,
        )
        response.raise_for_status()
        return response.json()["embedding"]


if __name__ == "__main__":
    test_text = "This is a test text for embedding generation."
    embedding = EmbeddingService.get_embedding(test_text)
    print(embedding)
