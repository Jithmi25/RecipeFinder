-- Schema: recipes, ingredients, recipe_ingredients, diet_types, recipe_diet_types
id INT AUTO_INCREMENT PRIMARY KEY,
key_name VARCHAR(64) NOT NULL UNIQUE,
display_name VARCHAR(128)
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS recipe_diet_types (
recipe_id BIGINT NOT NULL,
diet_type_id INT NOT NULL,
PRIMARY KEY (recipe_id, diet_type_id),
FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
FOREIGN KEY (diet_type_id) REFERENCES diet_types(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- Insert sample diet types
INSERT IGNORE INTO diet_types (key_name, display_name) VALUES
('vegan','Vegan'), ('vegetarian','Vegetarian'), ('gluten_free','Gluten Free'), ('keto','Keto');


-- Sample ingredients (normalized_name lowercased)
INSERT IGNORE INTO ingredients (name, normalized_name) VALUES
('Chicken Breast','chicken breast'),
('Olive Oil','olive oil'),
('Salt','salt'),
('Black Pepper','black pepper'),
('Garlic','garlic'),
('Onion','onion'),
('Tomato','tomato'),
('Basil','basil'),
('Parmesan Cheese','parmesan'),
('Spaghetti','spaghetti'),
('Flour','flour'),
('Sugar','sugar'),
('Butter','butter'),
('Egg','egg'),
('Milk','milk'),
('Chickpeas','chickpea'),
('Cumin','cumin'),
('Turmeric','turmeric'),
('Ginger','ginger'),
('Rice','rice');


-- A few sample recipes
INSERT INTO recipes (title, slug, description, instructions, prep_minutes, cook_minutes, servings, popularity) VALUES
('Garlic Chicken','garlic-chicken','Simple garlic chicken with herbs','1. Season chicken... 2. Sear and bake...',15,30,4,120),
('Tomato Basil Pasta','tomato-basil-pasta','Quick pasta with fresh tomato and basil','1. Boil pasta... 2. Saute tomatoes...',10,15,2,95),
('Chickpea Curry','chickpea-curry','Hearty vegan chickpea curry','1. Saute onion and spices... 2. Add chickpeas and simmer',15,25,4,60);


-- recipe_ingredients linking
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
(1, (SELECT id FROM ingredients WHERE normalized_name='chicken breast'), '500g'),
(1, (SELECT id FROM ingredients WHERE normalized_name='garlic'), '4 cloves'),
(1, (SELECT id FROM ingredients WHERE normalized_name='olive oil'), '2 tbsp'),
(2, (SELECT id FROM ingredients WHERE normalized_name='spaghetti'), '200g'),
(2, (SELECT id FROM ingredients WHERE normalized_name='tomato'), '3 medium'),
(2, (SELECT id FROM ingredients WHERE normalized_name='basil'), 'handful'),
(3, (SELECT id FROM ingredients WHERE normalized_name='chickpea'), '2 cups'),
(3, (SELECT id FROM ingredients WHERE normalized_name='cumin'), '1 tsp'),
(3, (SELECT id FROM ingredients WHERE normalized_name='turmeric'), '1/2 tsp');


-- Link diets
INSERT IGNORE INTO recipe_diet_types (recipe_id, diet_type_id) VALUES
(2, (SELECT id FROM diet_types WHERE key_name='vegetarian')),
(3, (SELECT id FROM diet_types WHERE key_name='vegan'));