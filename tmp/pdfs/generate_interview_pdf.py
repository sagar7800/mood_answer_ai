from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Flowable,
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    Preformatted,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "output" / "pdf"
OUT_DIR.mkdir(parents=True, exist_ok=True)
PDF_PATH = OUT_DIR / "MoodAnswer-AI-Interview-Explanation.pdf"


BRAND = colors.HexColor("#4f46e5")
BRAND_DARK = colors.HexColor("#312e81")
INK = colors.HexColor("#0f172a")
MUTED = colors.HexColor("#475569")
LIGHT = colors.HexColor("#eef2ff")
SOFT = colors.HexColor("#f8fafc")
LINE = colors.HexColor("#dbeafe")


styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        name="CoverTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=30,
        leading=36,
        textColor=BRAND_DARK,
        alignment=TA_CENTER,
        spaceAfter=18,
    )
)
styles.add(
    ParagraphStyle(
        name="CoverSub",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=13,
        leading=20,
        textColor=MUTED,
        alignment=TA_CENTER,
        spaceAfter=8,
    )
)
styles.add(
    ParagraphStyle(
        name="H1",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=25,
        textColor=BRAND_DARK,
        spaceBefore=6,
        spaceAfter=10,
    )
)
styles.add(
    ParagraphStyle(
        name="H2",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=INK,
        spaceBefore=12,
        spaceAfter=7,
    )
)
styles.add(
    ParagraphStyle(
        name="Body",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10.2,
        leading=15,
        textColor=INK,
        spaceAfter=6,
    )
)
styles.add(
    ParagraphStyle(
        name="Small",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=8.8,
        leading=12.5,
        textColor=MUTED,
        spaceAfter=4,
    )
)
styles.add(
    ParagraphStyle(
        name="Callout",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=16,
        textColor=BRAND_DARK,
        backColor=LIGHT,
        borderColor=LINE,
        borderWidth=0.7,
        borderPadding=8,
        spaceBefore=8,
        spaceAfter=10,
    )
)
styles.add(
    ParagraphStyle(
        name="TableHead",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=11,
        textColor=colors.white,
        alignment=TA_LEFT,
    )
)
styles.add(
    ParagraphStyle(
        name="TableCell",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=8.3,
        leading=11.5,
        textColor=INK,
    )
)
styles.add(
    ParagraphStyle(
        name="CodeBlock",
        parent=styles["Code"],
        fontName="Courier",
        fontSize=7.7,
        leading=9.6,
        textColor=colors.HexColor("#111827"),
    )
)


class SectionRule(Flowable):
    def __init__(self, width=6.9 * inch, height=8):
        super().__init__()
        self.width = width
        self.height = height

    def draw(self):
        self.canv.setStrokeColor(LINE)
        self.canv.setLineWidth(1)
        self.canv.line(0, self.height / 2, self.width, self.height / 2)


def p(text, style="Body"):
    return Paragraph(text, styles[style])


def bullet(items):
    return ListFlowable(
        [ListItem(p(item), leftIndent=12) for item in items],
        bulletType="bullet",
        start="circle",
        leftIndent=16,
        bulletFontName="Helvetica",
        bulletFontSize=7,
        bulletColor=BRAND,
    )


def numbered(items):
    return ListFlowable(
        [ListItem(p(item), leftIndent=14) for item in items],
        bulletType="1",
        leftIndent=18,
        bulletFontName="Helvetica-Bold",
        bulletFontSize=8,
        bulletColor=BRAND,
    )


def section(title):
    return [p(title, "H1"), SectionRule(), Spacer(1, 7)]


def make_table(rows, widths):
    data = []
    for row_index, row in enumerate(rows):
        style_name = "TableHead" if row_index == 0 else "TableCell"
        data.append([p(str(cell), style_name) for cell in row])

    table = Table(data, colWidths=widths, hAlign="LEFT", repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), BRAND),
                ("BOX", (0, 0), (-1, -1), 0.6, LINE),
                ("GRID", (0, 0), (-1, -1), 0.4, LINE),
                ("BACKGROUND", (0, 1), (-1, -1), colors.white),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    return table


def card_grid(rows):
    table = Table(rows, colWidths=[2.18 * inch, 2.18 * inch, 2.18 * inch], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), SOFT),
                ("BOX", (0, 0), (-1, -1), 0.7, LINE),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.white),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ]
        )
    )
    return table


