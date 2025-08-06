# 💰 Système de Gestion de Budget et Dépenses

## 📋 Description

Système complet de gestion de budget et dépenses par département développé avec Spring Boot. L'application permet aux responsables de département de gérer leurs budgets, créer et suivre leurs dépenses, et d'avoir une vue d'ensemble de leurs finances.

## 🚀 Fonctionnalités Principales

### 🔐 Authentification & Sécurité
- **JWT Authentication** : Système d'authentification sécurisé
- **Gestion des rôles** : ADMIN et USER (responsable département)
- **Gestion des mots de passe** : Réinitialisation et changement sécurisé

### 👤 Gestion des Utilisateurs
- **Profils utilisateurs** : Informations personnelles et départementales
- **Tableaux de bord** : Statistiques et analytics en temps réel
- **Gestion des responsables** : Attribution et réassignation de départements

### 🏢 Gestion des Départements
- **CRUD complet** : Création, lecture, mise à jour, suppression
- **Budgets annuels** : Attribution et suivi des budgets par année
- **Analytics** : Statistiques détaillées et rapports

### 💸 Gestion des Dépenses
- **Création de dépenses** : Interface intuitive pour ajouter des dépenses
- **Validation workflow** : Statuts EN_ATTENTE, VALIDEE, REFUSEE
- **Suivi des prestataires** : Gestion des fournisseurs et prestataires
- **Filtres avancés** : Par année, statut, prestataire

### 📊 Tableaux de Bord
- **Dashboard utilisateur** : Vue d'ensemble du département
- **Statistiques** : Pourcentage d'utilisation, budget restant
- **Graphiques** : Visualisation des données financières

### 🔔 Notifications
- **Système de notifications** : Alertes et mises à jour
- **Notifications en temps réel** : Statuts des dépenses

## 🛠️ Technologies Utilisées

### Backend
- **Spring Boot 3.5.3** : Framework principal
- **Spring Security** : Authentification et autorisation
- **Spring Data JPA** : Persistance des données
- **MySQL 8.0** : Base de données
- **JWT** : Tokens d'authentification
- **Swagger/OpenAPI** : Documentation API

### Frontend (à venir)
- **React.js** : Interface utilisateur
- **Material-UI** : Composants UI
- **Chart.js** : Graphiques et visualisations

## 📦 Installation et Configuration

### Prérequis
- **Java 21** ou supérieur
- **Maven 3.6** ou supérieur
- **MySQL 8.0** ou supérieur
- **Git**

### 1. Cloner le projet
```bash
git clone <repository-url>
cd demo
```

### 2. Configuration de la base de données
Créer une base de données MySQL :
```sql
CREATE DATABASE budget_management;
```

### 3. Configuration de l'application
Modifier `src/main/resources/application.properties` :
```properties
# Base de données
spring.datasource.url=jdbc:mysql://localhost:3306/budget_management
spring.datasource.username=votre_username
spring.datasource.password=votre_password

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT
jwt.secret=votre_secret_jwt_tres_long_et_securise
jwt.expiration=86400000

# Email (optionnel)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=votre_email@gmail.com
spring.mail.password=votre_mot_de_passe_app
```

### 4. Compilation et démarrage
```bash
# Compiler le projet
mvn clean compile

# Démarrer l'application
mvn spring-boot:run
```

## 🌐 Accès à l'Application

### URLs principales
- **Application** : `http://localhost:8080`
- **Swagger UI** : `http://localhost:8080/swagger-ui/index.html`
- **API Documentation** : `http://localhost:8080/v3/api-docs`

### Comptes de test
```
Email: test.user@company.com
Mot de passe: password123
Rôle: USER (Responsable Département SI)
```

## 📚 Documentation API

### Authentification
L'API utilise JWT (JSON Web Tokens) pour l'authentification. Incluez le token dans le header :
```
Authorization: Bearer <votre_token_jwt>
```

### Endpoints principaux

#### 🔐 Authentification (`/api/auth`)
- `POST /api/auth/login` - Connexion utilisateur
- `POST /api/auth/register` - Inscription utilisateur
- `POST /api/auth/logout` - Déconnexion

#### 👤 Utilisateur (`/api/user`)
- `GET /api/user/dashboard` - Tableau de bord
- `GET /api/user/profile` - Profil utilisateur
- `GET /api/user/depenses` - Liste des dépenses
- `POST /api/user/depenses` - Créer une dépense

