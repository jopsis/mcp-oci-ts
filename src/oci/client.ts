import * as OCI from 'oci-sdk';
import fs from 'fs';
import { ociConfig } from '../config';
import logger from '../utils/logger';

/**
 * Configuración del cliente OCI
 */
const createOCIConfig = (): OCI.common.ConfigFileAuthenticationDetailsProvider => {
  try {
    const privateKey = fs.readFileSync(ociConfig.keyFile, 'utf8');

    return new OCI.common.SimpleAuthenticationDetailsProvider(
      ociConfig.tenancy,
      ociConfig.user,
      ociConfig.fingerprint,
      privateKey,
      null,
      ociConfig.region
    );
  } catch (error) {
    logger.error('Error creating OCI configuration', { error });
    throw new Error('Failed to initialize OCI configuration');
  }
};

/**
 * Cliente de Compute
 */
export const getComputeClient = (): OCI.core.ComputeClient => {
  const provider = createOCIConfig();
  return new OCI.core.ComputeClient({
    authenticationDetailsProvider: provider,
  });
};

/**
 * Cliente de Virtual Network
 */
export const getVirtualNetworkClient = (): OCI.core.VirtualNetworkClient => {
  const provider = createOCIConfig();
  return new OCI.core.VirtualNetworkClient({
    authenticationDetailsProvider: provider,
  });
};

/**
 * Cliente de Block Storage
 */
export const getBlockStorageClient = (): OCI.core.BlockstorageClient => {
  const provider = createOCIConfig();
  return new OCI.core.BlockstorageClient({
    authenticationDetailsProvider: provider,
  });
};

/**
 * Cliente de Object Storage
 */
export const getObjectStorageClient = (): OCI.objectStorage.ObjectStorageClient => {
  const provider = createOCIConfig();
  return new OCI.objectStorage.ObjectStorageClient({
    authenticationDetailsProvider: provider,
  });
};

/**
 * Cliente de Database
 */
export const getDatabaseClient = (): OCI.database.DatabaseClient => {
  const provider = createOCIConfig();
  return new OCI.database.DatabaseClient({
    authenticationDetailsProvider: provider,
  });
};

/**
 * Obtener el ID del compartimento configurado
 */
export const getCompartmentId = (): string => {
  return ociConfig.compartmentId;
};
