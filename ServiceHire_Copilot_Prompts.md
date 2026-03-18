# ServiceHire Platform — VS Code Copilot Prompts
### Phase-by-Phase Development Guide

> **Tech Stack:** React (Vite) + Node.js (Express) + MongoDB (Mongoose)  
> **Design:** White background (`#FFFFFF`), Green accents (`#3B6D11`, `#639922`, `#97C459`), Yellow/Amber highlights (`#EF9F27`, `#FAC775`, `#FAEEDA`)  
> **Platform Type:** Dual-model — Workers list profiles AND Clients can post jobs  
> **Service Types:** Digital, Local/In-Person, Professional  

---

## PHASE 1 — Project Setup & Folder Structure

**Prompt to give Copilot:**

```
Create a full-stack web application called "ServiceHire" using the following structure:

BACKEND (Node.js + Express + MongoDB):
- Create a folder called `server/` at the root.
- Inside `server/`, create the following subfolders:
  - `config/` — for database connection and environment config
  - `controllers/` — for route handler logic (authController, userController, jobController, serviceController, messageController, reviewController)
  - `middleware/` — for auth middleware (JWT verification) and error handling middleware
  - `models/` — for Mongoose schemas (User, WorkerProfile, ServiceListing, Job, Application, Message, Review)
  - `routes/` — for Express route files (auth.routes.js, user.routes.js, job.routes.js, service.routes.js, message.routes.js, review.routes.js)
  - `utils/` — for helper functions (generateToken.js, sendEmail.js)
- Create `server/index.js` as the Express app entry point.
- Create `server/.env` with placeholders: PORT, MONGO_URI, JWT_SECRET, CLIENT_URL.

FRONTEND (React with Vite):
- Create a folder called `client/` at the root.
- Initialize a Vite React project inside `client/`.
- Inside `client/src/`, create:
  - `api/` — for Axios instance and API call functions (auth.api.js, jobs.api.js, services.api.js, messages.api.js)
  - `assets/` — for images and icons
  - `components/` — reusable UI components (Navbar, Footer, ServiceCard, JobCard, ReviewCard, Modal, Button, Input, Badge, AvatarUpload, StarRating, SearchBar)
  - `context/` — for React Context (AuthContext.jsx, SocketContext.jsx)
  - `hooks/` — custom hooks (useAuth.js, useDebounce.js, usePagination.js)
  - `pages/` — full page components (Home, Login, Register, WorkerProfile, ClientProfile, ServiceListings, JobBoard, JobDetail, ServiceDetail, PostJob, CreateService, Dashboard, Messages, AdminPanel, NotFound)
  - `styles/` — global CSS file and a `theme.js` exporting the color palette

Create a `package.json` at the root that has scripts:
- `"dev:server"` → runs `nodemon server/index.js`
- `"dev:client"` → runs `cd client && npm run dev`
- `"dev"` → runs both concurrently using the `concurrently` package

Install root dependencies: `concurrently`, `nodemon`
Install server dependencies: `express`, `mongoose`, `dotenv`, `bcryptjs`, `jsonwebtoken`, `cors`, `express-validator`, `multer`, `cloudinary`, `socket.io`
Install client dependencies: `axios`, `react-router-dom`, `socket.io-client`, `react-hook-form`, `react-hot-toast`, `react-icons`, `date-fns`
```

---

## PHASE 2 — Database Models (MongoDB + Mongoose)

**Prompt to give Copilot:**

