#!/usr/bin/env python3
"""
Knowledge Base Ingestion Script

This script ingests all markdown files from the kb/ directory into Qdrant.
Run this after starting Ollama and Qdrant services.

Usage:
    python -m scripts.ingest_kb
    or
    python scripts/ingest_kb.py
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.ollama import OllamaService
from app.services.qdrant import QdrantService
from app.services.rag import RAGService


async def main():
    print("=" * 50)
    print("Weather App Knowledge Base Ingestion")
    print("=" * 50)

    # Initialize services
    print("\n[1/4] Initializing services...")
    ollama = OllamaService()
    qdrant = QdrantService()
    rag = RAGService(ollama, qdrant)

    # Check services health
    print("\n[2/4] Checking service health...")

    ollama_ok = await ollama.check_health()
    if not ollama_ok:
        print("[ERROR] Ollama is not running!")
        print("   Please start Ollama first: ollama serve")
        print("   Then pull required models:")
        print("   - ollama pull llama3.2:3b")
        print("   - ollama pull nomic-embed-text")
        return

    print("[OK] Ollama is running")

    qdrant_ok = await qdrant.check_health()
    if not qdrant_ok:
        print("[ERROR] Qdrant is not running!")
        print("   Please start Qdrant: docker-compose up -d qdrant")
        return

    print("[OK] Qdrant is running")

    # Get KB directory
    kb_dir = Path(__file__).parent.parent.parent / "kb"
    if not kb_dir.exists():
        print(f"[ERROR] KB directory not found: {kb_dir}")
        return

    # Find all markdown files
    md_files = list(kb_dir.glob("*.md"))
    if not md_files:
        print(f"[ERROR] No markdown files found in {kb_dir}")
        return

    print(f"\n[3/4] Found {len(md_files)} KB files:")
    for f in md_files:
        print(f"   - {f.name}")

    # Clear existing collection (optional - for fresh start)
    print("\n[4/4] Ingesting documents...")
    await qdrant.delete_collection()
    print("   Cleared existing collection")

    total_chunks = 0

    for md_file in md_files:
        print(f"\n   Processing: {md_file.name}")

        try:
            content = md_file.read_text(encoding="utf-8")
            chunks_added = await rag.ingest(content, md_file.name)
            total_chunks += chunks_added
            print(f"   [OK] Added {chunks_added} chunks")
        except Exception as e:
            print(f"   [ERROR] Error: {e}")

    # Summary
    final_count = await qdrant.count()
    print("\n" + "=" * 50)
    print("Ingestion Complete!")
    print(f"Total chunks in collection: {final_count}")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
