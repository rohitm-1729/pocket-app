from datetime import datetime
from pydantic import BaseModel, HttpUrl, ConfigDict


class ArticleCreate(BaseModel):
    url: HttpUrl


class ArticleUpdate(BaseModel):
    is_read: bool | None = None
    is_archived: bool | None = None


class ArticleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    title: str
    author: str | None
    content: str | None
    excerpt: str | None
    thumbnail_url: str | None
    site_name: str | None
    reading_time_minutes: int
    word_count: int
    is_read: bool
    is_archived: bool
    saved_at: datetime
    updated_at: datetime


class ArticleListResponse(BaseModel):
    articles: list[ArticleResponse]
    total: int
