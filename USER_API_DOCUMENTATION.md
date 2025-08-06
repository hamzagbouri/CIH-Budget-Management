# User API Documentation (Responsable Département)

## Overview
This documentation covers all APIs available for users (responsables département). All endpoints require authentication and are scoped to the authenticated user's department.

**Base URL:** `http://localhost:8080/api/user`

**Authentication:** Bearer Token (JWT)

---

## Table of Contents
1. [Dashboard APIs](#dashboard-apis)
2. [Profile Management APIs](#profile-management-apis)
3. [Password Management APIs](#password-management-apis)
4. [Expense Management APIs](#expense-management-apis)
5. [Analytics APIs](#analytics-apis)

---

## Dashboard APIs

### 1. Get User Dashboard
**Endpoint:** `GET /api/user/dashboard`

**Description:** Retrieves the complete dashboard for the authenticated user's department.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Query Parameters:**
- `annee` (optional): Year to filter data (default: current year)

**Response:**
```json
{
  "departementId": 1,
  "departementNom": "Département Informatique",
  "annee": 2024,
  "budgetTotal": 50000.0,
  "budgetUtilise": 25000.0,
  "budgetRestant": 25000.0,
  "totalDepenses": 15,
  "depensesValidees": 10,
  "depensesEnAttente": 3,
  "depensesRefusees": 2,
  "totalMontantValidees": 25000.0,
  "totalMontantRefusees": 5000.0,
  "pourcentageUtilisation": 50.0,
  "recentDepenses": [
    {
      "id": 1,
      "titre": "Achat matériel informatique",
      "description": "Ordinateurs et périphériques",
      "type": "MATERIEL",
      "date": "2024-01-15",
      "montant": 5000.0,
      "departementId": 1,
      "status": "VALID",
      "prestataire": "TechStore"
    }
  ],
  "prestataires": ["TechStore", "OfficeSupply", "MaintenancePlus"]
}
```

---

## Profile Management APIs

### 2. Get User Profile
**Endpoint:** `GET /api/user/profile`

**Description:** Retrieves the complete profile of the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Response:**
```json
{
  "id": 1,
  "nom": "Jean Dupont",
  "email": "jean.dupont@company.com",
  "matricule": "EMP001",
  "role": "USER",
  "departementActuel": {
    "id": 1,
    "nom": "Département Informatique"
  },
  "departementsPrecedents": [
    {
      "id": 2,
      "nom": "Département Marketing"
    }
  ],
  "historiqueResponsabilites": [
    {
      "id": 1,
      "annee": 2023,
      "actif": false,
      "departementId": 2,
      "departementNom": "Département Marketing",
      "utilisateurId": 1,
      "utilisateurNom": "Jean Dupont",
      "utilisateurEmail": "jean.dupont@company.com"
    }
  ]
}
```

### 3. Update User Profile
**Endpoint:** `PUT /api/user/profile`

**Description:** Updates the profile of the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "nom": "Jean Dupont",
  "email": "jean.dupont@company.com",
  "matricule": "EMP001"
}
```

**Response:** Returns the updated profile (same format as GET /profile)

**Business Rules:**
- Email must be unique across all users
- All fields are optional (only provided fields will be updated)

### 4. Update Password
**Endpoint:** `PUT /api/user/password`

**Description:** Updates the password of the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

**Response:**
```json
{
  "message": "Mot de passe mis à jour avec succès"
}
```

**Business Rules:**
- Current password must be correct
- New password and confirmation must match
- Password is automatically hashed using BCrypt

---

## Password Management APIs

### 5. Forgot Password
**Endpoint:** `POST /api/user/forgot-password`

**Description:** Initiates password reset process by sending a reset email.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "jean.dupont@company.com"
}
```

**Response:**
```json
{
  "message": "Email de réinitialisation envoyé"
}
```

**Business Rules:**
- Email must exist in the system
- Reset token is valid for 1 hour
- Reset link is sent to the provided email

### 6. Reset Password
**Endpoint:** `POST /api/user/reset-password`

**Description:** Resets password using a valid reset token.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

**Response:**
```json
{
  "message": "Mot de passe réinitialisé avec succès"
}
```

**Business Rules:**
- Token must be valid and not expired
- New password and confirmation must match
- Password is automatically hashed using BCrypt

---

## Expense Management APIs

### 7. Get User Department Expenses
**Endpoint:** `GET /api/user/depenses`

**Description:** Retrieves all expenses for the authenticated user's department with optional filtering.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Query Parameters:**
- `annee` (optional): Year to filter expenses (default: current year)
- `status` (optional): Filter by status (VALID, EN_ATTENTE, INVALID)
- `prestataire` (optional): Filter by service provider

**Response:**
```json
[
  {
    "id": 1,
    "titre": "Achat matériel informatique",
    "description": "Ordinateurs et périphériques",
    "type": "MATERIEL",
    "date": "2024-01-15",
    "montant": 5000.0,
    "departementId": 1,
    "status": "VALID",
    "prestataire": "TechStore"
  }
]
```

### 8. Get Specific Expense
**Endpoint:** `GET /api/user/depenses/{id}`

**Description:** Retrieves a specific expense by ID (only if it belongs to user's department).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters:**
- `id`: Expense ID

**Response:**
```json
{
  "id": 1,
  "titre": "Achat matériel informatique",
  "description": "Ordinateurs et périphériques",
  "type": "MATERIEL",
  "date": "2024-01-15",
  "montant": 5000.0,
  "departementId": 1,
  "status": "VALID",
  "prestataire": "TechStore"
}
```

**Business Rules:**
- User can only access expenses from their department
- Returns 403 if expense doesn't belong to user's department

### 9. Create Expense
**Endpoint:** `POST /api/user/depenses`

**Description:** Creates a new expense for the authenticated user's department.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "titre": "Achat matériel informatique",
  "description": "Ordinateurs et périphériques",
  "type": "MATERIEL",
  "date": "2024-01-15",
  "montant": 5000.0,
  "prestataire": "TechStore"
}
```

**Response:**
```json
{
  "id": 1,
  "titre": "Achat matériel informatique",
  "description": "Ordinateurs et périphériques",
  "type": "MATERIEL",
  "date": "2024-01-15",
  "montant": 5000.0,
  "departementId": 1,
  "status": "EN_ATTENTE",
  "prestataire": "TechStore"
}
```

**Business Rules:**
- Expense is automatically assigned to user's department
- Status is always set to "EN_ATTENTE" initially
- All fields are required except `prestataire`

### 10. Update Expense
**Endpoint:** `PUT /api/user/depenses/{id}`

**Description:** Updates an existing expense (only if it belongs to user's department).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters:**
- `id`: Expense ID

**Request Body:**
```json
{
  "titre": "Achat matériel informatique mis à jour",
  "description": "Ordinateurs et périphériques mis à jour",
  "type": "MATERIEL",
  "date": "2024-01-15",
  "montant": 5500.0,
  "prestataire": "TechStore"
}
```

**Response:**
```json
{
  "id": 1,
  "titre": "Achat matériel informatique mis à jour",
  "description": "Ordinateurs et périphériques mis à jour",
  "type": "MATERIEL",
  "date": "2024-01-15",
  "montant": 5500.0,
  "departementId": 1,
  "status": "EN_ATTENTE",
  "prestataire": "TechStore"
}
```

**Business Rules:**
- User can only update expenses from their department
- Status is automatically reset to "EN_ATTENTE" when modified
- Returns 403 if expense doesn't belong to user's department

### 11. Delete Expense
**Endpoint:** `DELETE /api/user/depenses/{id}`

**Description:** Deletes an expense (only if it belongs to user's department).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters:**
- `id`: Expense ID

**Response:**
```json
{
  "message": "Dépense supprimée avec succès"
}
```

**Business Rules:**
- User can only delete expenses from their department
- Returns 403 if expense doesn't belong to user's department

---

## Analytics APIs

### 12. Get User Department Analytics
**Endpoint:** `GET /api/user/analytics`

**Description:** Retrieves detailed analytics for the authenticated user's department.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Query Parameters:**
- `annee` (optional): Year to filter analytics (default: current year)

**Response:**
```json
{
  "departementId": 1,
  "departementNom": "Département Informatique",
  "annee": 2024,
  "budgetTotal": 50000.0,
  "budgetUtilise": 25000.0,
  "budgetRestant": 25000.0,
  "totalDepenses": 15,
  "depensesValidees": 10,
  "depensesEnAttente": 3,
  "depensesRefusees": 2,
  "totalMontantValidees": 25000.0,
  "totalMontantRefusees": 5000.0,
  "pourcentageUtilisation": 50.0
}
```

### 13. Get Prestataires
**Endpoint:** `GET /api/user/prestataires`

**Description:** Retrieves the list of all service providers used by the user's department.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Response:**
```json
[
  "TechStore",
  "OfficeSupply",
  "MaintenancePlus"
]
```

---

## Error Responses

### Common Error Format
```json
{
  "error": "Error message",
  "timestamp": "2024-01-15T10:30:00",
  "status": 400
}
```

### Common Error Codes
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Access denied (e.g., trying to access another department's data)
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Specific Error Messages
- `"Aucun département associé à cet utilisateur"`: User has no assigned department
- `"Accès non autorisé à cette dépense"`: Trying to access expense from another department
- `"Les mots de passe ne correspondent pas"`: Password confirmation doesn't match
- `"Le mot de passe actuel est incorrect"`: Current password is wrong
- `"Token invalide ou expiré"`: Password reset token is invalid or expired
- `"Aucun utilisateur trouvé avec cet email"`: Email doesn't exist in system

---

## Authentication

All endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

The token is obtained by logging in through the authentication endpoint.

---

## Business Rules Summary

### User Scope
- All operations are scoped to the authenticated user's department
- Users cannot access data from other departments
- All expense operations are automatically associated with user's department

### Expense Management
- New expenses always start with "EN_ATTENTE" status
- Modified expenses automatically reset to "EN_ATTENTE" status
- Users can only manage expenses from their department

### Password Management
- Password reset tokens expire after 1 hour
- Passwords are automatically hashed using BCrypt
- Email uniqueness is enforced for profile updates

### Data Filtering
- All data is filtered by year (default: current year)
- Expenses can be filtered by status and service provider
- Analytics are calculated only for validated expenses

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

---

## Security Considerations

1. **Authentication**: All endpoints require valid JWT tokens
2. **Authorization**: Users can only access their department's data
3. **Input Validation**: All inputs are validated
4. **Password Security**: Passwords are hashed using BCrypt
5. **Token Security**: JWT tokens have expiration times
6. **CORS**: Configured to allow cross-origin requests

---

## Testing

Use the provided Postman collection to test all endpoints. Make sure to:
1. First authenticate to get a JWT token
2. Include the token in all subsequent requests
3. Test with different user roles and departments
4. Verify that users can only access their department's data 