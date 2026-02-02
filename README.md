# Ts.ED Backend with SQLite

A basic Ts.ED backend API with a local SQLite database using MikroORM.

## Features

- **Ts.ED Framework**: Modern TypeScript framework for Node.js
- **SQLite Database**: Local database with MikroORM
- **REST API**: User management endpoints
- **TypeScript**: Full type safety
- **Express**: Fast web framework

## Project Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── UserController.ts    # User API endpoints
│   ├── entities/
│   │   └── User.ts               # User entity/model
│   ├── Server.ts                 # Server configuration
│   └── index.ts                  # Application entry point
├── dist/                         # Compiled JavaScript (generated)
├── db.sqlite                     # SQLite database (generated)
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

## Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

## Usage

### Development Mode

Run the server in development mode with auto-reload:

```bash
npm run dev
```

### Production Mode

Build and run the server:

```bash
npm run build
npm start
```

## API Endpoints

The API is available at `https://localhost:3443/api`

**Note**: This server uses a self-signed SSL certificate for local development. You may need to:
- Accept the security warning in your browser
- Use `curl -k` or `--insecure` flag to bypass certificate validation

### Get All Users

```bash
GET https://localhost:3443/api/users
```

### Get User by ID

```bash
GET https://localhost:3443/api/users/:id
```

### Create User

```bash
POST https://localhost:3443/api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

## Testing the API

You can test the API using curl:

```bash
# Create a user
curl -k -X POST https://localhost:3443/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'

# Get all users
curl -k https://localhost:3443/api/users

# Get user by ID
curl -k https://localhost:3443/api/users/1
```

## Database

The SQLite database (`db.sqlite`) is created automatically when you first run the server. The database contains a `user` table with the following schema:

- `id` (number): Primary key
- `name` (string): User's name
- `email` (string): User's email
- `createdAt` (Date): Timestamp of creation

## Technologies Used

- **Ts.ED**: 8.24.1
- **MikroORM**: 6.6.5
- **SQLite**: better-sqlite3
- **Express**: 5.2.1
- **TypeScript**: 5.9.3
