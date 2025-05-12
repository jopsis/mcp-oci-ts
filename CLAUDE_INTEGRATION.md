# Integración con Claude Desktop

Esta guía proporciona instrucciones detalladas sobre cómo integrar el servidor MCP de Oracle Cloud Infrastructure con Claude Desktop.

## Arquitectura de la integración

La integración se basa en la siguiente arquitectura:

```
+----------------+      +------------------+      +------------------+
|                |      |                  |      |                  |
| Claude Desktop | <--> | Claude-MCP Bridge| <--> | MCP OCI Server  |
|                |      |                  |      |                  |
+----------------+      +------------------+      +------------------+
        |                       |                         |
        |                       |                         |
        v                       v                         v
  Interfaz de Usuario     Puerto 3001               Puerto 3000
```

El sistema consta de tres componentes principales:

1. **Claude Desktop**: Aplicación de escritorio para interactuar con el modelo Claude de Anthropic
2. **Puente Claude-MCP**: Servidor que traduce las solicitudes entre Claude Desktop y el protocolo MCP
3. **Servidor MCP-OCI**: Servidor que implementa el protocolo MCP y se comunica con Oracle Cloud Infrastructure

## Requisitos previos

- Claude Desktop instalado
- Servidor MCP-OCI y puente Claude configurados y ejecutándose
- Credenciales de Oracle Cloud Infrastructure configuradas

## Configuración del servidor

### Opción 1: Ejecución con Docker

La forma más sencilla de ejecutar todo el sistema es usando Docker Compose:

1. Asegúrate de que el archivo `.env` esté configurado correctamente
2. Ejecuta Docker Compose:

```bash
docker-compose up -d
```

Esto iniciará tanto el servidor MCP-OCI (puerto 3000) como el puente Claude (puerto 3001).

### Opción 2: Ejecución local

Para ejecutar los servidores localmente:

1. Instala las dependencias:

```bash
npm install
```

2. Compila el proyecto:

```bash
npm run build
```

3. Inicia los servidores:

```bash
npm start
```

## Verificación de la configuración

Puedes verificar que los servidores estén funcionando correctamente con el siguiente comando:

```bash
npm run test:claude
```

Este comando realizará las siguientes comprobaciones:
- Conectividad básica con el puente Claude
- Obtención de las herramientas disponibles
- Ejecución de una función de prueba (listar VCNs)

## Configuración en Claude Desktop

Una vez que los servidores estén en funcionamiento, debes configurar Claude Desktop para utilizar las herramientas de OCI:

1. **Abrir Claude Desktop**

2. **Acceder a la configuración de herramientas**
   - Haz clic en el icono de engranaje (⚙️) en la parte superior derecha
   - Selecciona "Herramientas personalizadas" o "Custom Tools"

3. **Añadir un nuevo servidor de herramientas**
   - Haz clic en "Añadir servidor" o "Add server"
   - Completa la información:
     - **Nombre**: Oracle Cloud Infrastructure
     - **Descripción**: Herramientas para gestionar recursos en Oracle Cloud Infrastructure
     - **URL del servidor**: http://localhost:3001
     - **Endpoint de herramientas**: /tools
     - **Endpoint de función**: /function

4. **Guardar la configuración**
   - Haz clic en "Guardar" o "Save"
   - Asegúrate de que el interruptor de activación esté en posición "activado"

## Uso con Claude Desktop

Una vez configurado, puedes interactuar con Claude para gestionar tu infraestructura de Oracle Cloud. Aquí tienes algunos ejemplos de lo que puedes hacer:

### Consultar recursos existentes

- **Instancias de computación**: "¿Puedes listar todas mis instancias de computación en Oracle Cloud?"
- **Redes virtuales**: "Muéstrame todas mis VCNs"
- **Almacenamiento**: "¿Cuántos buckets de almacenamiento tengo y cuáles son?"

### Crear nuevos recursos

- **Red virtual**: "Crea una nueva VCN llamada 'produccion-net' con CIDR 10.0.0.0/16"
- **Instancia**: "Necesito crear una instancia de computación con la forma VM.Standard.E4.Flex"
- **Almacenamiento**: "Crea un nuevo bucket llamado 'datos-aplicacion'"

