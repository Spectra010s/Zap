# Zap Frontend

This is the frontend for the Zap application, built with React. It provides a modern, responsive interface for interacting with the Zap backend.

## Features

- 🔐 User authentication (login/register)
- 📊 Interactive dashboard
- 🎙️ Voice command interface
- 📱 Responsive design
- 🚀 Fast and efficient with React 18

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Update the `.env` file with your configuration:
   - Set `REACT_APP_API_URL` to your backend API URL (e.g., `http://localhost:8000/api/v1`)
   - Set `REACT_APP_URL` to your backend base URL (e.g., `http://localhost:8000`)
   - Uncomment and modify development settings as needed

For production, update these values to point to your production backend.

## Project Structure

```
src/
├── components/    # Reusable UI components
│   ├── common/    # Common UI elements (buttons, inputs, etc.)
│   ├── tables/    # Tables components
│   ├── theme/     # Theme components
│   ├── voice/     # Voice components
├── contexts/      # React context providers
├── pages/         # Page components
├── services/      # API service functions
├── App.js         # Main application component
└── index.js       # Application entry point
```

## Dependencies

- React 18
- React Router DOM
- Axios for API requests
- React Icons