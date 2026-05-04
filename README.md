# AI Proposal Generator

A full-stack web application that automatically generates professional project proposals using AI (Claude Haiku via Anthropic API).

## Technology Stack

- **Frontend:** React.js + Tailwind CSS + Axios + Vite
- **Backend:** Node.js with Express.js
- **AI Integration:** Anthropic API (claude-haiku-4-5-20251001)
- **PDF Export:** jsPDF (optional feature)
- **Version Control:** Git

## Project Structure

```
ai-proposal-generator/
├── client/                   # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProposalForm.jsx
│   │   │   ├── ProposalOutput.jsx
│   │   │   └── ProposalSection.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── server/                   # Express backend
│   ├── routes/
│   │   └── proposal.js
│   ├── controllers/
│   │   └── proposalController.js
│   ├── services/
│   │   └── aiService.js
│   ├── index.js
│   └── package.json
├── .env
├── .gitignore
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Anthropic API key

### Installation

1. Clone the repository and navigate to project root:
```bash
cd ai-proposal-generator
```

2. **Setup Backend:**
```bash
cd server
npm install
```

3. **Setup Frontend:**
```bash
cd ../client
npm install
```

4. **Environment Configuration:**
Create a `.env` file in the root directory:
```
ANTHROPIC_API_KEY=your-api-key-here
PORT=5000
NODE_ENV=development
```

### Running the Application

**Terminal 1 - Start Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Start Frontend:**
```bash
cd client
npm run dev
```

The application will be available at `http://localhost:5173` (Vite default port).

## Features

- **Client Details Input:** Staff enter project and client information
- **AI-Powered Generation:** Automatic proposal generation using Claude Haiku
- **Professional Output:** Structured, formatted proposal sections
- **PDF Export:** Download proposals as PDF (optional)

## API Endpoints

- `POST /api/proposal/generate` - Generate proposal from client details

## Module Implementation Plan

The application will be built in the following order:
1. Backend Setup & AI Service Integration
2. API Routes and Controllers
3. Frontend Components (Form, Output, Display)
4. Integration and Testing

---

*More details will be added as development progresses.*
