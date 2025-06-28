import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupAdmin() {
  try {
    console.log('🔧 Configurando banco de dados...');
    
    // Dados do usuário administrador
    const adminEmail = 'admin@synergia.com';
    const adminPassword = 'admin123';
    const adminName = 'Administrador';

    console.log('👤 Criando usuário no Supabase Auth...');
    
    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true
    });

    if (authError) {
      console.error('❌ Erro ao criar usuário no Supabase:', authError.message);
      return;
    }

    console.log('✅ Usuário criado no Supabase Auth');

    // Verificar se o usuário já existe no banco
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingUser) {
      console.log('⚠️  Usuário administrador já existe no banco de dados');
      console.log('📧 Email:', adminEmail);
      console.log('🔑 Senha:', adminPassword);
      return;
    }

    console.log('💾 Criando usuário no banco de dados...');

    // Criar usuário no banco de dados
    const user = await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });

    console.log('✅ Configuração concluída com sucesso!');
    console.log('');
    console.log('🎉 Usuário administrador criado:');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Senha:', adminPassword);
    console.log('👑 Papel: Administrador');
    console.log('');
    console.log('🌐 Acesse: http://localhost:5173/login');
    console.log('');

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupAdmin();