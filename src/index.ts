import express from 'express';
import cors from 'cors';
import { setupMCPTools, mcpService } from './mcp/service';
import { serverConfig } from './config';
import logger from './utils/logger';

// Inicializar el servidor Express
const app = express();

// Configurar middleware
app.use(cors());
app.use(express.json());

// Configurar las herramientas MCP
const configuredMCPService = setupMCPTools();

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    name: 'MCP Oracle Cloud Infrastructure Server',
    version: '0.1.0',
    description: 'Model Context Protocol server for Oracle Cloud Infrastructure',
    endpoints: {
      '/': 'This information',
      '/mcp': 'MCP protocol endpoint'
    }
  });
});

// Endpoint para el protocolo MCP
app.post('/mcp', async (req, res) => {
  try {
    const request = req.body;
    logger.info('Received MCP request', { request });
    
    const response = await configuredMCPService.process(request);
    logger.info('MCP response processed', { response });
    
    return res.json(response);
  } catch (error) {
    logger.error('Error processing MCP request', { error });
    return res.status(500).json({
      status: 'error',
      error: `Internal server error: ${(error as Error).message}`
    });
  }
});

// Iniciar el servidor
app.listen(serverConfig.port, () => {
  logger.info(`MCP OCI Server started on port ${serverConfig.port}`);
  logger.info(`Environment: ${serverConfig.nodeEnv}`);
});

// Manejar señales de terminación
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received, shutting down gracefully');
  process.exit(0);
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason });
  process.exit(1);
});

export default app;
