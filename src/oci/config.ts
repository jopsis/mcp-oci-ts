import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';

// Variables para almacenar la configuración
let ociConfig = {
  user: '',
  tenancy: '',
  region: '',
  fingerprint: '',
  keyFile: '',
  compartmentId: '',
  privateKey: ''
};

/**
 * Configura el cliente OCI con las variables de entorno o la configuración proporcionada
 */
export function configureOCIClient() {
  try {
    // Obtener configuración de variables de entorno
    ociConfig.user = process.env.OCI_USER_OCID || '';
    ociConfig.tenancy = process.env.OCI_TENANCY_OCID || '';
    ociConfig.region = process.env.OCI_REGION || '';
    ociConfig.fingerprint = process.env.OCI_FINGERPRINT || '';
    ociConfig.keyFile = process.env.OCI_KEY_FILE || '';
    ociConfig.compartmentId = process.env.OCI_COMPARTMENT_ID || '';
    
    // Verificar que tenemos todas las variables necesarias
    if (!ociConfig.user || !ociConfig.tenancy || !ociConfig.region || 
        !ociConfig.fingerprint || !ociConfig.keyFile || !ociConfig.compartmentId) {
      throw new Error('Faltan variables de configuración de OCI');
    }
    
    // Leer la clave privada
    try {
      const keyFilePath = path.resolve(ociConfig.keyFile);
      ociConfig.privateKey = fs.readFileSync(keyFilePath, 'utf8');
      logger.info('Configuración de OCI cargada correctamente');
    } catch (error) {
      throw new Error(`No se pudo leer el archivo de clave privada: ${(error as Error).message}`);
    }
    
    return ociConfig;
  } catch (error) {
    logger.error('Error al configurar el cliente OCI', { error });
    throw error;
  }
}

/**
 * Obtiene la configuración OCI actual
 */
export function getOCIConfig() {
  return { ...ociConfig };
}

/**
 * Obtiene el ID del compartimento configurado
 */
export function getCompartmentId() {
  return ociConfig.compartmentId;
}

/**
 * Obtiene la clave privada configurada
 */
export function getPrivateKey() {
  return ociConfig.privateKey;
}
