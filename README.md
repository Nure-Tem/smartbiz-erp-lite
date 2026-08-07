# SmartBiz Frontend

SmartBiz ERP Lite - Milestone 1

Build a modern, professional ERP web application called SmartBiz ERP Lite.

IMPORTANT

A Supabase backend already exists.

Do NOT create a new database.

Do NOT generate SQL migrations.

Do NOT create mock data.

Do NOT rename database tables or columns.

Use the connected Supabase project as the single source of truth.

Read the existing database schema and build the frontend around it.

Tech Stack

Use:

React

TypeScript

Vite

Tailwind CSS

shadcn/ui

TanStack Query

React Router

React Hook Form

Zod

Lucide React

Authentication

Use the existing Supabase Authentication.

Implement:

Login

Register

Forgot Password

Logout

Respect the existing authentication flow.

Do not create a custom authentication system.

Existing Database

Use the existing tables:

profiles

categories

products

customers

sales

sale_items

inventory_logs

settings

Do not modify them.

User Roles

The backend already supports:

Admin

Cashier

Respect the existing role system.

Do not change database roles.

Application Layout

Create a modern SaaS interface.

Include:

Responsive sidebar

Top navigation

User profile menu

Logout button

Dashboard home

Breadcrumb navigation

Mobile responsive layout

Use a clean professional design.

Primary color:

Blue

Accent:

Green

Rounded cards.

Minimal shadows.

Professional spacing.

Dark mode support.

Dashboard

Create a beautiful dashboard.

Display:

Total Products

Total Customers

Total Sales

Revenue

Low Stock Products

Recent Sales

Use charts only if data already exists.

Otherwise display clean empty states.

Categories Module

Build complete CRUD connected to Supabase.

Features:

List categories

Create category

Edit category

Delete category

Search categories

All operations must use the existing database.

Products Module

Build complete CRUD connected to Supabase.

Display:

Product image

Product name

SKU

Category

Buying Price

Selling Price

Current Stock

Minimum Stock

Features:

Create

Read

Update

Delete

Search

Filter by category

All forms must use React Hook Form with Zod validation.

Persist data in Supabase.

No mock data.

Customers Module

Build complete CRUD.

Display:

Customer name

Phone

Email

Address

Credit balance

Support:

Create

Read

Update

Delete

Search

Persist everything to Supabase.

UI Components

Create reusable components.

Examples:

Data Table

Form Dialog

Confirmation Dialog

Search Input

Loading Spinner

Empty State

Error State

Toast Notifications

Error Handling

Show friendly validation errors.

Display loading indicators.

Handle failed Supabase requests gracefully.

Code Quality

Generate clean production-quality code.

Create reusable components.

Organize files professionally.

Use custom hooks where appropriate.

Avoid duplicated code.

IMPORTANT

This is ONLY Milestone 1.

Do NOT build:

Inventory transactions

Sales processing

Automatic stock deduction

Profit calculations

Reports

PDF invoices

CSV import/export

Offline synchronization

PWA features

Those will be implemented in later milestones.

Focus on delivering an excellent frontend foundation with fully working authentication, dashboard, categories, products, and customers connected to the existing Supabase backend.

At the end, summarize what has been completed and identify anything that requires manual Supabase configuration before moving to Milestone 2.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e7d192a8-2fdb-48b1-971e-ee7d72a63ef1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
