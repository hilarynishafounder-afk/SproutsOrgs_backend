/**
 * 🚀 LOCAL → ATLAS MIGRATION SCRIPT
 * Copies all collections from Local MongoDB to MongoDB Atlas
 * Run with: node migrateToAtlas.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const LOCAL_URI  = 'mongodb://127.0.0.1:27017/sprouts';
const ATLAS_URI  = process.env.MONGODB_URI;

if (!ATLAS_URI) {
  console.error('❌ MONGODB_URI not found in .env');
  process.exit(1);
}

async function migrate() {
  console.log('\n🚀 Starting Local → Atlas Migration\n');
  console.log('📍 Local  :', LOCAL_URI);
  console.log('☁️  Atlas  :', ATLAS_URI.replace(/:([^@]+)@/, ':****@'));
  console.log('');

  // Create two separate connections
  const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
  console.log('✅ Connected to Local MongoDB');

  const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
  console.log('✅ Connected to MongoDB Atlas\n');

  // Get all collections from local
  const collections = await localConn.db.listCollections().toArray();
  console.log(`📦 Found ${collections.length} collections: ${collections.map(c => c.name).join(', ')}\n`);

  let totalMigrated = 0;

  for (const colInfo of collections) {
    const colName = colInfo.name;

    try {
      // Fetch all docs from local
      const localDocs = await localConn.db.collection(colName).find({}).toArray();

      if (localDocs.length === 0) {
        console.log(`⏭️  ${colName}: empty — skipping`);
        continue;
      }

      const atlasCollection = atlasConn.db.collection(colName);

      // Check existing docs in Atlas to avoid duplicates
      const existingIds = new Set(
        (await atlasCollection.find({}, { projection: { _id: 1 } }).toArray())
          .map(d => d._id.toString())
      );

      // Only insert docs that don't exist in Atlas
      const newDocs = localDocs.filter(d => !existingIds.has(d._id.toString()));

      if (newDocs.length === 0) {
        console.log(`✅ ${colName}: all ${localDocs.length} docs already in Atlas — skipping`);
        continue;
      }

      await atlasCollection.insertMany(newDocs, { ordered: false });
      console.log(`✅ ${colName}: migrated ${newDocs.length} new docs (${localDocs.length - newDocs.length} already existed)`);
      totalMigrated += newDocs.length;

    } catch (err) {
      console.error(`❌ ${colName}: Error — ${err.message}`);
    }
  }

  await localConn.close();
  await atlasConn.close();

  console.log(`\n🎉 Migration complete! ${totalMigrated} new documents migrated to Atlas.\n`);
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
