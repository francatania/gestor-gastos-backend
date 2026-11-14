# REQ-01: autorización de API v2

Implementación en `feature/req-01-authorization`, iniciada el 14/11/2026. Sin despliegue ni cambios de datos existentes.

## Contrato de seguridad

- Sólo `/api/v2` está montada. Las rutas legacy `/api` responden `404` sin redirecciones ni ejecución de sus controladores. CORS preflight permanece disponible.
- Registro y login son públicos. Cada ruta privada requiere un JWT verificado con `_id` escalar válido; tokens ausentes, inválidos o vencidos reciben `401`.
- El propietario se obtiene del JWT, no de campos enviados por el cliente ni de arrays de cuentas. Los servicios reciben la identidad como argumento obligatorio separado del DTO.
- Si se envía `userId`, debe coincidir con la sesión. Identificadores ajenos e inexistentes reciben el mismo `404` y mensaje `Resource not found.`. Los identificadores malformados reciben `400`.
- Cuentas, movimientos, categorías personales, transferencias y dashboard quedan acotados por propietario. Una transferencia debe tener ambas cuentas propias; su propietario y nombres de cuentas se asignan en el servidor.
- Los DTOs de cuenta ya no devuelven `incomes`, `spents` ni `transfers`: son referencias duplicadas históricas, no fuente de autorización. El cliente TS no las necesita.
- DELETE de gastos/ingresos verifica que `accountId` corresponda a la cuenta real del movimiento. Un movimiento ajeno recibe `404`; una cuenta propia distinta recibe `400`. Las denegaciones no modifican documentos ni arrays.
- PATCH de gastos/ingresos no permite cambiar de cuenta. Se puede omitir `accountId` o enviar la misma cuenta; un destino ajeno recibe `404` y uno propio diferente, `400`. La sincronización de cambios de cuenta queda en REQ-03.
- Las categorías de gasto disponibles son globales (propietario ausente o `null`) y propias. Crear siempre asigna el propietario de la sesión. Sólo se pueden borrar propias; si están referenciadas por gastos se responde `409` para no generar nuevos huérfanos.
- Las categorías globales son de sólo lectura autenticada. Crear/eliminar categorías de ingresos o eliminar una categoría global de gastos devuelve `403`. No se agregó un rol administrador ni una API de gestión global.
- Registro conserva la creación de las dos cuentas iniciales con el usuario recién creado. Campos extra como `accounts` en el request no se persisten.

## Regresión reproducible

Se usa `node:test` + `assert`, HTTP real con `fetch`, Passport/JWT reales y MongoDB real local. No hay Supertest, Jest, Cypress ni nuevas dependencias de ejecución. Las pruebas unitarias continúan usando DAOs simulados.

Desde la raíz del backend:

```bash
npm test

# En otra terminal, iniciar un MongoDB exclusivo de prueba:
mkdir -p /tmp/gestor-gastos-req01-mongo
mongod --dbpath /tmp/gestor-gastos-req01-mongo \
  --bind_ip 127.0.0.1 --port 27961 --nounixsocket

# Ejecutar integración contra ese proceso local:
TEST_MONGO_URI=mongodb://127.0.0.1:27961/gestor_gastos_test_req01 \
  npm run test:integration
```

La suite rechaza una URI ausente, un host no local o un nombre que no cumpla `gestor_gastos_test_*`. Configura secreto JWT y cuentas iniciales sólo para el proceso de prueba, antes de importar la aplicación. Cada ejecución crea una base con sufijo aleatorio y sólo elimina esa base al terminar; no usa `MONGO_URI` de la `.env`. Cierra servidor HTTP y conexión MongoDB en el teardown. Detener el `mongod` de prueba al finalizar.

Fixtures: usuarios A/B, dos cuentas por usuario, movimientos, categorías globales/personales y referencias históricas cruzadas o huérfanas. Las denegaciones comparan snapshots de documentos y referencias antes y después de cada intento.

Casos cubiertos: todos los métodos privados frente a seis variantes de credenciales inválidas/ausentes, retiro de rutas legacy con/sin token, consultas propias/ajenas, suplantación de propietario, DELETE con cuenta falsa, PATCH entre cuentas, inyección de objetos/arrays en identificadores, transferencias cruzadas, categorías, agregados, registro/login y ciclo de vida de recursos propios.

**Evidencia del 14/11/2026:** `npm test` y ejecución directa de las unitarias exitosas (13 casos); `npm run test:integration` exitoso (45 casos/subcasos: 14 pruebas principales y 31 subcasos de métodos privados). Se verificó también el rechazo de una URI ausente o remota antes de conectar. Cliente TS: build y lint exitosos, sin cambios en su código o dependencias. Entorno verificado: Node 18.19.1 y MongoDB 8.0.26 local.

## Límites de esta entrega

- Las referencias cruzadas o huérfanas no autorizables se excluyen de listados y agregados, y reciben `404` en consultas directas. No se borran ni reparan documentos existentes. Por eso el saldo visible puede diferir del que incluía datos inconsistentes: reconciliar antes de desplegar sobre datos reales (REQ-03).
- No se resolvieron validación monetaria completa, concurrencia de saldo ni transacciones (REQ-02/03), ni el estado de sesión React (REQ-04).
- No se agregó una suite E2E frontend, por indicación del usuario. Del cliente TS se verifican compilación y lint; la validación en navegador queda pendiente. El intento de Playwright CLI temporal no llegó a abrir el navegador porque requiere Node >=20 y el entorno usa Node 18.19.1; no se cambió el runtime ni el proyecto frontend.
- No se ejecutaron pruebas contra producción ni se realizó despliegue. El usuario confirmó que funciona y solicitó commit/push de la rama `feature/req-01-authorization`; esto no implica merge ni despliegue.