```
Inside `server/models/`, create the following Mongoose schema files. Each model must include `timestamps: true`.

1. `User.js` — The base account for all users (both clients and workers share this model):
   Fields: name (String, required), email (String, required, unique), password (String, required), role (String, enum: ['client', 'worker', 'admin'], default: 'client'), avatar (String, default: ''), isVerified (Boolean, default: false), createdAt (auto).

2. `WorkerProfile.js` — Extended profile for users with role='worker':
   Fields: user (ObjectId ref 'User', required, unique), bio (String), location (String), skills (Array of Strings), categories (Array of Strings — values can be: 'digital', 'local', 'professional'), hourlyRate (Number), availability (Boolean, default: true), completedJobs (Number, default: 0), rating (Number, default: 0), totalReviews (Number, default: 0), portfolio (Array of { title: String, description: String, imageUrl: String }), languages (Array of Strings).

3. `ServiceListing.js` — A gig/service posted by a worker:
   Fields: worker (ObjectId ref 'User', required), title (String, required), description (String, required), category (String, enum: ['digital', 'local', 'professional'], required), subcategory (String), price (Number, required), pricingType (String, enum: ['fixed', 'hourly', 'negotiable']), deliveryTime (String), images (Array of Strings), tags (Array of Strings), isActive (Boolean, default: true), rating (Number, default: 0), totalReviews (Number, default: 0), orders (Number, default: 0).

4. `Job.js` — A job posted by a client:
   Fields: client (ObjectId ref 'User', required), title (String, required), description (String, required), category (String, enum: ['digital', 'local', 'professional'], required), budget (Number), budgetType (String, enum: ['fixed', 'hourly']), deadline (Date), status (String, enum: ['open', 'in-progress', 'completed', 'cancelled'], default: 'open'), applicants (Array of ObjectId ref 'User'), hiredWorker (ObjectId ref 'User', default: null), location (String), tags (Array of Strings).

5. `Application.js` — A worker's proposal for a job:
   Fields: job (ObjectId ref 'Job', required), worker (ObjectId ref 'User', required), coverLetter (String, required), proposedRate (Number), estimatedTime (String), status (String, enum: ['pending', 'accepted', 'rejected'], default: 'pending').

6. `Message.js` — Direct message between two users:
   Fields: sender (ObjectId ref 'User', required), receiver (ObjectId ref 'User', required), content (String, required), isRead (Boolean, default: false), conversationId (String, required — store as a sorted combination of both user IDs joined with '_').

7. `Review.js` — A rating left after a job/service:
   Fields: reviewer (ObjectId ref 'User', required), reviewee (ObjectId ref 'User', required), job (ObjectId ref 'Job'), service (ObjectId ref 'ServiceListing'), rating (Number, min: 1, max: 5, required), comment (String), type (String, enum: ['client-to-worker', 'worker-to-client']).

After creating all models, create `server/config/db.js` that connects to MongoDB using the MONGO_URI from .env and logs a success or failure message.
```

---

## PHASE 3 — Backend: Auth System (Register & Login)

**Prompt to give Copilot:**

```
In `server/controllers/authController.js`, implement the following functions using async/await and try/catch. Use bcryptjs to hash passwords and jsonwebtoken to create tokens. Import the User model.

1. `register(req, res)`:
   - Validate that name, email, password, and role are present in req.body.
   - Role must be either 'client' or 'worker' (reject 'admin' from public registration).
   - Check if a user with that email already exists — if yes, return 400 with message "Email already in use".
   - Hash the password with bcryptjs (salt rounds: 10).
   - Create and save the new User.
   - If role is 'worker', also automatically create an empty WorkerProfile linked to the new user.
   - Return 201 with the user's id, name, email, role, and a JWT token (expires in 7 days).

2. `login(req, res)`:
   - Find the user by email.
   - If not found or password doesn't match, return 401 with "Invalid credentials".
   - Return 200 with user's id, name, email, role, avatar, and a JWT token.

3. `getMe(req, res)`:
   - This is a protected route. Return the currently logged-in user's data from req.user (populated by auth middleware).
   - Exclude password from the response.

In `server/middleware/authMiddleware.js`:
   - Create a `protect` middleware that reads the Authorization header (Bearer token), verifies the JWT using JWT_SECRET, finds the user by decoded id, attaches the user to `req.user`, and calls next(). If token is missing or invalid, return 401.
   - Create an `adminOnly` middleware that checks if req.user.role === 'admin', otherwise returns 403.

In `server/routes/auth.routes.js`:
   - POST /api/auth/register → authController.register
   - POST /api/auth/login → authController.login
   - GET /api/auth/me → protect middleware + authController.getMe

In `server/index.js`:
   - Set up Express with cors (allow CLIENT_URL from .env), express.json(), and express.urlencoded().
   - Connect to the database using db.js.
   - Mount auth routes at /api/auth.
   - Add a global error handler middleware at the bottom that sends { message: err.message } with status 500.
   - Start the server on PORT from .env.
```

---

## PHASE 4 — Backend: Service Listings & Job Posting APIs

**Prompt to give Copilot:**

