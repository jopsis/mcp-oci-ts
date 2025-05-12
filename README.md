# MCP Oracle Cloud Infrastructure Server (TypeScript)

Este es un servidor que implementa el protocolo MCP (Model Context Protocol) para Oracle Cloud Infrastructure usando TypeScript. Proporciona herramientas para listar y crear recursos en OCI, y se integra fácilmente con Claude Desktop para gestionar la infraestructura mediante conversaciones en lenguaje natural.

## Características

- **Implementación TypeScript del Model Context Protocol**: Basado en el SDK oficial de TypeScript para MCP
- **Integración con Oracle Cloud Infrastructure**: Utiliza el SDK oficial de OCI para Node.js
- **Herramientas para gestión de recursos**:
  - Instancias de computación
  - Redes virtuales (VCNs) y subredes
  - Volúmenes de almacenamiento en bloque
  - Buckets de almacenamiento de objetos
  - Bases de datos autónomas
- **Puente para Claude Desktop**: Servidor adicional que actúa como intermediario entre Claude Desktop y el servidor MCP

## Requisitos previos

- Node.js 18 o superior
- Cuenta de Oracle Cloud Infrastructure con credenciales API configuradas
- Claude Desktop (opcional, para integración conversacional)

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/mcp-oci-ts.git
cd mcp-oci-ts
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar las credenciales de OCI

Crea un archivo `.env` en la raíz del proyecto (puedes copiar y modificar `.env.example`):

```
# Oracle Cloud Infrastructure credentials
OCI_USER_OCID=your_user_ocid
OCI_TENANCY_OCID=your_tenancy_ocid
OCI_REGION=your_region
OCI_FINGERPRINT=your_api_key_fingerprint
OCI_KEY_FILE=path_to_your_private_key
OCI_COMPARTMENT_ID=your_compartment_id

# Server configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# Client configuration
MCP_SERVER_URL=http://localhost:3000/mcp
CLAUDE_BRIDGE_URL=http://localhost:3001
```

### 4. Compilar el proyecto

```bash
npm run build
```

### 5. Iniciar el servidor

```bash
npm start
```

También puedes usar el modo de desarrollo con recarga automática:

```bash
npm run dev
```

## Uso del cliente de prueba

El proyecto incluye un cliente de línea de comandos para probar el servidor MCP:

### Listar recursos

```bash
# Listar instancias de computación
npm run test:client -- list instances

# Listar VCNs
npm run test:client -- list vcns

# Listar subredes
npm run test:client -- list subnets
```

### Crear recursos

```bash
# Crear una VCN
npm run test:client -- create-vcn my-network 10.0.0.0/16 --dns-label mynetwork

# Crear una instancia de computación
npm run test:client -- create-instance my-instance VM.Standard.E4.Flex ocid1.image.oc1... ocid1.subnet.oc1... AD-1

# Crear un bucket
npm run test:client -- create-bucket my-bucket
```

### Probar el puente Claude Desktop

```bash
npm run test:claude
```

## Integración con Claude Desktop

### Ejecutar con Docker

La forma más sencilla de ejecutar el sistema completo es usando Docker Compose:

```bash
docker-compose up -d
```

### Configuración en Claude Desktop

Para integrar con Claude Desktop:

1. Abre Claude Desktop
2. Ve a Configuración > Herramientas personalizadas
3. Haz clic en "Añadir servidor"
4. Configura lo siguiente:
   - **Nombre**: Oracle Cloud Infrastructure
   - **Descripción**: Herramientas para gestionar Oracle Cloud Infrastructure
   - **URL del servidor**: http://localhost:3001
   - **Endpoint de herramientas**: /tools
   - **Endpoint de función**: /function
5. Guarda la configuración

### Ejemplos de uso con Claude

Una vez configurado, puedes interactuar con Claude Desktop para gestionar tu infraestructura:

- "Lista todas mis VCNs en Oracle Cloud"
- "Crea una nueva subred en mi VCN principal con CIDR 10.0.1.0/24"
- "¿Cuántas instancias de computación tengo actualmente?"
- "Crea un nuevo bucket de almacenamiento llamado 'datos-analítica'"

## Personalización y extensión

### Añadir nuevas herramientas MCP

Para añadir nuevas herramientas o funciones:

1. Crea los servicios necesarios en `src/oci/services.ts`
2. Añade las herramientas y funciones en `src/mcp/service.ts`
3. Recompila y reinicia el servidor

### Estructura del proyecto

```
mcp-oci-ts/
├── src/
│   ├── claude/         # Integración con Claude Desktop
│   ├── config/         # Configuración de la aplicación
│   ├── mcp/            # Definición de herramientas MCP
│   ├── oci/            # Servicios de Oracle Cloud
│   ├── utils/          # Utilidades (logger, etc.)
│   ├── index.ts        # Servidor principal MCP
│   ├── server.ts       # Punto de entrada para ambos servidores
│   └── test-client.ts  # Cliente de prueba
├── Dockerfile          # Configuración de Docker
├── docker-compose.yml  # Configuración de Docker Compose
├── package.json        # Dependencias y scripts
└── tsconfig.json       # Configuración de TypeScript
```

## Referencias

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Oracle Cloud Infrastructure SDK para Node.js](https://github.com/oracle/oci-typescript-sdk)
- [Documentación de Claude Desktop](https://docs.anthropic.com)

## Licencia

Este proyecto está licenciado bajo la licencia MIT - vea el archivo LICENSE para más detalles.
