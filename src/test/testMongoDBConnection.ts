import { connectDB, getDB } from '../databases/db';

(async () => {
  await connectDB();
  const db = getDB();
  const batches = db.collection('batches');

  const result = await batches.insertOne({ batchId: 'test-1', status: 'pending', documentIds: [] });
  console.log('Batch créé :', result.insertedId);

  const found = await batches.findOne({ batchId: 'test-1' });
  console.log('Batch trouvé :', found);
})();