```
Create the full CRUD API for ServiceListings and Jobs.

--- SERVICE LISTINGS (server/controllers/serviceController.js) ---

1. `createService(req, res)` [protected, worker only]:
   - Only users with role='worker' may create a service.
   - Accepts: title, description, category, subcategory, price, pricingType, deliveryTime, tags from req.body.
   - Accepts: up to 5 image files via Multer (store in /uploads or use Cloudinary).
   - Save the new ServiceListing with worker = req.user._id.
   - Return 201 with the new service.

2. `getAllServices(req, res)` [public]:
   - Support query params: category, minPrice, maxPrice, search (searches title and tags), page (default 1), limit (default 10).
   - Use Mongoose .find() with filters, .skip(), .limit(), and populate 'worker' with name, avatar, rating.
   - Return paginated results with totalCount.

3. `getServiceById(req, res)` [public]:
   - Return one service by ID, fully populated with worker profile details.

4. `updateService(req, res)` [protected, owner only]:
   - Find service, verify req.user._id matches service.worker, update allowed fields.

5. `deleteService(req, res)` [protected, owner only]:
   - Delete the service if the requesting user is the owner.

--- JOB POSTINGS (server/controllers/jobController.js) ---

6. `createJob(req, res)` [protected, client only]:
   - Only users with role='client' may post a job.
   - Accepts: title, description, category, budget, budgetType, deadline, location, tags.
   - Return 201 with the new job.

7. `getAllJobs(req, res)` [public]:
   - Support query params: category, minBudget, maxBudget, status (default 'open'), search, page, limit.
   - Populate 'client' with name, avatar.
   - Return paginated results.

8. `getJobById(req, res)` [public]:
   - Return full job with populated client. If user is logged in as a worker, also include their application status for this job.

9. `updateJob(req, res)` [protected, client owner only]:
   - Allow the client who posted the job to update it.

10. `deleteJob(req, res)` [protected, client owner only]:
    - Delete the job.

11. `applyToJob(req, res)` [protected, worker only]:
    - A worker applies by submitting coverLetter, proposedRate, estimatedTime.
    - Check the worker hasn't already applied — if so, return 400.
    - Create an Application document. Add worker to job.applicants array.
    - Return 201.

12. `getApplicationsForJob(req, res)` [protected, job owner only]:
    - Return all applications for a specific job, populated with worker name, avatar, rating.

13. `acceptApplication(req, res)` [protected, job owner only]:
    - Set application.status = 'accepted', job.hiredWorker = worker id, job.status = 'in-progress'.
    - Set all other applications for that job to status = 'rejected'.

Mount all routes in server/routes/service.routes.js and server/routes/job.routes.js and register them in server/index.js at /api/services and /api/jobs.
```

---

## PHASE 5 — Backend: Messaging & Reviews APIs

**Prompt to give Copilot:**

```
Create the messaging and review systems.

--- MESSAGING (server/controllers/messageController.js) ---

The messaging system uses REST for history and Socket.IO for real-time delivery.

1. `sendMessage(req, res)` [protected]:
   - Accepts: receiverId, content from req.body.
   - Generate conversationId by sorting [req.user._id, receiverId] and joining with '_'.
   - Save new Message document.
   - Return 201 with the message.

2. `getConversation(req, res)` [protected]:
   - Accepts: otherUserId as URL param.
   - Generate conversationId the same way.
   - Return all messages in the conversation, sorted by createdAt ascending.
   - Mark all messages from the other user as isRead = true.

3. `getConversationList(req, res)` [protected]:
   - Return a list of all unique users the current user has exchanged messages with.
   - For each conversation, return the other user's name, avatar, and the latest message content and timestamp.
   - This requires grouping Message documents by conversationId and finding the latest in each group.

--- SOCKET.IO SETUP (server/index.js) ---

4. After creating the Express server, set up Socket.IO with cors config.
   - On connection: receive userId from socket handshake query, store a map of userId → socketId.
   - On 'sendMessage' event: save message to DB (or just emit if already saved via REST), then emit 'receiveMessage' to the receiver's socket if they are online.
   - On disconnect: remove the user from the online users map.

--- REVIEWS (server/controllers/reviewController.js) ---

5. `createReview(req, res)` [protected]:
   - Accepts: revieweeId, rating, comment, jobId (optional), serviceId (optional), type.
   - Prevent the same reviewer from reviewing the same person twice for the same job/service.
   - Create the Review document.
   - After saving, recalculate the reviewee's average rating: average all Review.rating values for that reviewee, then update WorkerProfile.rating and totalReviews (if reviewee is a worker).
   - Return 201.

6. `getReviewsForUser(req, res)` [public]:
   - Return all reviews where reviewee = userId, populated with reviewer name and avatar, sorted newest first.

Mount routes in server/routes/message.routes.js at /api/messages and server/routes/review.routes.js at /api/reviews. Register in server/index.js.
```

---

## PHASE 6 — Frontend: Global Setup, Theme & Router

**Prompt to give Copilot:**

