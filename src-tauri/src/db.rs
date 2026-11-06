use rusqlite::Connection;
use std::path::Path;

const SCHEMA_V1: &str = "
CREATE TABLE tanks (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL CHECK (trim(name) <> ''),
  kind TEXT NOT NULL CHECK (kind IN ('fish','planted','terrarium','paludarium')),
  length_cm REAL CHECK (length_cm > 0), width_cm REAL CHECK (width_cm > 0),
  height_cm REAL CHECK (height_cm > 0), volume_l REAL CHECK (volume_l > 0),
  setup_date TEXT, notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE devices (
  id INTEGER PRIMARY KEY, tank_id INTEGER NOT NULL REFERENCES tanks(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (trim(name) <> ''), brand TEXT, model TEXT,
  purpose TEXT NOT NULL CHECK (purpose IN ('filter','light','heater','co2','plug','sensor','other')),
  connection TEXT NOT NULL CHECK (connection IN ('tuya','bluetooth','wifi','none')),
  purchase_date TEXT, notes TEXT);
CREATE TABLE animals (
  id INTEGER PRIMARY KEY, tank_id INTEGER NOT NULL REFERENCES tanks(id) ON DELETE CASCADE,
  species TEXT NOT NULL CHECK (trim(species) <> ''), count INTEGER NOT NULL CHECK (count >= 1), notes TEXT);
CREATE TABLE plants (
  id INTEGER PRIMARY KEY, tank_id INTEGER NOT NULL REFERENCES tanks(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (trim(name) <> ''),
  layer TEXT NOT NULL CHECK (layer IN ('carpet','foreground','midground','background','unknown')), notes TEXT);
PRAGMA user_version = 1;
";

pub fn open(path: &Path) -> rusqlite::Result<Connection> {
    prepare(Connection::open(path)?)
}

#[cfg(test)]
pub fn open_in_memory() -> rusqlite::Result<Connection> {
    prepare(Connection::open_in_memory()?)
}

fn prepare(mut c: Connection) -> rusqlite::Result<Connection> {
    // SQLite ships with foreign keys off; cascade deletes depend on this.
    c.pragma_update(None, "foreign_keys", "ON")?;
    let v: i64 = c.query_row("PRAGMA user_version", [], |r| r.get(0))?;
    if v < 1 {
        let tx = c.transaction()?;
        tx.execute_batch(SCHEMA_V1)?;
        tx.commit()?;
    }
    Ok(c)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn migrate_is_idempotent_and_keeps_data() {
        let p = std::env::temp_dir().join(format!("rium-test-{}.db", std::process::id()));
        let _ = std::fs::remove_file(&p);
        {
            let c = open(&p).unwrap();
            c.execute("INSERT INTO tanks(name, kind) VALUES ('Hồ cá 1','fish')", []).unwrap();
        }
        let c = open(&p).unwrap(); // migrate runs a second time
        let n: i64 = c.query_row("SELECT count(*) FROM tanks", [], |r| r.get(0)).unwrap();
        assert_eq!(n, 1);
        let v: i64 = c.query_row("PRAGMA user_version", [], |r| r.get(0)).unwrap();
        assert_eq!(v, 1);
        let fk: i64 = c.query_row("PRAGMA foreign_keys", [], |r| r.get(0)).unwrap();
        assert_eq!(fk, 1);
        drop(c);
        std::fs::remove_file(&p).unwrap();
    }
}
