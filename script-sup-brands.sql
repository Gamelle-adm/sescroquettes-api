-- vider statistics, rating, history, favorites avant sinon pb de foreign keys
DELETE FROM Food
WHERE brand NOT IN ("Feringa", "Nutrivia", "Dechra Specific", "Taste of the Wild", "Equilibre & Instinct", "Atavik !", "Applaws", "Cosma", "Casino", "Animonda");
