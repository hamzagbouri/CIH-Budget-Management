# CIH Budget Management System

A comprehensive budget management application for CIH Bank, built with React and modern web technologies.

## 🚀 Features

### 👥 User Management
- **Multi-role authentication** (Admin, Responsable, User)
- **User profile management** with department assignments
- **Responsable management** with department assignments
- **User validation** and assignment workflows

### 📊 Budget Management
- **Annual budget planning** (2020-2030)
- **Department-specific budgets** with tracking
- **Budget modification** with approval workflows
- **Budget history** and audit trails

### 🏢 Department Management
- **Department creation** and management
- **Department status** (active/inactive)
- **Department budget allocation**
- **Responsable assignments** per department

### 💰 Expense Tracking
- **Expense submission** and categorization
- **Expense approval** workflows
- **Expense reports** and analytics
- **Budget vs actual** comparisons

### 📈 Analytics & Reporting
- **Interactive charts** (Chart.js integration)
- **Monthly expense trends**
- **Category-wise expense breakdown**
- **Department performance metrics**
- **Real-time statistics**

### 🔄 Advanced Features
- **Responsable reassignment** between departments
- **Switch responsables** functionality
- **Department history** tracking
- **Audit trails** for all changes
- **Pagination** for large datasets
- **Search and filtering** capabilities

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Chart.js** - Data visualization
- **React Router** - Navigation
- **Axios** - HTTP client

### State Management
- **React Context** - Global state management
- **Custom hooks** - Reusable logic

### UI Components
- **Custom components** - Reusable UI elements
- **Modal system** - Form dialogs
- **Table component** - Sortable, searchable tables
- **Notification system** - User feedback

## 📁 Project Structure

```
CIH-Budget-Management/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── AdminSidebar.jsx
│   │   ├── Table.jsx
│   │   ├── Modal.jsx
│   │   ├── FormInput.jsx
│   │   ├── Chart components/
│   │   └── ...
│   ├── pages/             # Main application pages
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminResponsables.jsx
│   │   ├── AdminDepartements.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Depenses.jsx
│   │   └── ...
│   ├── services/          # API service layer
│   │   ├── authService.js
│   │   ├── budgetService.js
│   │   ├── responsableService.js
│   │   ├── departmentService.js
│   │   └── ...
│   ├── context/           # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── RoleContext.jsx
│   ├── config/            # Configuration files
│   │   └── api.js
│   └── data/              # Static data and utilities
│       └── staticData.js
├── package.json
├── vite.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Backend API** running (see API Integration section)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CIH-Budget-Management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint**
   - Edit `src/config/api.js`
   - Update the base URL to match your backend

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Navigate to `http://localhost:5173`

## 🔧 Configuration

### API Configuration
Edit `src/config/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8080/api'; // Your backend URL
```

### Environment Variables
Create `.env` file (optional):
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=CIH Budget Management
```

## 📊 API Integration

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Budget Management
- `GET /api/budgets` - Get budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/{id}` - Update budget
- `DELETE /api/budgets/{id}` - Delete budget

### Department Management
- `GET /api/departements` - Get departments
- `POST /api/departements` - Create department
- `PUT /api/departements/{id}` - Update department
- `DELETE /api/departements/{id}` - Delete department

### Responsable Management
- `GET /api/responsables` - Get responsables
- `POST /api/responsables` - Create responsable
- `PUT /api/responsables/{id}` - Update responsable
- `POST /api/responsables/reassign` - Reassign responsable
- `POST /api/responsables/change` - Change department

### User Management
- `GET /api/utilisateurs` - Get users
- `PUT /api/utilisateurs/{id}` - Update user
- `GET /api/utilisateurs/{id}/profile` - Get user profile

## 🎨 UI Components

### Chart Colors
The application uses a consistent color palette for charts:
- **Primary Blue**: `#3B82F6`
- **Success Green**: `#10B981`
- **Warning Orange**: `#F59E0B`
- **Danger Red**: `#EF4444`
- **Purple**: `#8B5CF6`
- **Gray**: `#6B7280`

### Component Library
- **Modal** - Reusable dialog component
- **Table** - Sortable, searchable data table
- **FormInput** - Standardized form inputs
- **SelectInput** - Dropdown selection component
- **StatCard** - Statistics display cards
- **LoadingSpinner** - Loading indicator

## 🔐 Authentication & Authorization

### User Roles
1. **Admin** - Full system access
2. **Responsable** - Department-specific access
3. **User** - Limited access to own data

### Protected Routes
- Admin routes require admin role
- Responsable routes require responsable role
- User routes require authenticated user

## 📱 Responsive Design

The application is fully responsive with:
- **Mobile-first** approach
- **Tailwind CSS** responsive classes
- **Flexible layouts** for all screen sizes
- **Touch-friendly** interface elements

## 🧪 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Structure
- **Functional components** with hooks
- **Custom hooks** for reusable logic
- **Service layer** for API calls
- **Context providers** for state management

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Server
1. Build the application
2. Upload `dist/` folder to your web server
3. Configure server to serve `index.html` for all routes
4. Set up API proxy if needed

### Environment Setup
- Configure API endpoints for production
- Set up HTTPS certificates
- Configure CORS settings on backend

## 🔧 Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Check backend server is running
   - Verify API base URL in config
   - Check CORS settings

2. **Authentication Issues**
   - Clear browser cache
   - Check token expiration
   - Verify user credentials

3. **Chart Display Issues**
   - Check Chart.js dependencies
   - Verify data format
   - Check console for errors

### Debug Mode
Enable debug logging in `src/config/api.js`:
```javascript
const DEBUG_MODE = true;
```

## 📝 API Documentation

For detailed API documentation, see `API_INTEGRATION.md` in the project root.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software for CIH Bank.

## 📞 Support

For technical support or questions:
- Check the troubleshooting section
- Review API documentation
- Contact the development team

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Maintained by**: CIH Bank Development Team
