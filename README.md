# Helpdesk Ticket System

A complete helpdesk ticketing system for managing support requests and user interactions. This system is built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- User authentication with roles (admin and regular users)
- Ticket creation and management
- Status tracking of tickets (Open, In progress, Resolved)
- Priority levels for tickets (Low, Medium, High)
- Comment system for ongoing conversations
- History tracking of ticket changes
- Statistics dashboard for administrators
- Responsive design for desktop and mobile

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info
- `GET /api/auth/logout` - Logout user

### Users

- `GET /api/users` - Get all users (admin only)
- `PUT /api/users/:id/role` - Update user role (admin only)

### Tickets

- `GET /api/tickets` - Get all tickets (admin) or user's tickets
- `GET /api/tickets/:id` - Get specific ticket
- `POST /api/tickets` - Create a new ticket
- `PUT /api/tickets/:id` - Update a ticket
- `DELETE /api/tickets/:id` - Delete a ticket (admin only, resolved tickets only)
- `PUT /api/tickets/:id/assign` - Assign ticket to a role
- `GET /api/tickets/role/:role` - Get tickets by role
- `GET /api/tickets/stats/roles` - Get ticket statistics by role (admin only)

### Comments

- `GET /api/tickets/:ticketId/comments` - Get comments for a ticket
- `POST /api/tickets/:ticketId/comments` - Add comment to ticket
- `PUT /api/comments/:id` - Update a comment
- `DELETE /api/comments/:id` - Delete a comment

### Feedback

- `POST /api/tickets/:ticketId/feedback` - Submit feedback for a resolved ticket
- `GET /api/feedback/stats` - Get feedback statistics (admin only)

### Statistics

- `GET /api/stats` - Get system statistics (admin only)

## Installation

1. Clone the repository
   ```
   git clone <repository-url>
   ```

2. Install server dependencies
   ```
   npm install
   ```

3. Install client dependencies
   ```
   cd client
   npm install
   ```

4. Create a `.env` file in the root directory with the following content:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/helpdesk
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   COOKIE_EXPIRE=30
   ```

5. Run the development server
   ```
   npm run dev
   ```

## Security Features

- Password hashing with bcrypt
- JWT authentication with HTTP-only cookies
- Rate limiting on authentication routes
- Role-based authorization
- Input validation

## Technologies Used

- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Frontend**: React, React Router, Axios, Context API
- **Authentication**: JWT, bcrypt
- **Other**: Recharts (for statistics visualization)
