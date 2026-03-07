# 🔐 Sistema de Administración CYF Customs

## 📊 Resumen de Cambios

Se ha implementado un sistema completo de autenticación con las siguientes características:

### ✅ Cambios Realizados

1. **Navbar Público Simplificado**
   - ❌ Eliminado: "Mis Diseños"
   - ❌ Eliminado: "Calculadoras"
   - ✅ Solo visible: "Contacto" y toggle de tema

2. **Sistema de Autenticación**
   - 🔒 Login oculto en ruta especial: `/cyf-admin-access`
   - 🛡️ Autenticación de dos factores (2FA) con Google Authenticator
   - 🔑 Integración completa con Supabase Auth

3. **Rutas Protegidas**
   - `/admin` → Dashboard de administración
   - `/configurador` → Mis Diseños (ahora protegido)
   - `/calculadoras` → Suite de calculadoras (ahora protegido)

4. **Nuevos Componentes**
   - `AdminLogin.tsx` - Pantalla de login con 2FA
   - `AdminDashboard.tsx` - Panel de control administrativo
   - `ProtectedRoute.tsx` - HOC para proteger rutas
   - `useAuth.ts` - Hook personalizado de autenticación

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    CYF Customs Web App                      │
└─────────────────────────────────────────────────────────────┘

🌐 RUTAS PÚBLICAS
├── / (Landing Page)
│   └── Sin links a admin
└── /cyf-admin-access (Login - OCULTO)
    └── Email + Password + 2FA

🔒 RUTAS PROTEGIDAS (Requieren autenticación)
├── /admin (Dashboard)
│   ├── Acceso a Mis Diseños
│   ├── Acceso a Calculadoras
│   └── Configuración de cuenta
├── /configurador (Mis Diseños)
└── /calculadoras (Suite de Calculadoras)

🔐 SISTEMA DE AUTENTICACIÓN
├── Supabase Auth
├── TOTP (Google Authenticator)
├── Jotai Atoms (State Management)
└── Protected Route HOC
```

## 🚀 Flujo de Usuario

### Usuario Público (Sin autenticación)

```
1. Visita cyfcustoms.com
2. Ve el landing page limpio
3. Solo puede navegar contenido público
4. No ve links a admin ni calculadoras
```

### Usuario Admin (Con autenticación)

```
1. Va a cyfcustoms.com/cyf-admin-access
2. Ingresa email y contraseña
3. Ingresa código 2FA de Google Authenticator
4. Accede al dashboard admin
5. Puede usar Mis Diseños y Calculadoras
```

## 📁 Archivos Creados/Modificados

### Nuevos Archivos

```
src/app/
├── hooks/
│   └── useAuth.ts              ← Hook de autenticación con 2FA
├── pages/
│   ├── AdminLogin.tsx          ← Página de login oculta
│   └── AdminDashboard.tsx      ← Dashboard administrativo
└── components/
    └── ProtectedRoute.tsx      ← Componente de protección de rutas

├── SUPABASE_AUTH_SETUP.md      ← Guía de configuración
├── supabase-admin-setup.sql    ← Script SQL para crear usuario
└── ADMIN_SYSTEM_README.md      ← Este archivo
```

### Archivos Modificados

```
src/app/
├── App.tsx                     ← Rutas actualizadas
├── components/Navbar.tsx       ← Links admin eliminados
└── store/atoms.ts              ← Nuevos átomos de auth
```

## 🔧 Configuración Inicial

### Paso 1: Configurar Usuario en Supabase

**Opción A: Usando el Script SQL (Recomendado)**

1. Abre Supabase Dashboard → SQL Editor
2. Copia el contenido de `supabase-admin-setup.sql`
3. Ejecuta el script
4. Verifica que se creó el usuario

**Opción B: Manualmente desde Dashboard**

1. Ve a Authentication → Users
2. Click "Add User"
3. Email: `francisco.august.fa@gmail.com`
4. Password: `Cyfcustom.765`
5. ✅ Auto Confirm User
6. Click "Create"

### Paso 2: Habilitar 2FA en Supabase

1. Ve a Authentication → Settings
2. Scroll a "Multi-Factor Authentication"
3. Habilita "Time-based One-Time Password (TOTP)"
4. Guarda cambios

### Paso 3: Primer Login y Configuración de 2FA

1. Ejecuta la app: `npm run dev`
2. Ve a `http://localhost:5173/cyf-admin-access`
3. Inicia sesión:
   - Email: `francisco.august.fa@gmail.com`
   - Password: `Cyfcustom.765`
4. Configura Google Authenticator:
   - Escanea el código QR
   - Ingresa el código de 6 dígitos
5. ¡Listo! Ahora estás autenticado

## 🎯 Credenciales de Acceso

```
📧 Email: francisco.august.fa@gmail.com
🔑 Password: Cyfcustom.765
📱 2FA: Google Authenticator (configurar en primer login)
🔗 URL Login: http://localhost:5173/cyf-admin-access
```