def header_footer(canvas, doc):
    canvas.saveState()
    page = canvas.getPageNumber()
    canvas.setFillColor(BRAND)
    canvas.rect(0, A4[1] - 0.22 * inch, A4[0], 0.22 * inch, fill=1, stroke=0)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(0.55 * inch, 0.36 * inch, "MoodAnswer AI - Interview Explanation")
    canvas.drawRightString(A4[0] - 0.55 * inch, 0.36 * inch, f"Page {page}")
    canvas.restoreState()


story = []

# Cover
story.extend(
    [
        Spacer(1, 1.0 * inch),
        p("MoodAnswer AI", "CoverTitle"),
        p("Interview Explanation and Working Guide", "CoverSub"),
        p("Node.js + Express + EJS MVC project with mood-aware AI chat, rooms, games, voice, history, MongoDB, Joi validation, and adaptive UI.", "CoverSub"),
        Spacer(1, 0.5 * inch),
        make_table(
            [
                ["Project Type", "Adaptive Mood-Aware Conversational Assistant"],
                ["Backend", "Node.js, Express.js, EJS, Express Router"],
                ["Database", "MongoDB with Mongoose models"],
                ["AI Layer", "Google Gemini API with OpenRouter fallback support"],
                ["Interview Goal", "Explain architecture, working flow, features, and decisions clearly"],
            ],
            [2.0 * inch, 4.7 * inch],
        ),
        Spacer(1, 0.5 * inch),
        p("One-line pitch: MoodAnswer AI is an AI assistant platform that answers user questions in a tone adapted to the user's selected mood, while also supporting FunTalk, AI Rooms, FunGames, voice features, history, and adaptive themes.", "Callout"),
        PageBreak(),
    ]
)

# Quick intro
story.extend(section("1. Interview Opening Script"))
story.append(
    p(
        "If an interviewer asks, 'Tell me about your project', use this simple explanation:",
        "Body",
    )
)
story.append(
    p(
        "I built MoodAnswer AI, a full-stack Node.js and Express project where users can log in, select their current mood, ask questions, and receive AI-generated answers in a tone that matches their mood. The app uses EJS for server-side pages, MongoDB with Mongoose for users and answer history, Joi for validation, sessions for authentication, and a service layer to call Gemini/OpenRouter AI APIs. I structured it using MVC so routes, controllers, services, models, middleware, and validators are cleanly separated.",
        "Callout",
    )
)
story.append(p("Short Hinglish version for confidence:", "H2"))
story.append(
    p(
        "Mera project MoodAnswer AI hai. Isme user login karta hai, apna mood choose karta hai, question ask karta hai, aur AI us mood ke hisaab se answer ka tone change karta hai. Backend Express/EJS MVC architecture me hai, database MongoDB hai, validation Joi se hoti hai, password bcrypt se secure hota hai, aur AI response Gemini API se generate hota hai.",
        "Body",
    )
)
story.append(p("Main project goals:", "H2"))
story.append(
    bullet(
        [
            "Give correct AI answers with mood-based tone control.",
            "Save user history so previous answers can be reviewed.",
            "Provide specialized modes: MoodAnswer, FunTalk, AI Rooms, and FunGames.",
            "Use a professional Express MVC structure suitable for scaling.",
            "Keep validation, authentication, business logic, and UI separate.",
        ]
    )
)
story.append(PageBreak())

# Problem solution
story.extend(section("2. Problem Statement and Solution"))
story.append(p("Problem:", "H2"))
story.append(
    p(
        "Normal Q&A assistants usually answer the question but do not adapt their explanation style to how the user feels. A confused student may need a step-by-step explanation, while a tired user may need a short answer. A stressed user may need a calm and compact reply.",
        "Body",
    )
)
story.append(p("Solution:", "H2"))
story.append(
    p(
        "MoodAnswer AI asks for the user's mood and answer preferences, sends that context to the AI service, and returns a structured response with answer, example, supportive line, optional safe humor, quick actions, and metadata for history.",
        "Body",
    )
)
story.append(
    card_grid(
        [
            [
                p("<b>Mood-aware Q&A</b><br/>Answers become simple, calm, short, detailed, or supportive based on mood."),
                p("<b>Adaptive Rooms</b><br/>Study Room, Coding Help, Chill Cafe, Gaming Lounge, Meme Zone, and more."),
                p("<b>History</b><br/>Every successful answer is saved with question, mood, settings, metadata, and timestamp."),
            ],
            [
                p("<b>Voice Features</b><br/>Voice input and answer read-aloud support in the chat interface."),
                p("<b>Safe Humor</b><br/>Light jokes only for safe topics; skipped for serious or sensitive questions."),
                p("<b>Clean Architecture</b><br/>Express Router, controllers, services, Mongoose models, Joi validators, middleware."),
            ],
        ]
    )
)
story.append(PageBreak())

# Stack
story.extend(section("3. Tech Stack Explanation"))
story.append(
    make_table(
        [
            ["Technology", "Where Used", "Interview Explanation"],
            ["Node.js", "Runtime", "Runs the backend JavaScript server."],
            ["Express.js", "Backend framework", "Handles routes, middleware, sessions, static files, APIs, and page rendering."],
            ["EJS", "View engine", "Renders dynamic HTML pages using res.render()."],
            ["Express Router", "routes/", "Keeps page routes and API routes modular instead of writing everything inside app.js."],
            ["MongoDB + Mongoose", "models/", "Stores users and saved answers using schemas and models."],
            ["Joi", "validators/", "Validates login, signup, answer requests, and history query inputs."],
            ["bcrypt", "utils/password.js", "Hashes and verifies passwords securely."],
            ["express-session", "app.js", "Keeps logged-in user session on the server side."],
            ["dotenv", "config/env.js", "Loads API keys, database URI, port, and session secret from .env."],
            ["morgan", "app.js", "Logs HTTP requests during development."],
            ["method-override", "app.js", "Allows HTML forms to support PUT/DELETE in future features."],
        ],
        [1.35 * inch, 1.5 * inch, 3.85 * inch],
    )
)
story.append(PageBreak())

# Architecture
story.extend(section("4. High-Level Architecture"))
story.append(p("Main request flow:", "H2"))
story.append(
    Preformatted(
        """Browser
  |
  v
Express app.js
  |
  +-- Page Routes -> Page Controller -> res.render(EJS view)
  |
  +-- API Routes -> Joi Validation -> Auth Middleware
          |
          v
       Controller
          |
          v
       Service Layer
          |
          +-- Mongoose Models -> MongoDB
          |
          +-- AI Service -> Gemini/OpenRouter API
          |
          v
       JSON response back to frontend""",
        styles["CodeBlock"],
    )
)
story.append(Spacer(1, 10))
story.append(p("Why this architecture is good:", "H2"))
story.append(
    bullet(
        [
            "app.js remains clean and only configures the application.",
            "routes/ only defines endpoints and middleware chain.",
            "controllers/ handle request and response logic.",
            "services/ contain reusable business logic and external API calls.",
            "models/ define MongoDB structure through Mongoose schemas.",
            "validators/ keep Joi validation separate from controllers.",
            "middleware/ handles authentication, validation, and error processing.",
        ]
    )
)
story.append(PageBreak())

# Folder
story.extend(section("5. Folder Structure and Responsibility"))
story.append(
    Preformatted(
        """project-root/
  app.js                  Express configuration and server startup
  config/                 Environment and database setup
  routes/                 Express Router files
  controllers/            Request/response logic
  services/               Business logic and external API calls
  models/                 Mongoose schemas
  middleware/             Auth, validation, error middleware
  validators/             Joi schemas
  utils/                  Shared helpers
  views/                  EJS pages and partials
  public/                 Static CSS, browser JS, assets, sounds, JSON data""",
        styles["CodeBlock"],
    )
)
story.append(Spacer(1, 10))
story.append(
    make_table(
        [
            ["File/Folder", "Purpose"],
            ["app.js", "Sets EJS, sessions, cookies, JSON parsing, method override, static files, routes, and errors."],
            ["routes/apiRoutes.js", "Defines /api/login, /api/signup, /api/logout, /api/session, /api/answer, /api/history."],
            ["routes/pageRoutes.js", "Defines pages like /login, /signup, /, /ask, /chat, /rooms, /history."],
            ["controllers/answerController.js", "Handles answer generation request and history response."],
            ["services/aiService.js", "Builds AI prompts, calls Gemini/OpenRouter, parses output."],
            ["models/User.js", "User schema with username, email, displayName, passwordHash, role."],
            ["models/Answer.js", "Saved answer schema with question, mood, settings, answer, metadata."],
        ],
        [1.8 * inch, 4.9 * inch],
    )
)
story.append(PageBreak())

