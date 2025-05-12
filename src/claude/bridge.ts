import express from 'express';
import cors from 'cors';
import { setupMCPTools } from '../mcp/service';
import logger from '../utils/logger';

// Configuración del servidor Claude Bridge
const PORT = process.env.CLAUDE_BRIDGE_PORT || 3001;

// Inicializar el servicio MCP con todas las herramientas
const mcpService = setupMCPTools();

// Inicializar el servidor Express
const app = express();

// Configurar middleware
app.use(cors());
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    name: 'Claude Desktop - OCI MCP Bridge',
    version: '0.1.0',
    description: 'Bridge to connect Claude Desktop with Oracle Cloud Infrastructure using MCP',
    endpoints: {
      '/tools': 'Get available tools and functions',
      '/function': 'Execute functions'
    }
  });
});

// Endpoint para obtener las herramientas disponibles
app.get('/tools', (req, res) => {
  try {
    const tools = mcpService.getTools().reduce((acc, tool) => {
      // Obtener todas las funciones para esta herramienta
      const functions = tool.getFunctions().reduce((funcAcc, func) => {
        // Convertir los parámetros al formato esperado por Claude Desktop
        const parameters: Record<string, any> = {};
        
        Object.entries(func.parameters || {}).forEach(([key, param]) => {
          parameters[key] = param.description;
        });
        
        funcAcc[func.name] = {
          description: func.description,
          parameters: parameters
        };
        
        return funcAcc;
      }, {} as Record<string, any>);
      
      // Agregar la herramienta con sus funciones al acumulador
      acc[tool.name] = {
        description: tool.description,
        functions: functions
      };
      
      return acc;
    }, {} as Record<string, any>);
    
    res.json(tools);
  } catch (error) {
    logger.error('Error getting tools', { error });
    res.status(500).json({
      status: 'error',
      error: `Failed to get tools: ${(error as Error).message}`
    });
  }
});

// Endpoint para ejecutar funciones
app.post('/function', async (req, res) => {
  try {
    const { tool, function: functionName, parameters } = req.body;
    
    logger.info('Function execution request', { tool, function: functionName, parameters });
    
    if (!tool || !functionName) {
      return res.status(400).json({
        status: 'error',
        error: 'Missing tool or function name'
      });
    }
    
    // Convertir al formato MCP
    const mcpRequest = {
      version: '0.1',
      tool,
      function: functionName,
      parameters: parameters || {}
    };
    
    // Procesar la solicitud a través del servicio MCP
    const mcpResponse = await mcpService.process(mcpRequest);
    
    // Devolver la respuesta
    res.json({
      status: mcpResponse.status,
      content: mcpResponse.content,
      error: mcpResponse.error
    });
  } catch (error) {
    logger.error('Error executing function', { error });
    res.status(500).json({
      status: 'error',
      error: `Failed to execute function: ${(error as Error).message}`
    });
  }
});

// Iniciar el servidor
export const startClaudeBridge = () => {
  app.listen(PORT, () => {
    logger.info(`Claude Desktop Bridge started on port ${PORT}`);
  });
};

export default app;
