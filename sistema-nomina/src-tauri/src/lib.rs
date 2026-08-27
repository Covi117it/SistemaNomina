#[allow(unused_imports)]
use std::process::Command;
#[allow(unused_imports)]
use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn log_terminal(msg: String) {
    println!("\x1b[1;32m[AUTO-UPDATE]\x1b[0m {}", msg);
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
        .invoke_handler(tauri::generate_handler![greet, log_terminal])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}