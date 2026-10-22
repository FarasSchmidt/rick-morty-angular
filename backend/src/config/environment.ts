import { isIP } from 'node:net';

export function validateEnvironment(env: Record<string, unknown>) {
  const uri = String(env['MONGODB_URI'] ?? '');
  if (!/^mongodb(?:\+srv)?:\/\//.test(uri) || /USUARIO|CONTRASENA|HOST_DE_ATLAS|<[^>]+>/.test(uri)) {
    throw new Error('Configurá MONGODB_URI en backend/.env con la conexión de Atlas.');
  }
  const port = Number(env['PORT'] ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT debe ser un número entre 1 y 65535.');
  }
  const origin = String(env['FRONTEND_ORIGIN'] ?? 'http://localhost:4200');
  try {
    const parsed = new URL(origin);
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.origin !== origin) throw new Error();
  } catch {
    throw new Error('FRONTEND_ORIGIN debe ser un origen HTTP o HTTPS sin barra final.');
  }
  const db = String(env['MONGODB_DB'] ?? 'rick_morty');
  if (!/^[a-zA-Z0-9_-]+$/.test(db)) throw new Error('MONGODB_DB debe ser un nombre de base válido.');
  const dnsServers = String(env['DNS_SERVERS'] ?? '').trim();
  const secret = String(env['JWT_SECRET'] ?? '');
  if (secret.length < 32 || secret.includes('REEMPLAZAR')) {
    throw new Error('JWT_SECRET debe contener al menos 32 caracteres y ser una clave privada aleatoria.');
  }
  if (dnsServers && dnsServers.split(',').some(server => !isIP(server.trim()))) {
    throw new Error('DNS_SERVERS debe contener direcciones IP separadas por comas.');
  }
  return { ...env, MONGODB_URI: uri, MONGODB_DB: db, PORT: port, FRONTEND_ORIGIN: origin, DNS_SERVERS: dnsServers };
}
