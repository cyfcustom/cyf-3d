# Configuración de Autenticación Supabase con 2FA

## 📋 Resumen

Este documento describe cómo configurar la autenticación y el usuario administrador en Supabase para CYF Custom.

## 🚀 Pasos de Configuración

### 1. Configurar Autenticación en Supabase Dashboard

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **Authentication** → **Providers**
3. Asegúrate de que **Email** esté habilitado
4. En **Authentication** → **URL Configuration**, asegúrate de que:
   - Site URL: `http://localhost:5173` (para desarrollo) o tu dominio de producción
   - Redirect URLs: Agrega `http://localhost:5173/admin` y tu dominio de producción

### 2. Habilitar Multi-Factor Authentication (MFA/2FA)

1. En el Supabase Dashboard, ve a **Authentication** → **Settings**
2. Scroll hasta **Multi-Factor Authentication**
3. Habilita **Time-based One-Time Password (TOTP)**
4. Guarda los cambios

### 3. Crear Usuario Administrador

#### Opción A: Desde Supabase Dashboard (Recomendado)

1. Ve a **Authentication** → **Users**
2. Click en **Invite User** o **Add User**
3. Ingresa:
   - Email: `francisco.august.fa@gmail.com`
   - Password: `Cyfcustom.765`
   - Auto Confirm User: ✅ (activado)
4. Click en **Create User**

#### Opción B: Usando SQL Editor

```sql
-- Insertar usuario administrador
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'francisco.august.fa@gmail.com',
  crypt('Cyfcustom.765', gen_salt('bf')),
  NOW(),
  '{"role": "admin"}'::jsonb,
  NOW(),
  NOW()
);
```

### 4. Configurar 2FA para el Usuario

#### Proceso Manual (Desde la aplicación web):

1. Inicia sesión en `/cyf-admin-access` con:
   - Email: `francisco.august.fa@gmail.com`
   - Password: `Cyfcustom.765`

2. Una vez dentro del dashboard admin, ve a **Configuración** → **Seguridad**

3. Escanea el código QR con **Google Authenticator** o cualquier app de autenticación TOTP:
   - Google Authenticator (iOS/Android)
   - Microsoft Authenticator
   - Authy
   - 1Password

4. Ingresa el código de 6 dígitos para verificar

5. ¡Listo! Ahora tu cuenta está protegida con 2FA

#### Proceso Programático (Opcional):

```typescript
// Este código ya está implementado en el hook useAuth
const { enrollMfa } = useAuth();

const setupMfa = async () => {
  const { qrCode, secret, factorId } = await enrollMfa();

  // Muestra el QR code al usuario
  // El usuario escanea con Google Authenticator
  // Luego verifica con el código de 6 dígitos
};
```

## 🔐 Flujo de Autenticación

### Primera vez (Sin 2FA configurado):

1. Usuario va a `/cyf-admin-access`
2. Ingresa email y contraseña
3. Se redirige a `/admin`

### Con 2FA habilitado:

1. Usuario va a `/cyf-admin-access`
2. Ingresa email y contraseña
3. Sistema detecta que tiene 2FA habilitado
4. Se muestra pantalla de código 2FA
5. Usuario ingresa código de 6 dígitos de Google Authenticator
6. Si es correcto, se redirige a `/admin`

## 📱 Aplicaciones de Autenticación Recomendadas

- **Google Authenticator**: [iOS](https://apps.apple.com/app/google-authenticator/id388497605) | [Android](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2)
- **Microsoft Authenticator**: [iOS](https://apps.apple.com/app/microsoft-authenticator/id983156458) | [Android](https://play.google.com/store/apps/details?id=com.azure.authenticator)
- **Authy**: [iOS](https://apps.apple.com/app/authy/id494168017) | [Android](https://play.google.com/store/apps/details?id=com.authy.authy)

## 🛡️ Rutas Protegidas

Las siguientes rutas ahora requieren autenticación:

- `/admin` - Dashboard de administración
- `/configurador` - Mis Diseños
- `/calculadoras` - Suite de Calculadoras

Las rutas públicas son:

- `/` - Landing Page
- `/cyf-admin-access` - Login (oculto, no hay links públicos)

## ✅ Verificación

Para verificar que todo está funcionando:

1. Abre `http://localhost:5173` - Deberías ver el landing sin links a "Mis Diseños" ni "Calculadoras"
2. Ve a `http://localhost:5173/cyf-admin-access` - Deberías ver la pantalla de login
3. Intenta acceder a `http://localhost:5173/admin` sin estar autenticado - Deberías ser redirigido al login
4. Inicia sesión con las credenciales - Deberías poder acceder al dashboard

## 🔧 Solución de Problemas

### "Error al iniciar sesión"

- Verifica que el usuario esté confirmado en Supabase Dashboard
- Asegúrate de que el email esté escrito correctamente
- Verifica que la contraseña sea correcta

### "Código 2FA inválido"

- Asegúrate de que el reloj de tu dispositivo esté sincronizado
- Verifica que estés usando el código más reciente (cambia cada 30 segundos)
- Intenta con un código nuevo

### "No se puede configurar 2FA"

- Verifica que MFA/TOTP esté habilitado en Supabase Dashboard
- Asegúrate de tener la última versión de `@supabase/supabase-js`

## 📝 Credenciales de Admin

```
Email: francisco.august.fa@gmail.com
Password: Cyfcustom.765
2FA: Google Authenticator (configurar después del primer login)
```

**⚠️ IMPORTANTE**: Cambia la contraseña en producción y nunca la compartas públicamente.

## 🔒 Seguridad Adicional

### Recomendaciones:

1. **Rotación de Contraseñas**: Cambia la contraseña cada 90 días
2. **Códigos de Recuperación**: Guarda códigos de backup en lugar seguro
3. **Logs de Acceso**: Revisa regularmente los logs de autenticación
4. **IP Whitelist**: Considera restringir acceso por IP en producción
5. **Rate Limiting**: Supabase incluye rate limiting por defecto

### Variables de Entorno (Producción):

Considera mover las credenciales de Supabase a variables de entorno:

```bash
# .env.local
VITE_SUPABASE_URL=https://jushzjpeetegcjyikclb.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_7_NNj-RmsdvNH-K7QnX5Lg_-mMbrh3R
```

```typescript
// src/app/lib/supabase.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

## 📞 Soporte

Si tienes problemas con la configuración, revisa:

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase MFA Guide](https://supabase.com/docs/guides/auth/auth-mfa)