# Working
story.extend(section("6. Complete Working Flow"))
story.append(p("A. Login flow", "H2"))
story.append(
    numbered(
        [
            "User opens /login.",
            "Express renders views/login.ejs using res.render().",
            "Frontend js/auth.js sends POST /api/login with username/email and password.",
            "apiRoutes.js validates the body with Joi loginSchema.",
            "authController.login calls userService.authenticateUser.",
            "userService checks MongoDB through the User model and verifies password using bcrypt.",
            "If valid, express-session stores user data in req.session.user.",
            "Frontend redirects user to the home page.",
        ]
    )
)
story.append(p("B. Ask question flow", "H2"))
story.append(
    numbered(
        [
            "User selects mood, language, answer length, humor, study mode, focus mode, and enters question.",
            "Frontend stores settings and opens /chat with query parameters.",
            "Chat form sends POST /api/answer.",
            "Joi validates the answer request.",
            "requireAuth middleware checks active session.",
            "answerController creates settings object and calls aiService.generateAnswer.",
            "aiService builds the system instruction and user prompt for selected mode.",
            "Gemini/OpenRouter returns structured answer text.",
            "textParser converts text into answer, example, joke, supportive line, quick actions, and metadata.",
            "historyService saves full answer data in MongoDB.",
            "Frontend shows the answer in ChatGPT-style chat UI.",
        ]
    )
)
story.append(PageBreak())

# Database
story.extend(section("7. Database Design"))
story.append(p("The project uses MongoDB with Mongoose models. This makes data structure clear and easier to maintain.", "Body"))
story.append(
    make_table(
        [
            ["Collection", "Important Fields", "Purpose"],
            ["users", "username, email, displayName, passwordHash, role", "Stores login/signup users. Password is never stored in plain text."],
            ["answers", "username, question, mood, language, answer, metadata, createdAt", "Stores each generated answer so the user can view history later."],
        ],
        [1.2 * inch, 2.6 * inch, 2.9 * inch],
    )
)
story.append(p("Answer model important fields:", "H2"))
story.append(
    bullet(
        [
            "question - the user's question.",
            "mood - selected mood such as confused, stressed, curious, or tired.",
            "assistantMode - moodanswer, funtalk, rooms, or fungames.",
            "roomName/gameMode - optional context for specialized modes.",
            "answer, example, lightJoke, supportiveLine, quickActions - structured AI response.",
            "metadata - mood used, language used, theme tag, history title, safety level, feedback labels.",
        ]
    )
)
story.append(p("Interview line:", "H2"))
story.append(
    p(
        "I used Mongoose because it gives schemas, validation at model level, indexes, and clean query methods. It also makes the database layer easier to scale compared to writing raw MongoDB queries everywhere.",
        "Callout",
    )
)
story.append(PageBreak())

# Routes
story.extend(section("8. Routes and API Endpoints"))
story.append(
    make_table(
        [
            ["Method", "Route", "Purpose"],
            ["GET", "/login", "Render login page."],
            ["GET", "/signup", "Render signup page."],
            ["GET", "/", "Render home page after authentication."],
            ["GET", "/ask", "Render ask/settings page."],
            ["GET", "/chat, /fun, /room-chat, /game-chat", "Render common chat page with different modes."],
            ["GET", "/history", "Render saved history page."],
            ["POST", "/api/login", "Validate credentials and create session."],
            ["POST", "/api/signup", "Validate signup form, create user, create session."],
            ["POST", "/api/logout", "Destroy session."],
            ["GET", "/api/session", "Check current login status."],
            ["POST", "/api/answer", "Generate AI answer and save history."],
            ["GET", "/api/history", "Return saved answers for logged-in user."],
        ],
        [0.85 * inch, 2.35 * inch, 3.5 * inch],
    )
)
story.append(p("Interview note:", "H2"))
story.append(
    p(
        "I used router.get and router.post inside separate route files instead of putting all app.get and app.post routes directly in app.js. This is still Express routing, but cleaner and more scalable.",
        "Callout",
    )
)
story.append(PageBreak())

