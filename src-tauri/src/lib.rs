mod briefing;
mod commands;
mod db;
mod tanks;

use std::sync::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&dir)?;
            app.manage(Mutex::new(db::open(&dir.join("rium.db"))?));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::list_tanks, commands::get_tank, commands::get_briefing,
            commands::save_tank, commands::delete_tank,
            commands::save_device, commands::delete_device,
            commands::save_animal, commands::delete_animal,
            commands::save_plant, commands::delete_plant,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
