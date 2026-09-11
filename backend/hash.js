const bcrypt = require('bcryptjs');

async function main() {
  const password = 'admin123';
  const email = 'ale@tienda.com';
  
  const hash = await bcrypt.hash(password, 10);
  
  console.log('\n========================================');
  console.log('📧 Email:', email);
  console.log('🔑 Contraseña:', password);
  console.log('🔐 Hash:', hash);
  console.log('========================================\n');
  console.log('📋 Ejecuta este SQL en PostgreSQL:\n');
  console.log(`UPDATE usuario SET password = '${hash}' WHERE email = '${email}';\n`);
  
  const verificar = await bcrypt.compare(password, hash);
  console.log('✅ Verificación:', verificar ? 'CORRECTA' : 'FALLÓ');
}

main();