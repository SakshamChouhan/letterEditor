import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/mongodb';
import File from '../../models/File';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session?.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { db } = await connectToDatabase();
    const files = await File.find({ userEmail: session.user.email }).exec(); // Fetch files for the logged-in user

    res.status(200).json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ message: 'Error fetching files' });
  }
}
