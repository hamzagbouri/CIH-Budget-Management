# API Documentation

## Expenses (Dépenses)

### List All Expenses (with Filters)
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
  },
  ...
]
```

### Validate an Expense
**PUT** `/api/depenses/{id}/validate`

**Description:** Set the status of the expense to `VALID`.

### Invalidate/Refuse an Expense
**PUT** `/api/depenses/{id}/invalidate`

**Description:** Set the status of the expense to `INVALID`.

---

## Budgets

### List All Departments' Budgets (Summary)
**GET** `/api/budget-departements/summary`

**Query Parameters:**
- `annee` (optional): Year to filter budgets (e.g., 2024)

**Example:**
```
GET /api/budget-departements/summary?annee=2024
```

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
  },
  ...
]
```

### Get a Department's Budget (Summary)
**GET** `/api/budget-departements/departement/{departementId}/summary`

**Query Parameters:**
- `annee` (optional): Year to filter budget (e.g., 2024)

**Example:**
```
GET /api/budget-departements/departement/1/summary?annee=2024
```

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

## Status Values
- `EN_ATTENTE`: Pending (awaiting admin validation)
- `VALID`: Validated by admin
- `INVALID`: Refused by admin

---

## Notes
- All endpoints return JSON.
- Filtering parameters are optional; omitting them returns broader results.
- Only expenses with `status=VALID` are counted in `usedBudget` and `remainingBudget` calculations. 

---

## User's Department Expenses (Authenticated USER)

### List My Department's Expenses (Current Year by Default)
**GET** `/api/depenses/my-departement`

**Headers:**
- `Authorization: Bearer <token>` (required)

**Query Parameters:**
- `annee` (optional): Year to filter expenses (defaults to current year)
- `status` (optional): Filter by status (`VALID`, `INVALID`, `EN_ATTENTE`)

**Example:**
```
GET /api/depenses/my-departement?status=EN_ATTENTE
Authorization: Bearer <token>
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
    "status": "EN_ATTENTE"
  },
  ...
]
``` 