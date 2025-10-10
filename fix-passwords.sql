-- Fix password hashes for all test users
-- This sets all passwords to "password123"

UPDATE users
SET password_hash = '$2b$10$HOd7SaWxLSSC78b7unV/o.FK/d7fh.47o23RZXzv5n9OBYU9tTo/6'
WHERE email IN ('admin@cosmostream.com', 'creator@cosmostream.com', 'viewer@cosmostream.com');

SELECT email, name, role FROM users;
