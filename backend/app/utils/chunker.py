import re


def chunk_text(
    text: str,
    chunk_size: int = 500,
    overlap: int = 50
) -> list[str]:
    """
    Split text into overlapping chunks for embedding.

    Args:
        text: The text to chunk
        chunk_size: Target size for each chunk (in characters)
        overlap: Number of characters to overlap between chunks

    Returns:
        List of text chunks
    """
    if not text or not text.strip():
        return []

    # Clean up the text
    text = text.strip()
    text = re.sub(r'\n{3,}', '\n\n', text)  # Reduce multiple newlines

    # Try to split on paragraph boundaries first
    paragraphs = text.split('\n\n')

    chunks = []
    current_chunk = ""

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        # If adding this paragraph exceeds chunk_size, save current and start new
        if len(current_chunk) + len(para) + 2 > chunk_size and current_chunk:
            chunks.append(current_chunk.strip())

            # Start new chunk with overlap from previous
            if overlap > 0 and len(current_chunk) > overlap:
                # Get last sentences for overlap
                overlap_text = _get_overlap_text(current_chunk, overlap)
                current_chunk = overlap_text + " " + para
            else:
                current_chunk = para
        else:
            if current_chunk:
                current_chunk += "\n\n" + para
            else:
                current_chunk = para

    # Don't forget the last chunk
    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    # If any chunk is still too large, split further
    final_chunks = []
    for chunk in chunks:
        if len(chunk) > chunk_size * 1.5:
            final_chunks.extend(_split_long_chunk(chunk, chunk_size, overlap))
        else:
            final_chunks.append(chunk)

    return final_chunks


def _get_overlap_text(text: str, overlap: int) -> str:
    """Get text for overlap, trying to end at sentence boundary"""
    if len(text) <= overlap:
        return text

    # Take last `overlap` characters
    overlap_region = text[-overlap:]

    # Try to find a sentence start
    sentence_starts = [
        m.start() for m in re.finditer(r'(?<=[.!?])\s+', overlap_region)
    ]

    if sentence_starts:
        return overlap_region[sentence_starts[0]:].strip()

    return overlap_region.strip()


def _split_long_chunk(text: str, chunk_size: int, overlap: int) -> list[str]:
    """Split a chunk that's too long by sentences"""
    sentences = re.split(r'(?<=[.!?])\s+', text)

    chunks = []
    current = ""

    for sentence in sentences:
        if len(current) + len(sentence) + 1 > chunk_size and current:
            chunks.append(current.strip())
            # Add overlap
            if overlap > 0:
                current = _get_overlap_text(current, overlap) + " " + sentence
            else:
                current = sentence
        else:
            current = current + " " + sentence if current else sentence

    if current.strip():
        chunks.append(current.strip())

    return chunks
