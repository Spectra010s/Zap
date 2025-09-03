# Zap Backend

This is the backend for the Zap application, built with FastAPI. It provides the API endpoints and business logic for the Zap platform.

## Features

- 🚀 FastAPI for high performance
- 🔐 JWT Authentication
- 🗄️ SQLAlchemy ORM
- 📊 Database migrations
- 📝 API documentation with Swagger UI
- 🛡️ CORS enabled
- 📈 Logging and error handling

## Getting Started

### Prerequisites

- Python 3.8+
- pip (Python package manager)
- SQLite (for development)

### Installation

1. Clone the repository if you haven't already:
   ```bash
   git clone https://github.com/HDAI654/Zap.git
   cd Zap/backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r ../requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. Initialize the database:
   ```bash
   python create_tables.py
   ```

6. Start the development server:
   ```bash
   uvicorn main:app --reload
   ```

## Project Structure

```
backend/
├── api/              # API routes and endpoints
│   └── v1/           # API version 1
├── auth/             # Authentication and authorization
├── core/             # Core configurations and utilities
├── db/               # Database models and CRUD operations
│   ├── crud/         # Database operations
│   ├── models/       # SQLAlchemy models
│   └── database.py   # Database connection
├── services/         # Business logic and external services
├── main.py           # Application entry point
└── create_tables.py  # Database initialization
```


### Once the server is running, you can access the following:

- **Simple Panel**: http://localhost:8000/simple-panel/

## Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Update the `.env` file with your configuration. See [ENV_CONFIG.md](../ENV_CONFIG.md) for detailed explanations of each variable.

3. Required configurations:
   - Set `SECRET_KEY` to a secure random string
   - Configure `ALLOWED_ORIGINS` with your frontend URL
   - Set up external API keys if using those features

## Development

### Running Tests

To run the test suite:

```bash
pytest
```

### Code Style

This project uses `black` for code formatting and `isort` for import sorting. Before committing, run:

```bash
black .
isort .
```

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
