import { serverConfig } from './config';
import logger from './utils/logger';
import app from './index';
import { startClaudeBridge } from './claude/bridge';

// Iniciar el servidor MCP OCI
app.listen(serverConfig.port, () => {
  logger.info(`MCP OCI Server started on port ${serverConfig.port}`);
  logger.info(`Environment: ${serverConfig.nodeEnv}`);
  
  // También iniciar el puente Claude Desktop
  startClaudeBridge();
});
