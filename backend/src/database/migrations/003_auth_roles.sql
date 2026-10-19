ALTER TABLE users ADD COLUMN IF NOT EXISTS role varchar(30);
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

UPDATE users
SET role = CASE
  WHEN role IN ('Administrator', 'admin') THEN 'admin'
  ELSE 'user'
END;

ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user';
ALTER TABLE users ALTER COLUMN role SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'user'));
