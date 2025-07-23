# API de Gestion des Responsables de Départements

Cette API permet de gérer les responsables de départements avec les règles métier suivantes :
- Chaque utilisateur avec le rôle "USER" (responsable) ne peut être responsable que d'un seul département par année
- Chaque département ne peut avoir qu'un seul responsable par année
- Lors de la création d'un responsable, un mot de passe est généré automatiquement et envoyé par email
- L'API retourne par défaut tous les responsables (actifs et inactifs)

## Configuration

### Email Configuration
Avant d'utiliser l'API, configurez les paramètres email dans `application.properties` :

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=votre-email@gmail.com
spring.mail.password=votre-mot-de-passe-app
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

**Note :** Pour Gmail, utilisez un "App Password" au lieu de votre mot de passe principal.

## Endpoints

### Base URL
```
/api/responsables
```

### 1. Créer un nouveau responsable
**POST** `/api/responsables`

Crée un nouveau responsable avec génération automatique du mot de passe et envoi par email.

**Request Body :**
```json
{
    "nom": "John Doe",
    "email": "john.doe@example.com",
    "matricule": "EMP001",
    "departementId": 1,
    "annee": 2024
}
```

**Response :**
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

### 2. Lister tous les responsables (actifs et inactifs)
**GET** `/api/responsables`

**Response :**
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

### 3. Lister tous les responsables actifs uniquement
**GET** `/api/responsables/all`

### 4. Lister les responsables par année
**GET** `/api/responsables/annee/{annee}`

**Response :** Même format que la liste générale, mais filtrée par année.

### 5. Lister les responsables actifs d'un département
**GET** `/api/responsables/departement/{departementId}`

**Response :** Même format que la liste générale, mais filtrée par département.

### 6. Lister tous les responsables d'un département (actifs et inactifs)
**GET** `/api/responsables/departement/{departementId}/all`

**Response :** Même format que la liste générale, mais filtrée par département.

### 7. Récupérer un responsable par ID
**GET** `/api/responsables/{id}`

**Response :** Un seul objet responsable.

### 8. Mettre à jour un responsable
**PUT** `/api/responsables/{id}`

**Request Body :**
```json
{
    "annee": 2024,
    "utilisateurId": 1,
    "departementId": 2,
    "actif": true
}
```

### 9. Supprimer définitivement un responsable
**DELETE** `/api/responsables/{id}`

### 10. Désactiver un responsable (soft delete)
**PUT** `/api/responsables/{id}/deactivate`

## Règles Métier

### Contraintes de Validation
1. **Email unique :** Un utilisateur ne peut pas avoir le même email qu'un autre
2. **Matricule unique :** Un utilisateur ne peut pas avoir le même matricule qu'un autre
3. **Responsable unique par année :** Un utilisateur ne peut être responsable que d'un seul département par année
4. **Département unique par année :** Un département ne peut avoir qu'un seul responsable par année
5. **Année valide :** L'année doit être entre 2020 et 2030

### Processus de Création
1. Vérification de l'unicité de l'email et du matricule
2. Vérification qu'aucun responsable n'est déjà assigné au département pour l'année
3. Génération d'un mot de passe aléatoire de 8 caractères
4. Création de l'utilisateur avec le rôle "user"
5. Création de la relation responsable-département
6. Envoi d'un email avec les identifiants de connexion
7. Retour des informations du responsable créé

### Gestion des Erreurs
L'API retourne des messages d'erreur explicites en cas de :
- Email déjà utilisé
- Matricule déjà utilisé
- Département déjà assigné pour l'année
- Département inexistant
- Données invalides

## Exemples d'Utilisation

### Créer un responsable
```bash
curl -X POST http://localhost:8080/api/responsables \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Jane Smith",
    "email": "jane.smith@example.com",
    "matricule": "EMP002",
    "departementId": 2,
    "annee": 2024
  }'
```

### Lister tous les responsables
```bash
curl -X GET http://localhost:8080/api/responsables
```

### Lister les responsables de 2024
```bash
curl -X GET http://localhost:8080/api/responsables/annee/2024
```

## Base de Données

### Table `responsable_departement`
- `id` : Clé primaire
- `annee` : Année d'assignation
- `utilisateur_id` : Référence vers l'utilisateur
- `departement_id` : Référence vers le département
- `date_creation` : Date de création automatique
- `actif` : Statut actif/inactif

### Contraintes d'Unicité
- `uk_responsable_annee` : Un utilisateur ne peut être responsable que d'un département par année
- `uk_departement_annee` : Un département ne peut avoir qu'un responsable par année

## Sécurité

- Les mots de passe sont encodés avec BCrypt avant stockage
- Les mots de passe générés sont envoyés par email sécurisé
- L'API utilise Spring Security pour l'authentification
- Les contraintes de base de données garantissent l'intégrité des données 