-- Set Sarthak Godse as the only admin user
-- Remove admin role from all users first
UPDATE users SET role = 'viewer' WHERE role = 'admin';

-- Set admin role for Sarthak Godse only
UPDATE users SET role = 'admin' WHERE email = 'sarthakgodse03@gmail.com';

-- Verify the change
SELECT email, name, role FROM users WHERE email = 'sarthakgodse03@gmail.com';