```
Set up the React frontend inside client/src/.

1. THEME — In `client/src/styles/theme.js`, export a theme object with these exact colors:
   {
     green: {
       dark: '#27500A',
       main: '#3B6D11',
       mid: '#639922',
       light: '#97C459',
       pale: '#C0DD97',
       ghost: '#EAF3DE',
     },
     yellow: {
       dark: '#854F0B',
       main: '#EF9F27',
       light: '#FAC775',
       ghost: '#FAEEDA',
     },
     neutral: {
       white: '#FFFFFF',
       offWhite: '#F9F9F6',
       border: '#E5E7EB',
       muted: '#6B7280',
       dark: '#111827',
     }
   }

2. GLOBAL CSS — In `client/src/styles/global.css`, set:
   - body background: #FFFFFF
   - font-family: 'Inter', sans-serif (import from Google Fonts in index.html)
   - Reset margins/paddings. Box-sizing: border-box on all elements.
   - Link element in index.html to import Inter font.
   - Custom scrollbar: thin, with thumb color #97C459.

3. AXIOS INSTANCE — In `client/src/api/axiosInstance.js`:
   - Create an Axios instance with baseURL = import.meta.env.VITE_API_URL (default: 'http://localhost:5000').
   - Add a request interceptor that reads the JWT token from localStorage and attaches it as Authorization: Bearer <token>.
   - Add a response interceptor that, on 401 errors, clears localStorage and redirects to /login.

4. AUTH CONTEXT — In `client/src/context/AuthContext.jsx`:
   - Create and export AuthContext and AuthProvider.
   - State: user (object or null), token (string or null), loading (bool).
   - On mount: check localStorage for 'serviceHireUser' and 'serviceHireToken', restore them.
   - Functions: login(userData, token) — saves to state and localStorage; logout() — clears state and localStorage; updateUser(newData) — merges updates into user state.
   - Export a custom hook: useAuth() = useContext(AuthContext).

5. ROUTER — In `client/src/App.jsx`:
   - Set up React Router v6 with the following routes:
     / → Home page
     /login → Login page
     /register → Register page
     /services → ServiceListings page (browse all services)
     /services/:id → ServiceDetail page
     /jobs → JobBoard page (browse all open jobs)
     /jobs/:id → JobDetail page
     /post-job → PostJob page [protected, client only]
     /create-service → CreateService page [protected, worker only]
     /worker/:id → WorkerProfile page
     /dashboard → Dashboard page [protected]
     /messages → Messages page [protected]
     /messages/:userId → Messages page with specific conversation [protected]
     /admin → AdminPanel page [protected, admin only]
     * → NotFound page
   - Create a ProtectedRoute wrapper component that redirects to /login if user is not logged in, and optionally checks role.
   - Wrap App in AuthProvider and BrowserRouter.
```

---

## PHASE 7 — Frontend: Navbar, Footer & Shared Components

**Prompt to give Copilot:**

```
Build the shared UI components in client/src/components/.

1. NAVBAR (Navbar.jsx):
   - Fixed top, full width, white background (#FFFFFF), bottom border 1px solid #E5E7EB, box-shadow: 0 1px 4px rgba(0,0,0,0.05).
   - Left side: Logo text "ServiceHire" in bold, color #3B6D11 (green.main), font-size 22px.
   - Center (desktop): Navigation links — "Find Services", "Browse Jobs", "How It Works". Links in color #111827, hover color #3B6D11 with underline transition.
   - Right side (logged out): "Log In" button (outlined, border #3B6D11, text #3B6D11) and "Sign Up" button (filled, background #3B6D11, text white). Hover on filled: background #27500A.
   - Right side (logged in): Show user avatar or initials circle in #EAF3DE background with #3B6D11 text. A dropdown on click showing: Dashboard, Messages, Post a Job (if client) or My Services (if worker), Log Out.
   - Mobile: Hamburger menu icon that reveals a slide-down drawer with all nav links and auth buttons.
   - Use useAuth() to detect login state.

2. FOOTER (Footer.jsx):
   - Background: #27500A (dark green). Text color: white.
   - Three columns: "ServiceHire" with tagline, "Quick Links" (Home, Browse Services, Post a Job, How It Works), "Contact" (email, social icons as placeholders).
   - Bottom bar: "© 2025 ServiceHire. All rights reserved." in #97C459 text.

3. BUTTON (Button.jsx):
   - Props: variant ('primary' | 'secondary' | 'outline' | 'danger'), size ('sm' | 'md' | 'lg'), disabled, loading, onClick, children.
   - primary: background #3B6D11, white text, hover #27500A.
   - secondary: background #EF9F27, white text, hover #854F0B.
   - outline: white background, border 2px solid #3B6D11, text #3B6D11, hover background #EAF3DE.
   - danger: background #dc2626, white text.
   - loading: Show a spinner inside the button, disable click.
   - border-radius: 8px. font-weight: 500.

4. INPUT (Input.jsx):
   - Props: label, name, type, placeholder, error, register (for react-hook-form), ...rest.
   - Render a label in color #374151, input with border 1px solid #D1D5DB, border-radius 8px, padding 10px 14px, focus ring 2px solid #639922.
   - Error: red border + red small text below.

5. BADGE (Badge.jsx):
   - Props: label, color ('green' | 'yellow' | 'gray').
   - green: background #EAF3DE, text #3B6D11.
   - yellow: background #FAEEDA, text #854F0B.
   - gray: background #F3F4F6, text #374151.
   - Rounded-full pill shape, font-size 12px, font-weight 500.

6. STAR RATING (StarRating.jsx):
   - Props: rating (0–5), size, interactive (bool), onChange.
   - Render 5 stars. Filled stars in #EF9F27 yellow. Empty in #D1D5DB.
   - If interactive=true, allow hover and click to set rating.

7. SERVICE CARD (ServiceCard.jsx):
   - Props: service object (id, title, category, price, pricingType, images[0], worker{ name, avatar, rating }, orders).
   - Card: white background, border 1px solid #E5E7EB, border-radius 12px, hover: shadow 0 4px 12px rgba(0,0,0,0.08), transition.
   - Top: image thumbnail (aspect-ratio 16/9, object-fit cover).
   - Body: category Badge, title (2 lines max, ellipsis), worker avatar + name + StarRating.
   - Bottom: "Starting at $X" in #3B6D11 bold text. On click: navigate to /services/:id.

8. JOB CARD (JobCard.jsx):
   - Props: job object (id, title, category, budget, budgetType, deadline, tags, status, client{ name }).
   - Card: same card styling as ServiceCard.
   - Show title, category Badge, budget in bold #3B6D11, deadline in muted gray, tags as small pills (background #EAF3DE), client name.
   - Button: "View & Apply" → navigates to /jobs/:id.
```

