import prisma from "./prisma";

const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("DATABASE CONNECTION SUCCESSFUL".green.bold);        
    } catch (error) {
        console.log(`DATABASE CONNECTION ERROR: ${error}`.red.bold)
    }
}


const disconnectDB = async () => {
    await prisma.$disconnect();
    process.exit(0);
};

export {connectDB, disconnectDB};