# AI
story.extend(section("9. AI Answer Generation Working"))
story.append(p("The AI service does three main jobs:", "Body"))
story.append(
    numbered(
        [
            "Selects the correct system prompt based on assistantMode: MoodAnswer, FunTalk, Rooms, or FunGames.",
            "Builds a user prompt with question, mood, language, answer length, humor mode, supportive line, study mode, focus mode, room, game, and login mode.",
            "Calls Gemini API first, or OpenRouter fallback if configured, then parses the structured output.",
        ]
    )
)
story.append(p("AI modes:", "H2"))
story.append(
    make_table(
        [
            ["Mode", "Behavior"],
            ["MoodAnswer", "Answers real questions with mood-based tone and safety rules."],
            ["FunTalk", "Friendly casual chat, safe jokes, random fun questions, boredom relief."],
            ["AI Rooms", "Different personalities like Study Room, Coding Help, Chill Cafe, Meme Zone."],
            ["FunGames", "Safe interactive mini-games like quizzes, riddles, emoji game, rapid fire."],
        ],
        [1.4 * inch, 5.3 * inch],
    )
)
story.append(p("Structured response sections:", "H2"))
story.append(
    Preformatted(
        """Answer:
[main answer]

Example:
[example or None]

Mood-friendly line:
[supportive line or None]

Optional light humor:
[safe joke or None]

Quick actions:
[action labels]

Metadata for app:
Mood used, Language used, Theme tag, History title, Safety level, Feedback""",
        styles["CodeBlock"],
    )
)
story.append(PageBreak())

# Security
story.extend(section("10. Validation, Security, and Error Handling"))
story.append(
    make_table(
        [
            ["Area", "Implementation", "Why It Matters"],
            ["Validation", "Joi schemas in validators/", "Bad form/API data is blocked before controllers run."],
            ["Authentication", "express-session and requireAuth middleware", "Protected pages and APIs require login."],
            ["Password security", "bcrypt hashing in utils/password.js", "Plain passwords are never stored."],
            ["Environment secrets", "dotenv and .env", "API keys and database URIs stay outside source code."],
            ["Error handling", "404 and 500 middleware with error.ejs", "Users see clean error pages instead of raw stack traces."],
            ["Logging", "morgan", "Requests are visible during development and debugging."],
        ],
        [1.3 * inch, 2.2 * inch, 3.2 * inch],
    )
)
story.append(p("Validation example explanation:", "H2"))
story.append(
    p(
        "When POST /api/answer is called, the request body first goes through answerSchema. Joi checks that question and mood exist, language is allowed, answerLength is valid, and boolean fields are converted properly. Only clean validated data reaches answerController.",
        "Body",
    )
)
story.append(PageBreak())

# Frontend
story.extend(section("11. Frontend and UI Features"))
story.append(p("The frontend is served from EJS pages and static assets inside public/.", "Body"))
story.append(
    bullet(
        [
            "views/*.ejs render pages like login, signup, home, ask, chat, rooms, games, history, and settings.",
            "public/css contains feature-based CSS: global, navbar, hero, chat, mood, rooms, history, themes, responsive, animations.",
            "public/js contains browser logic: auth, chat, API calls, mood selection, voice, theme, history, settings, sound, streaks.",
            "Chat page uses a fixed bottom input like modern AI assistants.",
            "Voice button supports speech-to-text where browser support exists.",
            "Background sound mode is available for Chill Cafe, Late Night Talk, and Study Room.",
            "History page displays saved questions and opens full answer details.",
        ]
    )
)
story.append(p("Adaptive UI explanation:", "H2"))
story.append(
    p(
        "The app changes visual style using mood and room context. For example, Study Room can use a focused theme, Chill Cafe can use a calm cafe vibe, and tired mood can use a softer low-energy theme. This makes the app feel more personalized.",
        "Body",
    )
)
story.append(PageBreak())

# Demo script
story.extend(section("12. Demo Script for Interview"))
story.append(p("Use this demo order during an interview:", "Body"))
story.append(
    numbered(
        [
            "Start the app with npm run dev and open http://localhost:3000.",
            "Show login page and explain express-session plus bcrypt password hashing.",
            "Login and open the home page.",
            "Open Ask page, select mood as Confused, language as English, answer length as Medium, enable Study mode.",
            "Ask: What is JavaScript?",
            "Show chat page: user question appears, typing animation runs, AI answer appears below.",
            "Explain that /api/answer validates with Joi, calls AI service, saves answer with Mongoose.",
            "Open History page and show the saved question plus detail view.",
            "Open Rooms page and show Study Room or Chill Cafe.",
            "Explain future improvements: production session store, tests, deployment, and better analytics.",
        ]
    )
)
story.append(p("If interviewer asks why Express + EJS:", "H2"))
story.append(
    p(
        "I chose EJS because it is simple, beginner-friendly, and good for server-rendered pages. Express handles routes and middleware cleanly, while static browser JS handles dynamic chat interactions.",
        "Callout",
    )
)
story.append(PageBreak())

