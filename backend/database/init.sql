-- Criar schema jobify
CREATE SCHEMA IF NOT EXISTS jobify;

-- Inserir usuário demo
INSERT INTO jobify.users (id, email, created_at) 
VALUES (1, 'demo@jobify.com', NOW()) 
ON CONFLICT (id) DO NOTHING;

-- Inserir algumas categorias padrão
INSERT INTO jobify.categories (name, slug) VALUES 
('Software Development', 'software-development'),
('Design', 'design'),
('Marketing', 'marketing'),
('Customer Support', 'customer-support'),
('Sales', 'sales'),
('Data Science', 'data-science'),
('DevOps', 'devops'),
('Product Management', 'product-management')
ON CONFLICT (slug) DO NOTHING;