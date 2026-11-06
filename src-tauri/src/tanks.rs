use rusqlite::types::{FromSql, FromSqlError, FromSqlResult, ToSql, ToSqlOutput, ValueRef};
use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};

pub type AppResult<T> = Result<T, String>;

fn db_err(e: rusqlite::Error) -> String {
    e.to_string()
}

/// Enum stored as TEXT: the same lowercase strings in SQL and JSON.
macro_rules! text_enum {
    ($name:ident { $($variant:ident => $text:literal),+ $(,)? }) => {
        #[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq)]
        pub enum $name { $(#[serde(rename = $text)] $variant),+ }
        impl ToSql for $name {
            fn to_sql(&self) -> rusqlite::Result<ToSqlOutput<'_>> {
                Ok(ToSqlOutput::from(match self { $(Self::$variant => $text),+ }))
            }
        }
        impl FromSql for $name {
            fn column_result(v: ValueRef<'_>) -> FromSqlResult<Self> {
                match v.as_str()? { $($text => Ok(Self::$variant),)+ _ => Err(FromSqlError::InvalidType) }
            }
        }
    };
}

text_enum!(TankKind { Fish => "fish", Planted => "planted", Terrarium => "terrarium", Paludarium => "paludarium" });

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct Tank {
    pub id: Option<i64>,
    pub name: String,
    pub kind: TankKind,
    pub length_cm: Option<f64>,
    pub width_cm: Option<f64>,
    pub height_cm: Option<f64>,
    pub volume_l: Option<f64>,
    pub setup_date: Option<String>,
    pub notes: Option<String>,
}

/// Trimmed text, or an error when nothing is left.
fn required(s: &str, msg: &str) -> AppResult<String> {
    let s = s.trim();
    if s.is_empty() { Err(msg.into()) } else { Ok(s.into()) }
}

/// Blank optional text becomes None.
fn optional(s: Option<String>) -> Option<String> {
    s.map(|s| s.trim().to_string()).filter(|s| !s.is_empty())
}

pub fn save_tank(c: &Connection, t: Tank) -> AppResult<Tank> {
    let t = Tank {
        name: required(&t.name, "Tên bể không được để trống")?,
        setup_date: optional(t.setup_date),
        notes: optional(t.notes),
        ..t
    };
    if [t.length_cm, t.width_cm, t.height_cm, t.volume_l].iter().flatten().any(|v| *v <= 0.0) {
        return Err("Kích thước và thể tích phải lớn hơn 0".into());
    }
    let id = match t.id {
        None => {
            c.execute("INSERT INTO tanks(name,kind,length_cm,width_cm,height_cm,volume_l,setup_date,notes)
                       VALUES (?1,?2,?3,?4,?5,?6,?7,?8)",
                      params![t.name, t.kind, t.length_cm, t.width_cm, t.height_cm, t.volume_l,
                              t.setup_date, t.notes]).map_err(db_err)?;
            c.last_insert_rowid()
        }
        Some(id) => {
            let n = c.execute("UPDATE tanks SET name=?1,kind=?2,length_cm=?3,width_cm=?4,height_cm=?5,
                               volume_l=?6,setup_date=?7,notes=?8 WHERE id=?9",
                              params![t.name, t.kind, t.length_cm, t.width_cm, t.height_cm, t.volume_l,
                                      t.setup_date, t.notes, id]).map_err(db_err)?;
            if n == 0 { return Err("Không tìm thấy bể".into()); }
            id
        }
    };
    Ok(Tank { id: Some(id), ..t })
}

pub fn delete_tank(c: &Connection, id: i64) -> AppResult<()> {
    c.execute("DELETE FROM tanks WHERE id=?1", [id]).map_err(db_err)?;
    Ok(())
}

const TANK_COLS: &str = "id,name,kind,length_cm,width_cm,height_cm,volume_l,setup_date,notes";

fn tank_from_row(r: &rusqlite::Row) -> rusqlite::Result<Tank> {
    Ok(Tank { id: r.get(0)?, name: r.get(1)?, kind: r.get(2)?, length_cm: r.get(3)?, width_cm: r.get(4)?,
              height_cm: r.get(5)?, volume_l: r.get(6)?, setup_date: r.get(7)?, notes: r.get(8)? })
}

pub fn get_tank_row(c: &Connection, id: i64) -> AppResult<Tank> {
    c.query_row(&format!("SELECT {TANK_COLS} FROM tanks WHERE id=?1"), [id], tank_from_row)
        .optional().map_err(db_err)?
        .ok_or_else(|| "Không tìm thấy bể".into())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db;

    fn tank(name: &str, kind: TankKind) -> Tank {
        Tank { id: None, name: name.into(), kind, length_cm: None, width_cm: None, height_cm: None,
               volume_l: None, setup_date: None, notes: None }
    }

    #[test]
    fn save_then_update_tank() {
        let c = db::open_in_memory().unwrap();
        let t = save_tank(&c, tank("  Hồ cá 2 ", TankKind::Fish)).unwrap();
        assert_eq!(t.name, "Hồ cá 2");
        assert!(t.id.is_some());
        let t2 = save_tank(&c, Tank { volume_l: Some(73.0), ..t.clone() }).unwrap();
        assert_eq!(get_tank_row(&c, t.id.unwrap()).unwrap().volume_l, Some(73.0));
        assert_eq!(t2.id, t.id);
    }

    #[test]
    fn rejects_blank_name_and_non_positive_size() {
        let c = db::open_in_memory().unwrap();
        assert_eq!(save_tank(&c, tank("   ", TankKind::Fish)).unwrap_err(), "Tên bể không được để trống");
        let bad = Tank { length_cm: Some(0.0), ..tank("Hồ", TankKind::Fish) };
        assert_eq!(save_tank(&c, bad).unwrap_err(), "Kích thước và thể tích phải lớn hơn 0");
    }

    #[test]
    fn delete_tank_cascades() {
        let c = db::open_in_memory().unwrap();
        let id = save_tank(&c, tank("Terra", TankKind::Terrarium)).unwrap().id.unwrap();
        c.execute("INSERT INTO plants(tank_id,name,layer) VALUES (?1,'Rêu','carpet')", [id]).unwrap();
        delete_tank(&c, id).unwrap();
        let n: i64 = c.query_row("SELECT count(*) FROM plants", [], |r| r.get(0)).unwrap();
        assert_eq!(n, 0);
    }
}
