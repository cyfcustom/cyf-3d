# Auditoría de Seguridad — RapidMockup CDN

**Tipo de engagement:** Penetration Test (Black-box parcial / Grey-box)
**Target:** `https://rapidmockup-v3.nyc3.cdn.digitaloceanspaces.com/`
**Stack:** DigitalOcean Spaces (NYC3), objetos `/{id}/model.glb`
**Versión del documento:** 0.1 — borrador para revisión del cliente
**Fecha:** 2026-09-12
**Estado:** Pendiente de firma de LOA y Reglas de Engagement

---

## 1. Resumen Ejecutivo

Se propone realizar una auditoría de seguridad sobre la infraestructura de distribución de contenido (CDN) de RapidMockup, alojada en DigitalOcean Spaces, con el objetivo de identificar configuraciones inseguras, exposiciones accidentales de objetos y debilidades en las políticas de control de acceso.

El engagement se ejecuta bajo una **Carta de Autorización (LOA)** firmada por el propietario del Space y un documento de **Reglas de Engagement (RoE)** firmado por ambas partes. Sin ambos firmados, **no se ejecuta ninguna prueba activa**.

**Salvaguardas no negociables:**

- El auditor se identifica ante el target. No se usa VPN, proxy anonimizador ni enmascaramiento de IP. El propietario del bucket sabe quién está probando y desde dónde.
- La auditoría **reporta hallazgos**, no exfiltra contenido. Si una prueba descubre objetos accesibles, se documenta la evidencia mínima necesaria (URL, hash, headers) y se reporta; el contenido en sí no se descarga más allá de lo imprescindible para reproducir el hallazgo.
- Se respeta un rate limit acordado con el cliente para evitar impacto en la operación.
- Cualquier hallazgo crítico se reporta al contacto de seguridad del cliente en menos de 24h, sin esperar al informe final.

---

## 2. Alcance (In-Scope)

### 2.1 Infraestructura

| Activo | Descripción | Notas |
|---|---|---|
| Space `rapidmockup-v3` | Bucket principal en DO Spaces, región NYC3 | Único asset confirmado en scope |
| Endpoint público | `https://rapidmockup-v3.nyc3.cdn.digitaloceanspaces.com/` | CDN público estándar de DO |
| Patrón de URL confirmado | `/{id}/model.glb` donde `id` es numérico | Único patrón público observado |
| Subdominios asociados | `[PENDIENTE: listar con el cliente]` | Si el cliente tiene otros subdomains sirviendo desde el mismo Space |

### 2.2 Tipos de pruebas cubiertas

- Reconocimiento pasivo (OSINT, DNS, certificados, headers).
- Revisión de configuración expuesta vía HTTP (headers, CORS, cache-control, signed URLs).
- Enumeración de IDs / patrones de URL accesibles.
- Pruebas de control de acceso sobre el endpoint público.
- Revisión de surface area de errores (mensajes verbose, stack traces, listado accidental).
- Pruebas de hotlinking y referrer restrictions.

### 2.3 Fuera de Alcance (Out-of-Scope)

Queda **explícitamente prohibido**:

- Cualquier acción que cause indisponibilidad del servicio (DoS, flooding).
- Modificación, eliminación o escritura de objetos en el Space.
- Pruebas sobre infraestructura **no listada** en §2.1 sin aprobación previa por escrito.
- Ingeniería social contra empleados de RapidMockup.
- Pruebas físicas o sobre redes internas.
- Uso de credenciales no proporcionadas por el cliente. Si durante la auditoría se descubre una credencial expuesta, se reporta y **no se usa** salvo autorización explícita posterior.
- Descarga masiva o sistemática del contenido (`model.glb` u otros). Las pruebas son de presencia/accesibilidad, no de exfiltración.

---

## 3. Metodología

El engagement sigue un enfoque por fases inspirado en **PTES** y **OWASP Testing Guide**, adaptado a la naturaleza específica de un CDN de objetos.

### Fase 0 — Pre-engagement (esta fase)
- Firma de LOA y RoE.
- Intercambio de contactos de emergencia.
- Confirmación de rate limit, ventana horaria y canal de comunicación.
- Entrega por parte del cliente de: dominios en scope, contactos de seguridad, credenciales de solo-lectura si están disponibles para revisión de políticas.

### Fase 1 — Reconocimiento Pasivo
- OSINT: dominios, subdominios, certificados TLS históricos (crt.sh, Censys, Shodan pasivo).
- Revisión de headers HTTP públicos sin causar carga (`HEAD` requests espaciados).
- Mapeo del surface area público: robots.txt, sitemap, endpoints conocidos.
- Revisión de reportes previos de disclosure si existen.
- **Salida esperada:** inventario de assets públicos, sin tocar el bucket directamente más allá de headers.

