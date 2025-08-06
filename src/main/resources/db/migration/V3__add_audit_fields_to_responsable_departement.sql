-- Add audit fields to responsable_departement table
ALTER TABLE responsable_departement 
ADD COLUMN date_modification DATETIME NULL,
ADD COLUMN utilisateur_modification VARCHAR(255) NULL,
ADD COLUMN raison_modification VARCHAR(500) NULL;

-- Add indexes for better performance
CREATE INDEX idx_responsable_departement_utilisateur_annee ON responsable_departement(utilisateur_id, annee);
CREATE INDEX idx_responsable_departement_departement_annee ON responsable_departement(departement_id, annee);
CREATE INDEX idx_responsable_departement_actif ON responsable_departement(actif);
CREATE INDEX idx_responsable_departement_date_modification ON responsable_departement(date_modification);
CREATE INDEX idx_responsable_departement_utilisateur_modification ON responsable_departement(utilisateur_modification); 