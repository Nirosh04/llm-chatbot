import logging
import uuid
from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, CollectionInfo
from sentence_transformers import SentenceTransformer
from settings import settings

logger = logging.getLogger(__name__)

class VectorService:
    """Service for managing interactions with the Qdrant Vector Database."""

    def __init__(self):
        """Initializes the Qdrant client connection."""
        try:
            self.client = QdrantClient(
                host=settings.QDRANT.HOST,
                port=settings.QDRANT.PORT
            )
            
            self.client.get_collections()
            logger.info("Successfully connected to Qdrant client.")

            self.model = SentenceTransformer("all-MiniLM-L6-v2")

            logger.info("Embedding model loaded.")
        except Exception as e:
            logger.error(f"Failed to connect to Qdrant: {e}")

    def create_collection(
        self, 
        collection_name: str, 
    ) -> bool:
        """
        Creates a new collection in Qdrant if it does not already exist.

        Args:
            collection_name: The name of the collection to create. (session_id)
        
        Returns:
            True if creation was successful or collection already exists, False otherwise.
        """
        try:
            if self.client.collection_exists(collection_name=collection_name):
                logger.info(f"Collection '{collection_name}' already exists.")
                return True

            logger.info(f"Attempting to create collection: {collection_name}")
            
            self.client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(
                    size=settings.QDRANT.VECTOR_SIZE,
                    distance=Distance.COSINE
                )
            )
            
            logger.info(f"Collection '{collection_name}' created successfully.")
            return True
            
        except Exception as e:
            logger.error(f"Error creating collection '{collection_name}': {e}")
            return False

    def upsert_vectors(
        self, 
        collection_name: str,
        user_query: str,
        llm_response: str,
    ) -> bool:
        """
        Inserts or updates points (vectors and payloads) into a collection. 

        Args:
            collection_name: The target collection name. (session_id)
            user_query: The user's query.
            llm_response: The LLM's response for the query.
        
        Returns:
            True if the upsert operation was successful.
        """
        try:

            vector = self.get_embedding(user_query + " " + llm_response)

            operation_info = self.client.upsert(
                collection_name=collection_name,
                points=[{
                    "id": str(uuid.uuid4()),
                    "vector": vector,
                    "payload": {"user_query": user_query, "llm_response": llm_response}
                }]
            )
            
            if operation_info.status == "completed":
                 logger.debug(f"Successfully upserted vectors into '{collection_name}'")
                 return True
            else:
                 logger.warning(f"Upsert status not completed: {operation_info.status}")
                 return False

        except Exception as e:
            logger.error(f"Error upserting vectors into '{collection_name}': {e}")
            return False

    def search_vectors(
        self, 
        collection_name: str, 
        user_query: str,
        limit: int = 5,
    ) -> List[Dict[str, Any]]:
        """
        Performs a vector similarity search against a collection.

        Args:
            collection_name: The target collection name. (session_id)
            user_query: The user's query.
            limit: The maximum number of results to return. ('n' nearest neighbors)
        
        Returns:
            A list of search results, typically including the vector's payload and score.
        """
        try:

            vector = self.get_embedding(user_query)

            logger.info(f"Searching collection '{collection_name}' with limit {limit}")
            
            search_results = self.client.search(
                collection_name=collection_name,
                query_vector=vector,
                limit=limit
            )
            
            formatted_results = []
            for point in search_results:
                formatted_results.append({
                    "id": point.id,
                    "score": point.score,
                    "payload": point.payload
                })
                
            return formatted_results

        except Exception as e:
            logger.error(f"Error searching vectors in '{collection_name}': {e}")
            return []


    def delete_collection(self, collection_name: str) -> bool:
        """
        Deletes a collection from Qdrant.

        Args:
            collection_name: The name of the collection to delete. (session_id)
        
        Returns:
            True if deletion was successful or collection did not exist.
        """
        try:
            if not self.client.collection_exists(collection_name=collection_name):
                logger.info(f"Collection '{collection_name}' does not exist, skipping deletion.")
                return True

            logger.info(f"Deleting collection: {collection_name}")
            
            self.client.delete_collection(collection_name=collection_name)
            
            logger.info(f"Collection '{collection_name}' deleted successfully.")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting collection '{collection_name}': {e}")
            return False
    
    def get_embedding(self, text: str):
        return self.model.encode(text).tolist()