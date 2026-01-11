# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **greenfield project** for a personal read-it-later application (Pocket clone). The complete specification is in `pocket_clone_spec.md`. No code has been written yet - implementation should follow the phased approach outlined below.

**Goal:** Open-source, self-hostable app that users can easily run locally.

## Tech Stack

### Backend
- **Framework:** Python 3.11+ with FastAPI
- **Database:** SQLite (default, zero-config) with PostgreSQL as optional alternative
- **ORM:** SQLAlchemy with Alembic for migrations
- **Auth:** JWT tokens with python-jose, passwords hashed with passlib[bcrypt]
- **Content Parsing:** newspaper3k or trafilatura for article extraction

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS with shadcn/ui components
- **Offline Storage:** Dexie.js (IndexedDB wrapper)
- **Mobile:** React Native (Phase 5)

## System Architecture

```mermaid
graph TB
    subgraph Client
        Browser[Browser/PWA]
        Extension[Browser Extension]
        Mobile[Mobile App]
    end

    subgraph Frontend[Frontend - React/Vite]
        UI[UI Components]
        State[State Management]
        IndexedDB[(IndexedDB<br/>Offline Cache)]
    end

    subgraph Backend[Backend - FastAPI]
        API[API Routes]
        AuthService[Auth Service]
        ParserService[Parser Service]
        SyncService[Sync Service]
    end

    subgraph Database
        SQLite[(SQLite/PostgreSQL)]
    end

    subgraph External
        WebPages[Web Pages]
    end

    Browser --> UI
    Extension --> API
    Mobile --> API
    UI --> State
    State <--> IndexedDB
    State <--> API
    API --> AuthService
    API --> ParserService
    API --> SyncService
    AuthService --> SQLite
    ParserService --> SQLite
    ParserService --> WebPages
    SyncService --> SQLite
```

## Key Flows

### 1. Save Article Flow
```mermaid
sequenceDiagram
    actor User
    participant UI as Frontend
    participant API as FastAPI
    participant Parser as Parser Service
    participant DB as SQLite

    User->>UI: Paste URL / Click Extension
    UI->>API: POST /api/articles {url}
    API->>API: Validate JWT token
    API->>Parser: parse_article(url)
    Parser->>Parser: Fetch webpage
    Parser->>Parser: Extract content (trafilatura)
    Parser->>Parser: Extract metadata (title, author, image)
    Parser-->>API: ArticleData
    API->>DB: INSERT article
    DB-->>API: article_id
    API-->>UI: 201 Created {article}
    UI->>UI: Update local state + IndexedDB
    UI-->>User: Show success toast
```

### 2. Offline Sync Flow
```mermaid
sequenceDiagram
    participant UI as Frontend
    participant IDB as IndexedDB
    participant Queue as Sync Queue
    participant API as FastAPI
    participant DB as SQLite

    Note over UI: User is offline
    UI->>IDB: Save action locally
    UI->>Queue: Add to pending queue

    Note over UI: Connection restored
    Queue->>API: POST /api/sync {pending_actions}
    API->>DB: Apply changes
    DB-->>API: Updated records
    API-->>Queue: Sync response + server changes
    Queue->>IDB: Update local cache
    Queue->>UI: Notify sync complete
```

### 3. Authentication Flow
```mermaid
sequenceDiagram
    actor User
    participant UI as Frontend
    participant API as FastAPI
    participant Auth as Auth Service
    participant DB as SQLite

    User->>UI: Enter email/password
    UI->>API: POST /api/auth/login
    API->>Auth: verify_password(email, password)
    Auth->>DB: SELECT user WHERE email
    DB-->>Auth: user record
    Auth->>Auth: bcrypt.verify(password, hash)
    Auth-->>API: user_id
    API->>API: create_jwt(user_id, expires=24h)
    API-->>UI: {access_token, user}
    UI->>UI: Store token in httpOnly cookie
    UI-->>User: Redirect to /list
```

