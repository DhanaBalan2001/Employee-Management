# Employee Management System

A comprehensive Employee Management System with role-based access control, timesheet management, project tracking, and automated workflows.

## Features

### Core Modules
- **Employee Management**: Complete CRUD operations with personal and professional details
- **User Authentication**: JWT-based authentication with role-based access control
- **Project Management**: Project creation with auto-generated codes and employee assignments
- **Timesheet Management**: Daily time tracking with approval workflow and automation
- **Customer Management**: Customer database with auto-generated codes
- **Dashboard**: Real-time analytics and comprehensive statistics
- **Reporting**: Employee, project, and monthly reports with export capabilities

### Key Capabilities
- **Role-Based Access Control (RBAC)**
  - Admin: Full system access and management
  - Principal: Employee and project management, timesheet approvals
  - Employee: Personal timesheet management and profile updates
- **Automated Workflows**
  - Auto-generated customer and project codes
  - Weekly timesheet validation (40h limit)
  - Daily timesheet limits (8h per day)
  - Automatic project completion when target hours reached
- **Email Notifications**
  - Welcome emails for new users
  - Project assignment notifications
  - Timesheet submission and approval alerts
  - Role change notifications
- **Record Tracking**: Complete audit trail for all operations
- **Employee Limit**: Maximum 200 employees with admin notifications

## Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication and authorization
- **Bcrypt** for secure password hashing
- **Nodemailer** for email notifications

### Frontend
- **React.js** with React Router for navigation
- **Axios** for API communication
- **Modern CSS** with responsive design

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Gmail account for email notifications

### Backend Setup
```bash
cd server
npm install
```

Create `.env` file in server directory:
```env
PORT=5000
MONGODB=mongodb://localhost:27017/employee_management
JWT=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

Start the backend server:
```bash
npm start
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/users/login` - User login

### Employees
- `GET /api/employees` - Get employees (filtered by role)
- `POST /api/employees` - Create employee (Admin only)
- `PUT /api/employees/:id` - Update employee (Admin/Principal)
- `DELETE /api/employees/:id` - Delete employee (Admin only)

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project (Admin only)
- `PUT /api/projects/:id` - Update project (Admin only)
- `GET /api/projects/employee/:id` - Get projects by employee

### Timesheets
- `GET /api/timesheets` - Get timesheets (role-filtered)
- `POST /api/timesheets` - Create timesheet
- `PUT /api/timesheets/:id` - Update timesheet
- `GET /api/timesheets/weekly/:employeeId/:weekStart` - Weekly timesheets

### Dashboard & Reports
- `GET /api/dashboard` - Dashboard statistics
- `GET /api/reports/employee` - Employee reports
- `GET /api/reports/project` - Project reports
- `GET /api/reports/monthly` - Monthly reports (Admin only)

## Default Admin Setup

Create admin user by calling:
```bash
POST /api/setup/create-admin
```

Default credentials:
- Username: `clarkkent`
- Password: `admin123`

## Project Structure

```
employee-management-system/
├── server/
│   ├── controllers/        # Business logic controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Authentication & validation
│   ├── services/          # Email and external services
│   ├── utils/             # Helper utilities
│   └── server.js          # Main server file
├── client/
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   └── App.js         # Main application component
│   └── public/
└── README.md
```

## Key Features Implementation

### Automation Rules
- **Weekly Limit**: 40 hours per week maximum
- **Daily Limit**: 8 hours per day maximum
- **Auto-Submit**: Timesheets auto-submit when limits reached
- **Project Completion**: Projects auto-complete when target hours met

### Code Generation
- **Customer Codes**: Auto-increment format (0001, 0002, ...)
- **Project Codes**: Customer-based format (0001.0001A, 0001.0002B, ...)

### Email System
- **Priority**: Company email first, fallback to personal email
- **Templates**: Professional HTML email templates
- **Reliability**: Graceful error handling, doesn't block operations

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Authorization**: Granular permission control
- **Password Hashing**: Bcrypt with salt rounds
- **Input Validation**: Comprehensive data validation

## Usage Workflow

1. **Setup**: Create admin user and configure environment
2. **Employee Onboarding**: Admin creates employees and user accounts
3. **Project Setup**: Admin creates customers and projects
4. **Assignment**: Admin assigns employees to projects
5. **Time Tracking**: Employees log daily timesheets
6. **Approval**: Principals review and approve timesheets
7. **Reporting**: Generate comprehensive reports and analytics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please create an issue in the GitHub repository.