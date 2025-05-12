import * as OCI from 'oci-sdk';
import {
  getComputeClient,
  getVirtualNetworkClient,
  getBlockStorageClient,
  getObjectStorageClient,
  getDatabaseClient,
  getCompartmentId,
} from './client';
import logger from '../utils/logger';

/**
 * Servicio para gestionar instancias de computación
 */
export class ComputeService {
  private client: OCI.core.ComputeClient;
  private compartmentId: string;

  constructor() {
    this.client = getComputeClient();
    this.compartmentId = getCompartmentId();
  }

  /**
   * Lista todas las instancias de computación en el compartimento
   */
  async listInstances() {
    try {
      const request: OCI.core.models.ListInstancesRequest = {
        compartmentId: this.compartmentId,
      };

      const response = await this.client.listInstances(request);
      return response.items;
    } catch (error) {
      logger.error('Error listing compute instances', { error });
      throw error;
    }
  }

  /**
   * Obtiene los detalles de una instancia específica
   */
  async getInstance(instanceId: string) {
    try {
      const request: OCI.core.models.GetInstanceRequest = {
        instanceId: instanceId,
      };

      const response = await this.client.getInstance(request);
      return response.instance;
    } catch (error) {
      logger.error(`Error getting compute instance: ${instanceId}`, { error });
      throw error;
    }
  }

  /**
   * Crea una nueva instancia de computación
   */
  async createInstance(
    displayName: string,
    shape: string,
    imageId: string,
    subnetId: string,
    availabilityDomain: string,
    metadata?: Record<string, string>,
    shapeConfig?: { ocpus?: number; memoryInGBs?: number }
  ) {
    try {
      // Crear detalles de la instancia
      const launchDetails: OCI.core.models.LaunchInstanceDetails = {
        availabilityDomain: availabilityDomain,
        compartmentId: this.compartmentId,
        displayName: displayName,
        shape: shape,
        sourceDetails: {
          sourceType: 'image',
          imageId: imageId,
        } as OCI.core.models.InstanceSourceViaImageDetails,
        createVnicDetails: {
          subnetId: subnetId,
          assignPublicIp: true,
        } as OCI.core.models.CreateVnicDetails,
        metadata: metadata,
      };

      // Añadir configuración de forma si se proporciona
      if (shapeConfig) {
        launchDetails.shapeConfig = {
          ocpus: shapeConfig.ocpus,
          memoryInGBs: shapeConfig.memoryInGBs,
        } as OCI.core.models.LaunchInstanceShapeConfigDetails;
      }

      const request: OCI.core.models.LaunchInstanceRequest = {
        launchInstanceDetails: launchDetails,
      };

      const response = await this.client.launchInstance(request);
      return response.instance;
    } catch (error) {
      logger.error('Error creating compute instance', { error });
      throw error;
    }
  }
}

/**
 * Servicio para gestionar redes virtuales
 */
export class NetworkService {
  private client: OCI.core.VirtualNetworkClient;
  private compartmentId: string;

  constructor() {
    this.client = getVirtualNetworkClient();
    this.compartmentId = getCompartmentId();
  }

  /**
   * Lista todas las VCNs en el compartimento
   */
  async listVcns() {
    try {
      const request: OCI.core.models.ListVcnsRequest = {
        compartmentId: this.compartmentId,
      };

      const response = await this.client.listVcns(request);
      return response.items;
    } catch (error) {
      logger.error('Error listing VCNs', { error });
      throw error;
    }
  }

  /**
   * Obtiene los detalles de una VCN específica
   */
  async getVcn(vcnId: string) {
    try {
      const request: OCI.core.models.GetVcnRequest = {
        vcnId: vcnId,
      };

      const response = await this.client.getVcn(request);
      return response.vcn;
    } catch (error) {
      logger.error(`Error getting VCN: ${vcnId}`, { error });
      throw error;
    }
  }

