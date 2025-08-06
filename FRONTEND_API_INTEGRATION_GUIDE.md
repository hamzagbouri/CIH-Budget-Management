# Frontend API Integration Guide - Responsable Département

## 🚀 **NEW APIs TO IMPLEMENT**

### **1. REASSIGNMENT APIs (CRITICAL - Fixes Historical Data Issues)**

#### **Reassign Responsible**
```http
POST /api/responsables/reassign
```
**Purpose**: Reassigns a user to a different department in the same year
**Parameters**:
- `departementId` (Integer, required)
- `newUserId` (Integer, required) 
- `annee` (Integer, required)
- `modifiedBy` (String, required) - Current user making the change
- `reason` (String, optional) - Default: "Réassignation"

**Example Request**:
```javascript
const response = await fetch('/api/responsables/reassign', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        departementId: 1,
        newUserId: 2,
        annee: 2025,
        modifiedBy: "admin@company.com",
        reason: "Department transfer"
    })
});
```

**Response**:
```json
{
    "id": 15,
    "annee": 2025,
    "utilisateurId": 2,
    "utilisateurNom": "John Doe",
    "utilisateurEmail": "john@company.com",
    "utilisateurMatricule": "EMP002",
    "departementId": 1,
    "departementNom": "IT Department",
    "dateCreation": "2024-01-15T10:30:00",
    "dateModification": "2024-01-15T10:35:00",
    "utilisateurModification": "admin@company.com",
    "actif": true,
    "raisonModification": "Department transfer"
}
```

#### **Change Department Responsible**
```http
POST /api/responsables/change
```
**Purpose**: Changes the responsible of a department for a specific year
**Parameters**: Same as reassign

### **2. VALIDATION APIs (NEW - Prevents Errors)**

#### **Check if User Can Be Responsible**
```http
GET /api/responsables/validate/user/{userId}/annee/{annee}
```
**Purpose**: Validates if a user can be assigned as responsible
**Response**: `true` or `false`

**Example**:
```javascript
const canBeResponsable = await fetch(`/api/responsables/validate/user/1/annee/2025`, {
    headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());
```

### **3. ENHANCED QUERY APIs (NEW - Better Data Access)**

#### **Get User Assignments**
```http
GET /api/responsables/user/{userId}/assignments
```
**Purpose**: Gets all active assignments for a user
**Response**: Array of assignments

#### **Get Department History**
```http
GET /api/responsables/departement/{departementId}/history
```
**Purpose**: Gets complete history of responsible assignments for a department
**Response**: Array of historical assignments

#### **Get Current Responsible**
```http
GET /api/responsables/departement/{departementId}/annee/{annee}/current
```
**Purpose**: Gets the current responsible for a department in a specific year
**Response**: Single responsible object or null

### **4. PAGINATION APIs (NEW - Performance)**

#### **Get Active Responsables with Pagination**
```http
GET /api/responsables/active/paginated?page=0&size=10
```
**Parameters**:
- `page` (Integer, default: 0)
- `size` (Integer, default: 10)

**Response**:
```json
{
    "content": [...],
    "totalElements": 50,
    "totalPages": 5,
    "size": 10,
    "number": 0,
    "first": true,
    "last": false
}
```

#### **Get Responsables by Year with Pagination**
```http
GET /api/responsables/annee/{annee}/paginated?page=0&size=10
```

### **5. AUDIT APIs (NEW - Tracking Changes)**

#### **Get Modifications by User**
```http
GET /api/responsables/audit/user/{utilisateurModification}
```
**Purpose**: Gets all modifications made by a specific user

#### **Get Modifications Between Dates**
```http
GET /api/responsables/audit/dates?startDate=2024-01-01T00:00:00&endDate=2024-12-31T23:59:59
```
**Parameters**:
- `startDate` (ISO DateTime string)
- `endDate` (ISO DateTime string)

## 🔄 **UPDATED APIs (Enhanced Response Format)**

### **All Existing GET APIs Now Return Enhanced DTO**

**Old Response**:
```json
{
    "id": 1,
    "annee": 2025,
    "utilisateurId": 1,
    "utilisateurNom": "John Doe",
    "utilisateurEmail": "john@company.com",
    "utilisateurMatricule": "EMP001",
    "departementId": 1,
    "departementNom": "IT Department",
    "dateCreation": "2024-01-15T10:30:00",
    "actif": true
}
```

**New Response** (All GET endpoints):
```json
{
    "id": 1,
    "annee": 2025,
    "utilisateurId": 1,
    "utilisateurNom": "John Doe",
    "utilisateurEmail": "john@company.com",
    "utilisateurMatricule": "EMP001",
    "departementId": 1,
    "departementNom": "IT Department",
    "dateCreation": "2024-01-15T10:30:00",
    "dateModification": "2024-01-15T11:00:00",
    "utilisateurModification": "admin@company.com",
    "actif": true,
    "raisonModification": "Initial assignment"
}
```

## 🛠 **FRONTEND IMPLEMENTATION GUIDE**

### **1. Update Existing Components**

#### **Responsable List Component**
```javascript
// OLD
const responsables = await fetch('/api/responsables').then(r => r.json());

// NEW - Add pagination
const [responsables, setResponsables] = useState([]);
const [page, setPage] = useState(0);
const [totalPages, setTotalPages] = useState(0);

const loadResponsables = async (pageNum = 0) => {
    const response = await fetch(`/api/responsables/active/paginated?page=${pageNum}&size=10`);
    const data = await response.json();
    setResponsables(data.content);
    setTotalPages(data.totalPages);
    setPage(pageNum);
};
```

