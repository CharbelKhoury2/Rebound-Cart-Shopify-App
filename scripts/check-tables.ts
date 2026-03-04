import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllTables() {
    try {
        const [users, checkouts, commissions, communications, sessions, shopSettings] = await Promise.all([
            prisma.platformUser.count(),
            prisma.abandonedCheckout.count(),
            prisma.commission.count(),
            prisma.communication.count(),
            prisma.session.count().catch(() => -1),
            prisma.shopSettings.count().catch(() => -1),
        ]);

        console.log('📊 Table Row Counts:');
        console.log(`  PlatformUser:      ${users}`);
        console.log(`  AbandonedCheckout: ${checkouts}`);
        console.log(`  Commission:        ${commissions}`);
        console.log(`  Communication:     ${communications}`);
        console.log(`  Session:           ${sessions === -1 ? 'N/A' : sessions}`);
        console.log(`  ShopSettings:      ${shopSettings === -1 ? 'N/A' : shopSettings}`);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAllTables();
