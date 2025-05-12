#!/usr/bin/env node

import { setupMCPTools } from './mcp/service';
import { MCPStreamServer } from '@modelcontextprotocol/mcp';
import { configureOCIClient } from './oci/config';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Configurar las opciones de línea de comandos
const argv = yargs(hideBin(process.argv))
  .option('config', {
    alias: 'c',
    type: 'string',
    description: 'Ruta al archivo de configuración de OCI (.env o .json)',
    default: '.env'
  })
  .option('user-ocid', {
    type: 'string',
    description: 'OCID del usuario en OCI'
  })
  .option('tenancy-ocid', {
    type: 'string',
    description: 'OCID del tenancy en OCI'
  })
  .option('region', {
    type: 'string',
    description: 'Región de OCI'
  })
  .option('fingerprint', {
    type: 'string',
    description: 'Fingerprint de la clave API'
  })
  .option('key-file', {
    type: 'string',
    description: 'Ruta al archivo de clave privada'
  })
  .option('compartment-id', {
    type: 'string',
    description: 'OCID del compartimento donde trabajar'
  })
  .help()
  .argv;

// Función para cargar la configuración
const loadConfig = () => {
  const configPath = argv.config as string;
  
  // Verificar si el archivo de configuración existe
  if (!fs.existsSync(configPath)) {
    console.error(`El archivo de configuración no existe: ${configPath}`);
    process.exit(1);
  }
  
  // Determinar el tipo de archivo de configuración
  if (path.extname(configPath) === '.json') {
    // Cargar archivo JSON
    try {
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      // Establecer variables de entorno desde el objeto JSON
      process.env.OCI_USER_OCID = configData.user || configData.userOcid || configData.OCI_USER_OCID;
      process.env.OCI_TENANCY_OCID = configData.tenancy || configData.tenancyOcid || configData.OCI_TENANCY_OCID;
      process.env.OCI_REGION = configData.region || configData.OCI_REGION;
      process.env.OCI_FINGERPRINT = configData.fingerprint || configData.OCI_FINGERPRINT;
      process.env.OCI_KEY_FILE = configData.keyFile || configData.OCI_KEY_FILE;
      process.env.OCI_COMPARTMENT_ID = configData.compartmentId || configData.OCI_COMPARTMENT_ID;
    } catch (error) {
      console.error(`Error al parsear el archivo JSON: ${(error as Error).message}`);
      process.exit(1);
    }
  } else {
    // Cargar archivo .env
    dotenv.config({ path: configPath });
  }
  
  // Sobrescribir con argumentos de línea de comandos si están presentes
  if (argv['user-ocid']) process.env.OCI_USER_OCID = argv['user-ocid'] as string;
  if (argv['tenancy-ocid']) process.env.OCI_TENANCY_OCID = argv['tenancy-ocid'] as string;
  if (argv.region) process.env.OCI_REGION = argv.region as string;
  if (argv.fingerprint) process.env.OCI_FINGERPRINT = argv.fingerprint as string;
  if (argv['key-file']) process.env.OCI_KEY_FILE = argv['key-file'] as string;
  if (argv['compartment-id']) process.env.OCI_COMPARTMENT_ID = argv['compartment-id'] as string;
  
  // Verificar que las variables requeridas están definidas
  const requiredVars = [
    'OCI_USER_OCID',
    'OCI_TENANCY_OCID',
    'OCI_REGION',
    'OCI_FINGERPRINT',
    'OCI_KEY_FILE',
    'OCI_COMPARTMENT_ID'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`Faltan las siguientes variables de configuración: ${missingVars.join(', ')}`);
    process.exit(1);
  }
};

// Cargar la configuración
loadConfig();

// Configurar el cliente OCI con las variables de entorno
configureOCIClient();

// Crear el servicio MCP con todas las herramientas
const mcpService = setupMCPTools();

// Crear el servidor MCP que se comunica a través de stdin/stdout
const server = new MCPStreamServer({
  service: mcpService,
  input: process.stdin,
  output: process.stdout
});

// Iniciar el servidor
console.error('Iniciando servidor MCP para Oracle Cloud Infrastructure...');
server.start();

// Manejar señales de terminación
process.on('SIGTERM', () => {
  console.error('SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.error('SIGINT recibido, cerrando servidor...');
  process.exit(0);
});
