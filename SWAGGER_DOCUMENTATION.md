# 📚 Documentation Swagger - API de Gestion de Budget et Dépenses

## 🌐 Accès à la Documentation Swagger

Une fois l'application démarrée, accédez à la documentation Swagger via :
- **URL** : `http://localhost:8080/swagger-ui/index.html`
- **OpenAPI JSON** : `http://localhost:8080/v3/api-docs`

## 🔐 Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification. Incluez le token dans le header :
```
Authorization: Bearer <votre_token_jwt>
```

## 📋 Endpoints par Catégorie

### 🔐 Authentification (`/api/auth`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/auth/login` | Connexion utilisateur |
| `POST` | `/api/auth/register` | Inscription utilisateur |
| `PUT` | `/api/auth/password/{userId}` | Mise à jour mot de passe |
| `GET` | `/api/auth/test` | Test d'authentification |
| `POST` | `/api/auth/logout` | Déconnexion utilisateur |

### 👤 Utilisateur (`/api/user`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/user/dashboard` | Tableau de bord utilisateur |
| `GET` | `/api/user/profile` | Profil utilisateur |
| `PUT` | `/api/user/profile` | Mise à jour du profil |
| `PUT` | `/api/user/password` | Changement de mot de passe |
| `POST` | `/api/user/forgot-password` | Mot de passe oublié |
| `POST` | `/api/user/reset-password` | Réinitialisation de mot de passe |

#### 💰 Gestion des Dépenses (Utilisateur)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/user/depenses` | Liste des dépenses du département |
| `GET` | `/api/user/depenses/{id}` | Détails d'une dépense |
| `POST` | `/api/user/depenses` | Création d'une dépense |
| `PUT` | `/api/user/depenses/{id}` | Modification d'une dépense |
| `DELETE` | `/api/user/depenses/{id}` | Suppression d'une dépense |

#### 📊 Analytics (Utilisateur)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/user/analytics` | Analytics du département |
| `GET` | `/api/user/prestataires` | Liste des prestataires |

### 🏢 Responsables Département (`/api/responsables`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/responsables` | Tous les responsables |
| `GET` | `/api/responsables/active` | Responsables actifs |
| `GET` | `/api/responsables/all` | Tous avec détails |
| `GET` | `/api/responsables/{id}` | Responsable par ID |
| `POST` | `/api/responsables` | Créer un responsable |
| `PUT` | `/api/responsables/{id}` | Mettre à jour un responsable |
| `DELETE` | `/api/responsables/{id}` | Supprimer un responsable |
| `PUT` | `/api/responsables/{id}/deactivate` | Désactiver un responsable |

#### 📅 Gestion par Année

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/responsables/annee/{annee}` | Responsables par année |
| `GET` | `/api/responsables/annee/{annee}/paginated` | Avec pagination |

#### 🏢 Gestion par Département

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/responsables/departement/{departementId}` | Responsables d'un département |
| `GET` | `/api/responsables/departement/{departementId}/history` | Historique du département |
| `GET` | `/api/responsables/departement/{departementId}/annee/{annee}/current` | Responsable actuel |

#### 🔄 Réassignation

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/responsables/reassign` | Réassigner un responsable |
| `POST` | `/api/responsables/change` | Changer le responsable |

#### 👤 Gestion par Utilisateur

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/responsables/user/{userId}/assignments` | Assignations d'un utilisateur |
| `GET` | `/api/responsables/validate/user/{userId}/annee/{annee}` | Valider si utilisateur peut être responsable |

#### 📊 Pagination et Audit

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/responsables/active/paginated` | Responsables actifs avec pagination |
| `GET` | `/api/responsables/audit/user/{utilisateurModification}` | Modifications par utilisateur |
| `GET` | `/api/responsables/audit/dates` | Modifications entre dates |

### 🏢 Départements (`/api/departements`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/departements` | Tous les départements |
| `GET` | `/api/departements/{id}` | Département par ID |
| `POST` | `/api/departements` | Créer un département |
| `PUT` | `/api/departements/{id}` | Mettre à jour un département |
| `DELETE` | `/api/departements/{id}` | Supprimer un département |

### 💰 Budgets (`/api/budgets`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/budgets` | Tous les budgets |
| `GET` | `/api/budgets/{id}` | Budget par ID |
| `POST` | `/api/budgets` | Créer un budget |
| `PUT` | `/api/budgets/{id}` | Mettre à jour un budget |
| `DELETE` | `/api/budgets/{id}` | Supprimer un budget |

### 💰 Budgets Département (`/api/budget-departements`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/budget-departements` | Tous les budgets département |
| `GET` | `/api/budget-departements/{id}` | Budget département par ID |
| `POST` | `/api/budget-departements` | Créer un budget département |
| `PUT` | `/api/budget-departements/{id}` | Mettre à jour un budget département |
| `DELETE` | `/api/budget-departements/{id}` | Supprimer un budget département |