  /**
   * Crea una nueva VCN
   */
  async createVcn(displayName: string, cidrBlock: string, dnsLabel?: string) {
    try {
      const createVcnDetails: OCI.core.models.CreateVcnDetails = {
        compartmentId: this.compartmentId,
        displayName: displayName,
        cidrBlock: cidrBlock,
        dnsLabel: dnsLabel,
      };

      const request: OCI.core.models.CreateVcnRequest = {
        createVcnDetails: createVcnDetails,
      };

      const response = await this.client.createVcn(request);
      return response.vcn;
    } catch (error) {
      logger.error('Error creating VCN', { error });
      throw error;
    }
  }

  /**
   * Lista todas las subredes en el compartimento
   */
  async listSubnets(vcnId?: string) {
    try {
      const request: OCI.core.models.ListSubnetsRequest = {
        compartmentId: this.compartmentId,
        vcnId: vcnId,
      };

      const response = await this.client.listSubnets(request);
      return response.items;
    } catch (error) {
      logger.error('Error listing subnets', { error });
      throw error;
    }
  }

  /**
   * Crea una nueva subred
   */
  async createSubnet(
    displayName: string,
    vcnId: string,
    cidrBlock: string,
    availabilityDomain?: string,
    dnsLabel?: string
  ) {
    try {
      const createSubnetDetails: OCI.core.models.CreateSubnetDetails = {
        compartmentId: this.compartmentId,
        displayName: displayName,
        vcnId: vcnId,
        cidrBlock: cidrBlock,
        availabilityDomain: availabilityDomain,
        dnsLabel: dnsLabel,
      };

      const request: OCI.core.models.CreateSubnetRequest = {
        createSubnetDetails: createSubnetDetails,
      };

      const response = await this.client.createSubnet(request);
      return response.subnet;
    } catch (error) {
      logger.error('Error creating subnet', { error });
      throw error;
    }
  }
}

/**
 * Servicio para gestionar almacenamiento en bloque
 */
export class BlockStorageService {
  private client: OCI.core.BlockstorageClient;
  private compartmentId: string;

  constructor() {
    this.client = getBlockStorageClient();
    this.compartmentId = getCompartmentId();
  }

  /**
   * Lista todos los volúmenes en el compartimento
   */
  async listVolumes() {
    try {
      const request: OCI.core.models.ListVolumesRequest = {
        compartmentId: this.compartmentId,
      };

      const response = await this.client.listVolumes(request);
      return response.items;
    } catch (error) {
      logger.error('Error listing volumes', { error });
      throw error;
    }
  }

  /**
   * Obtiene los detalles de un volumen específico
   */
  async getVolume(volumeId: string) {
    try {
      const request: OCI.core.models.GetVolumeRequest = {
        volumeId: volumeId,
      };

      const response = await this.client.getVolume(request);
      return response.volume;
    } catch (error) {
      logger.error(`Error getting volume: ${volumeId}`, { error });
      throw error;
    }
  }

  /**
   * Crea un nuevo volumen
   */
  async createVolume(
    displayName: string,
    availabilityDomain: string,
    sizeInGBs?: number
  ) {
    try {
      const createVolumeDetails: OCI.core.models.CreateVolumeDetails = {
        compartmentId: this.compartmentId,
        displayName: displayName,
        availabilityDomain: availabilityDomain,
        sizeInGBs: sizeInGBs,
      };

      const request: OCI.core.models.CreateVolumeRequest = {
        createVolumeDetails: createVolumeDetails,
      };

      const response = await this.client.createVolume(request);
      return response.volume;
    } catch (error) {
      logger.error('Error creating volume', { error });
      throw error;
    }
  }
}

/**
 * Servicio para gestionar almacenamiento de objetos
 */
export class ObjectStorageService {
  private client: OCI.objectStorage.ObjectStorageClient;
  private compartmentId: string;
  private namespace: string | null = null;

  constructor() {
    this.client = getObjectStorageClient();
    this.compartmentId = getCompartmentId();
  }

  /**
   * Obtiene el namespace del almacenamiento de objetos
   */
  async getNamespace() {
    if (this.namespace) {
      return this.namespace;
    }

    try {
      const response = await this.client.getNamespace({});
      this.namespace = response.value;
      return this.namespace;
    } catch (error) {
      logger.error('Error getting object storage namespace', { error });
      throw error;
    }
  }

