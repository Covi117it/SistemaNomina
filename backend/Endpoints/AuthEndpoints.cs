using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using backend.Common;
using backend.Services;


namespace backend.Endpoints

{
    public static class AuthEndpoints
    {
        public static void MapAuthEndpoints(this WebApplication app)
        {
            var authGroup = app.MapGroup("/api/auth").WithTags("Autenticación");
            var userGroup = app.MapGroup("/api/usuarios")
                .WithTags("Gestión de Usuarios")
                .RequirePermission(Permissions.UsuariosManage);

            authGroup.MapPost("/login", async (LoginRequestDto request, AppDbContext db, HttpContext httpContext) =>
            {
                var emailNormalizado = request.Email.Trim().ToLower();

                var usuario = await db.Usuarios
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == emailNormalizado);

                if (usuario == null)
                {
                    return Results.BadRequest(new { message = "Correo electrónico o contraseña incorrectos."});
                }

                if (!usuario.Activo)
                {
                    return Results.BadRequest(new { message = "Este usuario se encuentra inactivo. Contacte al administrador." });
                }

                bool passwordValida = BCrypt.Net.BCrypt.Verify(request.Password, usuario.PasswordHash);

                if (!passwordValida)
                {
                    return Results.BadRequest(new { message = "Correo electrónico o contraseña incorrectos." });
                }

                
                 usuario.UltimoAcceso = DateTime.UtcNow;
                
                string tokenGenerado = Convert.ToHexString(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32));
                var expiracion = request.RememberMe 
                    ? DateTime.UtcNow.AddDays(30) 
                    : DateTime.UtcNow.AddHours(24);
                var nuevaSesion = new SesionUsuario
                {
                    UsuarioId = usuario.Id,
                    Token = tokenGenerado,
                    FechaCreacion = DateTime.UtcNow,
                    FechaExpiracion = expiracion,
                    UltimoUso = DateTime.UtcNow,
                    Dispositivo = "Tauri Desktop",
                    Activa = true
                };
                db.SesionesUsuarios.Add(nuevaSesion);
                await db.SaveChangesAsync();

                var response = new LoginResponseDto(
                    usuario.Id,
                    usuario.NombreCompleto,
                    usuario.Email,
                    usuario.Rol,
                    usuario.PermisosJson,
                    usuario.Activo,
                    tokenGenerado
                );

                var ipCliente = httpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
                await AuditoriaHelper.RegistrarAsync(
                    db, 
                    usuario.Id, 
                    "AUTH", 
                    "info", 
                    "Inicio de sesión exitoso en el sistema", 
                    "Sesión iniciada vía cliente de escritorio", 
                    ipCliente
                );

                return Results.Ok(response);
            })
            .RequireRateLimiting("LoginLimiter");


             userGroup.MapGet("/", async (AppDbContext db) =>
            {
                var usuarios = await db.Usuarios
                    .OrderBy(u => u.NombreCompleto)
                    .Select(u => new UsuarioDto(
                        u.Id,
                        u.NombreCompleto,
                        u.Email,
                        u.Rol,
                        u.PermisosJson,
                        u.Activo,
                        u.UltimoAcceso,
                        u.FechaCreacion
                    ))
                    .ToListAsync();
                return Results.Ok(usuarios);
            });

            userGroup.MapGet("/{id:int}", async (int id, AppDbContext db) =>
            {
                var usuario = await db.Usuarios.FindAsync(id);
                if (usuario == null) return Results.NotFound(new { message = "Usuario no encontrado." });
                return Results.Ok(new UsuarioDto(
                    usuario.Id,
                    usuario.NombreCompleto,
                    usuario.Email,
                    usuario.Rol,
                    usuario.PermisosJson,
                    usuario.Activo,
                    usuario.UltimoAcceso,
                    usuario.FechaCreacion
                ));
            });

