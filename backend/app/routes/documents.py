"""Document upload and listing routes."""

import os
import shutil
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException

from ..config import DOCUMENTS_DIR, CHROMA_DB_DIR, EMBEDDING_MODEL, CHUNK_SIZE, CHUNK_OVERLAP
from ..models.schemas import UploadResponse, DocumentListResponse, DocumentInfo
from ..services.rag import reset_retriever, get_document_count

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.get("/", response_model=DocumentListResponse)
async def list_documents():
    """List all uploaded documents and their chunk count."""
    docs = []
    if DOCUMENTS_DIR.exists():
        for f in sorted(DOCUMENTS_DIR.iterdir()):
            if f.is_file() and not f.name.startswith("."):
                docs.append(DocumentInfo(filename=f.name, chunk_count=0))

    total_chunks = get_document_count()
    return DocumentListResponse(documents=docs, total_chunks=total_chunks)


@router.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """Upload a document and ingest it into ChromaDB."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    # Validate file type
    allowed = {".txt", ".pdf", ".md", ".html", ".csv", ".doc", ".docx"}
    ext = Path(file.filename).suffix.lower()
    if ext not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{ext}' not supported. Allowed: {', '.join(allowed)}",
        )

    # Save file
    DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)
    dest = DOCUMENTS_DIR / file.filename
    with open(dest, "wb") as f:
        content = await file.read()
        f.write(content)

    # Ingest into ChromaDB
    chunks_created = 0
    ingestion_error = ""
    try:
        chunks_created = _ingest_document(dest)
        reset_retriever()
    except Exception as e:
        import traceback
        traceback.print_exc()
        ingestion_error = str(e)

    total_chunks = get_document_count()
    return UploadResponse(
        filename=file.filename,
        chunks_created=chunks_created,
        total_chunks=total_chunks,
        ingestion_error=ingestion_error or None,
    )


def _ingest_document(file_path: Path) -> int:
    """Ingest a single document into ChromaDB. Returns number of chunks created."""
    from langchain_community.document_loaders import (
        TextLoader,
        UnstructuredHTMLLoader,
    )
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    from langchain_huggingface import HuggingFaceEmbeddings
    from langchain_chroma import Chroma

    ext = file_path.suffix.lower()

    # Load document based on type
    if ext in (".txt", ".md", ".csv"):
        loader = TextLoader(str(file_path), encoding="utf-8")
    elif ext == ".html":
        loader = UnstructuredHTMLLoader(str(file_path))
    elif ext == ".pdf":
        from langchain_community.document_loaders import PyPDFLoader
        loader = PyPDFLoader(str(file_path))
    else:
        loader = TextLoader(str(file_path), encoding="utf-8")

    documents = loader.load()

    # Add metadata
    for doc in documents:
        doc.metadata["source"] = file_path.name
        doc.metadata["title"] = file_path.stem

    # Split into chunks
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
    )
    chunks = splitter.split_documents(documents)

    # Add chunk numbers
    for i, chunk in enumerate(chunks):
        chunk.metadata["chunk"] = i + 1

    # Add to ChromaDB
    embeddings = HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL,
        model_kwargs={"device": "cpu"},
    )

    CHROMA_DB_DIR.mkdir(parents=True, exist_ok=True)
    db = Chroma(
        persist_directory=str(CHROMA_DB_DIR),
        embedding_function=embeddings,
        collection_name="sbdc_documents",
    )
    db.add_documents(chunks)

    return len(chunks)
