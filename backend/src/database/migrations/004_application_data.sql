CREATE TABLE IF NOT EXISTS people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  name varchar(160) NOT NULL,
  email varchar(320) NOT NULL,
  project_role varchar(160),
  access_role varchar(30) NOT NULL DEFAULT 'Bearbeiter' CHECK (access_role IN ('Betrachter', 'Bearbeiter', 'Administrator')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO people (account_id, name, email, access_role)
SELECT u.id, u.name, u.email, CASE WHEN u.role = 'admin' THEN 'Administrator' ELSE 'Bearbeiter' END
FROM users u
ON CONFLICT (account_id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, access_role = EXCLUDED.access_role;

CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(160) NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS team_members (
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (team_id, person_id)
);

CREATE TABLE IF NOT EXISTS event_teams (
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, team_id)
);

CREATE TABLE IF NOT EXISTS event_people (
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, person_id)
);

ALTER TABLE events ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE events ADD COLUMN IF NOT EXISTS end_date date;
ALTER TABLE events ADD COLUMN IF NOT EXISTS start_time time;
ALTER TABLE events ADD COLUMN IF NOT EXISTS end_time time;
ALTER TABLE events ADD COLUMN IF NOT EXISTS location varchar(240) NOT NULL DEFAULT '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS image text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES users(id) ON DELETE SET NULL;
UPDATE events SET start_date = date WHERE start_date IS NULL;
UPDATE events SET end_date = COALESCE(end_date, start_date, date) WHERE end_date IS NULL;
ALTER TABLE events ALTER COLUMN start_date SET NOT NULL;
ALTER TABLE events ALTER COLUMN end_date SET NOT NULL;

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignee_id uuid REFERENCES people(id) ON DELETE SET NULL;
ALTER TABLE costs ADD COLUMN IF NOT EXISTS note text NOT NULL DEFAULT '';
ALTER TABLE costs ADD COLUMN IF NOT EXISTS task_id uuid REFERENCES tasks(id) ON DELETE SET NULL;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS task_id uuid REFERENCES tasks(id) ON DELETE CASCADE;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS type varchar(30) NOT NULL DEFAULT 'comment';
ALTER TABLE comments ADD COLUMN IF NOT EXISTS to_email varchar(320);
ALTER TABLE comments ADD COLUMN IF NOT EXISTS subject varchar(240);
ALTER TABLE members ADD COLUMN IF NOT EXISTS person_id uuid REFERENCES people(id) ON DELETE CASCADE;

INSERT INTO people (name, email, project_role, access_role)
SELECT m.name, COALESCE(NULLIF(m.name, ''), 'Unbekannt') || '@local.invalid', m.project_role, m.access_role
FROM members m
WHERE NOT EXISTS (SELECT 1 FROM people p WHERE p.name = m.name AND p.email = COALESCE(NULLIF(m.name, ''), 'Unbekannt') || '@local.invalid');

UPDATE members m
SET person_id = p.id
FROM people p
WHERE m.person_id IS NULL AND p.name = m.name AND p.email = COALESCE(NULLIF(m.name, ''), 'Unbekannt') || '@local.invalid';

CREATE INDEX IF NOT EXISTS people_account_id_idx ON people(account_id);
CREATE INDEX IF NOT EXISTS team_members_person_id_idx ON team_members(person_id);
CREATE INDEX IF NOT EXISTS event_people_person_id_idx ON event_people(person_id);
CREATE INDEX IF NOT EXISTS tasks_assignee_id_idx ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS costs_task_id_idx ON costs(task_id);
CREATE INDEX IF NOT EXISTS comments_task_id_idx ON comments(task_id);
