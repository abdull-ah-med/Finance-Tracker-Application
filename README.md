# FinanceTracker - Internship Learning Project

A personal finance management application built as part of my internship to learn ASP.NET Core and full-stack development. This project demonstrates modern web development practices using ASP.NET Core Web API and React.

## Learning Objectives

This project was created to gain hands-on experience with:
- **ASP.NET Core Web API**: Building RESTful APIs with Entity Framework Core
- **Authentication & Authorization**: Implementing JWT-based security
- **Database Design**: PostgreSQL integration with Entity Framework migrations
- **React Development**: Modern frontend development with TypeScript
- **Full-Stack Integration**: Connecting frontend and backend applications

## Features Implemented

- **User Authentication**: JWT-based login/registration system
- **Account Management**: CRUD operations for financial accounts
- **Transaction Tracking**: Record and categorize financial transactions
- **Database Relations**: Proper entity relationships and foreign keys
- **Input Validation**: Both client-side and server-side validation
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## Technologies Used

### Backend
- **ASP.NET Core 9.0**: Web API framework
- **Entity Framework Core**: ORM for database operations
- **PostgreSQL**: Relational database
- **JWT Authentication**: Token-based security
- **BCrypt**: Password hashing
- **FluentValidation**: Input validation

### Frontend
- **React 19**: JavaScript library for building user interfaces
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing

## Prerequisites

To run this project locally, you'll need:
- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/download/) (v13 or higher)

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/abdull-ah-med/Finance-Tracker-Application.git
cd Finance-Tracker-Application
```

### 2. Database Setup

1. **Install PostgreSQL** and create a database named `FinanceTracker`
2. **Update connection string** in `Backend/Backend/appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Port=5432;Database=FinanceTracker;Username=your_username;Password=your_password"
     }
   }
   ```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd Backend/Backend

# Restore NuGet packages
dotnet restore

# Run database migrations
dotnet ef database update

# Run the backend server
dotnet run
```

The API will be available at `https://localhost:7070` or `http://localhost:5089`

### 4. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd Frontend

# Install npm dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Project Structure

```
FinanceTracker/
├── Backend/
│   └── Backend/
│       ├── Controllers/          # API controllers
│       ├── Data/                # Database context
│       ├── DTO/                 # Data transfer objects
│       ├── Migrations/          # EF Core migrations
│       ├── Models/              # Entity models
│       ├── Services/            # Business logic services
│       └── Program.cs           # Application entry point
├── Frontend/
│   └── src/
│       ├── components/          # Reusable React components
│       ├── contexts/            # React contexts
│       ├── hooks/               # Custom React hooks
│       ├── pages/               # Page components
│       ├── types/               # TypeScript type definitions
│       └── utils/               # Utility functions
└── README.md
```

## What I Learned

Through building this project, I gained experience with:

### Backend Development
- **API Design**: Creating RESTful endpoints following REST conventions
- **Entity Framework**: Database-first approach with migrations and relationships
- **Authentication**: Implementing JWT tokens and secure password storage
- **Validation**: Using FluentValidation for robust input validation
- **Service Layer**: Separating business logic from controllers
- **Error Handling**: Proper HTTP status codes and error responses

### Database Design
- **Entity Relationships**: One-to-many relationships between Users, Accounts, and Transactions
- **Database Migrations**: Version control for database schema changes
- **Data Seeding**: Populating initial data for categories
- **Query Optimization**: Using Include() for efficient data loading

## Key Implementation Details

### JWT Authentication Flow
1. User registers/logs in with credentials
2. Server validates and returns JWT token
3. Client stores token and sends with subsequent requests
4. Server validates token on protected endpoints

### Database Relationships
- **Users** can have multiple **Accounts**
- **Accounts** can have multiple **Transactions**  
- **Categories** are pre-seeded and linked to accounts/transactions

### Service Layer Pattern
Controllers → Services → Entity Framework → Database

This separation keeps business logic out of controllers and makes the code more testable.

## Frontend Architecture

### Component Structure
```
src/
├── components/     # Reusable UI components
├── pages/          # Route-level components  
├── contexts/       # React Context for state management
├── hooks/          # Custom React hooks
├── utils/          # API calls and utilities
└── types/          # TypeScript type definitions
```

### State Management
Using React Context API for authentication state and user data across the application.

## Development Commands

### Backend (.NET)
```bash
dotnet run              # Start the API server
dotnet build            # Build the project
dotnet ef migrations add <name>    # Create database migration
dotnet ef database update         # Apply migrations to database
```

### Frontend (React)
```bash
npm run dev        # Start development server with hot reload
npm run build      # Build for production
npm run preview    # Preview production build locally
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - User login

### Accounts  
- `GET /api/accounts` - Get user's accounts
- `POST /api/accounts` - Create new account

### Transactions
- `GET /api/transactions` - Get all user transactions
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/account/{id}` - Get transactions for specific account


## Resources Used

- [ASP.NET Core Documentation](https://docs.microsoft.com/en-us/aspnet/core/)
- [Entity Framework Core Guide](https://docs.microsoft.com/en-us/ef/core/)
- [React Documentation](https://reactjs.org/docs/)

---

**Note**: This is a learning project created during my internship to understand full-stack web development with .NET Core and React. The focus is on learning fundamental concepts rather than production deployment.
