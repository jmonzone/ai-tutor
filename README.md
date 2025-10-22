# AI Study Tutor

**Live Demo:** [https://studyfetch-ai-tutor.vercel.app](https://studyfetch-ai-tutor.vercel.app)

A conversational AI tutor that helps students understand PDF documents through interactive dialogue, highlighting, and voice features.

---

## 🧩 Overview

The AI Tutor enables users to upload PDFs and engage in real-time conversation with an AI assistant that can:

- Reference specific pages and passages
- Highlight and annotate text dynamically
- Summarize sections
- Support **voice input/output** for hands-free learning

The goal is to create an intuitive and powerful study companion that merges document comprehension with conversational AI.

---

## 🚀 Key Features

- **Authentication**  
  Email/password signup, login, logout, and session validation

- **PDF Upload & Storage**  
  Upload documents to AWS S3 and view them in-app

- **Interactive Chat Interface**  
  Real-time AI chat powered by OpenAI’s API  
  Message persistence across sessions

- **Voice Input & Output**  
  Speech recognition and TTS integration for natural dialogue

- **AI-Powered Document Control**  
  The AI can highlight, annotate, and summarize PDF content  
  References page numbers and related sections automatically

- **Data Persistence**  
  MongoDB database to store users, PDFs, and conversations

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14+ (App Router), Tailwind CSS
- **Backend:** Node.js API routes with MongoDB (Mongoose)
- **AI Integration:** OpenAI API (Vercel AI SDK compatible)
- **Storage:** AWS S3
- **Deployment:** Vercel

---

## 🔐 Environment Variables

The repository is public; request credentials to run locally.

---

## ⚙️ Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/jonanmonzon/studyfetch-ai-tutor.git
   cd studyfetch-ai-tutor
   ```
2. **Install dependencies**

   ```npm install

   ```

3. **Add environment variables**

- Copy .env.example → .env
- Fill in API keys and credentials

4. **Run the development server**

```npm run dev

```

5. **Visit locally**

```http://localhost:3000
``1
```
