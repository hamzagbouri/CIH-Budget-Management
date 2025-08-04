# CIH Backend - Admin API Documentation

## Overview
This document provides comprehensive API documentation for the admin functionality in the CIH Backend system. Admin APIs provide full administrative control over budgets, departments, expenses, and analytics.

## Base URL
```
http://localhost:8080
```

## Authentication
All admin endpoints require a JWT token with ADMIN role in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Admin Dashboard API (`/api/admin`)

### 1.1 Get Admin Dashboard
**GET** `/api/admin/dashboard`

**Description:** Retrieves comprehensive analytics for admin dashboard

**Query Parameters:**
- `annee` (optional): Year to filter data (defaults to current year)

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
    "annee": 2024,
    "totalBudget": 100000.0,
    "totalBudgetUtilise": 65000.0,
    "totalBudgetRestant": 35000.0,
    "totalDepartements": 5,
    "totalDepenses": 25,
    "depensesEnAttente": 8,
    "depensesValidees": 15,
    "depensesRefusees": 2,
    "departementsAnalytics": [
        {
            "departementId": 1,
            "departementNom": "Informatique",
            "responsableNom": "John Doe",
            "responsableEmail": "john.doe@example.com",
            "budgetTotal": 20000.0,
            "budgetUtilise": 15000.0,
            "budgetRestant": 5000.0,
            "totalDepenses": 8,
            "depensesValidees": 6,
            "depensesEnAttente": 2,
            "depensesRefusees": 0,
            "pourcentageUtilisation": 75.0
        }
    ],
    "budgetsParAnnee": [
        {
            "id": 1,
            "annee": 2024,
            "montant": 100000.0,
            "description": "Budget principal 2024"
        }
    ]
}
```

---

## 2. Budget Management API (`/api/admin/budgets`)

### 2.1 Add Budget for Year
**POST** `/api/admin/budgets`

**Description:** Adds a budget for a specific year (one budget per year)

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
    "annee": 2024,
    "montant": 100000.0,
    "description": "Budget principal pour l'année 2024"
}
```

**Response:**
```json
{
    "id": 1,
    "annee": 2024,
    "montant": 100000.0,
    "description": "Budget principal pour l'année 2024"
}
```

### 2.2 Update Budget
**PUT** `/api/admin/budgets/{id}`

**Description:** Updates a budget with mandatory reason

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
    "montant": 120000.0,
    "description": "Augmentation du budget due à l'inflation"
}
```

**Response:**
```json
{
    "id": 1,
    "annee": 2024,
    "montant": 120000.0,
    "description": "Augmentation du budget due à l'inflation"
}
```

### 2.3 Get Budget by Year
**GET** `/api/admin/budgets/annee/{annee}`

**Description:** Retrieves budget for a specific year

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
    "id": 1,
    "annee": 2024,
    "montant": 100000.0,
    "description": "Budget principal pour l'année 2024"
}
```

---

## 3. Expense Validation API (`/api/admin/depenses`)

### 3.1 Validate Expense
**PUT** `/api/admin/depenses/{id}/validate`

**Description:** Validates an expense (admin only)

**Headers:** `Authorization: Bearer <token>`

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

### 3.2 Reject Expense
**PUT** `/api/admin/depenses/{id}/reject`

**Description:** Rejects an expense (admin only)

**Headers:** `Authorization: Bearer <token>`

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
    "status": "INVALID"
}
```

---

## 4. Department Analytics API (`/api/admin/departements/analytics`)

### 4.1 Get All Departments Analytics
**GET** `/api/admin/departements/analytics`

**Description:** Retrieves analytics for all departments

**Query Parameters:**
- `annee` (optional): Year to filter data (defaults to current year)

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
    {
        "departementId": 1,
        "departementNom": "Informatique",
        "responsableNom": "John Doe",
        "responsableEmail": "john.doe@example.com",
        "budgetTotal": 20000.0,
        "budgetUtilise": 15000.0,
        "budgetRestant": 5000.0,
        "totalDepenses": 8,
        "depensesValidees": 6,
        "depensesEnAttente": 2,
        "depensesRefusees": 0,
        "pourcentageUtilisation": 75.0
    }
]
```

### 4.2 Get Department Analytics
**GET** `/api/admin/departements/analytics/{departementId}`

**Description:** Retrieves analytics for a specific department

**Query Parameters:**
- `annee` (optional): Year to filter data (defaults to current year)

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
    "departementId": 1,
    "departementNom": "Informatique",
    "responsableNom": "John Doe",
    "responsableEmail": "john.doe@example.com",
    "budgetTotal": 20000.0,
    "budgetUtilise": 15000.0,
    "budgetRestant": 5000.0,
    "totalDepenses": 8,
    "depensesValidees": 6,
    "depensesEnAttente": 2,
    "depensesRefusees": 0,
    "pourcentageUtilisation": 75.0
}
```

---

## 5. Department Management API (`/api/admin/departements`)

### 5.1 Get Departments with Responsible
**GET** `/api/admin/departements/with-responsable`

**Description:** Retrieves all departments with their responsible and budget information

**Query Parameters:**
- `annee` (optional): Year to filter data (defaults to current year)

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
    {
        "id": 1,
        "nom": "Informatique",
        "responsableNom": "John Doe",
        "responsableEmail": "john.doe@example.com",
        "responsableMatricule": "EMP001",
        "budgetTotal": 20000.0,
        "budgetRestant": 5000.0,
        "annee": 2024
    }
]
```

### 5.2 Add Department with Responsible
**POST** `/api/admin/departements/with-responsable`