### Análisis y recomendaciones

- **Arquitectura**: "¿Cómo debería estructurar mis VCNs y subredes para una aplicación de tres niveles?"
- **Optimización**: "¿Puedes revisar mis instancias actuales y recomendar mejoras?"
- **Seguridad**: "¿Cómo puedo configurar mis subredes para mayor seguridad?"

## Ejemplo completo de interacción

A continuación se muestra un ejemplo de cómo interactuar con Claude Desktop utilizando las herramientas de OCI:

**Usuario**:
```
Necesito configurar una nueva VCN para mi entorno de desarrollo. Debería tener un CIDR de 172.16.0.0/16 y llamarse "dev-network".
```

**Claude**:
```
Voy a ayudarte a configurar una nueva VCN para tu entorno de desarrollo. Puedo crear esta red virtual en Oracle Cloud con los parámetros que has especificado.

Voy a crear una VCN con las siguientes características:
- Nombre: dev-network
- CIDR Block: 172.16.0.0/16

Permíteme hacerlo por ti.

[Claude utiliza la herramienta "network" y la función "create_vcn"]

¡Excelente! He creado con éxito una nueva VCN con las siguientes características:

- ID: ocid1.vcn.oc1.iad.amaaaaaauhde7kyaqocm4taljrxjsxjmk5vcznevf7uqye4z3cyddcmsp5qq
- Nombre: dev-network
- CIDR: 172.16.0.0/16
- Estado: PROVISIONING (cambiará a AVAILABLE en unos minutos)
- Etiqueta DNS: (no se configuró una etiqueta DNS personalizada)

La VCN tardará unos minutos en estar completamente aprovisionada. Una vez disponible, podrás crear subredes dentro de esta VCN. ¿Te gustaría que te ayude a crear algunas subredes para este entorno de desarrollo?
```

## Solución de problemas

Si encuentras problemas con la integración, aquí hay algunos pasos para solucionarlos:

### 1. Verificar que los servidores estén en ejecución

```bash
# Para Docker
docker ps

# Para ejecución local
ps aux | grep node
```

### 2. Comprobar los registros de los servidores

```bash
# Para Docker
docker-compose logs -f

# Para ejecución local
tail -f logs/combined.log
```

### 3. Probar la conectividad

```bash
# Probar el servidor MCP-OCI
curl http://localhost:3000

# Probar el puente Claude
curl http://localhost:3001
```

### 4. Verificar la configuración en Claude Desktop

- Asegúrate de que la URL del servidor sea correcta
- Verifica que los endpoints de herramientas y función estén correctamente configurados
- Comprueba que las herramientas estén habilitadas

### 5. Problemas comunes

- **Error "No se puede conectar al servidor"**: Asegúrate de que los servidores estén en ejecución y accesibles.
- **Error "No se encontraron herramientas"**: El endpoint `/tools` no está devolviendo el formato esperado.
- **Error al ejecutar funciones**: Verifica los registros del servidor para obtener más detalles.
- **Acceso denegado a OCI**: Las credenciales de OCI pueden no ser válidas o carecer de permisos suficientes.

## Seguridad y consideraciones para producción

Para entornos de producción, considera implementar estas medidas adicionales:

1. **HTTPS**: Configura certificados SSL/TLS para ambos servidores
2. **Autenticación**: Implementa un mecanismo de autenticación para el puente Claude
3. **Control de acceso**: Limita los permisos de las credenciales de OCI al mínimo necesario
4. **Redes privadas**: Configura los servidores en una red privada y usa un proxy inverso
5. **Auditoría**: Habilita el registro completo de todas las acciones realizadas

## Próximos pasos

- **Personalizar herramientas**: Añade nuevas herramientas o funciones según tus necesidades específicas
- **Integración con más servicios**: Amplía la funcionalidad para cubrir más servicios de OCI
- **Flujos de trabajo automatizados**: Crea secuencias predefinidas para tareas comunes
- **Interfaz de administración**: Desarrolla una interfaz web para gestionar la configuración
