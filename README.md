# Noctua 🦉

Noctua is a full-stack, cross-platform application designed to be your personalized AI study companion. Instead of just reading static notes, you can upload your study materials and have Noctua instantly summarize them, explain complex topics using the ELI5 framework, or generate dynamic quizzes to test your knowledge. All of this is guided by a sassy, animated owl mascot that reacts to your learning progress. The application securely handles multi-user authentication and ensures your notes and interaction history are safely stored in the cloud.

## Tech Stack
*   **Frontend:** Next.js, React 18, Tailwind CSS, React Markdown
*   **Backend & Database:** Supabase (PostgreSQL), Supabase Auth, Row Level Security (RLS)
*   **Artificial Intelligence:** Google Gemini API
*   **Mobile Deployment:** Capacitor (Android APK)

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Database Setup:**
   Run the provided SQL scripts (`supabase-schema.sql` and `supabase-migration-auth.sql`) in your Supabase SQL editor to create the necessary tables and policies.

4. **Run the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.