**Description:** Adds a department with its responsible

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
    "nom": "Marketing",
    "email": "marketing@example.com",
    "matricule": "EMP002",
    "departementId": 2,
    "annee": 2024
}
```

**Response:**
```json
{
    "id": 2,
    "nom": "Marketing",
    "responsableNom": "Marketing",
    "responsableEmail": "marketing@example.com",
    "responsableMatricule": "EMP002",
    "budgetTotal": 0.0,
    "budgetRestant": 0.0,
    "annee": 2024
}
```

---

## 6. Department Budget Management API (`/api/admin/departements/{departementId}/budget`)

### 6.1 Add Department Budget
**POST** `/api/admin/departements/{departementId}/budget`

**Description:** Adds a budget to a department for a year

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
    "annee": 2024,
    "montant": 20000.0,
    "description": "Budget département informatique 2024"
}
```

**Response:**
```json
{
    "id": 1,
    "annee": 2024,
    "montant": 20000.0,
    "departementId": 1,
    "description": "Budget département informatique 2024",
    "totalBudget": 20000.0,
    "usedBudget": 15000.0,
    "remainingBudget": 5000.0
}
```

### 6.2 Update Department Budget
**PUT** `/api/admin/departements/{departementId}/budget`

**Description:** Updates a department budget with mandatory reason

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
    "montant": 25000.0,
    "description": "Augmentation du budget pour nouveaux projets"
}
```

**Response:**
```json
{
    "id": 1,
    "annee": 2024,
    "montant": 25000.0,
    "departementId": 1,
    "description": "Augmentation du budget pour nouveaux projets",
    "totalBudget": 25000.0,
    "usedBudget": 15000.0,
    "remainingBudget": 10000.0
}
```

---

## 7. Budget Validation API (`/api/admin/budgets/validation`)

### 7.1 Validate Budgets
**GET** `/api/admin/budgets/validation/{annee}`

**Description:** Validates if total department budgets don't exceed main budget

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
    "valid": true,
    "mainBudget": 100000.0,
    "totalDepartmentBudgets": 85000.0,
    "difference": 15000.0,
    "message": "Les budgets département sont valides"
}
```

---

## 8. Updated Regular APIs

### 8.1 Budget Management (Updated)
**GET** `/api/budgets/annee/{annee}`

**Description:** Get budget by year (available to all users)

**Response:**
```json
{
    "id": 1,
    "annee": 2024,
    "montant": 100000.0,
    "description": "Budget principal pour l'année 2024"
}
```

**PUT** `/api/budgets/{id}`

**Description:** Update budget with reason (ADMIN only)

**Request Body:**
```json
{
    "montant": 120000.0,
    "description": "Raison obligatoire pour la modification"
}
```

---

## Business Rules

### Budget Management
1. **One Budget Per Year:** Only one main budget can exist per year
2. **One Department Budget Per Year:** Each department can have only one budget per year
3. **Budget Constraint:** Total department budgets cannot exceed main budget for the year
4. **Mandatory Reason:** All budget modifications require a reason

### Expense Validation
1. **Admin Only:** Only admins can validate/reject expenses
2. **Status Flow:** EN_ATTENTE → VALID/INVALID
3. **Budget Calculation:** Only VALID expenses count toward budget usage

### Department Management
1. **Responsible Assignment:** Each department can have one responsible per year
2. **Budget Tracking:** Real-time budget usage calculation
3. **Analytics:** Comprehensive analytics for each department

---

## Error Responses

### 400 Bad Request
```json
{
    "error": "La raison de modification est obligatoire"
}
```

### 409 Conflict
```json
{
    "error": "Un budget existe déjà pour l'année 2024"
}
```

### 422 Unprocessable Entity
```json
{
    "error": "La somme des budgets département ne peut pas dépasser le budget principal"
}
```

---

## Security Features

- **Role-based Access:** Admin endpoints require ADMIN role
- **JWT Authentication:** All endpoints require valid JWT tokens
- **Budget Validation:** Automatic validation of budget constraints
- **Audit Trail:** All modifications tracked with reasons

---

## Database Schema Updates

### Budget Table
- Added `description` column (VARCHAR(500))
- Added unique constraint on `annee` (one budget per year)

### Budget_Departement Table
- Added `description` column (VARCHAR(500))
- Added unique constraint on `departement_id, annee` (one budget per department per year)
- Removed `budget_id` reference (no longer needed)

---

## Migration Notes

The system includes automatic database migration (V3__add_admin_functionality.sql) that:
1. Adds description columns to both budget tables
2. Adds unique constraints for business rules
3. Updates existing records with default descriptions

---

## Usage Examples

### 1. Get Admin Dashboard
```bash
curl -X GET "http://localhost:8080/api/admin/dashboard?annee=2024" \
  -H "Authorization: Bearer <admin-token>"
```

### 2. Add Budget for Year
```bash
curl -X POST "http://localhost:8080/api/admin/budgets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "annee": 2024,
    "montant": 100000.0,
    "description": "Budget principal 2024"
  }'
```

### 3. Validate Expense
```bash
curl -X PUT "http://localhost:8080/api/admin/depenses/12/validate" \
  -H "Authorization: Bearer <admin-token>"
```

### 4. Add Department Budget
```bash
curl -X POST "http://localhost:8080/api/admin/departements/1/budget" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "annee": 2024,
    "montant": 20000.0,
    "description": "Budget informatique 2024"
  }'
```

---

## Notes

- All admin endpoints require ADMIN role authentication
- Budget modifications require mandatory reasons
- Real-time budget validation prevents overspending
- Comprehensive analytics provide full visibility
- Automatic email notifications for responsible creation
- Soft delete functionality for managers 