import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
    try {
        console.log('🔍 Checking PlatformUser table...\n');

        const users = await prisma.platformUser.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                status: true,
                tier: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'asc' }
        });

        if (users.length === 0) {
            console.log('❌ NO USERS FOUND in PlatformUser table. The table is empty!');
        } else {
            console.log(`✅ Found ${users.length} user(s):\n`);
            users.forEach((u, i) => {
                console.log(`${i + 1}. ${u.email}`);
                console.log(`   Name:   ${u.firstName} ${u.lastName}`);
                console.log(`   Role:   ${u.role}`);
                console.log(`   Status: ${u.status}`);
                console.log(`   Tier:   ${u.tier}`);
                console.log(`   ID:     ${u.id}`);
                console.log(`   Created: ${u.createdAt}`);
                console.log('');
            });
        }
    } catch (error) {
        console.error('❌ Error connecting to database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
