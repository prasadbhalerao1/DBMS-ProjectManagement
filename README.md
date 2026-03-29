# Project Management Application

Welcome to the Project Management Application codebase. This repository contains the source code for a full-stack project management solution built with modern web technologies, designed to provide a comprehensive suite of tools for managing workspaces, projects, and tasks.

## 📚 Documentation

The codebase is extensively documented. You can find all architectural details, database schemas, and guides in the [`docs/`](./docs) directory.

**Key Documentation Links:**
- 📖 [Project Documentation Index](./docs/README.md)
- 🗄️ [Database Operations Guide](./docs/Database_Operations.md)
- 🗺️ [Data Flow & Architecture](./docs/Data_Flow_Guide.md)
- 📊 [ERD Diagram](./docs/ERD_Diagram.md)
- 📝 [Software Requirements Specification (SRS)](./docs/SRS.md)

## 🏗️ Project Structure

This repository is structured as a monorepo containing both the client and server applications:

- **[`client/`](./client)**: The frontend application built with React, Vite, Redux Toolkit, and Tailwind CSS.
- **[`server/`](./server)**: The backend REST API built with Express, Prisma ORM, and PostgreSQL.
- **[`docs/`](./docs)**: Comprehensive project documentation.

## 🚀 Getting Started

Follow these steps to run the application locally.

### Prerequisites

- Node.js (v18 or higher recommended)
- PostgreSQL database (or Neon Data Serverless equivalent)

### Environment Setup

You will need to configure environment variables for both the client and server. 

1. **Client Setup:**
   Navigate to the `client/` directory and create your `.env` file based on `.env.example`:
   ```bash
   cd client
   # Copy .env.example to .env and fill in the values
   ```

2. **Server Setup:**
   Navigate to the `server/` directory and create your `.env` file based on `.env.example`:
   ```bash
   cd server
   # Copy .env.example to .env and fill in the values
   ```
   Make sure your `DATABASE_URL` and `CLERK` keys are appropriately configured.

### Installation & Running

1. **Install Dependencies:**
   Ensure you install dependencies for both applications. It will also generate the Prisma schema for the server.
   ```bash
   # Terminal 1 - For Server:
   cd server
   npm install
   
   # Terminal 2 - For Client:
   cd client
   npm install
   ```

2. **Start the Development Servers:**
   - **Start the Server:**
     ```bash
     cd server
     npm run dev
     ```
     The API server will run on `http://localhost:5000` (or as configured).

   - **Start the Client:**
     ```bash
     cd client
     npm run dev
     ```
     The Vite development server will typically start on `http://localhost:5173`.

---

*This codebase is comprehensively structured and documented, making it ready to be presented and scaled.*
