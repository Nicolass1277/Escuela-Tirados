import sql from 'mssql';

const config = {
  server: 'DESKTOP-MCP59O0',
  database: 'antonioTiradosLana',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
  authentication: {
    type: 'ntlm',
    options: {
      domain: 'LAPTOP-N7PIV231',
      userName: 'Nicolas',      
      password: 'Nicolas2255_',
    },
  },
};

let poolPromise;

try {
  poolPromise = sql.connect(config);
  console.log('Conexión a la base de datos exitosa');
} catch (err) {
  console.error('Error conectando a la base de datos:', err);
}

function getConnection() {
  return poolPromise;
}

export { getConnection, sql };
