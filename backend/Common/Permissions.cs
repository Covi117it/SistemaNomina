using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using backend.Models;

namespace backend.Common
{
    public class Permissions
    {
        public const string All = "*";
        public const string UsuariosManage = "usuarios:manage";
        public const string EmpleadosRead = "empleados:read";
        public const string EmpleadosCreate = "empleados:create";
        public const string EmpleadosEdit = "empleados:edit";
        public const string EmpleadosDelete = "empleados:delete";
        public const string NominaRead = "nomina:read";
        public const string NominaProcess = "nomina:process";
        public const string VolantesSend = "volantes:send";
        public const string EventosManage = "eventos:manage";

        public static readonly Dictionary<string, string[]> DefaultRolePermissions = new(StringComparer.OrdinalIgnoreCase)
        {
          ["Admin"] = new[] { All },
          ["RRHH"] = new[]
        {
            EmpleadosRead,
            EmpleadosCreate,
            EmpleadosEdit,
            EmpleadosDelete,
            NominaRead,
            NominaProcess,
            VolantesSend,
            EventosManage
        },

        ["Contador"] = new[]
        {
          EmpleadosRead,
          NominaRead,
          NominaProcess,
          VolantesSend,
          EventosManage

        },

        ["Auditor"] = new[]
        {
          EmpleadosRead,
          NominaRead,
        },

        ["Operador"] = new[]
        {
          EmpleadosRead,
          EmpleadosCreate,
          EmpleadosEdit,
          NominaRead
        }
        };

        public static string[] ObtenerPermisosPorRol(string? rol)
        {
            if (string.IsNullOrWhiteSpace(rol)) return new[] {EmpleadosRead};

            return DefaultRolePermissions.TryGetValue(rol.Trim(), out var permisos)
            ? permisos
            : new[] {EmpleadosRead}; 
        }

        public static bool TienePermiso(Usuario? usuario, string permisoRequerido)
        {
            if (usuario == null || !usuario.Activo) return false;

            if (string.Equals(usuario.Rol, "Admin", StringComparison.OrdinalIgnoreCase)) return true;

            var permisosEfectivos = new HashSet<string>(ObtenerPermisosPorRol(usuario.Rol), StringComparer.OrdinalIgnoreCase);
            
            if (!string.IsNullOrWhiteSpace(usuario.PermisosJson) && usuario.PermisosJson != "[]")
            {
                try
                {
                    var customPerms = JsonSerializer.Deserialize<List<string>>(usuario.PermisosJson);

                    if (customPerms != null)
                    {
                        foreach (var perm in customPerms)
                        {
                            permisosEfectivos.Add(perm);
                        }
                    }
                }

                catch (JsonException)
                {
                    // Manejar error de deserialización si es necesario
                }
            }

            return permisosEfectivos.Contains(All) || permisosEfectivos.Contains(permisoRequerido);
        }
    }
}