# Spring Boot Login API

This project provides a complete authentication system with JWT token-based authentication.

## Features

- User authentication with email and password
- JWT token generation and validation
- Protected endpoints with role-based access
- CORS configuration for frontend integration
- Swagger/OpenAPI documentation

## API Endpoints

### Authentication

#### Register
- **URL**: `POST /api/auth/register`
- **Description**: Register a new user
- **Request Body**:
```json
{
    "nom": "John Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "role": "USER",
    "matricule": "EMP001",
    "departementId": 1
}
```
- **Response**:
```json
{
    "success": true,
    "user": {
        "id": 1,
        "nom": "John Doe",
        "email": "john.doe@example.com",
        "role": "USER",
        "matricule": "EMP001",
        "departementId": 1
    },
    "message": "Inscription réussie"
}
```

#### Login
- **URL**: `POST /api/auth/login`
- **Description**: Authenticate user with email and password
- **Request Body**:
```json
{
    "email": "user@example.com",
    "password": "password123"
}
```
- **Response**:
```json
{
    "success": true,
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "user": {
        "id": 1,
        "nom": "John Doe",
        "email": "user@example.com",
        "role": "USER",
        "matricule": "EMP001",
        "departementId": 1
    },
    "message": "Connexion réussie"
}
```

#### Update Password
- **URL**: `PUT /api/auth/password/{userId}`
- **Description**: Update user password (requires current password verification)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
    "currentPassword": "oldpassword123",
    "newPassword": "newpassword123"
}
```
- **Response**:
```json
{
    "success": true,
    "message": "Mot de passe mis à jour avec succès"
}
```

#### Test Authentication
- **URL**: `GET /api/auth/test`
- **Description**: Test endpoint to verify authentication
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `"Authentification réussie! Vous êtes connecté."`

## Usage Examples

### 1. Register Request
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "John Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "role": "USER",
    "matricule": "EMP001",
    "departementId": 1
  }'
```

### 2. Login Request
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 3. Update Password
```bash
curl -X PUT http://localhost:8080/api/auth/password/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..." \
  -d '{
    "currentPassword": "oldpassword123",
    "newPassword": "newpassword123"
  }'
```

### 4. Access Protected Endpoint
```bash
curl -X GET http://localhost:8080/api/auth/test \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..."
```

### 5. Using with JavaScript/Fetch
```javascript
// Register
const registerResponse = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        nom: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: 'USER',
        matricule: 'EMP001',
        departementId: 1
    })
});

const registerData = await registerResponse.json();

// Login
const loginResponse = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        email: 'john.doe@example.com',
        password: 'password123'
    })
});

const loginData = await loginResponse.json();
const token = loginData.token;

// Use token for protected requests
const protectedResponse = await fetch('/api/auth/test', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});

// Update password
const passwordUpdateResponse = await fetch('/api/auth/password/1', {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        currentPassword: 'oldpassword123',
        newPassword: 'newpassword123'
    })
});
```

## Security Configuration

- JWT tokens are valid for 5 hours
- **Passwords are hashed using BCrypt** with salt rounds
- CORS is configured to allow all origins
- CSRF is disabled for API endpoints
- Stateless session management
- Password validation (minimum 6 characters for updates)

## Database Schema

The `Utilisateur` entity contains:
- `id`: Primary key
- `nom`: User name
- `email`: Email address (unique)
- `password`: Password (should be hashed)
- `role`: User role
- `matricule`: Employee ID
- `departement`: Associated department

## Running the Application

1. Ensure you have Java 21 and Maven installed
2. Configure your database connection in `application.properties`
3. Run the application:
```bash
mvn spring-boot:run
```
4. Access Swagger UI at: `http://localhost:8080/swagger-ui/index.html`

## Production Considerations

1. **Password Hashing**: ✅ Implemented with BCrypt
2. **Token Storage**: Store JWT secret in environment variables
3. **HTTPS**: Use HTTPS in production
4. **Token Refresh**: Implement token refresh mechanism
5. **Rate Limiting**: Add rate limiting for login attempts
6. **Logging**: Add proper logging for security events
7. **Password Policy**: Implement stronger password requirements
8. **Account Lockout**: Add account lockout after failed attempts

## Error Handling

The API returns appropriate HTTP status codes:
- `200 OK`: Successful login
- `400 Bad Request`: Invalid credentials or request format
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Server errors 