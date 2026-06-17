# AI Code Reviewer

An intelligent code reviewing application built using the MERN stack and Google Gemini API.
It features a React frontend with a Monaco Editor providing an IDE-like experience, and an Express backend that communicates with the Gemini API to analyze code syntax and logic.

## Features
- **Integrated Google Gemini API**: Uses prompt engineering to analyze code syntax and logic.
- **Intelligent Parser**: Separates code context from natural language instructions for accurate feedback.
- **IDE-like Frontend**: Built with React and `@monaco-editor/react` to display syntax highlighting and code perfectly.
- **MERN Stack**: MongoDB, Express, React, Node.js.

## Setup Instructions

### Prerequisites
- Node.js installed
- Google Gemini API Key

### Backend Setup
1. Navigate to the `backend` directory.
2. Run `npm install`
3. Create a `.env` file in the `backend` directory and add your Gemini API Key:
   ```
   GEMINI_API_KEY=your_api_key_here
   PORT=3000
   ```
4. Run `npm start` to start the backend server.

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Run `npm install`
3. Run `npm run dev` to start the Vite development server.