### 4. Tagging Flow
```mermaid
sequenceDiagram
    actor User
    participant UI as Frontend
    participant API as FastAPI
    participant DB as SQLite

    User->>UI: Click "Add Tag" on article
    UI->>UI: Show tag picker modal

    alt Create New Tag
        User->>UI: Type new tag name
        UI->>API: POST /api/tags {name, color}
        API->>DB: INSERT tag
        DB-->>API: tag_id
        API-->>UI: {tag}
    end

    User->>UI: Select tag(s)
    UI->>API: POST /api/articles/{id}/tags {tag_ids}
    API->>DB: INSERT article_tags (article_id, tag_id)
    DB-->>API: success
    API-->>UI: 200 OK {updated_article}
    UI->>UI: Update UI with tag chips
    UI-->>User: Tags visible on article

    Note over User,UI: Filter by tag
    User->>UI: Click tag chip
    UI->>API: GET /api/articles?tag={tag_id}
    API->>DB: SELECT articles JOIN article_tags
    DB-->>API: filtered articles
    API-->>UI: {articles[]}
    UI-->>User: Show filtered list
```

### 5. Search Flow
```mermaid
sequenceDiagram
    actor User
    participant UI as Frontend
    participant Debounce as Debounce (300ms)
    participant API as FastAPI
    participant DB as SQLite

    User->>UI: Type in search box
    UI->>Debounce: Search query
    Debounce->>Debounce: Wait 300ms

    alt User still typing
        Debounce->>Debounce: Reset timer
    else User stopped typing
        Debounce->>API: GET /api/articles/search?q={query}
    end

    API->>DB: Full-text search query
    Note over DB: SQLite FTS5 or<br/>PostgreSQL tsvector

    DB-->>API: Matching articles with rank
    API->>API: Sort by relevance score
    API-->>UI: {articles[], total_count}

    UI->>UI: Highlight matching terms
    UI-->>User: Display search results

    Note over User,UI: Advanced filters
    User->>UI: Add filters (tag, date, read status)
    UI->>API: GET /api/articles/search?q={query}&tag={id}&is_read=false
    API->>DB: Combined FTS + WHERE clauses
    DB-->>API: Filtered results
    API-->>UI: {articles[]}
    UI-->>User: Show filtered search results
```

### Project Structure
```
pocket-app/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── article.py
│   │   │   ├── tag.py
│   │   │   └── article_tag.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── article.py
│   │   │   └── tag.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── articles.py
│   │   │   └── tags.py
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── parser.py
│   │       └── sync.py
│   ├── alembic/
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Local Setup

```bash
# Without Docker
cd backend && pip install -r requirements.txt && python -m app.main
cd frontend && npm install && npm run dev

# With Docker
docker-compose up
```

## Implementation Phases

Follow these phases in order - each builds on the previous:

1. **Phase 1 (MVP):** Auth, URL saving, content parsing, article list, basic reader view
2. **Phase 2:** Tags, favorites, full-text search, reading preferences
3. **Phase 3:** Chrome/Firefox extensions, bookmarklet, PWA
4. **Phase 4:** Service workers, IndexedDB offline storage, real-time sync
5. **Phase 5:** React Native mobile apps

## Data Models

Core entities (see spec section 4.3 for full details):
- **User:** id, email, password_hash, preferences (JSON)
- **Article:** id, user_id, url, title, content, reading_position, is_read, is_favorite, is_archived
- **Tag:** id, user_id, name, color
- **ArticleTag:** article_id, tag_id (many-to-many)

## Key Architectural Decisions

- **Offline-first:** Queue actions when offline, sync on reconnect
- **Optimistic updates:** Update UI immediately, resolve conflicts via timestamps
- **Mobile-first responsive:** Breakpoints at 768px and 1024px
- **No tracking:** Privacy-focused, no analytics

## Performance Targets

- Article save: < 3 seconds
- List loading: < 1 second
- Reader view: < 500ms
- Search: < 500ms

## Keyboard Shortcuts (Web)

Implement these in the reader/list views:
- `A` - Archive | `F` - Favorite | `T` - Tags
- `J/K` - Navigate items | `/` - Focus search | `Esc` - Close reader
