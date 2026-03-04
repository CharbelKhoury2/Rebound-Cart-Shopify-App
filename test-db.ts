import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing DB connection...');
        const userCount = await prisma.platformUser.count();
        console.log(`Total users in DB: ${userCount}`);

        const users = await prisma.platformUser.findMany({
            select: {
                email: true,
                status: true,
                role: true
            }
        });

        console.log('User list:');
        console.table(users);
    } catch (error) {
        console.error('DB Connection Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
