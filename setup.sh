#!/bin/bash

# Configurar variables
CONFIG_DIR="$HOME/.mcp-server-oci"
CONFIG_FILE="$CONFIG_DIR/config.json"

# Crear directorio de configuración si no existe
mkdir -p "$CONFIG_DIR"

# Función para solicitar información del usuario
prompt_user() {
  echo "====== Configuración de MCP Server para Oracle Cloud Infrastructure ======"
  echo ""
  echo "Ingresa la información de tu cuenta de Oracle Cloud Infrastructure:"
  echo ""
  
  read -p "OCID del usuario: " USER_OCID
  read -p "OCID del tenancy: " TENANCY_OCID
  read -p "Región (ej: us-ashburn-1): " REGION
  read -p "Fingerprint de la clave API: " FINGERPRINT
  read -p "Ruta a la clave privada API: " KEY_FILE
  read -p "OCID del compartimento: " COMPARTMENT_ID
  
  # Validar la ruta de la clave
  if [ ! -f "$KEY_FILE" ]; then
    echo "Error: El archivo de clave privada no existe en la ruta especificada."
    exit 1
  fi
  
  # Crear el archivo JSON
  cat > "$CONFIG_FILE" << EOF
{
  "userOcid": "$USER_OCID",
  "tenancyOcid": "$TENANCY_OCID",
  "region": "$REGION",
  "fingerprint": "$FINGERPRINT",
  "keyFile": "$KEY_FILE",
  "compartmentId": "$COMPARTMENT_ID"
}
EOF
  
  echo ""
  echo "Configuración guardada en $CONFIG_FILE"
}

# Instalar el paquete
install_package() {
  echo ""
  echo "Instalando mcp-server-oci..."
  
  # Instalar globalmente
  npm install -g .
  
  if [ $? -ne 0 ]; then
    echo "Error: No se pudo instalar el paquete."
    exit 1
  fi
  
  echo "Instalación completada."
}

# Mostrar instrucciones de uso
show_instructions() {
  echo ""
  echo "===== Instrucciones para usar con Claude Desktop ====="
  echo ""
  echo "Para integrar este servidor con Claude Desktop, agrega la siguiente configuración"
  echo "a tu archivo de configuración de Claude Desktop:"
  echo ""
  echo '{
  "mcpServers": {
    "oracle-cloud": {
      "command": "'$(which mcp-server-oci)'",
      "args": [
        "--config",
        "'$CONFIG_FILE'"
      ],
      "env": {}
    }
  }
}'
  echo ""
  echo "Puedes encontrar más información en el archivo README.md."
}

# Ejecutar funciones
prompt_user
install_package
show_instructions

echo ""
echo "¡Configuración completada!"
echo ""