**⚠️ IMPORTANTE**: Estas credenciales son para desarrollo. En producción:
- Cambia la contraseña
- No compartas las credenciales
- Usa variables de entorno
- Habilita logging de accesos

## 🧪 Testing

### Verificar que funciona:

1. **Landing Público**
   ```bash
   # Abre: http://localhost:5173
   # ✅ No debe haber links a "Mis Diseños" ni "Calculadoras"
   # ✅ Solo debe ver "Contacto" y toggle de tema
   ```

2. **Acceso Protegido**
   ```bash
   # Intenta acceder: http://localhost:5173/admin
   # ✅ Debe redirigir a /cyf-admin-access (login)
   ```

3. **Login Funcional**
   ```bash
   # Ve a: http://localhost:5173/cyf-admin-access
   # ✅ Ingresa credenciales
   # ✅ Si es primer login, no pedirá 2FA aún
   # ✅ Debe redirigir a /admin
   ```

4. **Dashboard Admin**
   ```bash
   # ✅ Debe mostrar cards de "Mis Diseños" y "Calculadoras"
   # ✅ Debe mostrar email del usuario
   # ✅ Botón de "Cerrar Sesión" funcional
   ```

## 📱 Aplicaciones de 2FA Recomendadas

- **Google Authenticator**:
  - [iOS](https://apps.apple.com/app/google-authenticator/id388497605)
  - [Android](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2)

- **Microsoft Authenticator**:
  - [iOS](https://apps.apple.com/app/microsoft-authenticator/id983156458)
  - [Android](https://play.google.com/store/apps/details?id=com.azure.authenticator)

- **Authy**:
  - [iOS](https://apps.apple.com/app/authy/id494168017)
  - [Android](https://play.google.com/store/apps/details?id=com.authy.authy)

## 🔒 Seguridad

### Implementado ✅

- ✅ Autenticación con Supabase
- ✅ 2FA con TOTP (Google Authenticator)
- ✅ Rutas protegidas con HOC
- ✅ Verificación de sesión automática
- ✅ Redirección a login si no autenticado
- ✅ Logout seguro

### Recomendaciones Adicionales 🔐

- 🔄 Rotación de contraseñas cada 90 días
- 💾 Backup de códigos de recuperación 2FA
- 📊 Monitoreo de logs de acceso
- 🌍 IP Whitelisting (producción)
- 🔑 Variables de entorno para credenciales
- 📧 Notificaciones de nuevos logins

## 🐛 Solución de Problemas

### "No puedo iniciar sesión"

1. Verifica que el usuario esté creado en Supabase
2. Asegúrate de que `email_confirmed_at` no sea NULL
3. Verifica las credenciales
4. Revisa la consola del navegador para errores

### "Código 2FA inválido"

1. Verifica que el reloj esté sincronizado
2. Usa el código más reciente (cambia cada 30s)
3. Asegúrate de tener el account correcto en Google Authenticator

### "Redirige a login constantemente"

1. Limpia localStorage: `localStorage.clear()`
2. Limpia cookies de Supabase
3. Vuelve a iniciar sesión

### "No puedo ver el dashboard"

1. Verifica que estés autenticado
2. Revisa la consola para errores de Supabase
3. Asegúrate de que la sesión no haya expirado

## 📞 Recursos

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase MFA Guide](https://supabase.com/docs/guides/auth/auth-mfa)
- [Jotai Documentation](https://jotai.org/)
- [React Router Protected Routes](https://reactrouter.com/en/main/start/overview)

## 🎨 Personalización

### Cambiar la ruta del login

Edita `src/app/App.tsx`:

```tsx
// De:
<Route path="/cyf-admin-access" element={<AdminLogin />} />

// A:
<Route path="/tu-ruta-secreta" element={<AdminLogin />} />
```

### Agregar más usuarios admin

Ejecuta en Supabase SQL Editor:

```sql
INSERT INTO auth.users (...)
VALUES (
  -- datos del nuevo usuario
);
```

### Personalizar el dashboard

Edita `src/app/pages/AdminDashboard.tsx` para agregar más funcionalidades.

## ✨ Próximos Pasos

### Sugerencias de Mejora

1. **Dashboard Analytics**
   - Gráficos de uso de calculadoras
   - Estadísticas de diseños creados
   - Métricas de rendimiento

2. **Gestión de Usuarios**
   - Panel para crear/eliminar usuarios
   - Roles y permisos
   - Logs de actividad

3. **Backup y Recuperación**
   - Códigos de backup 2FA
   - Recuperación de contraseña
   - Email de verificación

4. **Notificaciones**
   - Email al crear nuevo diseño
   - Alertas de login desde nueva ubicación
   - Reportes semanales

5. **Audit Logs**
   - Registro de todas las acciones admin
   - Exportación de logs
   - Alertas de seguridad

---

**🎉 ¡Sistema de administración implementado exitosamente!**

Para cualquier duda o problema, revisa la documentación o contacta al equipo de desarrollo.
