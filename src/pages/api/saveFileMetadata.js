import { connectToDatabase } from '../../lib/mongodb';

const saveFileMetadata = async (req, res) => {
  if (req.method === 'POST') {
    const { fileId, fileName, userEmail } = req.body;

    // Validate incoming data
    if (!fileId || !fileName || !userEmail) {
      return res.status(400).json({ error: 'Missing file data' });
    }

    try {
      // Connect to MongoDB
      const { db } = await connectToDatabase();
      console.log("Database connected successfully");

      // Create new file record
      const newFile = {
        userEmail,
        fileId,
        fileName,
        createdAt: new Date(),
      };

      // Save the file metadata
      const result = await db.collection('files').insertOne(newFile);
      console.log("File metadata saved to MongoDB:", result);

      return res.status(200).json({ message: 'File metadata saved successfully' });
    } catch (error) {
      console.error('Error saving file metadata:', error);
      return res.status(500).json({ error: 'Failed to save file metadata', details: error.message });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
};

export default saveFileMetadata;