### 💸 Dépenses (`/api/depenses`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/depenses` | Toutes les dépenses |
| `GET` | `/api/depenses/{id}` | Dépense par ID |
| `POST` | `/api/depenses` | Créer une dépense |
| `PUT` | `/api/depenses/{id}` | Mettre à jour une dépense |
| `DELETE` | `/api/depenses/{id}` | Supprimer une dépense |

### 📊 Tableau de Bord (`/api/dashboard`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/dashboard/departement` | Tableau de bord département |

### 🔔 Notifications (`/api/notifications`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/notifications` | Toutes les notifications |
| `GET` | `/api/notifications/{id}` | Notification par ID |
| `POST` | `/api/notifications` | Créer une notification |
| `PUT` | `/api/notifications/{id}` | Mettre à jour une notification |
| `DELETE` | `/api/notifications/{id}` | Supprimer une notification |

### 👥 Utilisateurs (`/api/utilisateurs`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/utilisateurs` | Tous les utilisateurs |
| `GET` | `/api/utilisateurs/{id}` | Utilisateur par ID |
| `POST` | `/api/utilisateurs` | Créer un utilisateur |
| `PUT` | `/api/utilisateurs/{id}` | Mettre à jour un utilisateur |
| `DELETE` | `/api/utilisateurs/{id}` | Supprimer un utilisateur |

### 👨‍💼 Administration (`/api/admin`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/admin/dashboard` | Tableau de bord admin |
| `GET` | `/api/admin/statistics` | Statistiques globales |
| `GET` | `/api/admin/users` | Gestion des utilisateurs |
| `GET` | `/api/admin/departments` | Gestion des départements |

## 📝 Exemples de Requêtes

### 🔐 Connexion

```bash
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@company.com",
    "password": "password123"
  }'
```

### 📊 Tableau de Bord

```bash
curl -X GET "http://localhost:8080/api/user/dashboard?annee=2025" \
  -H "Authorization: Bearer <votre_token>"
```

### 💰 Créer une Dépense

```bash
curl -X POST "http://localhost:8080/api/user/depenses" \
  -H "Authorization: Bearer <votre_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Achat matériel informatique",
    "description": "Ordinateurs portables pour l'équipe",
    "type": "EQUIPEMENT",
    "date": "2025-01-15",
    "montant": 5000.0,
    "prestataire": "TechStore"
  }'
```

## 🔧 Codes de Réponse

| Code | Description |
|------|-------------|
| `200` | Succès |
| `201` | Créé avec succès |
| `400` | Requête invalide |
| `401` | Non authentifié |
| `403` | Accès refusé |
| `404` | Ressource non trouvée |
| `500` | Erreur serveur interne |

## 📊 Modèles de Données

### Utilisateur
```json
{
  "id": 1,
  "nom": "John Doe",
  "email": "john@company.com",
  "role": "USER",
  "matricule": "EMP001"
}
```

### Département
```json
{
  "id": 1,
  "nom": "Département SI"
}
```

### Dépense
```json
{
  "id": 1,
  "titre": "Achat matériel",
  "description": "Ordinateurs portables",
  "type": "EQUIPEMENT",
  "date": "2025-01-15",
  "montant": 5000.0,
  "prestataire": "TechStore",
  "status": "EN_ATTENTE",
  "departementId": 1
}
```

### Budget Département
```json
{
  "id": 1,
  "annee": 2025,
  "montant": 75000.0,
  "description": "Budget annuel SI",
  "departementId": 1
}
```

## 🔒 Sécurité

- **JWT Authentication** : Tous les endpoints (sauf `/api/auth/*`) nécessitent un token JWT valide
- **Rôles** : 
  - `ADMIN` : Accès complet
  - `USER` : Accès limité à son département
- **Validation** : Toutes les données sont validées côté serveur
- **CORS** : Configuré pour permettre les requêtes cross-origin

## 🚀 Démarrage Rapide

1. **Démarrer l'application** :
   ```bash
   mvn spring-boot:run
   ```

2. **Accéder à Swagger UI** :
   ```
   http://localhost:8080/swagger-ui/index.html
   ```

3. **Tester l'authentification** :
   ```bash
   curl -X POST "http://localhost:8080/api/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email": "test.user@company.com", "password": "password123"}'
   ```

4. **Utiliser le token** :
   ```bash
   curl -X GET "http://localhost:8080/api/user/dashboard" \
     -H "Authorization: Bearer <token_recu>"
   ```

---

**📧 Support** : dev@company.com  
**🌐 Documentation** : http://localhost:8080/swagger-ui/index.html  
**📄 API Spec** : http://localhost:8080/v3/api-docs 