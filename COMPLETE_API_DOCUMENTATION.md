# CIH Backend - Complete API Documentation

## Overview
This is a Spring Boot application for managing department budgets and expenses with JWT authentication. The API provides comprehensive functionality for user management, budget tracking, expense management, and department administration.

## Base URL
```
http://localhost:8080
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Authentication API (`/api/auth`)

### 1.1 User Login
**POST** `/api/auth/login`

**Description:** Authenticate user with email and password

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

**Response:**
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

### 1.2 User Registration
**POST** `/api/auth/register`

**Description:** Register a new user

**Request Body:**
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

**Response:**
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

### 1.3 Update Password
**PUT** `/api/auth/password/{userId}`

**Description:** Update user password (requires current password verification)

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
    "currentPassword": "oldpassword123",
    "newPassword": "newpassword123"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Mot de passe mis à jour avec succès"
}
```

### 1.4 Test Authentication
**GET** `/api/auth/test`

**Description:** Test endpoint to verify authentication

**Headers:** `Authorization: Bearer <token>`

**Response:**
```
"Authentification réussie! Vous êtes connecté."
```

### 1.5 Logout
**POST** `/api/auth/logout`

**Description:** Logout user by invalidating token

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
    "success": true,
    "message": "Déconnexion réussie"
}
```

---

## 2. Expenses API (`/api/depenses`)

### 2.1 Get All Expenses (with filters)
**GET** `/api/depenses`

**Query Parameters:**
- `departementId` (optional): Filter by department ID
- `annee` (optional): Filter by year (e.g., 2024)
- `status` (optional): Filter by status (`VALID`, `INVALID`, `EN_ATTENTE`)

**Example:**
```
GET /api/depenses?departementId=1&annee=2024&status=VALID
```

**Response:**
```json
[
    {
        "id": 12,
        "titre": "Achat matériel",
        "description": "Ordinateurs portables",
        "type": "Informatique",
        "date": "2024-03-10",
        "montant": 1500.0,
        "departementId": 1,
        "status": "VALID"
    }
]
```

### 2.2 Get My Department Expenses
**GET** `/api/depenses/my-departement`

**Description:** Get expenses for the authenticated user's department

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `annee` (optional): Year to filter expenses (defaults to current year)
- `status` (optional): Filter by status (`VALID`, `INVALID`, `EN_ATTENTE`)

**Response:**
```json
[
    {
        "id": 12,
        "titre": "Achat matériel",
        "description": "Ordinateurs portables",
        "type": "Informatique",
        "date": "2024-03-10",
        "montant": 1500.0,
        "departementId": 1,
        "status": "EN_ATTENTE"
    }
]
```

### 2.3 Get Expense by ID
**GET** `/api/depenses/{id}`

**Response:**
```json
{
    "id": 12,
    "titre": "Achat matériel",
    "description": "Ordinateurs portables",
    "type": "Informatique",
    "date": "2024-03-10",
    "montant": 1500.0,
    "departementId": 1,
    "status": "VALID"
}
```

### 2.4 Create New Expense
**POST** `/api/depenses`

**Request Body:**
```json
{
    "titre": "Achat matériel",
    "description": "Ordinateurs portables",
    "type": "Informatique",
    "date": "2024-03-10",
    "montant": 1500.0,
    "departementId": 1
}
```

**Response:** Returns the created expense with status `EN_ATTENTE`

### 2.5 Update Expense
**PUT** `/api/depenses/{id}`

**Request Body:**
```json
{
    "titre": "Achat matériel mis à jour",
    "description": "Ordinateurs portables",
    "type": "Informatique",
    "date": "2024-03-10",
    "montant": 1600.0,
    "departementId": 1
}
```

### 2.6 Validate Expense (Admin)
**PUT** `/api/depenses/{id}/validate`

**Description:** Set expense status to `VALID`

### 2.7 Invalidate Expense (Admin)
**PUT** `/api/depenses/{id}/invalidate`

**Description:** Set expense status to `INVALID`

### 2.8 Get Expenses by Status
**GET** `/api/depenses/status/{status}`

**Example:**
```
GET /api/depenses/status/EN_ATTENTE
```

### 2.9 Get Expenses by Department and Status
**GET** `/api/depenses/departement/{departementId}/status/{status}`

**Example:**
```
GET /api/depenses/departement/1/status/VALID
```

### 2.10 Delete Expense
**DELETE** `/api/depenses/{id}`

### 2.11 Get Remaining Budget
**GET** `/api/depenses/remaining-budget/{departementId}/{year}`

**Response:**
```json
6500.0
```

---

## 3. Budget API (`/api/budgets`)

### 3.1 Get All Budgets
**GET** `/api/budgets`

**Response:**
```json
[
    {
        "id": 1,
        "montant": 10000.0
    }
]
```

### 3.2 Get Budget by ID
**GET** `/api/budgets/{id}`

### 3.3 Create New Budget
**POST** `/api/budgets`

**Request Body:**
```json
{
    "montant": 10000.0
}
```

### 3.4 Update Budget
**PUT** `/api/budgets/{id}`

**Request Body:**
```json
{
    "montant": 12000.0
}
```

### 3.5 Delete Budget
**DELETE** `/api/budgets/{id}`

---

## 4. Department Budget API (`/api/budget-departements`)

### 4.1 Get All Department Budgets
**GET** `/api/budget-departements`

**Response:**
```json
[
    {
        "id": 1,
        "annee": 2024,
        "montant": 10000.0,
        "departementId": 1,
        "totalBudget": 10000.0,
        "usedBudget": 3500.0,
        "remainingBudget": 6500.0
    }
]
```

### 4.2 Get Department Budget by ID
**GET** `/api/budget-departements/{id}`

### 4.3 Create New Department Budget
**POST** `/api/budget-departements`

**Request Body:**
```json
{
    "annee": 2024,
    "montant": 10000.0,
    "departementId": 1
}
```

### 4.4 Update Department Budget
**PUT** `/api/budget-departements/{id}`

**Request Body:**
```json
{
    "annee": 2024,
    "montant": 12000.0,
    "departementId": 1
}
```

### 4.5 Delete Department Budget
**DELETE** `/api/budget-departements/{id}`

### 4.6 Get All Budgets Summary
**GET** `/api/budget-departements/summary`

**Query Parameters:**
- `annee` (optional): Year to filter budgets (e.g., 2024)

**Response:**
```json
[
    {
        "departementId": 1,
        "annee": 2024,
        "montant": 10000.0,
        "totalBudget": 10000.0,
        "usedBudget": 3500.0,
        "remainingBudget": 6500.0
    }
]
```

### 4.7 Get Department Budget Summary
**GET** `/api/budget-departements/departement/{departementId}/summary`

**Query Parameters:**
- `annee` (optional): Year to filter budget (e.g., 2024)

**Response:**
```json
{
    "departementId": 1,
    "annee": 2024,
    "montant": 10000.0,
    "totalBudget": 10000.0,
    "usedBudget": 3500.0,
    "remainingBudget": 6500.0
}
```

---

## 5. Departments API (`/api/departements`)

### 5.1 Get All Departments
**GET** `/api/departements`

**Response:**
```json
[
    {
        "id": 1,
        "nom": "Informatique"
    }
]
```

### 5.2 Get Department by ID
**GET** `/api/departements/{id}`

### 5.3 Create New Department
**POST** `/api/departements`

**Request Body:**
```json
{
    "nom": "Marketing"
}
```

### 5.4 Update Department
**PUT** `/api/departements/{id}`

**Request Body:**
```json
{
    "nom": "Marketing Digital"
}
```

### 5.5 Delete Department
**DELETE** `/api/departements/{id}`

---

## 6. Department Managers API (`/api/responsables`)

### 6.1 Get All Department Managers
**GET** `/api/responsables`

**Response:**
```json
[
    {
        "id": 1,
        "annee": 2024,
        "utilisateurId": 1,
        "utilisateurNom": "John Doe",
        "utilisateurEmail": "john.doe@example.com",
        "utilisateurMatricule": "EMP001",
        "departementId": 1,
        "departementNom": "Informatique",
        "dateCreation": "2024-01-15T10:30:00",
        "actif": true
    }
]
```

### 6.2 Get All Active Managers
**GET** `/api/responsables/all`

### 6.3 Get Managers by Year
**GET** `/api/responsables/annee/{annee}`

### 6.4 Get Active Managers by Department
**GET** `/api/responsables/departement/{departementId}`

### 6.5 Get All Managers by Department
**GET** `/api/responsables/departement/{departementId}/all`

### 6.6 Get Manager by ID
**GET** `/api/responsables/{id}`

### 6.7 Create New Manager
**POST** `/api/responsables`

**Description:** Creates a new manager with automatic password generation and email sending

**Request Body:**
```json
{
    "nom": "John Doe",
    "email": "john.doe@example.com",
    "matricule": "EMP001",
    "departementId": 1,
    "annee": 2024
}
```

**Response:**
```json
{
    "id": 1,
    "nom": "John Doe",
    "email": "john.doe@example.com",
    "matricule": "EMP001",
    "departementNom": "Informatique",
    "annee": 2024,
    "generatedPassword": "Ax7Kp9mN",
    "message": "Responsable créé avec succès. Un email avec le mot de passe a été envoyé."
}
```

### 6.8 Update Manager
**PUT** `/api/responsables/{id}`

**Request Body:**
```json
{
    "annee": 2024,
    "utilisateurId": 1,
    "departementId": 2,
    "actif": true
}
```

### 6.9 Delete Manager
**DELETE** `/api/responsables/{id}`

### 6.10 Deactivate Manager
**PUT** `/api/responsables/{id}/deactivate`

---

## 7. Users API (`/api/utilisateurs`)

### 7.1 Get All Users
**GET** `/api/utilisateurs`

**Response:**
```json
[
    {
        "id": 1,
        "nom": "John Doe",
        "email": "john.doe@example.com",
        "role": "USER",
        "matricule": "EMP001",
        "departementId": 1
    }
]
```

### 7.2 Get User by ID
**GET** `/api/utilisateurs/{id}`

### 7.3 Create New User
**POST** `/api/utilisateurs`

**Request Body:**
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

### 7.4 Update User
**PUT** `/api/utilisateurs/{id}`

**Request Body:**
```json
{
    "nom": "John Doe Updated",
    "email": "john.doe@example.com",
    "role": "USER",
    "matricule": "EMP001",
    "departementId": 1
}
```

### 7.5 Delete User
**DELETE** `/api/utilisateurs/{id}`

---

## 8. Notifications API (`/api/notifications`)

### 8.1 Get All Notifications
**GET** `/api/notifications`

**Response:**
```json
[
    {
        "id": 1,
        "message": "Nouvelle dépense créée"
    }
]
```

### 8.2 Get Notification by ID
**GET** `/api/notifications/{id}`

### 8.3 Create New Notification
**POST** `/api/notifications`

**Request Body:**
```json
{
    "message": "Nouvelle dépense créée"
}
```

### 8.4 Update Notification
**PUT** `/api/notifications/{id}`

**Request Body:**
```json
{
    "message": "Notification mise à jour"
}
```

### 8.5 Delete Notification
**DELETE** `/api/notifications/{id}`

---

## 9. Dashboard API (`/api/dashboard`)

### 9.1 Get Department Dashboard
**GET** `/api/dashboard/departement`

**Description:** Get dashboard information for the authenticated user's department

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
    "departementId": 1,
    "departementNom": "Informatique",
    "budgetTotal": 10000.0,
    "budgetUtilise": 3500.0,
    "budgetRestant": 6500.0,
    "depensesRecentes": [
        {
            "id": 12,
            "titre": "Achat matériel",
            "montant": 1500.0,
            "date": "2024-03-10",
            "status": "VALID"
        }
    ]
}
```

