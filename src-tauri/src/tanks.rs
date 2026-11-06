use rusqlite::types::{FromSql, FromSqlError, FromSqlResult, ToSql, ToSqlOutput, ValueRef};
use rusqlite::{params, Connection, OptionalExtension};
use crate::briefing::{missing, status_text, Missing};
use serde::{Deserialize, Serialize};

pub type AppResult<T> = Result<T, String>;

/// SQLite's own messages are English and technical: log them, show a plain Vietnamese one.
fn db_err(e: rusqlite::Error) -> String {
    eprintln!("db error: {e}");
    "Không lưu được dữ liệu, bạn thử lại nhé".into()
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

/// INSERT when `id` is None, else UPDATE with `id` bound after `p`. Returns the row id.
fn upsert(c: &Connection, id: Option<i64>, insert: &str, update: &str, p: &[&dyn ToSql]) -> AppResult<i64> {
    match id {
        None => {
            c.execute(insert, p).map_err(db_err)?;
            Ok(c.last_insert_rowid())
        }
        Some(id) => {
            let mut all = p.to_vec();
            all.push(&id);
            match c.execute(update, all.as_slice()).map_err(db_err)? {
                0 => Err("Không tìm thấy bản ghi".into()),
                _ => Ok(id),
            }
        }
    }
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
    let id = upsert(c, t.id,
        "INSERT INTO tanks(name,kind,length_cm,width_cm,height_cm,volume_l,setup_date,notes)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8)",
        "UPDATE tanks SET name=?1,kind=?2,length_cm=?3,width_cm=?4,height_cm=?5,volume_l=?6,
         setup_date=?7,notes=?8 WHERE id=?9",
        params![t.name, t.kind, t.length_cm, t.width_cm, t.height_cm, t.volume_l, t.setup_date, t.notes])?;
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

text_enum!(Purpose { Filter => "filter", Light => "light", Heater => "heater", Co2 => "co2",
                     Plug => "plug", Sensor => "sensor", Other => "other" });
text_enum!(Link { Tuya => "tuya", Bluetooth => "bluetooth", Wifi => "wifi", None => "none" });
text_enum!(Layer { Carpet => "carpet", Foreground => "foreground", Midground => "midground",
                   Background => "background", Unknown => "unknown" });

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct Device {
    pub id: Option<i64>,
    pub tank_id: i64,
    pub name: String,
    pub brand: Option<String>,
    pub model: Option<String>,
    pub purpose: Purpose,
    pub connection: Link,
    pub purchase_date: Option<String>,
    pub notes: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct Animal {
    pub id: Option<i64>,
    pub tank_id: i64,
    pub species: String,
    pub count: i64,
    pub notes: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct Plant {
    pub id: Option<i64>,
    pub tank_id: i64,
    pub name: String,
    pub layer: Layer,
    pub notes: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct TankDetail {
    pub tank: Tank,
    pub devices: Vec<Device>,
    pub animals: Vec<Animal>,
    pub plants: Vec<Plant>,
}

pub fn save_device(c: &Connection, d: Device) -> AppResult<Device> {
    let d = Device {
        name: required(&d.name, "Tên thiết bị không được để trống")?,
        brand: optional(d.brand),
        model: optional(d.model),
        purchase_date: optional(d.purchase_date),
        notes: optional(d.notes),
        ..d
    };
    let id = upsert(c, d.id,
        "INSERT INTO devices(tank_id,name,brand,model,purpose,connection,purchase_date,notes)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8)",
        "UPDATE devices SET tank_id=?1,name=?2,brand=?3,model=?4,purpose=?5,connection=?6,
         purchase_date=?7,notes=?8 WHERE id=?9",
        params![d.tank_id, d.name, d.brand, d.model, d.purpose, d.connection, d.purchase_date, d.notes])?;
    Ok(Device { id: Some(id), ..d })
}

pub fn save_animal(c: &Connection, a: Animal) -> AppResult<Animal> {
    let a = Animal { species: required(&a.species, "Tên loài không được để trống")?, notes: optional(a.notes), ..a };
    if a.count < 1 {
        return Err("Số lượng phải từ 1 trở lên".into());
    }
    let id = upsert(c, a.id,
        "INSERT INTO animals(tank_id,species,count,notes) VALUES (?1,?2,?3,?4)",
        "UPDATE animals SET tank_id=?1,species=?2,count=?3,notes=?4 WHERE id=?5",
        params![a.tank_id, a.species, a.count, a.notes])?;
    Ok(Animal { id: Some(id), ..a })
}

pub fn save_plant(c: &Connection, p: Plant) -> AppResult<Plant> {
    let p = Plant { name: required(&p.name, "Tên cây không được để trống")?, notes: optional(p.notes), ..p };
    let id = upsert(c, p.id,
        "INSERT INTO plants(tank_id,name,layer,notes) VALUES (?1,?2,?3,?4)",
        "UPDATE plants SET tank_id=?1,name=?2,layer=?3,notes=?4 WHERE id=?5",
        params![p.tank_id, p.name, p.layer, p.notes])?;
    Ok(Plant { id: Some(id), ..p })
}

fn delete_from(c: &Connection, table: &str, id: i64) -> AppResult<()> {
    c.execute(&format!("DELETE FROM {table} WHERE id=?1"), [id]).map_err(db_err)?;
    Ok(())
}

pub fn delete_device(c: &Connection, id: i64) -> AppResult<()> { delete_from(c, "devices", id) }
pub fn delete_animal(c: &Connection, id: i64) -> AppResult<()> { delete_from(c, "animals", id) }
pub fn delete_plant(c: &Connection, id: i64) -> AppResult<()> { delete_from(c, "plants", id) }

fn rows<T>(c: &Connection, sql: &str, id: i64, f: impl FnMut(&rusqlite::Row) -> rusqlite::Result<T>) -> AppResult<Vec<T>> {
    let mut st = c.prepare(sql).map_err(db_err)?;
    let out = st.query_map([id], f).map_err(db_err)?.collect::<rusqlite::Result<Vec<T>>>().map_err(db_err);
    out
}

pub fn get_tank(c: &Connection, id: i64) -> AppResult<TankDetail> {
    Ok(TankDetail {
        tank: get_tank_row(c, id)?,
        devices: rows(c, "SELECT id,tank_id,name,brand,model,purpose,connection,purchase_date,notes
                          FROM devices WHERE tank_id=?1 ORDER BY id", id, |r| Ok(Device {
            id: r.get(0)?, tank_id: r.get(1)?, name: r.get(2)?, brand: r.get(3)?, model: r.get(4)?,
            purpose: r.get(5)?, connection: r.get(6)?, purchase_date: r.get(7)?, notes: r.get(8)? }))?,
        animals: rows(c, "SELECT id,tank_id,species,count,notes FROM animals WHERE tank_id=?1 ORDER BY id", id,
            |r| Ok(Animal { id: r.get(0)?, tank_id: r.get(1)?, species: r.get(2)?, count: r.get(3)?, notes: r.get(4)? }))?,
        plants: rows(c, "SELECT id,tank_id,name,layer,notes FROM plants WHERE tank_id=?1 ORDER BY id", id,
            |r| Ok(Plant { id: r.get(0)?, tank_id: r.get(1)?, name: r.get(2)?, layer: r.get(3)?, notes: r.get(4)? }))?,
    })
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct TankOverview {
    pub tank: Tank,
    pub devices: i64,
    /// Total individuals (sum of counts).
    pub animals: i64,
    pub species: i64,
    pub plants: i64,
    pub missing: Vec<Missing>,
    pub status: String,
}

pub fn list_tanks(c: &Connection) -> AppResult<Vec<TankOverview>> {
    let mut st = c.prepare(&format!(
        "SELECT {TANK_COLS},
           (SELECT count(*) FROM devices d WHERE d.tank_id = t.id),
           (SELECT coalesce(sum(count),0) FROM animals a WHERE a.tank_id = t.id),
           (SELECT count(*) FROM animals a WHERE a.tank_id = t.id),
           (SELECT count(*) FROM plants p WHERE p.tank_id = t.id)
         FROM tanks t ORDER BY id")).map_err(db_err)?;
    let out = st.query_map([], |r| {
        let tank = tank_from_row(r)?;
        let (devices, animals, species, plants) = (r.get(9)?, r.get(10)?, r.get(11)?, r.get(12)?);
        let missing = missing(tank.kind, devices, animals, plants);
        let status = status_text(&missing);
        Ok(TankOverview { tank, devices, animals, species, plants, missing, status })
    }).map_err(db_err)?.collect::<rusqlite::Result<Vec<_>>>().map_err(db_err);
    out
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

    #[test]
    fn children_round_trip_vietnamese() {
        let c = db::open_in_memory().unwrap();
        let id = save_tank(&c, tank("Hồ cá 2", TankKind::Fish)).unwrap().id.unwrap();
        save_animal(&c, Animal { id: None, tank_id: id, species: "Cá chuột".into(), count: 6, notes: None }).unwrap();
        save_plant(&c, Plant { id: None, tank_id: id, name: "Ráy Nana".into(), layer: Layer::Midground, notes: None }).unwrap();
        save_device(&c, Device { id: None, tank_id: id, name: "Lọc thùng".into(), brand: Some("Chihiros".into()),
            model: None, purpose: Purpose::Filter, connection: Link::Tuya, purchase_date: None, notes: None }).unwrap();
        let d = get_tank(&c, id).unwrap();
        assert_eq!(d.animals[0].species, "Cá chuột");
        assert_eq!(d.plants[0].name, "Ráy Nana");
        assert_eq!(d.devices[0].connection, Link::Tuya);
    }

    #[test]
    fn rejects_zero_count() {
        let c = db::open_in_memory().unwrap();
        let id = save_tank(&c, tank("Hồ", TankKind::Fish)).unwrap().id.unwrap();
        let e = save_animal(&c, Animal { id: None, tank_id: id, species: "Neon".into(), count: 0, notes: None }).unwrap_err();
        assert_eq!(e, "Số lượng phải từ 1 trở lên");
        assert!(get_tank(&c, id).unwrap().animals.is_empty());
    }

    #[test]
    fn children_update_and_delete() {
        let c = db::open_in_memory().unwrap();
        let id = save_tank(&c, tank("Hồ", TankKind::Fish)).unwrap().id.unwrap();
        let a = save_animal(&c, Animal { id: None, tank_id: id, species: "Neon".into(), count: 12, notes: None }).unwrap();
        save_animal(&c, Animal { count: 10, ..a.clone() }).unwrap();
        assert_eq!(get_tank(&c, id).unwrap().animals[0].count, 10);
        delete_animal(&c, a.id.unwrap()).unwrap();
        assert!(get_tank(&c, id).unwrap().animals.is_empty());
        let e = save_plant(&c, Plant { id: None, tank_id: id, name: " ".into(), layer: Layer::Unknown, notes: None }).unwrap_err();
        assert_eq!(e, "Tên cây không được để trống");
    }

    #[test]
    fn list_tanks_counts() {
        let c = db::open_in_memory().unwrap();
        let id = save_tank(&c, tank("Hồ cá 1", TankKind::Fish)).unwrap().id.unwrap();
        for (s, n) in [("Neon", 12), ("Cá chuột", 6)] {
            save_animal(&c, Animal { id: None, tank_id: id, species: s.into(), count: n, notes: None }).unwrap();
        }
        let l = list_tanks(&c).unwrap();
        assert_eq!((l[0].animals, l[0].species, l[0].devices), (18, 2, 0));
        assert_eq!(l[0].status, "Chưa có thiết bị");
    }

    #[test]
    fn db_errors_are_vietnamese() {
        let c = db::open_in_memory().unwrap();
        // tank 999 does not exist: the foreign key fails inside SQLite
        let e = save_animal(&c, Animal { id: None, tank_id: 999, species: "Neon".into(), count: 1, notes: None }).unwrap_err();
        assert_eq!(e, "Không lưu được dữ liệu, bạn thử lại nhé");
    }
}
