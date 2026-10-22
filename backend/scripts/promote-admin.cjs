const { loadEnvFile } = require('node:process');
const { setServers } = require('node:dns');
const mongoose = require('mongoose');

async function main() {
  loadEnvFile('.env');
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email || !email.includes('@')) throw new Error('Indicá el email de una cuenta existente.');
  if (process.env.DNS_SERVERS) setServers(process.env.DNS_SERVERS.split(',').map(value => value.trim()));
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB || 'rick_morty', serverSelectionTimeoutMS: 10000 });
    const result = await mongoose.connection.collection('users').updateOne({ email }, { $set: { role: 'admin' } });
    if (!result.matchedCount) throw new Error('No existe una cuenta con ese correo. No se modificó ningún usuario.');
    console.log('Cuenta configurada como administradora. Volvé a iniciar sesión para actualizar la interfaz.');
  } finally { await mongoose.disconnect(); }
}

main().catch(() => {
  console.error('No se pudo asignar el rol. Verificá que la cuenta exista y que el acceso a Atlas esté disponible.');
  process.exitCode = 1;
});
