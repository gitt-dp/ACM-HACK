SchemeAI - Government Scheme Assistant
SchemeAI is a smart assistant that helps Indian citizens discover and understand government schemes they may be eligible for. Users can interact via a conversational interface (chatbot) to ask questions, get personalized scheme recommendations, and receive guidance on application procedures.

✨ Features
User Authentication – Secure sign-up/login using Supabase Auth (email/password).

Personalized Chatbot – AI-powered assistant that answers queries about government schemes.

Scheme Discovery – Get scheme recommendations based on user profile and eligibility criteria.

Voice Support – Voice input (Chrome only) for hands-free interaction.

Multi-language Support – Dropdown to select preferred language (planned).

Persistent Sessions – User data and chat history stored in Supabase for continuity.

🛠️ Tech Stack
Frontend: React (Vite), Tailwind CSS, React Router

Backend: Node.js (Express) – handles chatbot logic, external API integrations, and business logic

Database & Auth: Supabase (PostgreSQL, Authentication, Realtime)

Deployment: (e.g., Vercel for frontend, Render/Fly.io for backend)

Other Tools: Supabase JS SDK, React Context API, Axios

🚀 Getting Started
Prerequisites
Node.js (v18+)

npm or yarn

Supabase account and project

Environment Variables
Create .env files in both frontend and backend directories.

Frontend (.env):

text
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
Backend (.env):

text
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=5000
Installation
Clone the repository

bash
git clone https://github.com/yourusername/schemeai.git
cd schemeai
Install frontend dependencies

bash
cd frontend
npm install
Install backend dependencies

bash
cd ../backend
npm install
Set up your Supabase database tables (see schema below).

Run the development servers

Frontend: npm run dev (runs on http://localhost:5173)

Backend: npm run dev (runs on http://localhost:5000)

📁 Project Structure
text
schemeai/
├── frontend/               # React app (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # UserContext (authentication state)
│   │   ├── pages/          # AuthPage, ChatPage, etc.
│   │   ├── supabase.js     # Supabase client initialization
│   │   └── App.jsx
│   └── package.json
├── backend/                # Node.js/Express server
│   ├── routes/
│   ├── controllers/
│   ├── services/           # Chatbot logic, external API calls
│   ├── supabase.js         # Supabase admin client
│   └── server.js
└── README.md
🔐 Authentication Flow
Users sign up/login via the AuthPage (styled with gradient background).

Supabase handles authentication and returns a session.

The session is stored in localStorage (session ID) and used to persist user data across refreshes.

UserContext provides global access to user data and syncs with Supabase user_sessions table (optional, for additional user metadata).

🗄️ Database Schema (Supabase)
Table: profiles (extends auth.users)

id (uuid, references auth.users)

full_name (text)

phone (text)

age (int)

state (text)

created_at (timestamp)

Table: user_sessions (for storing session-specific data)

session_id (text, primary key)

user_data (jsonb) – stores user preferences or temporary data

updated_at (timestamp)

Table: chat_history

id (uuid)

user_id (uuid, references auth.users)

message (text)

response (text)

timestamp (timestamp)

(Adjust schema based on your actual requirements.)

🧠 Chatbot Integration
The chatbot backend (Node.js) can be powered by:

A custom NLP model or rules-based engine

Integration with external APIs (e.g., OpenAI, government portals)

Predefined FAQs and scheme database

The frontend communicates with the backend via REST endpoints (e.g., /api/chat).

🌐 Deployment
Frontend (Vercel)
Push your code to GitHub.

Import project into Vercel.

Add environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).

Deploy.

Backend (Render / Fly.io)
Create a new Web Service.

Connect your GitHub repository (backend directory as root).

Set environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PORT).

Deploy.
Prerequisites – Node.js, npm/yarn, Supabase account.

Environment variables – What to set in .env files for both frontend and backend.

Installation – Commands to clone, install dependencies for frontend and backend.

Running the development servers – npm run dev for frontend (Vite) and backend (Node.js

🤝 Contributing
Contributions are welcome! Please open an issue or submit a pull request.

📄 License
MIT License – see LICENSE file for details.

Built for Bharat – Empowering citizens with easy access to government welfare schemes. 🇮🇳