---

## PHASE 8 — Frontend: Home Page

**Prompt to give Copilot:**

```
Build the Home page in client/src/pages/Home.jsx. The background is white (#FFFFFF) throughout.

SECTION 1 — HERO:
   - Full-width section, min-height 90vh, centered content.
   - Background: white with a subtle green leaf/abstract SVG pattern in the background (very faint, #EAF3DE color, low opacity).
   - Headline: "Find Trusted Professionals for Any Service" — font-size 52px on desktop, 32px on mobile, font-weight 700, color #111827.
   - Subheadline: "From digital design to home repairs — hire skilled workers quickly and confidently." — font-size 18px, color #6B7280.
   - Search bar: full-width (max 600px), with a text input ("Search for a service or skill...") and a green search button (background #3B6D11). On submit, navigate to /services?search=<query>.
   - Below search: 3 quick category badges — "Digital Services", "Local Services", "Professional Services". Clicking each navigates to /services?category=digital (or local, professional).

SECTION 2 — HOW IT WORKS:
   - Section title: "How ServiceHire Works", centered, font-size 32px, color #111827.
   - 3 cards in a row (responsive grid). Each card: white background, border 1px solid #E5E7EB, border-radius 12px, padding 24px, centered content.
   - Card 1: icon (magnifying glass, color #3B6D11), title "Browse or Post", description "Search worker profiles or post your own job listing for workers to apply."
   - Card 2: icon (handshake, color #EF9F27), title "Connect & Hire", description "Contact workers directly or review applications and hire the best fit."
   - Card 3: icon (star, color #3B6D11), title "Get it Done", description "Work is completed, payment is released, and you leave a review."
   - Step numbers (1, 2, 3) displayed as large background text in #EAF3DE behind each card.

SECTION 3 — FEATURED SERVICES:
   - Section title: "Popular Services" with a "Browse All →" link in #3B6D11.
   - Horizontal scrollable row on mobile, 4-column grid on desktop.
   - Fetch services from GET /api/services?limit=8 and render using ServiceCard component.
   - Show a loading skeleton (gray pulsing blocks in the shape of ServiceCard) while fetching.

SECTION 4 — BROWSE OPEN JOBS:
   - Section title: "Recent Job Posts" with a "View All Jobs →" link.
   - Grid of 4 JobCards fetched from GET /api/jobs?status=open&limit=4.
   - A green CTA button below: "Post a Job for Free" → navigates to /post-job.

SECTION 5 — CATEGORIES:
   - Display 3 large category banners in a grid:
   - "Digital Services" (design, writing, development) — background #EAF3DE, icon #3B6D11.
   - "Local & In-Person" (cleaning, repairs, moving) — background #FAEEDA, icon #EF9F27.
   - "Professional" (legal, medical, finance) — background #EAF3DE, icon #3B6D11.
   - Each banner has a title, short description, and "Explore →" link.

SECTION 6 — CTA BANNER:
   - Full-width section, background #3B6D11 (dark green), text white.
   - Title: "Are you a skilled professional?" in white, 32px bold.
   - Subtitle: "Create your profile, list your services, and start earning today."
   - Two buttons: "Create Worker Profile" (background #EF9F27, text white) and "Learn More" (outline white border, white text).
```

---

## PHASE 9 — Frontend: Service Listings & Service Detail Pages

**Prompt to give Copilot:**

