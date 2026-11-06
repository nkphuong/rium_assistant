use crate::briefing::{self, Bubble};
use crate::tanks::{self, Animal, AppResult, Device, Plant, Tank, TankDetail, TankOverview};
use rusqlite::Connection;
use std::sync::Mutex;
use tauri::State;

type Db<'a> = State<'a, Mutex<Connection>>;

fn with<T>(db: Db, f: impl FnOnce(&Connection) -> AppResult<T>) -> AppResult<T> {
    let c = db.lock().map_err(|e| e.to_string())?;
    f(&c)
}

#[tauri::command]
pub fn list_tanks(db: Db) -> AppResult<Vec<TankOverview>> { with(db, tanks::list_tanks) }
#[tauri::command]
pub fn get_tank(db: Db, id: i64) -> AppResult<TankDetail> { with(db, |c| tanks::get_tank(c, id)) }
#[tauri::command]
pub fn get_briefing(db: Db) -> AppResult<Vec<Bubble>> { with(db, |c| Ok(briefing::briefing(&tanks::list_tanks(c)?))) }
#[tauri::command]
pub fn save_tank(db: Db, tank: Tank) -> AppResult<Tank> { with(db, |c| tanks::save_tank(c, tank)) }
#[tauri::command]
pub fn delete_tank(db: Db, id: i64) -> AppResult<()> { with(db, |c| tanks::delete_tank(c, id)) }
#[tauri::command]
pub fn save_device(db: Db, device: Device) -> AppResult<Device> { with(db, |c| tanks::save_device(c, device)) }
#[tauri::command]
pub fn delete_device(db: Db, id: i64) -> AppResult<()> { with(db, |c| tanks::delete_device(c, id)) }
#[tauri::command]
pub fn save_animal(db: Db, animal: Animal) -> AppResult<Animal> { with(db, |c| tanks::save_animal(c, animal)) }
#[tauri::command]
pub fn delete_animal(db: Db, id: i64) -> AppResult<()> { with(db, |c| tanks::delete_animal(c, id)) }
#[tauri::command]
pub fn save_plant(db: Db, plant: Plant) -> AppResult<Plant> { with(db, |c| tanks::save_plant(c, plant)) }
#[tauri::command]
pub fn delete_plant(db: Db, id: i64) -> AppResult<()> { with(db, |c| tanks::delete_plant(c, id)) }
