# MoodAnswer AI

MoodAnswer AI is an adaptive mood-aware conversational assistant. It lets users ask questions, choose their current mood, control answer style, use voice input, save history, open specialized AI rooms, and play safe mini-games through FunGames AI.

## Features

- Mood-aware answers for normal, confused, stressed, sad, angry, curious, and tired users.
- Adaptive AI Rooms with different conversation personalities.
- FunTalk mode for safe casual chatting and light entertainment.
- FunGames AI mode with Truth or Dare, Quiz Challenge, Guessing Game, Emoji Game, Riddles, Would You Rather, Rapid Fire, Meme Challenge, Word Association, and This or That.
- EmotionTheme AI adaptive UI themes for mood, room, time of day, and device type.
- Local streak stats for learning streaks, questions asked, and games completed.
- Background Sound Mode for Chill Cafe, Late Night Talk, and Study Room.
- Voice input and answer read-aloud support.
- Login, signup, saved answer history, and MongoDB-backed persistence.
- Humor, supportive line, study mode, focus mode, language, and answer-length controls.
- Responsive layout with fixed bottom chat composer.
- Express + EJS MVC architecture with Joi validation, Mongoose models, controllers, services, routers, reusable middleware, and error pages.

## Folder Structure

```text
project-root/
├── app.js
├── server.js
├── package.json
├── .env
├── .gitignore
├── config/
│   ├── database.js
│   └── env.js
├── routes/
│   ├── apiRoutes.js
│   └── pageRoutes.js
├── controllers/
│   ├── answerController.js
│   ├── authController.js
│   └── pageController.js
├── models/
│   ├── Answer.js
│   └── User.js
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   └── validate.js
├── validators/
│   ├── answerValidator.js
│   └── authValidator.js
├── services/
│   ├── aiService.js
│   ├── historyService.js
│   └── userService.js
├── utils/
│   ├── asyncHandler.js
│   ├── password.js
│   └── textParser.js
├── public/
│   ├── css/
│   ├── js/
│   ├── assets/
│   ├── data/
│   └── pages/
├── views/
│   ├── partials/
│   ├── layouts/
│   ├── home.ejs
│   ├── ask.ejs
│   ├── chat.ejs
│   ├── login.ejs
│   ├── signup.ejs
│   ├── rooms.ejs
│   ├── games.ejs
│   ├── features.ejs
│   ├── history.ejs
│   ├── settings.ejs
│   └── error.ejs
├── components/
├── pages/
└── README.md
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Add environment variables in `.env`:

```bash
GEMINI_API_KEY=your_key_here
MONGODB_URI=your_mongodb_uri_here
MONGODB_DB=moodwise
SESSION_SECRET=replace_this_with_a_long_random_secret
LOGIN_USERNAME=admin
LOGIN_PASSWORD=your_password_here
```

3. Start the app in development:

```bash
npm run dev
```

4. Or start the app in normal mode:

```bash
npm start
```

5. Open:

```text
http://localhost:3000
```

## Architecture Notes

- `app.js` configures Express, EJS, sessions, cookies, logging, static files, and error handling.
- `routes/` maps page and API routes with Express Router.
- `controllers/` owns request/response behavior.
- `services/` owns business logic such as AI generation, user creation, and history storage.
- `models/` contains Mongoose schemas for users and saved answers.
- `validators/` contains Joi schemas for login, signup, answer generation, and history query validation.
- `middleware/` contains reusable auth, validation, and error middleware.
- `views/` contains EJS pages, partials, layouts, and error templates.
- `public/` contains browser assets: CSS, JavaScript, images/assets, static data, room pages, and sounds.

## Future Improvements

- Move repeated page navigation fully into EJS partials.
- Add MongoDB-backed session storage for production scale.
- Add room-specific icons and background assets.
- Add a visual theme preview panel in Settings.
- Add score persistence and multiplayer-style game rooms for FunGames AI.
- Add service-worker caching for faster local loads.
- Add end-to-end tests for login, ask, chat, history, and rooms.
- Convert frontend scripts to ES modules when the project grows further.
