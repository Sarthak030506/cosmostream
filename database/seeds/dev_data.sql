-- Development seed data

BEGIN;

-- Insert test users
-- Password for all test users: password123
INSERT INTO users (id, email, password_hash, name, role) VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin@cosmostream.com', '$2b$10$HOd7SaWxLSSC78b7unV/o.FK/d7fh.47o23RZXzv5n9OBYU9tTo/6', 'Admin User', 'admin'),
    ('00000000-0000-0000-0000-000000000002', 'creator@cosmostream.com', '$2b$10$HOd7SaWxLSSC78b7unV/o.FK/d7fh.47o23RZXzv5n9OBYU9tTo/6', 'Dr. Jane Smith', 'creator'),
    ('00000000-0000-0000-0000-000000000003', 'viewer@cosmostream.com', '$2b$10$HOd7SaWxLSSC78b7unV/o.FK/d7fh.47o23RZXzv5n9OBYU9tTo/6', 'John Doe', 'viewer')
ON CONFLICT DO NOTHING;

-- Insert creator profile
INSERT INTO creator_profiles (user_id, verified, approval_status, credentials) VALUES
    ('00000000-0000-0000-0000-000000000002', true, 'approved', 'PhD in Astrophysics, MIT')
ON CONFLICT DO NOTHING;

-- Insert test videos
INSERT INTO videos (id, title, description, creator_id, status, category, difficulty, tags) VALUES
    ('10000000-0000-0000-0000-000000000001', 'Introduction to Black Holes', 'A comprehensive guide to understanding black holes', '00000000-0000-0000-0000-000000000002', 'ready', 'Astrophysics', 'Beginner', ARRAY['black holes', 'physics', 'tutorial']),
    ('10000000-0000-0000-0000-000000000002', 'The James Webb Space Telescope', 'Latest discoveries from JWST', '00000000-0000-0000-0000-000000000002', 'ready', 'Space Exploration', 'Intermediate', ARRAY['jwst', 'nasa', 'astronomy']),
    ('10000000-0000-0000-0000-000000000003', 'Dark Matter Explained', 'Understanding the invisible universe', '00000000-0000-0000-0000-000000000002', 'ready', 'Cosmology', 'Beginner', ARRAY['dark matter', 'cosmology', 'physics'])
ON CONFLICT DO NOTHING;

-- Insert forum thread
INSERT INTO threads (id, title, creator_id, category, tags) VALUES
    ('20000000-0000-0000-0000-000000000001', 'Best telescopes for beginners?', '00000000-0000-0000-0000-000000000003', 'Equipment & Gear', ARRAY['telescope', 'beginner'])
ON CONFLICT DO NOTHING;

-- Insert posts
INSERT INTO posts (thread_id, author_id, content) VALUES
    ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'What are the best telescopes for someone just starting out in astronomy?'),
    ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'I recommend starting with a good refractor or Dobsonian telescope. The Celestron NexStar series is excellent for beginners.')
ON CONFLICT DO NOTHING;

COMMIT;
