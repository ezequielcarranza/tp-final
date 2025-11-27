import { config } from './src/config/config.js';
import DatabaseFactory from './src/databases/DatabaseFactory.js';
import server from './src/server.js';

const runServer = async () => {
  try {
    DatabaseFactory.getConnection();
    const port = config.SERVER_PORT || 3000;
    const host = config.SERVER_HOST || 'localhost';
    server.listen(
      port,
      host,
      () => {
        console.log(`
                Server is running at: http://${host}:${port}
            `);
      },
    );
  } catch (error) {
    console.log(`Error en el server`, error.message);
  }
};

runServer();
