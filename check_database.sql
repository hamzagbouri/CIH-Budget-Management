-- Check if the responsable_departement table exists
SHOW TABLES LIKE 'responsable_departement';

-- Check the structure of the responsable_departement table
DESCRIBE responsable_departement;

-- Check if there are any records in the responsable_departement table
SELECT COUNT(*) as total_responsables FROM responsable_departement;

-- Check all records in the responsable_departement table
SELECT * FROM responsable_departement;

-- Check users with role 'user'
SELECT id, nom, email, role, matricule FROM utilisateur WHERE role = 'user';

-- Check all users
SELECT id, nom, email, role, matricule FROM utilisateur;

-- Check departments
SELECT id, nom FROM departement; 