import httpx
import trafilatura
from urllib.parse import urlparse
from dataclasses import dataclass


@dataclass
class ParsedArticle:
    title: str
    author: str | None
    content: str | None
    excerpt: str | None
    thumbnail_url: str | None
    site_name: str | None
    word_count: int
    reading_time_minutes: int


def calculate_reading_time(word_count: int, words_per_minute: int = 200) -> int:
    if word_count == 0:
        return 0
    return max(1, round(word_count / words_per_minute))


def extract_excerpt(content: str | None, max_length: int = 300) -> str | None:
    if not content:
        return None
    # Strip HTML and get plain text excerpt
    text = content[:max_length]
    if len(content) > max_length:
        # Cut at last space to avoid word truncation
        last_space = text.rfind(" ")
        if last_space > 0:
            text = text[:last_space]
        text += "..."
    return text


async def parse_article(url: str) -> ParsedArticle:
    """
    Fetch and parse article content from a URL.
    Returns parsed article data or fallback values if parsing fails.
    """
    parsed_url = urlparse(url)
    site_name = parsed_url.netloc.replace("www.", "")

    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
            response = await client.get(url, headers={
                "User-Agent": "Mozilla/5.0 (compatible; PocketApp/1.0)"
            })
            response.raise_for_status()
            html = response.text
    except Exception:
        # If fetch fails, return minimal data
        return ParsedArticle(
            title=url,
            author=None,
            content=None,
            excerpt=None,
            thumbnail_url=None,
            site_name=site_name,
            word_count=0,
            reading_time_minutes=0,
        )

    # Extract content using trafilatura
    extracted = trafilatura.extract(
        html,
        include_comments=False,
        include_tables=True,
        include_images=False,
        output_format="txt",
    )

    # Extract metadata
    metadata = trafilatura.extract_metadata(html)

    title = url
    author = None
    thumbnail_url = None

    if metadata:
        title = metadata.title or url
        author = metadata.author
        if metadata.image:
            thumbnail_url = metadata.image
        if metadata.sitename:
            site_name = metadata.sitename

    content = extracted or None
    word_count = len(content.split()) if content else 0
    reading_time = calculate_reading_time(word_count)
    excerpt = extract_excerpt(content)

    return ParsedArticle(
        title=title,
        author=author,
        content=content,
        excerpt=excerpt,
        thumbnail_url=thumbnail_url,
        site_name=site_name,
        word_count=word_count,
        reading_time_minutes=reading_time,
    )
