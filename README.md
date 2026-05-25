# elmigrante

Projeto separado em dois apps:

- `frontend/`: React
- `backend/`: Node.js + Express + Supabase

## Estrutura

```text
elmigrante/
  frontend/
  backend/
```

## Rodando localmente

### Frontend

```bash
cd frontend
npm install
npm start
```

Variavel de ambiente:

```bash
REACT_APP_API_URL=http://localhost:4000
```

### Backend

```bash
cd backend
npm install
npm run dev
```

Variaveis de ambiente:

```bash
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CLIENT_ORIGIN=http://localhost:3000
PORT=4000
```

## Deploy

- `frontend/` pode ir para a Vercel
- `backend/` deve ir para Railway, Render ou outro host Node

## GitHub

Depois da revisao final da estrutura, publique normalmente:

```bash
git add .
git commit -m "Separate frontend and backend"
git push
```
