# 🎯 RESPONSABLE DÉPARTEMENT API GUIDE (2025)

## 📋 Table of Contents
1. [Add New Responsable](#1-add-new-responsable)
2. [Reassign Department to Responsable](#2-reassign-department-to-responsable)
3. [Change Department for Responsable](#3-change-department-for-responsable)
4. [Remove Department from Responsable](#4-remove-department-from-responsable)
5. [Switching Responsables](#5-switching-responsables)
6. [Additional APIs](#6-additional-apis)
7. [Error Handling](#7-error-handling)
8. [Examples](#8-examples)

---

## 1. ADD NEW RESPONSABLE

### **Endpoint:** `POST /api/responsables`

### **Purpose:** Create a new user and assign them as responsible for a department in 2025

### **Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

### **Request Body:**
```json
{
  "nom": "John Doe",
  "email": "john.doe@company.com",
  "matricule": "EMP001",
  "departementId": 1,
  "annee": 2025
}
```

### **Response:**
```json
{
  "id": 1,
  "nom": "John Doe",
  "email": "john.doe@company.com",
  "matricule": "EMP001",
  "departementNom": "IT Department",
  "annee": 2025,
  "generatedPassword": "Kj8#mN2$pL9",
  "message": "Responsable créé avec succès. Un email avec le mot de passe a été envoyé."
}
```

### **JavaScript Example:**
```javascript
const createResponsable = async (responsableData) => {
  try {
    const response = await fetch('/api/responsables', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(responsableData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Responsable created:', result);
      return result;
    } else {
      throw new Error('Failed to create responsable');
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Usage
const newResponsable = {
  nom: "John Doe",
  email: "john.doe@company.com",
  matricule: "EMP001",
  departementId: 1,
  annee: 2025
};

createResponsable(newResponsable);
```

---

## 2. REASSIGN DEPARTMENT TO RESPONSABLE

### **Endpoint:** `POST /api/responsables/reassign`

### **Purpose:** Change who is responsible for a specific department in 2025

### **Parameters:**
- `departementId`: ID of the department
- `newUserId`: ID of the new responsible user
- `annee`: Year (2025)
- `modifiedBy`: Who is making the change
- `reason`: Reason for the change (optional)

### **JavaScript Example:**
```javascript
const reassignResponsable = async (departementId, newUserId, annee, modifiedBy, reason = 'Réassignation') => {
  try {
    const params = new URLSearchParams({
      departementId,
      newUserId,
      annee,
      modifiedBy,
      reason
    });
    
    const response = await fetch(`/api/responsables/reassign?${params}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Reassignment successful:', result);
      return result;
    } else {
      throw new Error('Failed to reassign responsable');
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Usage
reassignResponsable(1, 2, 2025, 'admin@company.com', 'Promotion');
```

---

## 3. CHANGE DEPARTMENT FOR RESPONSABLE

### **Endpoint:** `POST /api/responsables/change`

### **Purpose:** Move a responsible from one department to another in 2025

### **Parameters:**
- `departementId`: ID of the new department
- `newUserId`: ID of the responsible user
- `annee`: Year (2025)
- `modifiedBy`: Who is making the change
- `reason`: Reason for the change (optional)

### **JavaScript Example:**
```javascript
const changeDepartementResponsable = async (departementId, newUserId, annee, modifiedBy, reason = 'Changement de responsable') => {
  try {
    const params = new URLSearchParams({
      departementId,
      newUserId,
      annee,
      modifiedBy,
      reason
    });
    
    const response = await fetch(`/api/responsables/change?${params}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Department change successful:', result);
      return result;
    } else {
      throw new Error('Failed to change department responsable');
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Usage
changeDepartementResponsable(2, 1, 2025, 'admin@company.com', 'Department transfer');
```

---

## 4. REMOVE DEPARTMENT FROM RESPONSABLE

### **Endpoint:** `PUT /api/responsables/{id}/deactivate`

### **Purpose:** Deactivate a specific responsible assignment

### **JavaScript Example:**
```javascript
const deactivateResponsable = async (responsableId) => {
  try {
    const response = await fetch(`/api/responsables/${responsableId}/deactivate`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      console.log('Responsable deactivated successfully');
      return true;
    } else {
      throw new Error('Failed to deactivate responsable');
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Usage
deactivateResponsable(1);
```

---

## 5. SWITCHING RESPONSABLES

### **Scenario:** Switch John (IT) and Sarah (HR) in 2025

### **Current State:**
- John (User ID: 1) → IT Department (ID: 1)
- Sarah (User ID: 2) → HR Department (ID: 2)

### **To Switch Them:**

```javascript
const switchResponsables = async (user1Id, user2Id, dept1Id, dept2Id, annee, modifiedBy) => {
  try {
    // Step 1: Move User 1 to Department 2
    await changeDepartementResponsable(dept2Id, user1Id, annee, modifiedBy, 'Switch with other user');
    
    // Step 2: Move User 2 to Department 1
    await changeDepartementResponsable(dept1Id, user2Id, annee, modifiedBy, 'Switch with other user');
    
    console.log('Switch completed successfully');
  } catch (error) {
    console.error('Switch failed:', error);
    throw error;
  }
};

// Usage
switchResponsables(1, 2, 1, 2, 2025, 'admin@company.com');
```

### **Result:**
- John (User ID: 1) → HR Department (ID: 2)
- Sarah (User ID: 2) → IT Department (ID: 1)

---

## 6. ADDITIONAL APIS

### **Get Current Responsible for a Department:**
```javascript
const getCurrentResponsable = async (departementId, annee) => {
  const response = await fetch(`/api/responsables/departement/${departementId}/annee/${annee}/current`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

### **Get All Assignments for a User:**
```javascript
const getUserAssignments = async (userId) => {
  const response = await fetch(`/api/responsables/user/${userId}/assignments`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

### **Get Department History:**
```javascript
const getDepartementHistory = async (departementId) => {
  const response = await fetch(`/api/responsables/departement/${departementId}/history`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

### **Validate if User Can Be Responsible:**
```javascript
const canUserBeResponsable = async (userId, annee) => {
  const response = await fetch(`/api/responsables/validate/user/${userId}/annee/${annee}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

### **Get All Active Responsables (with Pagination):**
```javascript
const getActiveResponsables = async (page = 0, size = 10) => {
  const response = await fetch(`/api/responsables/active/paginated?page=${page}&size=${size}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

---

## 7. ERROR HANDLING

### **Common Error Responses:**
```json
{
  "error": "Une erreur inattendue s'est produite",
  "message": "Specific error message",
  "timestamp": "2025-08-06T10:30:00"
}
```

### **JavaScript Error Handling:**
```javascript
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    console.error('API Error:', error.response.data);
    return error.response.data;
  } else if (error.request) {
    // Network error
    console.error('Network Error:', error.request);
    return { error: 'Network error occurred' };
  } else {
    // Other error
    console.error('Error:', error.message);
    return { error: error.message };
  }
};
```

---

## 8. EXAMPLES

### **Complete Workflow Example:**
```javascript
// 1. Create a new responsable
const createNewResponsable = async () => {
  const newResponsable = {
    nom: "Alice Johnson",
    email: "alice.johnson@company.com",
    matricule: "EMP002",
    departementId: 3,
    annee: 2025
  };
  
  const result = await createResponsable(newResponsable);
  console.log('New responsable created:', result);
};

// 2. Reassign a department
const reassignDepartment = async () => {
  await reassignResponsable(1, 3, 2025, 'admin@company.com', 'Performance review');
  console.log('Department reassigned successfully');
};

// 3. Switch two responsables
const switchTwoResponsables = async () => {
  await switchResponsables(1, 2, 1, 2, 2025, 'admin@company.com');
  console.log('Responsables switched successfully');
};

// 4. Get current state
const getCurrentState = async () => {
  const activeResponsables = await getActiveResponsables(0, 20);
  console.log('Current active responsables:', activeResponsables);
};
```

---

## 🎯 KEY POINTS FOR 2025:

1. **Year-Specific:** All assignments are tied to 2025
2. **One User Per Department:** A user can only be responsible for one department per year
3. **Historical Tracking:** All changes are tracked with audit fields
4. **Soft Delete:** Assignments are deactivated, not deleted
5. **Validation:** System prevents conflicts and validates changes
6. **Audit Trail:** All modifications are logged with user and reason

---

## 📞 SUPPORT

For any issues or questions about these APIs, contact the backend team with:
- The specific API endpoint
- Request/response data
- Error messages
- Expected vs actual behavior 