# Q&A
story.extend(section("13. Interview Questions and Answers"))
qa_rows = [
    ["Question", "Best Answer"],
    [
        "Why did you use MVC?",
        "MVC separates responsibilities. Routes define URLs, controllers handle request/response, services handle business logic, models handle database structure, and views render UI. This keeps code clean and scalable.",
    ],
    [
        "Why Joi instead of express-validator?",
        "Joi gives reusable schema-based validation. It is easy to validate body and query data before controllers run.",
    ],
    [
        "How is authentication working?",
        "User submits login form, Joi validates it, bcrypt verifies password, then express-session stores user data in req.session.user. Protected routes use requireAuth middleware.",
    ],
    [
        "How is AI response generated?",
        "The frontend sends question and settings to /api/answer. The backend builds a prompt based on mood, room, and preferences, calls Gemini/OpenRouter, parses the structured response, saves it, and returns JSON.",
    ],
    [
        "How is history saved?",
        "After successful AI generation, answerController calls historyService.saveAnswer, which stores question, settings, answer, metadata, and timestamp in MongoDB through the Answer model.",
    ],
    [
        "What was the hardest part?",
        "Combining mood-aware prompt behavior, safe humor rules, multiple assistant modes, and clean MVC architecture while keeping the UI simple.",
    ],
]
story.append(make_table(qa_rows, [2.05 * inch, 4.65 * inch]))
story.append(PageBreak())

# Run and explain
story.extend(section("14. Commands and Environment"))
story.append(p("Install dependencies:", "H2"))
story.append(Preformatted("npm install", styles["CodeBlock"]))
story.append(p("Run in development:", "H2"))
story.append(Preformatted("npm run dev", styles["CodeBlock"]))
story.append(p("Run normally:", "H2"))
story.append(Preformatted("npm start", styles["CodeBlock"]))
story.append(p("Important .env variables:", "H2"))
story.append(
    Preformatted(
        """GEMINI_API_KEY=your_google_ai_studio_key
GEMINI_MODEL=gemini-2.5-flash
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=moodwise
SESSION_SECRET=long_random_secret
LOGIN_USERNAME=admin
LOGIN_PASSWORD=your_password""",
        styles["CodeBlock"],
    )
)
story.append(p("Do not expose .env in GitHub. Keep .env in .gitignore.", "Callout"))
story.append(PageBreak())

# Closing
story.extend(section("15. Final Summary"))
story.append(
    p(
        "MoodAnswer AI is not only a simple chatbot. It is a multi-mode conversational platform with mood-aware answers, adaptive rooms, safe fun chat, mini-games, voice support, answer history, and an MVC Express backend.",
        "Body",
    )
)
story.append(p("Final 30-second answer:", "H2"))
story.append(
    p(
        "MoodAnswer AI is my full-stack Node.js project. It uses Express and EJS for server-rendered pages, MongoDB and Mongoose for persistence, Joi for validation, bcrypt and sessions for authentication, and Gemini/OpenRouter for AI responses. The unique feature is mood-aware answering: the user selects mood and preferences, then the backend builds a safe structured prompt, generates an answer, saves it in history, and shows it in a modern chat UI. I followed MVC architecture so the project is clean, modular, and easy to scale.",
        "Callout",
    )
)
story.append(p("Future improvements:", "H2"))
story.append(
    bullet(
        [
            "Use MongoDB-backed session store for production.",
            "Add automated tests for auth, answer, history, and validation.",
            "Add delete/favorite history features with PUT/DELETE routes.",
            "Add analytics dashboard for moods, rooms, questions, and streaks.",
            "Deploy on Render/Railway with secure environment variables.",
        ]
    )
)


doc = SimpleDocTemplate(
    str(PDF_PATH),
    pagesize=A4,
    rightMargin=0.55 * inch,
    leftMargin=0.55 * inch,
    topMargin=0.62 * inch,
    bottomMargin=0.62 * inch,
    title="MoodAnswer AI Interview Explanation",
    author="MoodAnswer AI",
)
doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
print(PDF_PATH)
