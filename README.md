# Pocket App

A self-hostable read-it-later application. Save articles from the web to read later in a clean, distraction-free interface.

## Features

- Save articles by URL with automatic content extraction
- Clean reader view
- Mark articles as read/unread
- Archive articles
- Search by title
- Cross-device sync (planned)
- Offline support (planned)

## Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/rohitm-1729/pocket-app.git
cd pocket-app

# Copy environment file
cp .env.example .env

# Start the application
docker-compose up
```

The API will be available at `http://localhost:8000` and the frontend at `http://localhost:5173`.

### Manual Setup

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create data directory
mkdir -p data

# Run migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for the interactive API documentation.

## Tech Stack

- **Backend:** Python, FastAPI, SQLAlchemy, SQLite
- **Frontend:** React, TypeScript, Vite, TanStack Query, Tailwind CSS
- **Content Parsing:** trafilatura

## Development

### Running Tests

```bash
cd backend
pytest
```

### Project Structure

```
pocket-app/
├── backend/
│   ├── app/
│   │   ├── models/      # SQLAlchemy models
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── routes/      # API endpoints
│   │   └── services/    # Business logic
│   ├── alembic/         # Database migrations
│   └── tests/           # Test files
├── frontend/
│   └── src/
├── docker-compose.yml
└── README.md
```

## License

MIT