```
Build the Service Listings browse page and the Service Detail page.

--- SERVICE LISTINGS PAGE (client/src/pages/ServiceListings.jsx) ---

Layout: Two-column — left sidebar for filters (250px wide on desktop, collapsible drawer on mobile), right main area for results.

FILTERS SIDEBAR:
   - Title: "Filter Services" in #111827 bold.
   - Category filter: Checkboxes for "Digital", "Local / In-Person", "Professional". Checkbox accent color: #3B6D11.
   - Price range: Two number inputs for Min and Max price. Labels in #374151.
   - Pricing type: Radio buttons for "Any", "Fixed", "Hourly", "Negotiable". Accent color: #3B6D11.
   - A "Clear Filters" text button in #639922.
   - Apply Filters button (full width, background #3B6D11).
   - On mobile: show a "Filter" button that opens filters in a bottom drawer.

MAIN AREA:
   - Top row: search input + sort dropdown ("Newest", "Price: Low to High", "Price: High to Low", "Top Rated").
   - Results count text: "Showing 24 services" in muted gray.
   - Grid: 3 columns on desktop, 2 on tablet, 1 on mobile. Each cell renders a ServiceCard.
   - Pagination: Previous / page numbers / Next. Active page number in background #3B6D11 white text, rounded.
   - If no results: show a centered illustration placeholder + "No services found. Try adjusting your filters."
   - On mount + whenever filters/page change: call GET /api/services with all active query params.

--- SERVICE DETAIL PAGE (client/src/pages/ServiceDetail.jsx) ---

Fetch service by ID from GET /api/services/:id on mount.

Layout:
   LEFT (65%): 
   - Image gallery: Main image large, 4 thumbnails below. Clicking thumbnail swaps main image.
   - Title (font-size 28px, bold, #111827).
   - Category badge + tags as green pills.
   - "About this service" section with full description.
   - "Reviews" section: render ReviewCard components. Each card shows reviewer avatar, name, star rating, date, and comment.

   RIGHT (35%, sticky on scroll):
   - White card with border, border-radius 12px, padding 24px.
   - Price display: large "$XX" in #3B6D11 bold + pricing type label.
   - Delivery time if available.
   - "Contact Worker" button (full width, background #3B6D11, white text) → navigates to /messages/:workerId.
   - Divider.
   - Worker mini-profile: avatar, name, StarRating, "X reviews", location, "View Full Profile" link → /worker/:id.

If user is logged in as a client: show "Contact Worker" button normally.
If user is not logged in: "Contact Worker" button opens a modal saying "Please log in to contact this worker" with Login and Register buttons.
```

---

## PHASE 10 — Frontend: Job Board & Job Detail Pages

**Prompt to give Copilot:**

```
Build the Job Board and Job Detail pages.

--- JOB BOARD PAGE (client/src/pages/JobBoard.jsx) ---

Same two-column layout as ServiceListings with filters sidebar and main results area.

FILTERS:
   - Category checkboxes: Digital, Local, Professional.
   - Budget range: Min and Max inputs.
   - Budget type: Fixed / Hourly radio buttons.
   - Posted within: "Any time", "Last 24 hours", "Last 7 days", "Last 30 days" — select dropdown.

MAIN AREA:
   - Search bar at top.
   - Sort dropdown: "Newest", "Budget: High to Low", "Budget: Low to High".
   - Render JobCard components in a single-column list (not grid — jobs look better as wider list items).
   - JobCard in list mode: show title, category badge, description (2 lines), budget, deadline, tags, and "Apply Now" button on the right.
   - Pagination at bottom.
   - If user is not logged in: show a green banner at top "Sign up as a worker to apply for jobs. It's free!" with a Register button.

--- JOB DETAIL PAGE (client/src/pages/JobDetail.jsx) ---

Fetch job by ID from GET /api/jobs/:id on mount.

LAYOUT (single column, max-width 800px, centered):
   - Breadcrumb: "Jobs > [Category] > [Title]" in muted gray.
   - Header card: white, border, border-radius 12px, padding 32px.
     - Title (28px bold), category badge, status badge (green="open", yellow="in-progress", gray="completed").
     - Client mini-profile: avatar, name, join date.
     - Budget: "$X (Fixed)" or "$X/hr" in #3B6D11 bold, large.
     - Deadline: formatted date.
     - Location (if not digital).
   - "About this job" section with full description.
   - Tags as green pills.
   
   IF USER IS A LOGGED-IN WORKER AND JOB IS OPEN:
   - Show "Submit a Proposal" card below the job details. This card contains:
     - Textarea: "Cover Letter" (required, min 50 characters).
     - Number input: "Your Proposed Rate ($)".
     - Text input: "Estimated Completion Time (e.g. 3 days)".
     - Submit button (background #3B6D11). On submit, POST to /api/jobs/:id/apply.
     - If worker has already applied: show a "You've already applied" yellow info banner instead.
   
   IF USER IS THE JOB OWNER (CLIENT):
   - Show "Applications" section below the job details.
   - List all applications (fetched from GET /api/jobs/:id/applications).
   - Each application card: worker avatar + name + rating, cover letter text (collapsible), proposed rate, estimated time.
   - Two action buttons per application: "Accept" (green) and "Reject" (outline red). On accept, call /api/jobs/:id/applications/:appId/accept.
```

---

## PHASE 11 — Frontend: Dashboard Page

**Prompt to give Copilot:**