  /**
   * Lista todos los buckets en el compartimento
   */
  async listBuckets() {
    try {
      const namespace = await this.getNamespace();
      
      const request: OCI.objectStorage.models.ListBucketsRequest = {
        compartmentId: this.compartmentId,
        namespaceName: namespace,
      };

      const response = await this.client.listBuckets(request);
      return response.items;
    } catch (error) {
      logger.error('Error listing buckets', { error });
      throw error;
    }
  }

  /**
   * Obtiene los detalles de un bucket específico
   */
  async getBucket(bucketName: string) {
    try {
      const namespace = await this.getNamespace();
      
      const request: OCI.objectStorage.models.GetBucketRequest = {
        namespaceName: namespace,
        bucketName: bucketName,
      };

      const response = await this.client.getBucket(request);
      return response.bucket;
    } catch (error) {
      logger.error(`Error getting bucket: ${bucketName}`, { error });
      throw error;
    }
  }

  /**
   * Crea un nuevo bucket
   */
  async createBucket(
    name: string,
    publicAccessType: string = 'NoPublicAccess',
    storageTier: string = 'Standard'
  ) {
    try {
      const namespace = await this.getNamespace();
      
      const createBucketDetails: OCI.objectStorage.models.CreateBucketDetails = {
        name: name,
        compartmentId: this.compartmentId,
        publicAccessType: publicAccessType as OCI.objectStorage.models.CreateBucketDetails.PublicAccessType,
        storageTier: storageTier as OCI.objectStorage.models.CreateBucketDetails.StorageTier,
      };

      const request: OCI.objectStorage.models.CreateBucketRequest = {
        namespaceName: namespace,
        createBucketDetails: createBucketDetails,
      };

      const response = await this.client.createBucket(request);
      return response.bucket;
    } catch (error) {
      logger.error(`Error creating bucket: ${name}`, { error });
      throw error;
    }
  }
}

/**
 * Servicio para gestionar bases de datos
 */
export class DatabaseService {
  private client: OCI.database.DatabaseClient;
  private compartmentId: string;

  constructor() {
    this.client = getDatabaseClient();
    this.compartmentId = getCompartmentId();
  }

  /**
   * Lista todas las bases de datos autónomas en el compartimento
   */
  async listAutonomousDatabases() {
    try {
      const request: OCI.database.models.ListAutonomousDatabasesRequest = {
        compartmentId: this.compartmentId,
      };

      const response = await this.client.listAutonomousDatabases(request);
      return response.items;
    } catch (error) {
      logger.error('Error listing autonomous databases', { error });
      throw error;
    }
  }

  /**
   * Obtiene los detalles de una base de datos autónoma específica
   */
  async getAutonomousDatabase(databaseId: string) {
    try {
      const request: OCI.database.models.GetAutonomousDatabaseRequest = {
        autonomousDatabaseId: databaseId,
      };

      const response = await this.client.getAutonomousDatabase(request);
      return response.autonomousDatabase;
    } catch (error) {
      logger.error(`Error getting autonomous database: ${databaseId}`, { error });
      throw error;
    }
  }

  /**
   * Crea una nueva base de datos autónoma
   */
  async createAutonomousDatabase(
    displayName: string,
    dbName: string,
    adminPassword: string,
    cpuCoreCount: number,
    dataStorageSizeInTBs: number,
    isFreeTier: boolean = false,
    dbWorkload: string = 'OLTP'
  ) {
    try {
      const createAutonomousDatabaseDetails: OCI.database.models.CreateAutonomousDatabaseBase = {
        compartmentId: this.compartmentId,
        displayName: displayName,
        dbName: dbName,
        adminPassword: adminPassword,
        cpuCoreCount: cpuCoreCount,
        dataStorageSizeInTBs: dataStorageSizeInTBs,
        isFreeTier: isFreeTier,
        dbWorkload: dbWorkload as OCI.database.models.CreateAutonomousDatabaseBase.DbWorkload,
      };

      const request: OCI.database.models.CreateAutonomousDatabaseRequest = {
        createAutonomousDatabaseDetails: createAutonomousDatabaseDetails,
      };

      const response = await this.client.createAutonomousDatabase(request);
      return response.autonomousDatabase;
    } catch (error) {
      logger.error(`Error creating autonomous database: ${displayName}`, { error });
      throw error;
    }
  }
}
