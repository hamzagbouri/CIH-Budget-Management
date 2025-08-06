-- Remove departement_id column from utilisateur table
-- USER role users should not have a home department - their department assignment is only in ResponsableDepartement table

-- First, drop the foreign key constraint if it exists
ALTER TABLE utilisateur DROP FOREIGN KEY IF EXISTS fk_utilisateur_departement;

-- Remove the departement_id column
ALTER TABLE utilisateur DROP COLUMN IF EXISTS departement_id; 