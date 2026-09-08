#[allow(unused_imports)]
use std::process::Command;
#[allow(unused_imports)]
use tauri::Manager;
use keyring::Entry;

const SERVICE_NAME: &str = "enfoco_sistema_nomina";
const ACCOUNT_NAME: &str = "active_session_token";

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn log_terminal(msg: String) {
    println!("\x1b[1;32m[AUTO-UPDATE]\x1b[0m {}", msg);
}

#[tauri::command]
fn guardar_token_seguro(token: String) -> Result<(), String> {
    let entry = Entry::new(SERVICE_NAME, ACCOUNT_NAME).map_err(|e| e.to_string())?;
    entry.set_password(&token).map_err(|e| e.to_string())
}

#[tauri::command]
fn obtener_token_seguro() -> Result<Option<String>, String> {
    let entry = Entry::new(SERVICE_NAME, ACCOUNT_NAME).map_err(|e| e.to_string())?;
    match entry.get_password() {
        Ok(password) => Ok(Some(password)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
fn eliminar_token_seguro() -> Result<(), String> {
    let entry = Entry::new(SERVICE_NAME, ACCOUNT_NAME).map_err(|e| e.to_string())?;
    match entry.delete_credential() {
        Ok(_) | Err(keyring::Error::NoEntry) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(target_os = "linux")]
    {
        // Evita el fallo de EGL y pantalla en blanco de WebKitGTK en Arch Linux / CachyOS
        if std::env::var("WEBKIT_DISABLE_DMABUF_RENDERER").is_err() {
            std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
        }
    }

    tauri::Builder::default()
        .setup(|_app| {
            #[cfg(not(debug_assertions))]
            {
                let binary_name = if cfg!(windows) { "backend.exe" } else { "backend" };
                let mut candidate_paths = Vec::new();
                if let Ok(res_dir) = _app.path().resource_dir() {
                    candidate_paths.push(res_dir.join(binary_name));
                    candidate_paths.push(res_dir.join("resources").join(binary_name));
                }
                if let Ok(exe_path) = std::env::current_exe() {
                    if let Some(exe_dir) = exe_path.parent() {
                        candidate_paths.push(exe_dir.join("resources").join(binary_name));
                        candidate_paths.push(exe_dir.join(binary_name));
                        if let Some(parent_dir) = exe_dir.parent() {
                            candidate_paths.push(parent_dir.join("lib").join("sistema-nomina").join("resources").join(binary_name));
                            candidate_paths.push(parent_dir.join("resources").join(binary_name));
                        }
                    }
                }

                let mut found_backend: Option<std::path::PathBuf> = None;
                for path in candidate_paths {
                    if path.exists() {
                        found_backend = Some(path);
                        break;
                    }
                }

                if let Some(backend_exe) = found_backend {
                    #[cfg(unix)]
                    {
                        use std::os::unix::fs::PermissionsExt;
                        if let Ok(metadata) = std::fs::metadata(&backend_exe) {
                            let mut perms = metadata.permissions();
                            if perms.mode() & 0o111 == 0 {
                                perms.set_mode(0o755);
                                let _ = std::fs::set_permissions(&backend_exe, perms);
                            }
                        }
                    }

                    let default_dir = std::path::PathBuf::from(".");
                    let working_dir = backend_exe.parent().unwrap_or(&default_dir);
                    let _ = Command::new(&backend_exe)
                        .current_dir(working_dir)
                        .spawn();
                }
            }
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            greet, 
            log_terminal,
            guardar_token_seguro,
            obtener_token_seguro,
            eliminar_token_seguro
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}