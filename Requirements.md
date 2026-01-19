To design a world-class news portal like **BBC Bangla**, we need to focus on three pillars: **Content Hierarchy** (breaking news vs. evergreen), **Speed** (crucial for mobile-first news consumption), and **Editorial Workflow** (how news moves from a draft to the front page).

As an architect, I recommend a **Hybrid Rendering Strategy**: use Static Generation (ISR) for the homepage and articles to ensure near-instant loads for readers, while keeping the Admin Dashboard fully dynamic.

---

## 1. Architectural Strategy: The News Engine

The goal is to handle high-traffic readers who don't log in, while providing a robust, role-based backend for the editorial team.

### User Roles & Access Control

* **Public Reader:** No login required. Can view all news categories, search, and share.
* **Administrator:** Full access to the system, user management, and site-wide settings.
* **Editor/Author (Optional but recommended):** Can create and edit stories but might need Admin approval to "Publish."

### The Tech Stack

* **Framework:** Next.js (App Router) for SEO-friendly server-side rendering.
* **API Layer:** tRPC for end-to-end type safety between the Prisma DB and the React UI.
* **Database:** PostgreSQL (via Prisma) with a "Dummy" seed script for initial content.
* **Media:** Cloudinary for optimized image delivery (automatic resizing for mobile).

---

## 2. Feature-by-Feature Blueprint for Claude

You can provide the following instructions to Claude. They are organized to build the foundation first and the user experience last.

### Phase 1: Data Modeling & Schema

**Instruction:** "Create a Prisma schema with the following models:

* `User`: email, password (hashed), role (ADMIN, USER), and name.
* `Article`: title, slug, summary, content (JSON/Rich Text), featuredImage (Cloudinary URL), category (e.g., Politics, Sports, International), status (DRAFT, PUBLISHED), and timestamps.
* `Category`: name, slug, and description.
Generate a `seed.ts` file that populates the DB with 10 dummy news articles across different categories to simulate a live portal."

### Phase 2: tRPC API Layer

**Instruction:** "Set up tRPC routers for:

* **Public Router:** Procedures to `getLatestArticles`, `getArticlesByCategory`, and `getArticleBySlug`. These should be high-performance queries.
* **Admin Router:** Protected procedures using a middleware that checks for `ADMIN` role. Procedures include `createArticle`, `updateArticle`, `deleteArticle`, and `uploadImage` (which returns a Cloudinary signed signature)."

### Phase 3: The Admin Dashboard (CMS)

**Instruction:** "Build an Admin Dashboard at `/admin` using Tailwind CSS. It must include:

* **Article List:** A table showing all stories with status indicators.
* **Editor Page:** A form using `react-hook-form` and `zod` for validation. It must support:
* Title, Slug, and Category selection.
* **Cloudinary Integration:** A file upload component that sends images to the provided Cloudinary credentials and saves the URL to the DB.


* **Dashboard Stats:** Quick view of total articles and category distribution."

### Phase 4: The News Portal Frontend (BBC Style)

**Instruction:** "Design the public-facing site with a focus on 'News Information Architecture':

* **The Hero Section:** The latest 'Breaking News' article with a large image.
* **Grid Layout:** A 3-column layout for 'Trending' and 'Recent' news.
* **Category Pages:** Dynamic routes (`/category/[slug]`) that filter news based on the selected topic.
* **Article View:** A clean, readable typography-focused page. Use `lucide-react` for social sharing icons."

---

## 3. Implementation Details for Media

Since you provided specific Cloudinary credentials, the instructions should include a helper utility:

**Cloudinary Utility Instruction:** "Create a server-side utility in `lib/cloudinary.ts` that uses the `cloudinary` SDK. Use the provided credentials to handle secure image uploads. Ensure the frontend uses the `next-cloudinary` package or standard `img` tags with Cloudinary's optimization parameters (e.g., `q_auto,f_auto`) for faster loading on mobile."

---

### Would you like me to generate the specific `schema.prisma` file and the tRPC router code for you to copy-paste into Claude?