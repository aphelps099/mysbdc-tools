"""
SBDC RAG (Retrieval-Augmented Generation)
Refactored from Streamlit version — import paths updated for FastAPI backend.
"""

from pathlib import Path

from .. import config

# Lazy imports — these are heavy ML deps that may not be installed
# in minimal/dev environments. RAG functions gracefully return empty
# results when these aren't available.
_HAS_RAG_DEPS = False
try:
    from langchain_huggingface import HuggingFaceEmbeddings
    from langchain_chroma import Chroma
    _HAS_RAG_DEPS = True
except ImportError:
    pass


# Cache the retriever so it loads once per process
_retriever = None


def reset_retriever():
    """Invalidate the cached retriever so the next query reloads ChromaDB."""
    global _retriever
    _retriever = None


def has_documents() -> bool:
    """Check if the vector store exists and has documents."""
    db_path = Path(config.CHROMA_DB_DIR)
    return db_path.exists() and any(db_path.iterdir())


def get_retriever():
    """Load the ChromaDB vector store and return a retriever."""
    global _retriever

    if not _HAS_RAG_DEPS:
        return None

    if _retriever is not None:
        return _retriever

    if not has_documents():
        return None

    try:
        embeddings = HuggingFaceEmbeddings(
            model_name=config.EMBEDDING_MODEL,
            model_kwargs={"device": "cpu"},
        )

        db = Chroma(
            persist_directory=str(config.CHROMA_DB_DIR),
            embedding_function=embeddings,
            collection_name="sbdc_documents",
        )

        _retriever = db.as_retriever(
            search_type="similarity",
            search_kwargs={"k": config.TOP_K_RESULTS},
        )
        return _retriever
    except Exception as e:
        print(f"RAG init error: {e}")
        return None


def get_document_count() -> int:
    """Return the number of chunks in the vector store."""
    if not _HAS_RAG_DEPS or not has_documents():
        return 0

    try:
        embeddings = HuggingFaceEmbeddings(
            model_name=config.EMBEDDING_MODEL,
            model_kwargs={"device": "cpu"},
        )
        db = Chroma(
            persist_directory=str(config.CHROMA_DB_DIR),
            embedding_function=embeddings,
            collection_name="sbdc_documents",
        )
        return db._collection.count()
    except Exception:
        return 0


def retrieve_context(query: str) -> tuple[str, list[dict]]:
    """
    Search the vector store for relevant document chunks.

    Returns:
        (context_text, sources)
    """
    retriever = get_retriever()

    if retriever is None:
        return "", []

    try:
        results = retriever.invoke(query)
    except Exception as e:
        print(f"RAG retrieval error: {e}")
        return "", []

    if not results:
        return "", []

    context_parts = []
    sources = []

    for i, doc in enumerate(results, 1):
        source = doc.metadata.get("source", "Unknown")
        title = doc.metadata.get("title", "Unknown")
        chunk_num = doc.metadata.get("chunk", "?")

        context_parts.append(
            f"--- Document: {title} (Source: {source}, Section {chunk_num}) ---\n"
            f"{doc.page_content}"
        )
        sources.append({
            "source": source,
            "title": title,
            "chunk": chunk_num,
        })

    context_text = "\n\n".join(context_parts)
    return context_text, sources


def build_augmented_prompt(user_query: str) -> tuple[str, list[dict]]:
    """Build an augmented user prompt that includes retrieved document context."""
    context_text, sources = retrieve_context(user_query)

    if not context_text:
        return user_query, []

    augmented = (
        "Use the following NorCal SBDC reference documents to help answer the question. "
        "If the documents contain relevant information, use it and cite the source. "
        "If the documents don't cover the topic, use your general knowledge but note "
        "that the answer is from general knowledge, not SBDC-specific documents.\n\n"
        f"=== REFERENCE DOCUMENTS ===\n\n{context_text}\n\n"
        f"=== END REFERENCE DOCUMENTS ===\n\n"
        f"Question: {user_query}"
    )

    return augmented, sources
