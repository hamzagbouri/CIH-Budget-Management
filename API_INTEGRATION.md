# API Integration Documentation

## Overview
This document describes the API integration setup for the CIH Bank Budget Management Frontend.

## Configuration

### Base URL Configuration
The API base URL is configured in `src/config/api.js`. To change the URL for different environments:

```javascript
// Development
export const API_BASE_URL = 'http://localhost:8080';

// Production (example)
export const API_BASE_URL = 'https://your-production-api.com';
```

## Authentication

### Login Flow
1. User enters email and password
2. Frontend calls `/api/auth/login` endpoint
3. On success, JWT token is stored in localStorage
4. User is redirected to dashboard

### Token Management
- Tokens are automatically added to all API requests via axios interceptors
- Expired tokens trigger automatic logout and redirect to login page
- Token is stored in localStorage as 'authToken'

## API Services

### Available Services
- `authService` - Authentication operations
- `userService` - User management
- `expenseService` - Expense management
- `departmentService` - Department management
- `budgetService` - Budget management
- `budgetDepartmentService` - Budget-department relationships
- `notificationService` - Notification management

### Usage Example
```javascript
import { expenseService } from '../services';

// Get all expenses
const expenses = await expenseService.getAllExpenses();

// Create new expense
const newExpense = await expenseService.createExpense({
  titre: 'New Expense',
  description: 'Description',
  type: 'OPERATIONNEL',
  date: '2024-01-01',
  montant: 1000.00,
  departementId: 1
});
```

## Error Handling

### Global Error Handling
- All API calls include try-catch blocks
- Errors are thrown with descriptive messages
- 401 errors trigger automatic logout

### Error Response Format
```javascript
{
  message: 'Error description',
  // Additional error details from backend
}
```

## Data Models

### User (UtilisateurDTO)
```javascript
{
  id: number,
  nom: string,
  email: string,
  role: string,
  matricule: string,
  departementId: number
}
```

### Expense (DepenseDTO)
```javascript
{
  id: number,
  titre: string,
  description: string,
  type: string,
  date: string, // YYYY-MM-DD format
  montant: number,
  departementId: number
}
```

### Department (DepartementDTO)
```javascript
{
  id: number,
  nom: string
}
```

### Budget (BudgetDTO)
```javascript
{
  id: number,
  annee: number,
  montant: number
}
```

## Environment Setup

### Development
1. Ensure backend is running on `http://localhost:8080`
2. Start frontend with `npm run dev`
3. Test authentication with valid credentials

### Production Deployment
1. Update `API_BASE_URL` in `src/config/api.js`
2. Build the application with `npm run build`
3. Deploy the built files

## Testing API Connection

### Test Authentication
```javascript
import { authService } from '../services/authService';

// Test if backend is accessible
const testResult = await authService.testAuth();
console.log('API connection:', testResult);
```

### Test Login
```javascript
const loginResult = await authService.login('user@example.com', 'password');
if (loginResult.success) {
  console.log('Login successful:', loginResult.user);
} else {
  console.log('Login failed:', loginResult.message);
}
```

## Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure backend allows requests from frontend origin
2. **401 Errors**: Check if token is valid and not expired
3. **Network Errors**: Verify backend is running and accessible
4. **Data Format Errors**: Ensure request/response data matches expected schemas

### Debug Mode
Enable debug logging by adding to `src/config/api.js`:
```javascript
// Add request logging
apiClient.interceptors.request.use(request => {
  console.log('API Request:', request);
  return request;
});

// Add response logging
apiClient.interceptors.response.use(response => {
  console.log('API Response:', response);
  return response;
});
``` 