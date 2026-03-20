const { MongoClient } = require('mongodb');

// ━━━━━━━━━━━━━━━━━━━━━━━
// 🔁 DATABASE MIGRATION CONFIG
// ━━━━━━━━━━━━━━━━━━━━━━━

const LOCAL_DB_URI = "mongodb://127.0.0.1:27017/sprouts";
const CLOUD_DB_URI = "mongodb+srv://SproutsOrgs:SproutsOrgs12345@cluster0.1i9dtge.mongodb.net/sprouts?retryWrites=true&w=majority&appName=Cluster0"; // Replace with your Atlas connection string

async function migrate() {
    console.log("🚀 Starting Database Migration...");

    const localClient = new MongoClient(LOCAL_DB_URI);
    const cloudClient = new MongoClient(CLOUD_DB_URI);

    try {
        await localClient.connect();
        console.log("✅ Connected to LOCAL DB");

        await cloudClient.connect();
        console.log("✅ Connected to CLOUD DB");

        const localDb = localClient.db(); // Gets DB from URI
        const cloudDb = cloudClient.db();

        // 1. Get all collections from local DB
        const collections = await localDb.listCollections().toArray();
        console.log(`📦 Found ${collections.length} collections locally.`);

        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            
            // Skip system collections if any
            if (collectionName.startsWith('system.')) continue;

            console.log(`🔄 Migrating collection: ${collectionName}...`);

            const localCollection = localDb.collection(collectionName);
            const cloudCollection = cloudDb.collection(collectionName);

            // Read all documents
            const documents = await localCollection.find({}).toArray();

            if (documents.length > 0) {
                // Clear existing data in cloud (Optional - usually better to start fresh)
                // await cloudCollection.deleteMany({}); 

                // Insert into cloud
                const result = await cloudCollection.insertMany(documents);
                console.log(`✨ Successfully migrated ${result.insertedCount} documents for '${collectionName}'`);
            } else {
                console.log(`⚠️ Collection '${collectionName}' is EMPTY. Skipping documents.`);
            }
        }

        console.log("\n✅ ALL DATA MIGRATED SUCCESSFULLY!");

    } catch (error) {
        console.error("❌ MIGRATION FAILED:", error.message);
    } finally {
        await localClient.close();
        await cloudClient.close();
        console.log("🔌 Connections closed.");
        process.exit();
    }
}

migrate();
