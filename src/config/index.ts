import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Cargar variables de entorno
dotenv.config();

// Función para verificar que las variables necesarias están definidas
const validateEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
};

// Verificar que el archivo de clave OCI existe
const validateKeyFile = (keyFilePath: string): string => {
  const resolvedPath = path.resolve(keyFilePath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`OCI key file not found at: ${resolvedPath}`);
  }
  return resolvedPath;
};

// Configuración de Oracle Cloud Infrastructure
const ociConfig = {
  user: validateEnv('OCI_USER_OCID'),
  tenancy: validateEnv('OCI_TENANCY_OCID'),
  region: validateEnv('OCI_REGION'),
  fingerprint: validateEnv('OCI_FINGERPRINT'),
  keyFile: validateKeyFile(validateEnv('OCI_KEY_FILE')),
  compartmentId: validateEnv('OCI_COMPARTMENT_ID'),
};

// Configuración del servidor
const serverConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
};

export { ociConfig, serverConfig };
