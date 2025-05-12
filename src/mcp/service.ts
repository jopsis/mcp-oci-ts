import { Service, Tool, FunctionResponse } from '@modelcontextprotocol/mcp';
import {
  ComputeService,
  NetworkService,
  BlockStorageService,
  ObjectStorageService,
  DatabaseService
} from '../oci/services';
import logger from '../utils/logger';

// Instancia de MCP Service
const mcpService = new Service({
  description: 'Model Context Protocol service for Oracle Cloud Infrastructure'
});

// Herramienta para gestionar instancias de computación
export const setupMCPTools = () => {
  // Instancias de servicios OCI
  const computeService = new ComputeService();
  const networkService = new NetworkService();
  const blockStorageService = new BlockStorageService();
  const objectStorageService = new ObjectStorageService();
  const databaseService = new DatabaseService();

  // Herramienta de computación
  const computeTool = new Tool({
    name: 'compute',
    description: 'Manage compute instances in Oracle Cloud Infrastructure'
  });

  // Función para listar instancias
  computeTool.addFunction({
    name: 'list_instances',
    description: 'List all compute instances in the compartment',
    parameters: {},
    execute: async (): Promise<FunctionResponse> => {
      try {
        const instances = await computeService.listInstances();
        
        // Formatear los resultados
        const formattedInstances = instances.map(instance => ({
          id: instance.id,
          displayName: instance.displayName,
          shape: instance.shape,
          lifecycleState: instance.lifecycleState,
          availabilityDomain: instance.availabilityDomain,
          timeCreated: instance.timeCreated ? new Date(instance.timeCreated).toISOString() : null,
        }));
        
        return {
          status: 'success',
          content: formattedInstances
        };
      } catch (error) {
        logger.error('Error executing list_instances function', { error });
        return {
          status: 'error',
          error: `Failed to list instances: ${(error as Error).message}`
        };
      }
    }
  });

  // Función para obtener una instancia específica
  computeTool.addFunction({
    name: 'get_instance',
    description: 'Get details of a specific compute instance',
    parameters: {
      instance_id: {
        description: 'The ID of the compute instance',
        type: 'string',
        required: true
      }
    },
    execute: async ({ instance_id }): Promise<FunctionResponse> => {
      try {
        const instance = await computeService.getInstance(instance_id);
        
        return {
          status: 'success',
          content: {
            id: instance.id,
            displayName: instance.displayName,
            shape: instance.shape,
            lifecycleState: instance.lifecycleState,
            availabilityDomain: instance.availabilityDomain,
            timeCreated: instance.timeCreated ? new Date(instance.timeCreated).toISOString() : null,
            metadata: instance.metadata,
          }
        };
      } catch (error) {
        logger.error('Error executing get_instance function', { error });
        return {
          status: 'error',
          error: `Failed to get instance: ${(error as Error).message}`
        };
      }
    }
  });

  // Función para crear una instancia
  computeTool.addFunction({
    name: 'create_instance',
    description: 'Create a new compute instance',
    parameters: {
      display_name: {
        description: 'Display name for the instance',
        type: 'string',
        required: true
      },
      shape: {
        description: 'Shape/size of the instance (e.g., VM.Standard.E4.Flex)',
        type: 'string',
        required: true
      },
      image_id: {
        description: 'ID of the image to use',
        type: 'string',
        required: true
      },
      subnet_id: {
        description: 'ID of the subnet where the instance will be launched',
        type: 'string',
        required: true
      },
      availability_domain: {
        description: 'Availability domain (e.g., AD-1)',
        type: 'string',
        required: true
      },
      metadata: {
        description: 'Instance metadata (optional)',
        type: 'object',
        required: false
      },
      shape_config: {
        description: 'Shape configuration (optional for flexible shapes)',
        type: 'object',
        required: false
      }
    },
    execute: async ({ 
      display_name, 
      shape, 
      image_id, 
      subnet_id, 
      availability_domain, 
      metadata, 
      shape_config 
    }): Promise<FunctionResponse> => {
      try {
        const instance = await computeService.createInstance(
          display_name,
          shape,
          image_id,
          subnet_id,
          availability_domain,
          metadata,
          shape_config
        );
        
        return {
          status: 'success',
          content: {
            id: instance.id,
            displayName: instance.displayName,
            shape: instance.shape,
            lifecycleState: instance.lifecycleState,
            availabilityDomain: instance.availabilityDomain,
            timeCreated: instance.timeCreated ? new Date(instance.timeCreated).toISOString() : null,
          }
        };
      } catch (error) {
        logger.error('Error executing create_instance function', { error });
        return {
          status: 'error',
          error: `Failed to create instance: ${(error as Error).message}`
        };
      }
    }
  });

  // Agregar la herramienta de computación al servicio MCP
  mcpService.addTool(computeTool);

  // Herramienta de redes
  const networkTool = new Tool({
    name: 'network',
    description: 'Manage virtual networks (VCNs) and subnets in Oracle Cloud Infrastructure'
  });

  // Función para listar VCNs
  networkTool.addFunction({
    name: 'list_vcns',
    description: 'List all VCNs in the compartment',
    parameters: {},
    execute: async (): Promise<FunctionResponse> => {
      try {
        const vcns = await networkService.listVcns();
        
        const formattedVcns = vcns.map(vcn => ({
          id: vcn.id,
          displayName: vcn.displayName,
          cidrBlock: vcn.cidrBlock,
          lifecycleState: vcn.lifecycleState,
          timeCreated: vcn.timeCreated ? new Date(vcn.timeCreated).toISOString() : null,
          dnsLabel: vcn.dnsLabel,
        }));
        
        return {
          status: 'success',
          content: formattedVcns
        };
      } catch (error) {
        logger.error('Error executing list_vcns function', { error });
        return {
          status: 'error',
          error: `Failed to list VCNs: ${(error as Error).message}`
        };
      }
    }
  });

  // Función para crear una VCN
  networkTool.addFunction({
    name: 'create_vcn',
    description: 'Create a new VCN',
    parameters: {
      display_name: {
        description: 'Display name for the VCN',
        type: 'string',
        required: true
      },
      cidr_block: {
        description: 'CIDR block for the VCN (e.g., 10.0.0.0/16)',
        type: 'string',
        required: true
      },
      dns_label: {
        description: 'DNS label for the VCN (optional)',
        type: 'string',
        required: false
      }
    },
    execute: async ({ display_name, cidr_block, dns_label }): Promise<FunctionResponse> => {
      try {
        const vcn = await networkService.createVcn(
          display_name,
          cidr_block,
          dns_label
        );
        
        return {
          status: 'success',
          content: {
            id: vcn.id,
            displayName: vcn.displayName,
            cidrBlock: vcn.cidrBlock,
            lifecycleState: vcn.lifecycleState,
            timeCreated: vcn.timeCreated ? new Date(vcn.timeCreated).toISOString() : null,
            dnsLabel: vcn.dnsLabel,
          }
        };
      } catch (error) {
        logger.error('Error executing create_vcn function', { error });
        return {
          status: 'error',
          error: `Failed to create VCN: ${(error as Error).message}`
        };
      }
    }
  });

  // Función para listar subredes
  networkTool.addFunction({
    name: 'list_subnets',
    description: 'List all subnets in the compartment, optionally filtered by VCN',
    parameters: {
      vcn_id: {
        description: 'VCN ID to filter subnets (optional)',
        type: 'string',
        required: false
      }
    },
    execute: async ({ vcn_id }): Promise<FunctionResponse> => {
      try {
        const subnets = await networkService.listSubnets(vcn_id);
        
        const formattedSubnets = subnets.map(subnet => ({
          id: subnet.id,
          displayName: subnet.displayName,
          cidrBlock: subnet.cidrBlock,
          vcnId: subnet.vcnId,
          availabilityDomain: subnet.availabilityDomain,
          lifecycleState: subnet.lifecycleState,
          timeCreated: subnet.timeCreated ? new Date(subnet.timeCreated).toISOString() : null,
          dnsLabel: subnet.dnsLabel,
        }));
        
        return {
          status: 'success',
          content: formattedSubnets
        };
      } catch (error) {
        logger.error('Error executing list_subnets function', { error });
        return {
          status: 'error',
          error: `Failed to list subnets: ${(error as Error).message}`
        };
      }
    }
  });

  // Función para crear una subred
  networkTool.addFunction({
    name: 'create_subnet',
    description: 'Create a new subnet in a VCN',
    parameters: {
      display_name: {
        description: 'Display name for the subnet',
        type: 'string',
        required: true
      },
      vcn_id: {
        description: 'ID of the VCN where the subnet will be created',
        type: 'string',
        required: true
      },
      cidr_block: {
        description: 'CIDR block for the subnet (e.g., 10.0.1.0/24)',
        type: 'string',
        required: true
      },
      availability_domain: {
        description: 'Availability domain (optional)',
        type: 'string',
        required: false
      },
      dns_label: {
        description: 'DNS label for the subnet (optional)',
        type: 'string',
        required: false
      }
    },
    execute: async ({ 
      display_name, 
      vcn_id, 
      cidr_block, 
      availability_domain, 
      dns_label 
    }): Promise<FunctionResponse> => {
      try {
        const subnet = await networkService.createSubnet(
          display_name,
          vcn_id,
          cidr_block,
          availability_domain,
          dns_label
        );
        
        return {
          status: 'success',
          content: {
            id: subnet.id,
            displayName: subnet.displayName,
            cidrBlock: subnet.cidrBlock,
            vcnId: subnet.vcnId,
            availabilityDomain: subnet.availabilityDomain,
            lifecycleState: subnet.lifecycleState,
            timeCreated: subnet.timeCreated ? new Date(subnet.timeCreated).toISOString() : null,
            dnsLabel: subnet.dnsLabel,
          }
        };
      } catch (error) {
        logger.error('Error executing create_subnet function', { error });
        return {
          status: 'error',
          error: `Failed to create subnet: ${(error as Error).message}`
        };
      }
    }
  });

  // Agregar la herramienta de redes al servicio MCP
  mcpService.addTool(networkTool);

  // Herramienta de almacenamiento en bloque
  const blockStorageTool = new Tool({
    name: 'block_storage',
    description: 'Manage block storage volumes in Oracle Cloud Infrastructure'
  });

  // Función para listar volúmenes
  blockStorageTool.addFunction({
    name: 'list_volumes',
    description: 'List all volumes in the compartment',
    parameters: {},
    execute: async (): Promise<FunctionResponse> => {
      try {
        const volumes = await blockStorageService.listVolumes();
        
        const formattedVolumes = volumes.map(volume => ({
          id: volume.id,
          displayName: volume.displayName,
          sizeInGBs: volume.sizeInGBs,
          lifecycleState: volume.lifecycleState,
          availabilityDomain: volume.availabilityDomain,
          timeCreated: volume.timeCreated ? new Date(volume.timeCreated).toISOString() : null,
        }));
        
        return {
          status: 'success',
          content: formattedVolumes
        };
      } catch (error) {
        logger.error('Error executing list_volumes function', { error });
        return {
          status: 'error',
          error: `Failed to list volumes: ${(error as Error).message}`
        };
      }
    }
  });

  // Función para crear un volumen
  blockStorageTool.addFunction({
    name: 'create_volume',
    description: 'Create a new block storage volume',
    parameters: {
      display_name: {
        description: 'Display name for the volume',
        type: 'string',
        required: true
      },
      availability_domain: {
        description: 'Availability domain',
        type: 'string',
        required: true
      },
      size_in_gbs: {
        description: 'Size of the volume in GB (optional)',
        type: 'number',
        required: false
      }
    },
    execute: async ({ display_name, availability_domain, size_in_gbs }): Promise<FunctionResponse> => {
      try {
        const volume = await blockStorageService.createVolume(
          display_name,
          availability_domain,
          size_in_gbs
        );
        
        return {
          status: 'success',
          content: {
            id: volume.id,
            displayName: volume.displayName,
            sizeInGBs: volume.sizeInGBs,
            lifecycleState: volume.lifecycleState,
            availabilityDomain: volume.availabilityDomain,
            timeCreated: volume.timeCreated ? new Date(volume.timeCreated).toISOString() : null,
          }
        };
      } catch (error) {
        logger.error('Error executing create_volume function', { error });
        return {
          status: 'error',
          error: `Failed to create volume: ${(error as Error).message}`
        };
      }
    }
  });

  // Agregar la herramienta de almacenamiento en bloque al servicio MCP
  mcpService.addTool(blockStorageTool);

  // Herramienta de almacenamiento de objetos
  const objectStorageTool = new Tool({
    name: 'object_storage',
    description: 'Manage object storage buckets in Oracle Cloud Infrastructure'
  });

  // Función para listar buckets
  objectStorageTool.addFunction({
    name: 'list_buckets',
    description: 'List all buckets in the compartment',
    parameters: {},
    execute: async (): Promise<FunctionResponse> => {
      try {
        const buckets = await objectStorageService.listBuckets();
        
        const formattedBuckets = buckets.map(bucket => ({
          name: bucket.name,
          compartmentId: bucket.compartmentId,
          namespace: bucket.namespace,
          createdBy: bucket.createdBy,
          timeCreated: bucket.timeCreated ? new Date(bucket.timeCreated).toISOString() : null,
        }));
        
        return {
          status: 'success',
          content: formattedBuckets
        };
      } catch (error) {
        logger.error('Error executing list_buckets function', { error });
        return {
          status: 'error',
          error: `Failed to list buckets: ${(error as Error).message}`
        };
      }
    }
  });

  // Función para crear un bucket
  objectStorageTool.addFunction({
    name: 'create_bucket',
    description: 'Create a new object storage bucket',
    parameters: {
      name: {
        description: 'Name of the bucket',
        type: 'string',
        required: true
      },
      public_access_type: {
        description: 'Public access type (optional)',
        type: 'string',
        required: false
      },
      storage_tier: {
        description: 'Storage tier (optional)',
        type: 'string',
        required: false
      }
    },
    execute: async ({ name, public_access_type, storage_tier }): Promise<FunctionResponse> => {
      try {
        const bucket = await objectStorageService.createBucket(
          name,
          public_access_type,
          storage_tier
        );
        
        return {
          status: 'success',
          content: {
            name: bucket.name,
            compartmentId: bucket.compartmentId,
            namespace: bucket.namespace,
            createdBy: bucket.createdBy,
            timeCreated: bucket.timeCreated ? new Date(bucket.timeCreated).toISOString() : null,
            publicAccessType: bucket.publicAccessType,
            storageTier: bucket.storageTier,
          }
        };
      } catch (error) {
        logger.error('Error executing create_bucket function', { error });
        return {
          status: 'error',
          error: `Failed to create bucket: ${(error as Error).message}`
        };
      }
    }
  });

  // Agregar la herramienta de almacenamiento de objetos al servicio MCP
  mcpService.addTool(objectStorageTool);

  // Herramienta de base de datos
  const databaseTool = new Tool({
    name: 'database',
    description: 'Manage autonomous databases in Oracle Cloud Infrastructure'
  });

  // Función para listar bases de datos autónomas
  databaseTool.addFunction({
    name: 'list_autonomous_databases',
    description: 'List all autonomous databases in the compartment',
    parameters: {},
    execute: async (): Promise<FunctionResponse> => {
      try {
        const databases = await databaseService.listAutonomousDatabases();
        
        const formattedDatabases = databases.map(db => ({
          id: db.id,
          displayName: db.displayName,
          dbName: db.dbName,
          lifecycleState: db.lifecycleState,
          dbWorkload: db.dbWorkload,
          isFreeTier: db.isFreeTier,
          timeCreated: db.timeCreated ? new Date(db.timeCreated).toISOString() : null,
        }));
        
        return {
          status: 'success',
          content: formattedDatabases
        };
      } catch (error) {
        logger.error('Error executing list_autonomous_databases function', { error });
        return {
          status: 'error',
          error: `Failed to list autonomous databases: ${(error as Error).message}`
        };
      }
    }
  });

  // Función para crear una base de datos autónoma
  databaseTool.addFunction({
    name: 'create_autonomous_database',
    description: 'Create a new autonomous database',
    parameters: {
      display_name: {
        description: 'Display name for the database',
        type: 'string',
        required: true
      },
      db_name: {
        description: 'Database name',
        type: 'string',
        required: true
      },
      admin_password: {
        description: 'Admin password',
        type: 'string',
        required: true
      },
      cpu_core_count: {
        description: 'Number of CPU cores',
        type: 'number',
        required: true
      },
      data_storage_size_in_tbs: {
        description: 'Data storage size in TB',
        type: 'number',
        required: true
      },
      is_free_tier: {
        description: 'Is free tier?',
        type: 'boolean',
        required: false
      },
      db_workload: {
        description: 'Database workload type',
        type: 'string',
        required: false
      }
    },
    execute: async ({ 
      display_name, 
      db_name, 
      admin_password, 
      cpu_core_count, 
      data_storage_size_in_tbs, 
      is_free_tier, 
      db_workload 
    }): Promise<FunctionResponse> => {
      try {
        const database = await databaseService.createAutonomousDatabase(
          display_name,
          db_name,
          admin_password,
          cpu_core_count,
          data_storage_size_in_tbs,
          is_free_tier,
          db_workload
        );
        
        return {
          status: 'success',
          content: {
            id: database.id,
            displayName: database.displayName,
            dbName: database.dbName,
            lifecycleState: database.lifecycleState,
            dbWorkload: database.dbWorkload,
            isFreeTier: database.isFreeTier,
            timeCreated: database.timeCreated ? new Date(database.timeCreated).toISOString() : null,
          }
        };
      } catch (error) {
        logger.error('Error executing create_autonomous_database function', { error });
        return {
          status: 'error',
          error: `Failed to create autonomous database: ${(error as Error).message}`
        };
      }
    }
  });

  // Agregar la herramienta de base de datos al servicio MCP
  mcpService.addTool(databaseTool);

  return mcpService;
};

export { mcpService };