#### 🏢 Responsables (`/api/responsables`)
- `GET /api/responsables` - Tous les responsables
- `POST /api/responsables` - Créer un responsable
- `PUT /api/responsables/{id}` - Mettre à jour

#### 💰 Budgets (`/api/budget-departements`)
- `GET /api/budget-departements` - Tous les budgets
- `POST /api/budget-departements` - Créer un budget

## 🗄️ Structure de la Base de Données

### Tables principales
- **utilisateur** : Informations des utilisateurs
- **departement** : Départements de l'entreprise
- **responsable_departement** : Assignations responsables/départements
- **budget_departement** : Budgets annuels par département
- **depense** : Dépenses avec statuts
- **notification** : Système de notifications

### Relations
- Un utilisateur peut être responsable de plusieurs départements (différentes années)
- Un département a un budget annuel
- Les dépenses appartiennent à un département
- Notifications liées aux utilisateurs

## 🔧 Développement

### Structure du projet
```
src/
├── main/
│   ├── java/com/example/demo/
│   │   ├── config/          # Configurations (Security, Swagger)
│   │   ├── controller/       # Contrôleurs REST
│   │   ├── dto/             # Objets de transfert de données
│   │   ├── entity/          # Entités JPA
│   │   ├── repository/      # Repositories Spring Data
│   │   ├── service/         # Services métier
│   │   └── util/            # Utilitaires (JWT, etc.)
│   └── resources/
│       ├── application.properties
│       └── db/migration/    # Migrations Flyway
```

### Commandes utiles
```bash
# Compiler
mvn compile

# Tests
mvn test

# Package JAR
mvn package

# Nettoyer
mvn clean

# Vérifier les dépendances
mvn dependency:tree
```

## 🧪 Tests

### Tests unitaires
```bash
mvn test
```

### Tests d'intégration
```bash
mvn verify
```

## 📊 Monitoring et Logs

### Logs
Les logs sont configurés pour afficher :
- Requêtes HTTP
- Erreurs d'authentification
- Opérations de base de données
- Performance des endpoints

### Métriques
- Temps de réponse des API
- Utilisation de la base de données
- Erreurs et exceptions

## 🔒 Sécurité

### Authentification
- **JWT Tokens** : Tokens sécurisés avec expiration
- **BCrypt** : Hachage des mots de passe
- **CORS** : Configuration pour les requêtes cross-origin

### Autorisation
- **Rôles** : ADMIN et USER
- **Permissions** : Basées sur les rôles et départements
- **Validation** : Toutes les données sont validées

## 🚀 Déploiement

### Environnement de développement
```bash
mvn spring-boot:run
```

### Environnement de production
```bash
# Build JAR
mvn clean package

# Exécuter
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

### Variables d'environnement
```bash
export SPRING_PROFILES_ACTIVE=prod
export DB_URL=jdbc:mysql://localhost:3306/budget_management
export DB_USERNAME=prod_user
export DB_PASSWORD=prod_password
export JWT_SECRET=your_production_jwt_secret
```

## 🤝 Contribution

### Guidelines
1. **Fork** le projet
2. **Créer** une branche feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** les changements (`git commit -m 'Add some AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir** une Pull Request

### Standards de code
- **Java** : Suivre les conventions Java
- **Spring Boot** : Bonnes pratiques Spring
- **Tests** : Couverture de code > 80%
- **Documentation** : Javadoc pour les méthodes publiques

## 📝 Changelog

### Version 1.0.0 (2025-08-06)
- ✅ Authentification JWT
- ✅ Gestion des utilisateurs et rôles
- ✅ CRUD départements et budgets
- ✅ Gestion des dépenses avec workflow
- ✅ Tableaux de bord et analytics
- ✅ Documentation Swagger complète
- ✅ Système de notifications

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

### Contact
- **Email** : dev@company.com
- **Documentation** : `http://localhost:8080/swagger-ui/index.html`
- **Issues** : Utiliser les GitHub Issues

### FAQ
**Q: Comment changer le mot de passe d'un utilisateur ?**
A: Utilisez l'endpoint `PUT /api/auth/password/{userId}`

**Q: Comment voir les dépenses d'un département ?**
A: Utilisez `GET /api/user/depenses` avec les filtres appropriés

**Q: Comment ajouter un nouveau département ?**
A: Utilisez `POST /api/departements` (nécessite le rôle ADMIN)

---

**Développé avec ❤️ par l'équipe de développement** 