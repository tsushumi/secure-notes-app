# Secure Notes

A full-stack private notes app. Users register, log in, and manage notes that no one else can see.

**Stack:** Express, Prisma, PostgreSQL (Supabase or Neon), React (Vite)
**Security:** bcrypt, JWT in an httpOnly cookie, Zod validation, Helmet, CORS, rate limiting, resource-level authorization

## Features

- Register, log in, log out (JWT stored in an httpOnly cookie)
- Create, read, update, delete notes. Every note belongs to one user.
- Pin notes (pinned always sort first), categories, search by title/content
- **Bonus:** Markdown rendering, tags with filtering, public share links (per-note toggle), dark mode
- Role-based access: `ADMIN` users can read aggregate stats (`/api/admin/stats`), never note content

## Setup

You need Node 18+ and a PostgreSQL database (a free Supabase or Neon project works).

### 1. Backend

```bash
cd server
cp .env.example .env        # then edit .env
npm install                 # also runs `prisma generate`
npx prisma migrate dev --name init
npm run dev                 # http://localhost:4000
```

In `.env`, set `DATABASE_URL` to your connection string and generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste the output as `JWT_SECRET`. The server refuses to start without it.


### 2. Frontend

```bash
cd client
npm install
npm run dev                 # http://localhost:5173
```

The client talks to `http://localhost:4000/api` in development. Set `VITE_API_URL` (see `client/.env.example`) if your API lives elsewhere.

### Making an admin

Registration always creates a `USER`. To promote one, run `npx prisma studio` in `server/` and change the user's `role` to `ADMIN`.

## API

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Create account, sets auth cookie | No |
| POST | `/api/auth/login` | Log in, sets auth cookie | No |
| POST | `/api/auth/logout` | Clears auth cookie | No |
| GET | `/api/auth/me` | Current user | Yes |
| GET | `/api/notes` | List own notes. Query: `search`, `category`, `tag`, `sortBy`, `order` | Yes |
| POST | `/api/notes` | Create note | Yes |
| GET | `/api/notes/:id` | Get one note | Owner |
| PUT | `/api/notes/:id` | Update note | Owner |
| DELETE | `/api/notes/:id` | Delete note | Owner |
| PATCH | `/api/notes/:id/pin` | Toggle pin | Owner |
| PATCH | `/api/notes/:id/share` | Toggle public link | Owner |
| GET | `/api/public/notes/:shareId` | Read a shared note | No |
| GET | `/api/admin/stats` | User/note counts | Admin |

## curl

Cookies are stored in a jar. Mutating requests need the `X-Requested-With` header.

```bash
H='-H Content-Type:application/json -H X-Requested-With:XMLHttpRequest'

curl -c jar.txt $H -X POST http://localhost:4000/api/auth/register \
  -d '{"email":"test@mail.com","password":"testPass123","name":"Test User"}'

curl -b jar.txt $H -X POST http://localhost:4000/api/notes \
  -d '{"title":"First","content":"**hello**","category":"Personal","tags":["demo"]}'

curl -b jar.txt "http://localhost:4000/api/notes?search=first&tag=demo"

# Without the header, the request is rejected:
curl -b jar.txt -X POST http://localhost:4000/api/notes -H Content-Type:application/json -d '{}'   # 403
```

## Demo video 

<video src="https://github.com/user-attachments/assets/6b9a55f3-fc44-4cf6-9fde-4e774eb9d6cc" width="100%" controls>
</video>