             userGroup.MapPost("/", async (CrearUsuarioDto dto, AppDbContext db, HttpContext httpContext) =>
            {
                if (string.IsNullOrWhiteSpace(dto.Rol) || !Permissions.DefaultRolePermissions.ContainsKey(dto.Rol))
                {
                    return Results.BadRequest(new { message = "Selecciona un rol válido. No se guardaron los cambios." });
                }

                var currentUser = httpContext.Items["CurrentUser"] as Usuario;

                if (string.Equals(dto.Rol, "Admin", StringComparison.OrdinalIgnoreCase) && !string.Equals(currentUser?.Rol,
                "Admin", StringComparison.OrdinalIgnoreCase))
                {
                    return Results.Json(new {message = "Solo un administrador puede crear un usuario con rol de Admin"},
                    statusCode: StatusCodes.Status403Forbidden);
                }

                var emailNormalizado = dto.Email.Trim().ToLower();
 
                bool yaExiste = await db.Usuarios.AnyAsync(u => u.Email.ToLower() == emailNormalizado);
                if (yaExiste)
                {
                    return Results.BadRequest(new { message = "Ya existe un usuario registrado con este correo electrónico." });
                }
                var nuevoUsuario = new Usuario
                {
                    NombreCompleto = dto.NombreCompleto.Trim(),
                    Email = emailNormalizado,   
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password, workFactor: 12),
                    Rol = dto.Rol,
                    PermisosJson = string.IsNullOrWhiteSpace(dto.PermisosJson) ? "[]" : dto.PermisosJson,
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow,
                    FechaActualizacion = DateTime.UtcNow
                };
                await db.Usuarios.AddAsync(nuevoUsuario);
                await db.SaveChangesAsync();

                var ipCliente = httpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
                if (currentUser != null)
                {
                    await AuditoriaHelper.RegistrarAsync(db, currentUser.Id, "AUTH", "action", $"Creó al usuario {nuevoUsuario.NombreCompleto}", $"Rol: {nuevoUsuario.Rol} • Correo: {nuevoUsuario.Email}", ipCliente);
                }
                await AuditoriaHelper.RegistrarAsync(db, nuevoUsuario.Id, "AUTH", "info", "Cuenta registrada en el sistema", $"Creado por {currentUser?.NombreCompleto ?? "Administrador"} con rol {nuevoUsuario.Rol}", ipCliente);

                return Results.Created($"/api/usuarios/{nuevoUsuario.Id}", new UsuarioDto(
                    nuevoUsuario.Id,
                    nuevoUsuario.NombreCompleto,
                    nuevoUsuario.Email,
                    nuevoUsuario.Rol,
                    nuevoUsuario.PermisosJson,
                    nuevoUsuario.Activo,
                    nuevoUsuario.UltimoAcceso,
                    nuevoUsuario.FechaCreacion
                ));
            }); 

            userGroup.MapPut("/{id:int}", async (int id, ActualizarUsuarioDto dto, AppDbContext db, HttpContext httpContext) =>
            {
                if (string.IsNullOrWhiteSpace(dto.Rol) || !Permissions.DefaultRolePermissions.ContainsKey(dto.Rol))
                {
                    return Results.BadRequest(new { message = "Selecciona un rol válido. No se guardaron los cambios." });
                }

                var usuario = await db.Usuarios.FindAsync(id);
                if (usuario == null) return Results.NotFound(new { message = "Usuario no encontrado." });

                var currentUser = httpContext.Items["CurrentUser"] as Usuario;
                
                if ((string.Equals(dto.Rol, "Admin", StringComparison.OrdinalIgnoreCase) || 
                string.Equals(usuario.Rol, "Admin", StringComparison.OrdinalIgnoreCase)) &&
                    !string.Equals(currentUser?.Rol, "Admin", StringComparison.OrdinalIgnoreCase))
                    {
                    return Results.Json(new { message = "Solo un Administrador puede gestionar usuarios con rol Admin." }, statusCode: StatusCodes.Status403Forbidden);
                }

                var emailNormalizado = dto.Email.Trim().ToLower();

                bool emailDuplicado = await db.Usuarios
                    .AnyAsync(u => u.Email.ToLower() == emailNormalizado && u.Id != id);
                if (emailDuplicado)
                {
                    return Results.BadRequest(new { message = "El correo ya está en uso por otro usuario." });
                }
                usuario.NombreCompleto = dto.NombreCompleto.Trim();
                usuario.Email = emailNormalizado;
                usuario.Rol = dto.Rol;
                usuario.PermisosJson = string.IsNullOrWhiteSpace(dto.PermisosJson) ? "[]" : dto.PermisosJson;
                usuario.Activo = dto.Activo;
                usuario.FechaActualizacion = DateTime.UtcNow;
                // Si proporcionó una nueva contraseña, la hashea y actualiza
                if (!string.IsNullOrWhiteSpace(dto.Password))
                {
                    usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password, workFactor: 12);
                }
                await db.SaveChangesAsync();

                var ipClientePut = httpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
                if (currentUser != null)
                {
                    await AuditoriaHelper.RegistrarAsync(db, currentUser.Id, "AUTH", "action", $"Actualizó datos del usuario {usuario.NombreCompleto}", $"Rol: {usuario.Rol} • Activo: {usuario.Activo}", ipClientePut);
                }
                await AuditoriaHelper.RegistrarAsync(db, usuario.Id, "AUTH", "warn", "Perfil de usuario actualizado", $"Modificado por {currentUser?.NombreCompleto ?? "Administrador"}", ipClientePut);

                return Results.Ok(new UsuarioDto(
                    usuario.Id,
                    usuario.NombreCompleto,
                    usuario.Email,
                    usuario.Rol,
                    usuario.PermisosJson,
                    usuario.Activo,
                    usuario.UltimoAcceso,
                    usuario.FechaCreacion
                ));
            }); 

            userGroup.MapDelete("/{id:int}", async (int id, AppDbContext db, HttpContext httpContext) =>
            {
                var usuario = await db.Usuarios.FindAsync(id);
                if (usuario == null) return Results.NotFound(new { message = "Usuario no encontrado." });
                // Protección: No permitir eliminar el último Administrador activo
                if (usuario.Rol == "Admin")
                {
                    int totalAdmins = await db.Usuarios.CountAsync(u => u.Rol == "Admin" && u.Activo);
                    if (totalAdmins <= 1)
                    {
                        return Results.BadRequest(new { message = "No se puede eliminar el único Administrador del sistema." });
                    }
                }

                var currentUser = httpContext.Items["CurrentUser"] as Usuario;
                var ipClienteDel = httpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
                if (currentUser != null)
                {
                    await AuditoriaHelper.RegistrarAsync(db, currentUser.Id, "AUTH", "warn", $"Eliminó al usuario #{id} - {usuario.NombreCompleto}", $"Correo: {usuario.Email}", ipClienteDel);
                }

                db.Usuarios.Remove(usuario);
                await db.SaveChangesAsync();
                return Results.Ok(new { message = "Usuario eliminado exitosamente." });
            });

             authGroup.MapPost("/verificar-sesion", async (VerificarSesionRequestDto request, AppDbContext db) =>
            {
                if (string.IsNullOrWhiteSpace(request.Token))
                {
                    return Results.BadRequest(new { message = "Token de sesión no proporcionado." });
                }
                var sesion = await db.SesionesUsuarios
                    .Include(s => s.Usuario)
                    .FirstOrDefaultAsync(s => s.Token == request.Token && s.Activa);
                if (sesion == null)
                {
                    return Results.Unauthorized();
                }
                if (sesion.FechaExpiracion < DateTime.UtcNow)
                {
                    sesion.Activa = false;
                    await db.SaveChangesAsync();
                    return Results.Unauthorized();
                }
                if (!sesion.Usuario.Activo)
                {
                    sesion.Activa = false;
                    await db.SaveChangesAsync();
                    return Results.BadRequest(new { message = "El usuario se encuentra inactivo. Contacte al administrador." });
                }
                // Renueva la sesión por otros 30 días
                sesion.UltimoUso = DateTime.UtcNow;
                sesion.FechaExpiracion = DateTime.UtcNow.AddDays(30);
                sesion.Usuario.UltimoAcceso = DateTime.UtcNow;
                await db.SaveChangesAsync();
                var response = new LoginResponseDto(
                    sesion.Usuario.Id,
                    sesion.Usuario.NombreCompleto,
                    sesion.Usuario.Email,
                    sesion.Usuario.Rol,
                    sesion.Usuario.PermisosJson,
                    sesion.Usuario.Activo,
                    sesion.Token
                );
                return Results.Ok(response);
            });
            // 2. Endpoint para revocar la sesión al cerrar sesión
            authGroup.MapPost("/cerrar-sesion", async (CerrarSesionRequestDto request, AppDbContext db) =>
            {
                if (!string.IsNullOrWhiteSpace(request.Token))
                {
                    var sesion = await db.SesionesUsuarios
                        .FirstOrDefaultAsync(s => s.Token == request.Token);
                    if (sesion != null)
                    {
                        sesion.Activa = false;
                        await db.SaveChangesAsync();
                    }
                }
                return Results.Ok(new { message = "Sesión cerrada correctamente." });
            });

        userGroup.MapGet("/{id:int}/auditoria", async (int id, AppDbContext db) =>
            {
                var usuarioExiste = await db.Usuarios.AnyAsync(u => u.Id == id);
                if (!usuarioExiste)
                {
                    return Results.NotFound(new { message = "Usuario no encontrado." });
                }

                var count = await db.AuditoriasAcciones.CountAsync(a => a.UsuarioId == id);
                if (count == 0)
                {
                    var u = await db.Usuarios.FindAsync(id);
                    if (u != null)
                    {
                        db.AuditoriasAcciones.Add(new AuditoriaAccion
                        {
                            UsuarioId = u.Id,
                            Modulo = "AUTH",
                            Tipo = "info",
                            Tarea = "Registro inicial de cuenta en el sistema",
                            Detalles = $"Rol asignado: {u.Rol} • Correo: {u.Email}",
                            FechaHora = u.FechaCreacion,
                            Dispositivo = "Tauri Desktop"
                        });
                        await db.SaveChangesAsync();
                    }
                }

                var accionesDb = await db.AuditoriasAcciones
                    .Where(a => a.UsuarioId == id)
                    .OrderByDescending(a => a.FechaHora)
                    .Take(100)
                    .ToListAsync();

                var acciones = accionesDb.Select(a => new AuditoriaAccionDto(
                    a.Id,
                    a.UsuarioId,
                    a.FechaHora.ToString("dd MMM yyyy"),
                    a.FechaHora.ToString("hh:mm:ss tt"),
                    a.Modulo,
                    a.Tipo,
                    a.Tarea,
                    a.Detalles,
                    a.DireccionIp,
                    a.Dispositivo,
                    DateTime.SpecifyKind(a.FechaHora, DateTimeKind.Utc)
                )).ToList();

                return Results.Ok(acciones);
            });
        }

        
    }
}