import { connectToDatabase } from '../../lib/mongodb';

const updateFileMetadata = async (req, res) => {
  if (req.method === 'POST') {
    const { fileId, newFileName, userEmail } = req.body;


    // Validate incoming data
    if (!fileId || !newFileName || !userEmail) {
      return res.status(400).json({ error: 'Missing file data' });
    }

    try {
      // Connect to MongoDB
      const { db } = await connectToDatabase();


      // Check if the file exists in MongoDB
      const existingFile = await db.collection('files').findOne({ fileId });

      if (!existingFile) {
        return res.status(404).json({ error: 'File not found in MongoDB' });
      }

      // Update the file metadata in MongoDB
      const result = await db.collection('files').updateOne(
        { fileId: fileId },
        { $set: { fileName: newFileName } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'File not found for update' });
      }

      return res.status(200).json({ message: 'File metadata updated successfully' });
    } catch (error) {
      console.error('Error updating file metadata:', error);
      return res.status(500).json({ error: 'Failed to update file metadata', details: error.message });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
};

export default updateFileMetadata;