#### **Responsable Form Component**
```javascript
// Add validation before submission
const validateAssignment = async (userId, annee) => {
    const canBeResponsable = await fetch(`/api/responsables/validate/user/${userId}/annee/${annee}`);
    if (!canBeResponsable) {
        alert('This user cannot be assigned as responsible for this year');
        return false;
    }
    return true;
};

// Enhanced create function
const createResponsable = async (data) => {
    if (await validateAssignment(data.userId, data.annee)) {
        const response = await fetch('/api/responsables', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    }
};
```

### **2. New Components to Create**

#### **Reassignment Modal Component**
```javascript
const ReassignmentModal = ({ isOpen, onClose, currentResponsable }) => {
    const [formData, setFormData] = useState({
        departementId: currentResponsable?.departementId,
        newUserId: '',
        annee: new Date().getFullYear(),
        reason: 'Reassignment'
    });

    const handleReassign = async () => {
        const response = await fetch('/api/responsables/reassign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...formData,
                modifiedBy: currentUser.email
            })
        });
        
        if (response.ok) {
            onClose();
            // Refresh data
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2>Reassign Responsible</h2>
            <select value={formData.newUserId} onChange={e => setFormData({...formData, newUserId: e.target.value})}>
                <option value="">Select User</option>
                {users.map(user => <option key={user.id} value={user.id}>{user.nom}</option>)}
            </select>
            <input 
                type="text" 
                placeholder="Reason"
                value={formData.reason}
                onChange={e => setFormData({...formData, reason: e.target.value})}
            />
            <button onClick={handleReassign}>Reassign</button>
        </Modal>
    );
};
```

#### **Department History Component**
```javascript
const DepartmentHistory = ({ departementId }) => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const loadHistory = async () => {
            const response = await fetch(`/api/responsables/departement/${departementId}/history`);
            const data = await response.json();
            setHistory(data);
        };
        loadHistory();
    }, [departementId]);

    return (
        <div>
            <h3>Department History</h3>
            {history.map(item => (
                <div key={item.id}>
                    <span>{item.utilisateurNom}</span>
                    <span>{item.annee}</span>
                    <span>{item.actif ? 'Active' : 'Inactive'}</span>
                    {item.raisonModification && <span>Reason: {item.raisonModification}</span>}
                </div>
            ))}
        </div>
    );
};
```

#### **Audit Trail Component**
```javascript
const AuditTrail = () => {
    const [modifications, setModifications] = useState([]);
    const [dateRange, setDateRange] = useState({
        startDate: new Date().toISOString().split('T')[0] + 'T00:00:00',
        endDate: new Date().toISOString().split('T')[0] + 'T23:59:59'
    });

    const loadModifications = async () => {
        const response = await fetch(`/api/responsables/audit/dates?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
        const data = await response.json();
        setModifications(data);
    };

    return (
        <div>
            <h3>Audit Trail</h3>
            <input 
                type="datetime-local" 
                value={dateRange.startDate}
                onChange={e => setDateRange({...dateRange, startDate: e.target.value})}
            />
            <input 
                type="datetime-local" 
                value={dateRange.endDate}
                onChange={e => setDateRange({...dateRange, endDate: e.target.value})}
            />
            <button onClick={loadModifications}>Load Modifications</button>
            
            {modifications.map(mod => (
                <div key={mod.id}>
                    <span>{mod.utilisateurNom}</span>
                    <span>{mod.departementNom}</span>
                    <span>{mod.annee}</span>
                    <span>{mod.utilisateurModification}</span>
                    <span>{mod.raisonModification}</span>
                    <span>{new Date(mod.dateModification).toLocaleString()}</span>
                </div>
            ))}
        </div>
    );
};
```

### **3. Error Handling Updates**

#### **Enhanced Error Handling**
```javascript
const handleApiError = (error) => {
    if (error.message.includes('Impossible de modifier les données historiques')) {
        alert('Cannot modify historical data');
    } else if (error.message.includes('L\'utilisateur est déjà responsable')) {
        alert('User is already responsible for this department');
    } else if (error.message.includes('Ce département a déjà un responsable')) {
        alert('Department already has a responsible for this year');
    } else {
        alert('An error occurred: ' + error.message);
    }
};
```

## 📋 **IMPLEMENTATION CHECKLIST**

### **Phase 1: Critical Bug Fixes**
- [ ] Implement reassignment APIs (`/reassign`, `/change`)
- [ ] Add validation before assignments (`/validate/user/{userId}/annee/{annee}`)
- [ ] Update error handling for new validation messages
- [ ] Test historical data protection

### **Phase 2: Enhanced Features**
- [ ] Add pagination to existing lists
- [ ] Implement department history view
- [ ] Add user assignments view
- [ ] Create audit trail component

### **Phase 3: UI/UX Improvements**
- [ ] Add confirmation dialogs for reassignments
- [ ] Implement loading states for all new APIs
- [ ] Add success/error notifications
- [ ] Create responsive design for new components

### **Phase 4: Testing**
- [ ] Test all reassignment scenarios
- [ ] Verify historical data protection
- [ ] Test pagination with large datasets
- [ ] Validate audit trail functionality

## 🚨 **CRITICAL NOTES FOR FRONTEND TEAM**

1. **Always validate before assignment** - Use the validation API
2. **Handle historical data errors** - Show appropriate messages
3. **Implement proper loading states** - New APIs may take time
4. **Add confirmation dialogs** - Reassignments are critical operations
5. **Test all scenarios** - Especially cross-department movements
6. **Update error handling** - New error messages are more specific
7. **Implement audit trail** - For compliance and debugging
8. **Add pagination** - For better performance with large datasets

## 📞 **SUPPORT**

If you encounter any issues with the new APIs:
1. Check the Swagger documentation at `/swagger-ui/index.html`
2. Review the error messages in the browser console
3. Test with the provided example requests
4. Contact the backend team for API-specific issues 