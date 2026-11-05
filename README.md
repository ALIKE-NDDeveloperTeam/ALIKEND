# Alikend Shop – Frontend + Backend (alada)

alikend-shop-split/
├── backend/    -> Express + MongoDB API   (port 5000)
└── frontend/   -> React + Vite website    (port 5173)

## Lagbe
- Node.js 18+ (nodejs.org theke install koro)

## 1) Backend chalao (Terminal 1)
    cd backend
    npm install
    copy .env.example .env      (Mac/Linux: cp .env.example .env)
    npm run dev
-> http://localhost:5000/api/health  e {"status":"ok"} dekhle thik ache.
MONGO_URI khali thakle in-memory mode-e cholbe (restart dile data jabe).
Real database chaile .env e MONGO_URI (MongoDB Atlas) boshao.

## 2) Frontend chalao (Terminal 2)
    cd frontend
    npm install
    npm run dev
-> Browser e kholo: http://localhost:5173

Frontend er /api ar /uploads request auto backend (localhost:5000) e jabe (vite.config.ts proxy).
Backend onno port-e chalale frontend/.env e VITE_BACKEND_URL dao.

## Production build (frontend)
    cd frontend && npm run build   -> dist/ folder ta hosting e upload koro
