/**
 * 🔁 ATLAS → ATLAS MIGRATION SCRIPT
 * Migrates all data from SproutsOrgs cluster → hilarynishafounder cluster
 * Run with: node migrateAtlasToAtlas.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Source: old SproutsOrgs Atlas cluster
const SOURCE_URI = 'mongodb+srv://SproutsOrgs:SproutsOrgs12345@cluster0.1i9dtge.mongodb.net/sprouts?retryWrites=true&w=majority&appName=Cluster0';

// Destination: new hilarynishafounder Atlas cluster (@ encoded as %40)
const DEST_URI = 'mongodb+srv://hilarynishafounder:Nisha%40123@cluster0.rkhws5w.mongodb.net/sprouts?retryWrites=true&w=majority&appName=Cluster0';

async function migrate() {
  console.log('\n🔁 Starting Atlas → Atlas Migration\n');
  console.log('📤 Source (SproutsOrgs) :', SOURCE_URI.replace(/:([^@]+)@/, ':****@'));
  console.log('📥 Dest (hilarynishafounder):', DEST_URI.replace(/:([^@]+)@/, ':****@'));
  console.log('');

  const sourceConn = await mongoose.createConnection(SOURCE_URI).asPromise();
  console.log('✅ Connected to Source Atlas (SproutsOrgs)');

  const destConn = await mongoose.createConnection(DEST_URI).asPromise();
  console.log('✅ Connected to Destination Atlas (hilarynishafounder)\n');

  const collections = await sourceConn.db.listCollections().toArray();
  console.log(`📦 Found ${collections.length} collections: ${collections.map(c => c.name).join(', ')}\n`);

  let totalMigrated = 0;

  for (const colInfo of collections) {
    const colName = colInfo.name;
    try {
      const sourceDocs = await sourceConn.db.collection(colName).find({}).toArray();

      if (sourceDocs.length === 0) {
        console.log(`⏭️  ${colName}: empty — skipping`);
        continue;
      }

      const destCollection = destConn.db.collection(colName);

      // Check existing in destination to avoid duplicates
      const existingIds = new Set(
        (await destCollection.find({}, { projection: { _id: 1 } }).toArray())
          .map(d => d._id.toString())
      );

      const newDocs = sourceDocs.filter(d => !existingIds.has(d._id.toString()));

      if (newDocs.length === 0) {
        console.log(`✅ ${colName}: all ${sourceDocs.length} docs already in destination — skipping`);
        continue;
      }

      await destCollection.insertMany(newDocs, { ordered: false });
      console.log(`✅ ${colName}: migrated ${newDocs.length} docs (${sourceDocs.length - newDocs.length} already existed)`);
      totalMigrated += newDocs.length;

    } catch (err) {
      console.error(`❌ ${colName}: Error — ${err.message}`);
    }
  }

  await sourceConn.close();
  await destConn.close();

  console.log(`\n🎉 Done! ${totalMigrated} documents migrated to hilarynishafounder cluster.\n`);
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
