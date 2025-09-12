export interface User {
  id: string;
  name: string;
  email: string;
  college: string;
  country: string;
  birthDate: string;
  role: 'user' | 'admin';
  avatarUrl: string;
  ssn: string;
}

export interface Paper {
  id: string;
  name: string;
  description: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  pdfUrl: string;
  categoryId: string;
  status: 'approved' | 'pending' | 'rejected';
  rejectionReason?: string;
  approvedBy?: string; // adminId
  createdAt: string;
  summary: string;
  interactions: {
    reactions: number;
    comments: number;
    saves: number;
    shares: number;
  };
}

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  imageHint: string;
}