```
Build a unified Dashboard page at client/src/pages/Dashboard.jsx.
The dashboard appearance changes based on the logged-in user's role. Use useAuth() to get the current user.

SHARED LAYOUT:
   - Page title: "Welcome back, [Name]" in #111827, 28px bold.
   - Left sidebar (desktop) or top tab navigation (mobile) for switching between dashboard sections.
   - White background throughout. Active sidebar/tab item highlighted with left border #3B6D11 and background #EAF3DE.

--- CLIENT DASHBOARD ---

Sidebar sections: Overview, My Posted Jobs, Hired Workers, Messages, Account Settings.

Overview tab:
   - 4 stat cards in a row: "Jobs Posted" (count), "Active Jobs" (count), "Completed Jobs" (count), "Workers Hired" (count).
   - Card style: white background, border 1px solid #E5E7EB, border-radius 12px, padding 20px. Number in #3B6D11 bold 32px. Label in #6B7280 14px.
   - Below stats: a green CTA card "Need something done? Post a new job →" with a Post Job button (background #EF9F27).

My Posted Jobs tab:
   - Table/list of all jobs posted by the client with columns: Title, Status badge, Budget, Applications count, Date Posted, Actions (Edit | Delete | View Applications).
   - Clicking "View Applications" opens a modal or navigates to the job detail.

--- WORKER DASHBOARD ---

Sidebar sections: Overview, My Services, Job Applications, Active Work, Earnings, Messages, Account Settings.

Overview tab:
   - 4 stat cards: "Services Listed", "Applications Sent", "Jobs Completed", "Avg. Rating" (show stars).
   - Recent activity feed below: last 5 actions (e.g. "You applied to [Job Title] — 2 hours ago").

My Services tab:
   - List of all services the worker has created.
   - Each row: thumbnail, title, price, orders count, rating, status toggle (active/inactive), Edit and Delete buttons.
   - "Add New Service" button at the top (background #3B6D11).

Job Applications tab:
   - List of all jobs the worker has applied to.
   - Show job title, client name, date applied, proposed rate, and application status badge (Pending/Accepted/Rejected).

Account Settings tab (shared for both roles):
   - Form to update: name, avatar (file upload with preview), bio (for workers), location.
   - Password change form: current password, new password, confirm new password.
   - Save Changes button (background #3B6D11).
   - For workers: additional fields for skills (add/remove tag inputs), hourly rate, availability toggle.
```

---

## PHASE 12 — Frontend: Messaging Page

**Prompt to give Copilot:**

```
Build the real-time messaging interface at client/src/pages/Messages.jsx.

Connect to Socket.IO using the VITE_API_URL on mount. Store the socket instance in context or a ref.

PAGE LAYOUT (two-panel, full viewport height minus navbar):

LEFT PANEL (300px, fixed height, scrollable):
   - Header: "Messages" in bold #111827.
   - Search input to filter conversations by name.
   - List of conversations fetched from GET /api/messages/conversations.
   - Each conversation item: user avatar (initials circle in #EAF3DE/#3B6D11), name bold, last message text in gray (truncated to 1 line), timestamp right-aligned.
   - Active conversation highlighted: background #EAF3DE, left border 3px solid #3B6D11.
   - Unread messages: name shown in bold, a small green dot (#3B6D11) next to the avatar.
   - If URL param /messages/:userId is present on load, auto-select that conversation.

RIGHT PANEL (flex-1):
   - If no conversation selected: centered placeholder — "Select a conversation to start messaging" with a chat icon in #C0DD97.

   When a conversation is selected:
   - Header: other user's avatar, name, and a small "Online"/"Offline" status indicator.
   - Message area (scrollable, flex-grow): render all messages from GET /api/messages/:userId.
     - Own messages: aligned right, background #3B6D11, white text, border-radius 16px 16px 4px 16px.
     - Other's messages: aligned left, background #F3F4F6, #111827 text, border-radius 16px 16px 16px 4px.
     - Show timestamp below each message in 11px muted gray.
     - Auto-scroll to bottom when new messages arrive.
   - Message input area (fixed bottom): text input (flex-grow) + Send button (background #3B6D11, white, border-radius 8px).
     - On Send: emit 'sendMessage' to Socket.IO with {receiverId, content}. Also POST to /api/messages to persist. Append message optimistically to UI.
   - Listen for 'receiveMessage' Socket.IO event. If conversationId matches active conversation, append message to list and scroll to bottom. If it's a different conversation, show a notification badge on that conversation in the left panel.
```

---

## PHASE 13 — Frontend: Worker Public Profile Page

**Prompt to give Copilot:**

