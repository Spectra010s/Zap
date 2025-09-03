# Zap Project Structure

```
Zap/
├── backend/                      # Backend FastAPI application
│   ├── api/                      # All API routes grouped by version
│   │   ├── v1/
│   │   │   ├── endpoints/       # Route handlers (login, query, etc)
│   │   │   │   ├── auth.py     # Login, logout, register
│   │   │   │   ├── user.py     # User profile, settings
│   │   │   │   ├── voice.py    # Upload & transcribe voice
│   │   │   │   └── tables.py   # List & manage user tables
│   │   │   └── __init__.py
│   │   └── __init__.py
│   │
│   ├── auth/                     # Authentication logic
│   │   ├── session_manager.py   # Create, read, delete session cookies
│   │   ├── dependencies.py      # get_current_user() for route protection
│   │   └── security.py          # Password hashing & verification
│   │
│   ├── core/                     # App-wide config and startup
│   │   ├── config.py            # Environment vars (DB, secrets, session)
│   │   └── logger.js            # Global logger
│   │
│   ├── db/                       # DB connection, models, and CRUD
│   │   ├── session.py           # DB session management (SQLAlchemy)
│   │   ├── base.py              # Declarative base model
│   │   ├── models/              # SQLAlchemy ORM models
│   │   │   ├── user.py          # User table schema
│   │   │   └── session.py       # Session storage model
│   │   └── crud/                # DB operations (Create/Read/Update/Delete)
│   │       ├── user.py
│   │       ├── session.py
│   │       └── table.py
│   │
│   ├── services/                 # Core logic & LLM integrations
│   │   ├── voice_to_text.py     # Convert voice to text (API)
│   │   ├── rag_builder.py       # Build prompt with question + table (RAG)
│   │   ├── llm_client.py        # Send prompt to LLM and get response
│   │   ├── manager.py           # Manage all processes after user question
│   │   ├── change_compiler.py   # Compile and execute table changes
│   │   └── response_parser.py   # Parse model output into final answer
│   │
│   ├── middleware/               # Custom FastAPI middlewares
│   │   └── cors.py              # CORS configuration
│   │
│   ├── tests/                   # Unit and integration tests
│   │
│   ├── simple_panel.html        # Legacy simple panel files
│   ├── create_tables.py         # Create tables
│   ├── env.example              # example for enviroment variables
│   ├── main.py                  # Entry point for FastAPI app
│   └── README.md                # Backend documentation
│
├── frontend/                      # React frontend application
│   ├── public/            # Static files
│   │      index.html      # Main HTML file
│   │      manifest.json   # Web app manifest
│   │      robots.txt      # Robots.txt file
│   │      
│   ├── src/
│   │   ├── components/           # Reusable UI components 
│   │   │   ├── common/           # Common UI elements (buttons, inputs, etc.)
│   │   │   │   ├── ErrorBoundary.js      # Error boundary component
│   │   │   │   └── LoadingSpinner.js     # Loading spinner component
│   │   │   │
│   │   │   ├── tables/                      # Tables components     
│   │   │   │   ├── CreateTable.js           # Create table component
│   │   │   │   ├── TableExportImport.js     # Table export and import component
│   │   │   │   ├── EditTable.js             # Edit table component
│   │   │   │   ├── TableDetails.js          # Table details component
│   │   │   │   └── TableList.js             # Table list component
│   │   │   │
│   │   │   ├── theme/                     # Theme components
│   │   │   │   └── themeToggle.js         # Theme toggle component
│   │   │   │
│   │   │   ├── voice/                     # Voice components
│   │   │   │   └── voiceControl.js        # Voice control component
│   │   │   │
│   │   │   └── layout.js                  # Layout components
│   │   │
│   │   ├── contexts/             # React context providers
│   │   │   ├── AuthContext.js    # Authentication context
│   │   │   ├── VoiceContext.js   # Voice context
│   │   │   └── ThemeContext.js   # Theme context
│   │   │
│   │   ├── pages/                # Page components
│   │   │   ├── Login.js            # Authentication pages
│   │   │   ├── Dashboard.js       # Main dashboard
│   │   │   ├── Settings.js        # Settings page
│   │   │   └── Register.js        # Registration page
│   │   │
│   │   ├── services/             # API services
│   │   │   ├── commandService.js # Command service functions
│   │   │   ├── tableService.js   # Table service functions
│   │   │   ├── tableExportImportService.js # Table exp and im service functions
│   │   │   └── api.js            # API service functions
│   │   │
│   │   ├── App.js                # Main App component
│   │   ├── reportWebVitals.js    # Web vitals reporting
│   │   └── index.js              # Entry point
│   │
│   ├── package-lock.json         # Package lock file
│   ├── package.json              # Frontend dependencies
│   ├── env.example              # example for enviroment variables
│   └── README.md                 # Frontend documentation
│
│
├── .gitignore                    # Git ignore file
├── LICENSE                       # Project license
├── ENV_CONFIG.md                 # Env configuration guide
├── requirements.txt              # Python dependencies
├── STRUCTURE.md                  # Project structure
└── README.md                     # Project overview and setup instructions

```
