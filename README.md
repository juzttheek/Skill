# ServiceHire

ServiceHire is a full-stack marketplace platform that connects clients with skilled workers for service listings and job-based hiring. Clients can post jobs and hire talent, while workers can publish services, apply to jobs, and manage ongoing work.

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose, JWT, Socket.IO
- Frontend: React, Vite, React Router, Axios, React Hook Form, React Hot Toast
- Real-time: Socket.IO for messaging events
- Validation and Security: express-validator, express-rate-limit, role-based route protection

## Features

- Authentication and authorization with JWT
- Role-based dashboard experience for clients and workers
- Service listing creation and management
- Job posting, job applications, and application acceptance flow
- Real-time and API-based messaging support
- Reviews and worker rating aggregation
- Responsive UI with loading skeletons and fallback error boundary
- Input validation on backend POST/PUT routes and frontend forms

## Project Structure

- server: Express API, database models, controllers, middleware
- client: React app with routes, pages, reusable UI components
- root scripts: unified development and build workflows

## Environment Variables

### Server (.env)

Use [server/.env.example](server/.env.example) as a template:

- PORT
- NODE_ENV
- MONGO_URI
- JWT_SECRET
- CLIENT_URL
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

### Client (.env)

Use [client/.env.example](client/.env.example) as a template:

- VITE_API_URL

## Local Setup

1. Install root dependencies:

```bash
npm install
```

2. Install server dependencies:

```bash
cd server
npm install
```

3. Install client dependencies:

```bash
cd ../client
npm install
```

4. Create environment files from examples:

- Copy `server/.env.example` to `server/.env`
- Copy `client/.env.example` to `client/.env`

5. Start both apps from root:

```bash
cd ..
npm run dev
```

## Production Build

From project root:

```bash
npm run build
```

The backend is configured to serve `client/dist` in production mode and route non-API requests to the frontend SPA entry file.

## API Summary

- `POST /api/auth/register` and `POST /api/auth/login`
- `GET /api/auth/me`
- `GET/POST/PUT/DELETE /api/services`
- `GET/POST/PUT/DELETE /api/jobs`
- `POST /api/jobs/:id/apply`
- `GET /api/jobs/:id/applications`
- `PATCH /api/jobs/:jobId/applications/:applicationId/accept`
- `POST /api/messages`, `GET /api/messages/conversations`, `GET /api/messages/:otherUserId`
- `POST /api/reviews`, `GET /api/reviews/user/:userId`

## Brand Palette

| Token | Hex | Usage |
| --- | --- | --- |
| Primary Green | #3B6D11 | Main actions, highlights |
| Dark Green | #27500A | Hover and footer background |
| Accent Orange | #EF9F27 | Secondary actions |
| Accent Brown | #854F0B | Secondary hover and warning text |
| Light Green | #EAF3DE | Subtle backgrounds and badges |
| White | #FFFFFF | Surfaces |
| Text Dark | #111827 | Headings and primary text |
| Text Muted | #6B7280 | Supporting copy |

## Notes

- Login endpoint is rate-limited to help reduce brute-force attempts.
- In production, CORS is restricted to `CLIENT_URL`.
- Ensure your MongoDB instance is reachable via `MONGO_URI` before starting the server.
