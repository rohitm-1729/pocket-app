from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.article import Article
from app.schemas.article import ArticleCreate, ArticleUpdate, ArticleResponse, ArticleListResponse
from app.services.parser import parse_article
from app.dependencies import get_current_user

router = APIRouter()


@router.post("", response_model=ArticleResponse, status_code=status.HTTP_201_CREATED)
async def create_article(
    article_data: ArticleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check if article already exists for this user
    existing = db.query(Article).filter(
        Article.user_id == current_user.id,
        Article.url == str(article_data.url),
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Article already saved",
        )

    # Parse article content
    parsed = await parse_article(str(article_data.url))

    # Create article
    article = Article(
        user_id=current_user.id,
        url=str(article_data.url),
        title=parsed.title,
        author=parsed.author,
        content=parsed.content,
        excerpt=parsed.excerpt,
        thumbnail_url=parsed.thumbnail_url,
        site_name=parsed.site_name,
        word_count=parsed.word_count,
        reading_time_minutes=parsed.reading_time_minutes,
    )
    db.add(article)
    db.commit()
    db.refresh(article)

    return article


@router.get("", response_model=ArticleListResponse)
def list_articles(
    is_read: bool | None = Query(None),
    is_archived: bool | None = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Article).filter(Article.user_id == current_user.id)

    if is_read is not None:
        query = query.filter(Article.is_read == is_read)
    if is_archived is not None:
        query = query.filter(Article.is_archived == is_archived)

    total = query.count()
    articles = query.order_by(Article.saved_at.desc()).offset(offset).limit(limit).all()

    return ArticleListResponse(articles=articles, total=total)


@router.get("/search", response_model=ArticleListResponse)
def search_articles(
    q: str = Query(..., min_length=1),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Article).filter(
        Article.user_id == current_user.id,
        Article.title.ilike(f"%{q}%"),
    )

    total = query.count()
    articles = query.order_by(Article.saved_at.desc()).offset(offset).limit(limit).all()

    return ArticleListResponse(articles=articles, total=total)


@router.get("/{article_id}", response_model=ArticleResponse)
def get_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    article = db.query(Article).filter(
        Article.id == article_id,
        Article.user_id == current_user.id,
    ).first()

    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found",
        )

    return article


@router.patch("/{article_id}", response_model=ArticleResponse)
def update_article(
    article_id: int,
    article_data: ArticleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    article = db.query(Article).filter(
        Article.id == article_id,
        Article.user_id == current_user.id,
    ).first()

    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found",
        )

    update_data = article_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(article, field, value)

    db.commit()
    db.refresh(article)

    return article


@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    article = db.query(Article).filter(
        Article.id == article_id,
        Article.user_id == current_user.id,
    ).first()

    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found",
        )

    db.delete(article)
    db.commit()
