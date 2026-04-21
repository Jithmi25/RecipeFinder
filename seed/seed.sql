CREATE TABLE IF NOT EXISTS recipes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  instructions TEXT,
  prep_minutes INT,
  cook_minutes INT,
  servings INT,
  popularity INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  normalized_name VARCHAR(128) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  recipe_id BIGINT NOT NULL,
  ingredient_id INT NOT NULL,
  quantity VARCHAR(64),
  PRIMARY KEY (recipe_id, ingredient_id),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS diet_types (
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

INSERT IGNORE INTO diet_types (key_name, display_name) VALUES
('vegan', 'Vegan'),
('vegetarian', 'Vegetarian'),
('gluten_free', 'Gluten Free'),
('keto', 'Keto');

INSERT IGNORE INTO ingredients (name, normalized_name) VALUES
('Chicken Breast', 'chicken breast'),
('Olive Oil', 'olive oil'),
('Salt', 'salt'),
('Black Pepper', 'black pepper'),
('Garlic', 'garlic'),
('Onion', 'onion'),
('Tomato', 'tomato'),
('Basil', 'basil'),
('Parmesan Cheese', 'parmesan'),
('Spaghetti', 'spaghetti'),
('Flour', 'flour'),
('Sugar', 'sugar'),
('Butter', 'butter'),
('Egg', 'egg'),
('Milk', 'milk'),
('Chickpeas', 'chickpea'),
('Cumin', 'cumin'),
('Turmeric', 'turmeric'),
('Ginger', 'ginger'),
('Rice', 'rice');

INSERT IGNORE INTO recipes (title, slug, description, instructions, prep_minutes, cook_minutes, servings, popularity) VALUES
('Garlic Chicken', 'garlic-chicken', 'Simple garlic chicken with herbs', '1. Season chicken with salt, pepper, and garlic.\n2. Sear in olive oil and finish until cooked through.', 15, 30, 4, 120),
('Tomato Basil Pasta', 'tomato-basil-pasta', 'Quick pasta with fresh tomato and basil', '1. Boil pasta until al dente.\n2. Saute tomato and garlic, then toss with basil and pasta.', 10, 15, 2, 95),
('Chickpea Curry', 'chickpea-curry', 'Hearty vegan chickpea curry', '1. Saute onion with cumin and turmeric.\n2. Add chickpeas and simmer until thick.', 15, 25, 4, 60);

INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
(1, (SELECT id FROM ingredients WHERE normalized_name = 'chicken breast'), '500g'),
(1, (SELECT id FROM ingredients WHERE normalized_name = 'garlic'), '4 cloves'),
(1, (SELECT id FROM ingredients WHERE normalized_name = 'olive oil'), '2 tbsp'),
(2, (SELECT id FROM ingredients WHERE normalized_name = 'spaghetti'), '200g'),
(2, (SELECT id FROM ingredients WHERE normalized_name = 'tomato'), '3 medium'),
(2, (SELECT id FROM ingredients WHERE normalized_name = 'basil'), '1 handful'),
(3, (SELECT id FROM ingredients WHERE normalized_name = 'chickpea'), '2 cups'),
(3, (SELECT id FROM ingredients WHERE normalized_name = 'cumin'), '1 tsp'),
(3, (SELECT id FROM ingredients WHERE normalized_name = 'turmeric'), '1/2 tsp');

INSERT IGNORE INTO recipe_diet_types (recipe_id, diet_type_id) VALUES
(2, (SELECT id FROM diet_types WHERE key_name = 'vegetarian')),
(3, (SELECT id FROM diet_types WHERE key_name = 'vegan'));