---

## Status Values

### Expense Status
- `EN_ATTENTE`: Pending (awaiting admin validation)
- `VALID`: Validated by admin
- `INVALID`: Refused by admin

### User Roles
- `USER`: Regular user (department manager)
- `ADMIN`: Administrator

---

## Error Responses

### 400 Bad Request
```json
{
    "success": false,
    "message": "Invalid credentials"
}
```

### 401 Unauthorized
```json
{
    "success": false,
    "message": "Missing or invalid token"
}
```

### 404 Not Found
```json
{
    "success": false,
    "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
    "success": false,
    "message": "Internal server error"
}
```

---

## Security Features

- **JWT Authentication:** All protected endpoints require valid JWT tokens
- **Password Hashing:** Passwords are hashed using BCrypt
- **CORS Configuration:** Cross-origin requests are allowed
- **Role-based Access:** Different endpoints require different user roles
- **Token Expiration:** JWT tokens are valid for 5 hours

---

## Database Configuration

The application uses MySQL database with the following configuration:
- **Host:** localhost:3306
- **Database:** cih
- **Username:** root
- **Password:** Yassir@10

---

## Email Configuration

The application uses Mailtrap for email sending:
- **Host:** sandbox.smtp.mailtrap.io
- **Port:** 2525
- **Authentication:** Required

---

## Swagger Documentation

Access the interactive API documentation at:
```
http://localhost:8080/swagger-ui.html
```

---

## Notes

- All endpoints return JSON responses
- Filtering parameters are optional; omitting them returns broader results
- Only expenses with `status=VALID` are counted in budget calculations
- Department managers can only manage expenses for their assigned department
- Automatic password generation and email sending for new managers
- Soft delete functionality for managers (deactivation instead of permanent deletion) 