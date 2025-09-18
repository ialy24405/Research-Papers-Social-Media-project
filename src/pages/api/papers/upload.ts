import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Temporary response - file upload not yet implemented for Vercel
  return res.status(501).json({ 
    error: 'File upload not implemented for Vercel deployment yet. Please use smaller files or contact support.' 
  });
}