### Fase 2 — Revisión de Configuración Visible
- Análisis de headers HTTP (`Cache-Control`, `CORS`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Content-Disposition`).
- Verificación de comportamiento con `OPTIONS` (CORS preflight).
- Pruebas de hotlinking desde un origen controlado por el auditor.
- Verificación de políticas de referer / origin.
- **Salida esperada:** reporte de configuración con desviaciones respecto a buenas prácticas.

### Fase 3 — Enumeración de Objetos Accesibles
- Pruebas de enumeración **a bajo rate** (configurable, ver §4) sobre el patrón `/{id}/model.glb`.
- Sondeo de IDs: secuencial alrededor del conocido (`281`), aleatorio dentro de rangos plausibles, y de IDs extremos (1, 0, negativos, overflow).
- Verificación de otros nombres de archivo plausibles dentro del mismo path (`model.glb`, `preview.png`, `metadata.json`, `config.json`, etc.).
- **Hallazgos típicos esperados:** IDs previamente públicos que ya no deberían serlo, objetos huérfanos, archivos de configuración/preview no intended-for-public.
- **Salida esperada:** lista de objetos accesibles no intended-for-public (sin contenido descargado).

### Fase 4 — Pruebas de Control de Acceso
- Pruebas de IDOR-like: comportamiento del endpoint frente a IDs manipulados.
- Manejo de URLs firmadas si el cliente las usa.
- Pruebas de métodos HTTP inusuales (`PUT`, `DELETE`, `COPY` vía endpoint público).
- Pruebas de bypass de cache vía headers (`X-Forwarded-For`, `X-Original-URL`).
- **Salida esperada:** validación de que el modelo de acceso público/privado funciona según lo esperado.

### Fase 5 — Reporte
- Consolidación de hallazgos.
- Clasificación por severidad.
- Recomendaciones de remediación.
- Presentación al cliente.

---

## 4. Reglas de Engagement (RoE)

### 4.1 Rate Limit y Ventana de Pruebas

| Parámetro | Valor | Justificación |
|---|---|---|
| Requests por segundo | `[PENDIENTE: acordar]` | Default propuesto: 2 req/s |
| Burst máximo | `[PENDIENTE: acordar]` | Default propuesto: 10 req |
| Requests totales por día | `[PENDIENTE: acordar]` | Default propuesto: 5,000 |
| Ventana horaria | `[PENDIENTE: acordar]` | Default propuesto: L-V 09:00–18:00 UTC del cliente |
| Días excluidos | `[PENDIENTE: acordar]` | Lanzamientos, campañas, eventos del cliente |

### 4.2 Identificación

- **User-Agent de las pruebas:** se usa un UA identificable (ej. `RapidMockup-Audit/0.1 contact: <email>`) para que el equipo del cliente pueda reconocer las requests en logs.
- **IP de origen:** el auditor comparte su IP pública / rango ASN con el cliente. El cliente puede opcionalmente whitelistearla para reducir ruido en logs.
- **No se usa VPN, Tor, ni proxy anonimizador.** Esta es una condición del engagement; si el auditor la viola, el engagement se cancela.

### 4.3 Canal de Comunicación

- **Contacto técnico del auditor:** `[PENDIENTE]`
- **Contacto de seguridad del cliente:** `[PENDIENTE — requerido antes de Fase 1]`
- **Canal para hallazgos críticos:** `[PENDIENTE — acordar, ej. email cifrado / Signal / Slack]`
- **Tiempo de respuesta ante hallazgo crítico:** el auditor notifica en <24h; el cliente confirma recepción en <4h hábiles.

### 4.4 Manejo de Hallazgos Accidentales

Si durante las pruebas se descubre:
- Credenciales expuestas: se reportan inmediatamente, **no se prueban**.
- Datos personales (PII) de usuarios: se reporta; no se descarga más allá del mínimo necesario para reportar.
- Contenido ilegal: se reporta al contacto del cliente y se detiene la prueba que lo descubrió; no se descarga.

### 4.5 Stop Conditions

El engagement se detiene inmediatamente si:
- El cliente lo solicita por el canal acordado.
- Se detecta impacto en producción no acordado (picos de carga anómalos reportados por el cliente).
- Se descubre que una prueba cae fuera de scope.

---

## 5. Entregables

| # | Entregable | Formato | Timing |
|---|---|---|---|
| D1 | Este plan firmado | MD / PDF | Antes de Fase 1 |
| D2 | LOA firmada por ambas partes | PDF | Antes de Fase 1 |
| D3 | RoE firmada por ambas partes | PDF | Antes de Fase 1 |
| D4 | Reporte de hallazgos (borrador) | MD / PDF | Al cierre de Fase 4 |
| D5 | Presentación de hallazgos | Reunión + slides | Dentro de 5 días hábiles tras D4 |
| D6 | Reporte final firmado | PDF | Dentro de 3 días tras D5 con feedback |
| D7 | Verificación de remediación | MD / PDF | Tras aplicar fixes (re-test opcional) |

### Formato del Reporte de Hallazgos (D4)

Cada hallazgo incluye:

- **Título descriptivo**
- **Severidad** (Crítica / Alta / Media / Baja / Info) — escala explicada en §6
- **Descripción**
- **Impacto**
- **Pasos de reproducción** (mínimos y seguros)
- **Evidencia** (request/response, headers, URL — no contenido descargado)
- **Recomendación de remediación**
- **Referencias** (OWASP, CWE, buenas prácticas DO)

---

## 6. Escala de Severidad

| Nivel | Criterio (ejemplos) |
|---|---|
| **Crítica** | Credenciales / tokens / claves privadas accesibles públicamente. Listado completo del bucket. Modificación/eliminación posible sin auth. |
| **Alta** | Acceso no intencionado a objetos que contienen datos sensibles de negocio o usuarios. Bypass de control de acceso. |
| **Media** | Configuración que aumenta surface area (CORS abierto, headers de seguridad ausentes, información filtrada en errores). |
| **Baja** | Hardening menor, prácticas subóptimas sin impacto inmediato. |
| **Info** | Observación sin impacto, sugerencia de mejora. |

---

## 7. Manejo de Datos y Confidencialidad

- Los hallazgos son **confidenciales** entre auditor y cliente hasta que el cliente apruebe disclosure público.
- Evidencia almacenada en repositorio cifrado del auditor durante el engagement + 30 días, luego eliminada.
- El auditor no comparte hallazgos con terceros sin autorización escrita.
- NDA: `[PENDIENTE — ¿el cliente requiere uno? Modelo estándar disponible]`.

---

## 8. Línea de Tiempo Estimada

| Fase | Duración estimada |
|---|---|
| Fase 0 (firmas, alineación) | 3–5 días hábiles desde confirmación |
| Fase 1 (reconocimiento) | 1–2 días |
| Fase 2 (config visible) | 1 día |
| Fase 3 (enumeración) | 2–3 días (respetando rate limit) |
| Fase 4 (control de acceso) | 1–2 días |
| Fase 5 (reporte) | 2–3 días |
| **Total activo** | **7–11 días hábiles** |
| D5 + D6 | 5–8 días hábiles adicionales |

---

## 9. Contactos

| Rol | Nombre | Email | Teléfono |
|---|---|---|---|
| Auditor lead | `[PENDIENTE]` | `[PENDIENTE]` | `[PENDIENTE]` |
| Contacto técnico auditor | `[PENDIENTE]` | `[PENDIENTE]` | `[PENDIENTE]` |
| Contacto de seguridad cliente | `[PENDIENTE — REQUERIDO]` | `[PENDIENTE]` | `[PENDIENTE]` |
| Sponsor del engagement (cliente) | `[PENDIENTE]` | `[PENDIENTE]` | `[PENDIENTE]` |

---

## 10. Aprobaciones

Este documento requiere firma de ambas partes antes de iniciar cualquier prueba activa.

**Por el Auditor:**

| Campo | Valor |
|---|---|
| Nombre | |
| Firma | |
| Fecha | |

**Por el Cliente (RapidMockup):**

| Campo | Valor |
|---|---|
| Nombre | |
| Cargo | |
| Firma | |
| Fecha | |

---

## Anexo A — Glosario

- **LOA (Letter of Authorization):** documento legal donde el propietario autoriza pruebas sobre su infraestructura.
- **RoE (Rules of Engagement):** reglas técnicas y operativas del pentest (rate, horario, contacto).
- **IDOR (Insecure Direct Object Reference):** acceso a recursos manipulando un identificador en la URL.
- **CORS (Cross-Origin Resource Sharing):** mecanismo que controla qué orígenes pueden consumir recursos.
- **Surface area:** superficie de ataque expuesta públicamente.

## Anexo B — Referencias

- OWASP Testing Guide v4
- PTES — Penetration Testing Execution Standard
- DigitalOcean Spaces — Security Best Practices
- CWE — Common Weakness Enumeration
