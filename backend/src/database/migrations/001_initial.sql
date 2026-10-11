CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(160) NOT NULL,
  date date NOT NULL,
  participants integer NOT NULL DEFAULT 0 CHECK (participants >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title varchar(240) NOT NULL,
  status varchar(30) NOT NULL DEFAULT 'Offen' CHECK (status IN ('Offen', 'In Bearbeitung', 'Erledigt')),
  priority varchar(20) NOT NULL DEFAULT 'Mittel' CHECK (priority IN ('Niedrig', 'Mittel', 'Hoch')),
  owner varchar(160),
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name varchar(160) NOT NULL,
  project_role varchar(160),
  access_role varchar(30) NOT NULL DEFAULT 'Betrachter' CHECK (access_role IN ('Betrachter', 'Bearbeiter', 'Administrator')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title varchar(240) NOT NULL,
  category varchar(120) NOT NULL DEFAULT 'Sonstiges',
  amount numeric(12, 2) NOT NULL CHECK (amount >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  author varchar(160) NOT NULL DEFAULT 'Unbekannt',
  initials varchar(10) NOT NULL DEFAULT '??',
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX tasks_event_id_idx ON tasks(event_id);
CREATE INDEX members_event_id_idx ON members(event_id);
CREATE INDEX costs_event_id_idx ON costs(event_id);
CREATE INDEX comments_event_id_idx ON comments(event_id);
