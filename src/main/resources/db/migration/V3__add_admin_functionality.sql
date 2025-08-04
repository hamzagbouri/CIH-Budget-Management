-- Add description column to budget table
ALTER TABLE budget ADD COLUMN description VARCHAR(500);

-- Add description column to budget_departement table
ALTER TABLE budget_departement ADD COLUMN description VARCHAR(500);

-- Add unique constraint to budget table for annee (one budget per year)
ALTER TABLE budget ADD CONSTRAINT uk_budget_annee UNIQUE (annee);

-- Add unique constraint to budget_departement table for departement_id and annee (one budget per department per year)
ALTER TABLE budget_departement ADD CONSTRAINT uk_budget_departement_departement_annee UNIQUE (departement_id, annee);

-- Update existing records to have default descriptions
UPDATE budget SET description = 'Budget principal pour l''année ' || annee WHERE description IS NULL;
UPDATE budget_departement SET description = 'Budget département pour l''année ' || annee WHERE description IS NULL; 