```
Build the public-facing Worker Profile page at client/src/pages/WorkerProfile.jsx.

Fetch worker profile from GET /api/users/:id/profile on mount.

PAGE LAYOUT (max-width 1000px, centered, white background):

PROFILE HEADER CARD (white, border, border-radius 16px, padding 32px):
   - Left: Large avatar (100px circle) with online/availability indicator dot (green if available).
   - Center: Name (24px bold #111827), title/tagline if available (from bio first line), location in muted gray with a pin icon, "Member since [date]".
   - Right: StarRating component + "[X] reviews" text in #6B7280. "Contact" button (background #3B6D11, white) + "Save Profile" button (outline, border #3B6D11).
   - Skills: row of green Badge components.
   - Languages: row of gray Badge components.

STATS ROW:
   - 3 stat boxes side by side: "Jobs Completed" in #3B6D11 bold large, "Avg. Response Time" (placeholder), "On-time Rate" (placeholder).

ABOUT SECTION:
   - Heading "About [Name]" in #111827 20px bold.
   - Full bio text in #374151.
   - Category tags: "Digital", "Local", "Professional" (whichever apply) as colored badges.
   - Hourly rate: "$X / hr" in #3B6D11 bold.

SERVICES SECTION:
   - Heading "Services Offered" with count.
   - Horizontal scroll row of ServiceCards for this worker's services.

PORTFOLIO SECTION (if portfolio items exist):
   - Grid of portfolio cards (image thumbnail + title + description).
   - Clicking opens a modal with full size image and description.

REVIEWS SECTION:
   - Average rating display: large star graphic, "4.8 out of 5", based on X reviews.
   - Rating breakdown: bar chart for 5★, 4★, 3★, 2★, 1★ (bars in #97C459 green).
   - List of ReviewCard components, newest first, paginated (5 per page).

If the logged-in user is viewing their OWN profile:
   - Show an "Edit Profile" button at the top that navigates to /dashboard.
```

---

## PHASE 14 — Final Polish, Error Handling & Deployment Prep

**Prompt to give Copilot:**

```
Perform final polishing, error handling, and deployment preparation across the entire codebase.

FRONTEND POLISH:

1. Loading States: All pages that fetch data must show a skeleton loader (gray pulsing blocks matching the layout shape) while loading. Use a custom useFetch hook or React Query if needed. Implement this for: Home page service grid, ServiceListings, JobBoard, ServiceDetail, JobDetail, WorkerProfile, Dashboard.

2. Error Boundaries: Wrap the entire app in a React ErrorBoundary component that shows a friendly "Something went wrong. Please refresh the page." message with the green ServiceHire logo displayed.

3. Toast Notifications: Use react-hot-toast for all success and error feedback. Success toasts: green (#3B6D11). Error toasts: red. Position: top-right. Examples: "Service created successfully!", "Application submitted!", "Message sent.", "Login failed — please check your credentials."

4. 404 Page (NotFound.jsx): Show a large "404" in #EAF3DE, a heading "Page not found", a subheading "The page you're looking for doesn't exist or has been moved.", and a "Go Back Home" button in #3B6D11.

5. Form Validation: All forms (register, login, post job, create service, apply to job, contact form) must use react-hook-form with validation rules. Show inline errors in red below each field using the Input component's error prop.

6. Responsive Design: Audit all pages for mobile breakpoints. Ensure Navbar collapses to hamburger at 768px. Sidebar filters collapse to a drawer on mobile. All grids switch to 1-column on screens under 640px.

BACKEND POLISH:

7. Input Validation: Add express-validator middleware on all POST/PUT routes. Validate required fields, email format, password minimum length (8 chars), rating range (1–5). Return 422 with an array of field errors if validation fails.

8. Rate Limiting: Install express-rate-limit. Apply a rate limiter to POST /api/auth/login (max 10 requests per 15 minutes per IP) to prevent brute force attacks.

9. CORS: Update the cors config in server/index.js to allow only the CLIENT_URL from .env in production.

DEPLOYMENT PREP:

10. Environment files:
    - server/.env.example with all required env variable names (no actual values).
    - client/.env.example with VITE_API_URL placeholder.

11. In package.json at root, add a "build" script that runs `cd client && npm run build`.

12. In server/index.js, add logic to serve the client's dist/ folder as static files when NODE_ENV === 'production', and add a catch-all route that serves index.html for client-side routing.

13. Add a README.md at root with: project description, tech stack, setup instructions (clone, install, set env vars, run), feature list, and color palette documentation.
```

---

## COLOR REFERENCE SUMMARY

| Use Case | Color | Hex |
|---|---|---|
| Primary buttons, links, headings | Green Main | `#3B6D11` |
| Hover states for green | Green Dark | `#27500A` |
| Secondary buttons, highlights | Yellow Main | `#EF9F27` |
| Card borders, dividers | Border Gray | `#E5E7EB` |
| Page background | White | `#FFFFFF` |
| Subtle green backgrounds | Green Ghost | `#EAF3DE` |
| Yellow backgrounds, highlights | Yellow Ghost | `#FAEEDA` |
| Body text | Near Black | `#111827` |
| Muted / secondary text | Gray | `#6B7280` |
| Star ratings | Yellow Light | `#FAC775` |
| Active sidebar items | Green Pale | `#C0DD97` |
| Footer background | Green Dark | `#27500A` |
