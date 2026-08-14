// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    #[cfg(target_os = "linux")]
    {
        if std::env::var("TAURI_LINUX_ENV_FIXED").is_err() {
            std::env::set_var("TAURI_LINUX_ENV_FIXED", "1");
            std::env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1");
            std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
            std::env::set_var("WEBKIT_FORCE_SANDBOX", "0");
            std::env::set_var("WEBKIT_DISABLE_SANDBOX_THIS_IS_DANGEROUS", "1");
            std::env::set_var("GSK_RENDERER", "cairo");
            if let Ok(exe) = std::env::current_exe() {
                let args: Vec<_> = std::env::args_os().skip(1).collect();
                use std::os::unix::process::CommandExt;
                let _ = std::process::Command::new(exe).args(args).exec();
            }
        }
    }
    sistema_nomina_lib::run()
}
