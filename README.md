# Finance Management API

This project is a finance management API built with Express.js and Prisma ORM, designed to help users index their transactions and manage their budgets effectively.

## Features

- **User Transactions**: Create, update, retrieve and delete transactions for users.
- **Item Management**: Update, filter and delete items associated with transactions.
- **Goal Expenses**: Set, update and delete goal expenses for users.
- **Authentication**: Verify tokens and check for admin privileges (middleware provided).

## Setup Instructions

### Prerequisites

- Node.js (>= 14.x)
- PostgreSQL (or any other Prisma-supported database)
- npm

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/StefanMagureanu25/finance-management-API
```
2. **Install dependencies**

```bash
npm install
```
3. **Set up the database**
Ensure you have PostgreSQL installed and running. Create a database for the project.

Configure environment variables
Create a .env file in the root of the project and add the following configuration:

DATABASE_URL={database_type}://{user_name}:{password}@localhost:{port}/{database_name}?schema={schema_name}

The .env file is used to store environment-specific configurations. It helps to keep sensitive data such as database credentials out of the source code. This file is read by the application at runtime to configure various settings.

4. **Migrate the database**

```bash
npx prisma migrate dev --name your_migration_name
```
5. **Run the application**

```bash
npm start
