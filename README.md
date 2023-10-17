# UniTalk: Auto-Translating Chat Platform 🌐

UniTalk is a chat platform designed to break language barriers, providing real-time auto-translations for seamless conversations. Built with a React frontend using Next.js (in TypeScript) and a Python backend integrated with Flask, LibreTranslate, Socket.io, and SQLite.

## Demo
https://github.com/poudyalankit/UniTalk/assets/70168633/68267624-b61f-44ae-bf85-ecbceaaa16d3

## Features

- Real-time message translation.
- Instant chat experience with Socket.io.
- Multi-language support through LibreTranslate.

## Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- [Python](https://www.python.org/)
- [npm](https://www.npmjs.com/)

## Setup and Running the Project

### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install the required dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run start
   ```

### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. If you haven't set up a virtual environment, it's a good practice to do so:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

3. Install the required Python packages using the `requirements.txt` file:
   ```
   pip install -r requirements.txt
   ```

4. Start the Flask server:
   ```
   flask run --port=3001
   ```

With both servers running, open your browser and navigate to [http://localhost:3000](http://localhost:3000) to access UniTalk.

## Contributions

Feel free to fork the project, open a PR or submit an issue for any suggestions, improvements or fixes.

## License

This project is licensed under the MIT License. See `LICENSE` file for details.
