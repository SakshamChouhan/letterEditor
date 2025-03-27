import { NextApiRequest, NextApiResponse } from 'next';
import { getGoogleDriveFile, updateDocumentInDrive } from '../../../lib/drive';
import { connectToDatabase } from '../../../lib/mongodb';
import File from '../../../models/File';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { fileId } = req.query;

  if (!fileId) {
    return res.status(400).json({ message: 'File ID is required' });
  }

  try {
    // Get access token from the Authorization header
    const accessToken = req.headers.authorization?.split(' ')[1]; // Bearer <token>
    
    if (!accessToken) {
      return res.status(401).json({ message: 'Unauthorized: No access token provided' });
    }

    const { db } = await connectToDatabase();
    const file = await File.findOne({ fileId }).exec();

    if (!file) {
      return res.status(404).json({ message: 'File not found in DB' });
    }

    if (req.method === 'GET') {
      const driveFile = await getGoogleDriveFile(fileId as string, accessToken);

      return res.status(200).json({
        fileName: file.fileName,
        content: driveFile.content, 
      });
    }

    if (req.method === 'POST') {
      const { fileId, content, fileName, email } = req.body;

      if (!content) {
        return res.status(400).json({ message: 'Content is required' });
      }

      // Update Google Drive file using the user's access token
      await updateDocumentInDrive(fileId as string, fileName, content, accessToken, email);


      return res.status(200).json({ message: 'File updated successfully' });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    console.error('Error handling file request:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}
