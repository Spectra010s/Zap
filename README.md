# Zap

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

Zap is an AI-powered online accounting platform that lets you manage your business using voice commands and natural language. Easily track finances, generate reports, and handle operations — all through an intuitive, conversational interface.

## Features 

- 🎙️ Voice-controlled business management
- 🧠 AI-assisted accounting tools
- 📊 Automatic financial reports
- 💬 Natural language interface
- ☁️ Cloud-based and accessible anywhere
- 🖥️ Modern React frontend with responsive design
- 🔐 Secure authentication and user management

## Project Structure

Zap consists of two main components:

1. **Backend (FastAPI)**: Handles business logic, database operations, and AI integrations
2. **Frontend (React)**: Modern web interface for interacting with the platform

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/HDAI654/Zap.git
   cd Zap
   ```

2. Set up a Python virtual environment and install dependencies:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   ```
   
3. Set up the backend environment: 
   ```bash
   cd backend
   copy env.example .env
   # Edit .env with your configuration (required to start project !!)

4. create database tables

   ```bash
   cd backend
   python create_tables.py
   ```

5. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend API will be available at `http://localhost:8000`

#### Check more details of Backend in [Backend/README.md](backend/README.md)

### Frontend Setup

1. Navigate to the frontend directory and install dependencies:

   # In a new terminal
   ```bash
   cd frontend
   ```
   
   
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
   
3. Set up the frontend environment:
   ```bash
   copy env.example .env
   
   ```
   Edit .env to point to your backend API
   
4. Start the development server:
   ```bash
   npm start
   ```
   The frontend will open at `http://localhost:3000`

#### Check more details of Frontend in [Frontend/README.md](frontend/README.md)

## Using the Simple Panel (Legacy)

If you prefer to use the legacy simple panel:

1. Make sure the backend is running
2. Open `http://localhost:8000/simple-panel/` in your browser

## Project Structure

See full [project structure here](STRUCTURE.md)

## License

This project is licensed under the [MIT License](LICENSE).

## Contributing

We welcome contributions! Please open an issue or submit a pull request.
Or you can send me Email for collaboration.

My Email : hdai.code@gmail.com
