use std::process::Command;
use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(not(debug_assertions))]
            {
                if let Ok(resource_dir) = app.path().resource_dir() {
                    let mut backend_exe = resource_dir.join("backend");
                    if !backend_exe.exists() {
                        if let Ok(exe_path) = std::env::current_exe() {
                            if let Some(exe_dir) = exe_path.parent() {
                                let local_backend = exe_dir.join("resources").join("backend");
                                if local_backend.exists() {
                                    backend_exe = local_backend;
                                }
                            }
                        }
                    }

                    if backend_exe.exists() {
                        let working_dir = backend_exe.parent().unwrap_or(&resource_dir);
                        let _ = Command::new(&backend_exe)
                            .current_dir(working_dir)
                            .spawn();
                    }
                }
            }
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}