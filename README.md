# MCP Server para Oracle Cloud Infrastructure

Este paquete implementa un servidor MCP (Model Context Protocol) para Oracle Cloud Infrastructure. Permite a los modelos de lenguaje como Claude interactuar con recursos de OCI mediante herramientas estructuradas.

## Características

- Implementación del Model Context Protocol para OCI
- Integración directa con Claude Desktop
- Herramientas para gestionar:
  - Instancias de computación
  - Redes virtuales (VCNs) y subredes
  - Volúmenes de almacenamiento en bloque
  - Buckets de almacenamiento de objetos
  - Bases de datos autónomas

## Instalación rápida

Para una instalación rápida con configuración interactiva:

```bash
git clone https://github.com/tu-usuario/mcp-server-oci.git
cd mcp-server-oci
chmod +x setup.sh
./setup.sh
```

## Instalación manual

### 1. Clonar e instalar

```bash
git clone https://github.com/tu-usuario/mcp-server-oci.git
cd mcp-server-oci
npm install
npm run build
npm install -g .
```

### 2. Configurar

Crea un archivo de configuración JSON (por ejemplo, en `~/.mcp-server-oci/config.json`):

```json
{
  "userOcid": "ocid1.user.oc1..example",
  "tenancyOcid": "ocid1.tenancy.oc1..example",
  "region": "us-ashburn-1",
  "fingerprint": "12:34:56:78:90:ab:cd:ef:12:34:56:78:90:ab:cd:ef",
  "keyFile": "/path/to/your/oci_api_key.pem",
  "compartmentId": "ocid1.compartment.oc1..example"
}
```

O puedes usar un archivo `.env`:

```
OCI_USER_OCID=ocid1.user.oc1..example
OCI_TENANCY_OCID=ocid1.tenancy.oc1..example
OCI_REGION=us-ashburn-1
OCI_FINGERPRINT=12:34:56:78:90:ab:cd:ef:12:34:56:78:90:ab:cd:ef
OCI_KEY_FILE=/path/to/your/oci_api_key.pem
OCI_COMPARTMENT_ID=ocid1.compartment.oc1..example
```

## Integración con Claude Desktop

Para integrar este servidor MCP con Claude Desktop, añade la siguiente configuración a tu archivo de configuración de Claude Desktop (generalmente en `~/.config/claude-desktop/settings.json`):

```json
{
  "mcpServers": {
    "oracle-cloud": {
      "command": "/path/to/mcp-server-oci",
      "args": [
        "--config",
        "/path/to/your/config.json"
      ],
      "env": {}
    }
  }
}
```

Si instalaste globalmente con npm, puedes utilizar el comando `which mcp-server-oci` para encontrar la ruta correcta.

## Uso

Una vez configurado, reinicia Claude Desktop. Ahora podrás interactuar con Oracle Cloud Infrastructure a través de conversaciones con Claude.

### Ejemplos de consultas

- "Lista todas mis instancias de computación en Oracle Cloud"
- "Crea una nueva VCN con el nombre 'dev-network' y CIDR 10.0.0.0/16"
- "Muéstrame todos mis buckets de almacenamiento"
- "Crea una subred en la VCN principal con CIDR 10.0.1.0/24"

## Opciones de línea de comandos

El servidor MCP para OCI admite las siguientes opciones:

```
Opciones:
  --config, -c         Ruta al archivo de configuración (.env o .json)  [cadena] [predeterminado: ".env"]
  --user-ocid          OCID del usuario en OCI                          [cadena]
  --tenancy-ocid       OCID del tenancy en OCI                          [cadena]
  --region             Región de OCI                                    [cadena]
  --fingerprint        Fingerprint de la clave API                      [cadena]
  --key-file           Ruta al archivo de clave privada                 [cadena]
  --compartment-id     OCID del compartimento donde trabajar            [cadena]
  --help               Muestra ayuda                                    [booleano]
```

## Desarrollo

### Estructura del proyecto

```
mcp-server-oci/
├── src/
│   ├── cli.ts                 # Punto de entrada del CLI
│   ├── mcp/                   # Implementación del protocolo MCP
│   │   └── service.ts         # Definición de herramientas y funciones
│   └── oci/                   # Integración con Oracle Cloud
│       ├── client.ts          # Clientes de API de OCI
│       ├── config.ts          # Configuración de OCI
│       └── services.ts        # Servicios para interactuar con OCI
├── package.json
└── tsconfig.json
```

### Compilar desde el código fuente

```bash
# Instalar dependencias
npm install

# Compilar TypeScript
npm run build

# Probar localmente
node dist/cli.js --config=./config.json
```

## Consideraciones de seguridad

- El archivo de configuración contiene información sensible. Asegúrate de protegerlo adecuadamente.
- La clave privada de la API de OCI debe tener permisos limitados a las operaciones necesarias.
- Considera usar un compartimento específico para las operaciones de este servidor.

## Licencia

Este proyecto está licenciado bajo la licencia MIT. Consulta el archivo LICENSE para más detalles.
