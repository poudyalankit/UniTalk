# UniTalk: Auto-Translating Chat Platform 🌐

UniTalk is a chat platform designed to break language barriers, providing real-time auto-translations for seamless conversations. Built with an Angular frontend using TypeScript with Tailwind CSS for styling and a backend integrated with LibreTranslate and Firebase.

## Features

- Real-time message translation.
- Instant chat experience.
- Multi-language support through LibreTranslate.

## Technologies Used

- Angular
- TypeScript
- LibreTranslate
- Firebase
- Tailwind CSS

## Live Demo

Check out the live demo at [unitalk.ankitpoudyal.com](http://unitalk.ankitpoudyal.com).

## Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

## Setup and Running the Project

### Frontend

1. Create a Firestore database on Google Firebase.
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Create an `environment.ts` file inside the `src/environments` folder which will include your Firebase environment variables. For example:
   ```typescript
   export const environment = {
       production: true,
       firebase: {
           apiKey: "",
           authDomain: "",
           projectId: "",
           storageBucket: "",
           messagingSenderId: "",
           appId: ""
       }
   };
   ```
4. Start the development server:
   ```bash
   npm run start
   ```
5. Open your browser and navigate to `http://localhost:4200` to access UniTalk.

## Contributions

Feel free to fork the project, open a PR, or submit an issue for any suggestions, improvements, or fixes.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.