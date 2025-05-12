import axios from 'axios';
import dotenv from 'dotenv';
import { program } from 'commander';
import chalk from 'chalk';

// Cargar variables de entorno
dotenv.config();

// Configuración
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:3000/mcp';
const CLAUDE_BRIDGE_URL = process.env.CLAUDE_BRIDGE_URL || 'http://localhost:3001';

/**
 * Realiza una solicitud MCP al servidor.
 */
async function makeMCPRequest(tool: string, func: string, parameters: any = {}) {
  console.log(chalk.blue(`\n🔷 Sending MCP request to ${MCP_SERVER_URL}:`));
  
  const requestData = {
    version: '0.1',
    tool,
    function: func,
    parameters
  };
  
  console.log(JSON.stringify(requestData, null, 2));
  
  try {
    const response = await axios.post(MCP_SERVER_URL, requestData);
    
    console.log(chalk.yellow(`\n🔶 Server response (status code ${response.status}):`));
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.log(chalk.red(`\n❌ Error: ${error.response.status}`));
      console.log(error.response.data);
    } else {
      console.log(chalk.red(`\n❌ Error: ${(error as Error).message}`));
    }
    return null;
  }
}

/**
 * Lista recursos del tipo especificado.
 */
async function listResources(resourceType: string) {
  const resourceMapping: Record<string, [string, string]> = {
    instances: ['compute', 'list_instances'],
    vcns: ['network', 'list_vcns'],
    subnets: ['network', 'list_subnets'],
    volumes: ['block_storage', 'list_volumes'],
    buckets: ['object_storage', 'list_buckets'],
    databases: ['database', 'list_autonomous_databases']
  };
  
  if (!resourceMapping[resourceType]) {
    console.log(chalk.red(`\nInvalid resource type: ${resourceType}`));
    console.log(`Valid types: ${Object.keys(resourceMapping).join(', ')}`);
    return;
  }
  
  const [tool, func] = resourceMapping[resourceType];
  
  console.log(chalk.green(`\n📋 Listing ${resourceType}...`));
  await makeMCPRequest(tool, func);
}

/**
 * Crea una nueva VCN.
 */
async function createVcn(name: string, cidrBlock: string, dnsLabel?: string) {
  console.log(chalk.green(`\n🌐 Creating VCN: ${name}...`));
  
  const parameters: Record<string, any> = {
    display_name: name,
    cidr_block: cidrBlock
  };
  
  if (dnsLabel) {
    parameters.dns_label = dnsLabel;
  }
  
  await makeMCPRequest('network', 'create_vcn', parameters);
}

/**
 * Crea una nueva instancia de computación.
 */
async function createInstance(
  name: string,
  shape: string,
  imageId: string,
  subnetId: string,
  availabilityDomain: string
) {
  console.log(chalk.green(`\n💻 Creating instance: ${name}...`));
  
  const parameters = {
    display_name: name,
    shape,
    image_id: imageId,
    subnet_id: subnetId,
    availability_domain: availabilityDomain
  };
  
  await makeMCPRequest('compute', 'create_instance', parameters);
}

/**
 * Crea un nuevo bucket de almacenamiento de objetos.
 */
async function createBucket(name: string) {
  console.log(chalk.green(`\n🪣 Creating bucket: ${name}...`));
  
  const parameters = {
    name
  };
  
  await makeMCPRequest('object_storage', 'create_bucket', parameters);
}

/**
 * Prueba la conexión con el puente Claude Desktop.
 */
async function testClaudeBridge() {
  console.log(chalk.blue(`\n🔍 Testing Claude Desktop Bridge at ${CLAUDE_BRIDGE_URL}...`));
  
  try {
    // Probar la conexión básica
    const infoResponse = await axios.get(CLAUDE_BRIDGE_URL);
    console.log(chalk.green('\n✅ Connection successful!'));
    console.log(JSON.stringify(infoResponse.data, null, 2));
    
    // Obtener herramientas disponibles
    console.log(chalk.blue('\n🔍 Getting available tools...'));
    const toolsResponse = await axios.get(`${CLAUDE_BRIDGE_URL}/tools`);
    
    // Mostrar solo los nombres de las herramientas para brevedad
    const toolNames = Object.keys(toolsResponse.data);
    console.log(chalk.green(`\n✅ Available tools: ${toolNames.join(', ')}`));
    
    // Probar una función simple (listar VCNs)
    console.log(chalk.blue('\n🔍 Testing function execution (list_vcns)...'));
    
    const functionResponse = await axios.post(`${CLAUDE_BRIDGE_URL}/function`, {
      tool: 'network',
      function: 'list_vcns',
      parameters: {}
    });
    
    console.log(chalk.green('\n✅ Function execution successful!'));
    console.log(JSON.stringify(functionResponse.data, null, 2));
    
    return true;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.log(chalk.red(`\n❌ Error: ${error.response.status}`));
      console.log(error.response.data);
    } else {
      console.log(chalk.red(`\n❌ Error: ${(error as Error).message}`));
    }
    return false;
  }
}

// Configurar el CLI
program
  .name('mcp-client')
  .description('Client for MCP Oracle Cloud Infrastructure Server')
  .version('0.1.0');

program
  .command('list <resource-type>')
  .description('List resources of the specified type')
  .action(listResources);

program
  .command('create-vcn <name> <cidr-block>')
  .description('Create a new VCN')
  .option('--dns-label <label>', 'DNS label for the VCN')
  .action((name, cidrBlock, options) => {
    createVcn(name, cidrBlock, options.dnsLabel);
  });

program
  .command('create-instance <name> <shape> <image-id> <subnet-id> <availability-domain>')
  .description('Create a new compute instance')
  .action(createInstance);

program
  .command('create-bucket <name>')
  .description('Create a new bucket')
  .action(createBucket);

program
  .command('test-claude-bridge')
  .description('Test the Claude Desktop Bridge')
  .action(testClaudeBridge);

// Analizar argumentos
program.parse(process.argv);

// Si no se proporciona ningún comando, mostrar la ayuda
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
