-- Add prestataire column to depense table
ALTER TABLE depense ADD COLUMN prestataire VARCHAR(255);

-- Update existing records to have a default prestataire value
UPDATE depense SET prestataire = 'Prestataire par défaut' WHERE prestataire IS NULL; 