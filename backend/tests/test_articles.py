import pytest
from unittest.mock import patch, AsyncMock
from app.services.parser import ParsedArticle


@pytest.fixture
def mock_parsed_article():
    return ParsedArticle(
        title="Test Article Title",
        author="Test Author",
        content="This is the test article content.",
        excerpt="This is the test article...",
        thumbnail_url="https://example.com/image.jpg",
        site_name="example.com",
        word_count=6,
        reading_time_minutes=1,
    )


def test_create_article(client, auth_headers, mock_parsed_article):
    with patch("app.routes.articles.parse_article", new_callable=AsyncMock) as mock_parser:
        mock_parser.return_value = mock_parsed_article

        response = client.post(
            "/api/articles",
            json={"url": "https://example.com/article"},
            headers=auth_headers,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Test Article Title"
        assert data["url"] == "https://example.com/article"
        assert data["is_read"] is False
        assert data["is_archived"] is False


def test_create_article_duplicate(client, auth_headers, mock_parsed_article):
    with patch("app.routes.articles.parse_article", new_callable=AsyncMock) as mock_parser:
        mock_parser.return_value = mock_parsed_article

        # Create first article
        client.post(
            "/api/articles",
            json={"url": "https://example.com/article"},
            headers=auth_headers,
        )

        # Try to create duplicate
        response = client.post(
            "/api/articles",
            json={"url": "https://example.com/article"},
            headers=auth_headers,
        )

        assert response.status_code == 400
        assert "already saved" in response.json()["detail"]


def test_list_articles(client, auth_headers, mock_parsed_article):
    with patch("app.routes.articles.parse_article", new_callable=AsyncMock) as mock_parser:
        mock_parser.return_value = mock_parsed_article

        # Create some articles
        client.post(
            "/api/articles",
            json={"url": "https://example.com/article1"},
            headers=auth_headers,
        )
        client.post(
            "/api/articles",
            json={"url": "https://example.com/article2"},
            headers=auth_headers,
        )

    response = client.get("/api/articles", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["articles"]) == 2


def test_list_articles_filter_by_read(client, auth_headers, mock_parsed_article):
    with patch("app.routes.articles.parse_article", new_callable=AsyncMock) as mock_parser:
        mock_parser.return_value = mock_parsed_article

        # Create article
        response = client.post(
            "/api/articles",
            json={"url": "https://example.com/article"},
            headers=auth_headers,
        )
        article_id = response.json()["id"]

        # Mark as read
        client.patch(
            f"/api/articles/{article_id}",
            json={"is_read": True},
            headers=auth_headers,
        )

    # Filter by is_read=True
    response = client.get("/api/articles?is_read=true", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["total"] == 1

    # Filter by is_read=False
    response = client.get("/api/articles?is_read=false", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["total"] == 0


def test_get_article(client, auth_headers, mock_parsed_article):
    with patch("app.routes.articles.parse_article", new_callable=AsyncMock) as mock_parser:
        mock_parser.return_value = mock_parsed_article

        # Create article
        response = client.post(
            "/api/articles",
            json={"url": "https://example.com/article"},
            headers=auth_headers,
        )
        article_id = response.json()["id"]

    response = client.get(f"/api/articles/{article_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["id"] == article_id


def test_get_article_not_found(client, auth_headers):
    response = client.get("/api/articles/9999", headers=auth_headers)
    assert response.status_code == 404


def test_update_article(client, auth_headers, mock_parsed_article):
    with patch("app.routes.articles.parse_article", new_callable=AsyncMock) as mock_parser:
        mock_parser.return_value = mock_parsed_article

        # Create article
        response = client.post(
            "/api/articles",
            json={"url": "https://example.com/article"},
            headers=auth_headers,
        )
        article_id = response.json()["id"]

    # Update article
    response = client.patch(
        f"/api/articles/{article_id}",
        json={"is_read": True, "is_archived": True},
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_read"] is True
    assert data["is_archived"] is True


def test_delete_article(client, auth_headers, mock_parsed_article):
    with patch("app.routes.articles.parse_article", new_callable=AsyncMock) as mock_parser:
        mock_parser.return_value = mock_parsed_article

        # Create article
        response = client.post(
            "/api/articles",
            json={"url": "https://example.com/article"},
            headers=auth_headers,
        )
        article_id = response.json()["id"]

    # Delete article
    response = client.delete(f"/api/articles/{article_id}", headers=auth_headers)
    assert response.status_code == 204

    # Verify it's deleted
    response = client.get(f"/api/articles/{article_id}", headers=auth_headers)
    assert response.status_code == 404


def test_search_articles(client, auth_headers, mock_parsed_article):
    with patch("app.routes.articles.parse_article", new_callable=AsyncMock) as mock_parser:
        mock_parser.return_value = mock_parsed_article

        # Create article
        client.post(
            "/api/articles",
            json={"url": "https://example.com/article"},
            headers=auth_headers,
        )

    # Search by title
    response = client.get("/api/articles/search?q=Test", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["total"] == 1

    # Search with no results
    response = client.get("/api/articles/search?q=nonexistent", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["total"] == 0


def test_articles_unauthenticated(client):
    response = client.get("/api/articles")
    assert response.status_code == 403
