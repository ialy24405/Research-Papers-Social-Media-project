# Supabase Storage Setup for PDF Uploads

## 🎯 Benefits of Using Supabase Storage

- ✅ **No file system limitations** on Vercel
- ✅ **Direct public URLs** for PDFs (no custom serving needed)
- ✅ **Organized folder structure** (`papers/paper-{id}/filename.pdf`)
- ✅ **Scalable storage** with built-in CDN
- ✅ **Automatic file optimization** and caching

## 📋 Setup Steps

### 1. Create Storage Bucket in Supabase

1. Go to your Supabase dashboard
2. Navigate to **Storage** → **Buckets**
3. Click **"Create Bucket"**
4. Name: `papers`
5. Set **Public bucket**: `ON` (so PDFs can be accessed via direct URLs)
6. Click **"Create Bucket"**

### 2. Set Bucket Policies (Optional for Security)

If you want to restrict uploads to authenticated users:

```sql
-- Allow authenticated users to upload to their paper folders
INSERT INTO storage.policies (name, bucket_id, definition)
VALUES (
  'Users can upload papers',
  'papers',
  'auth.uid()::text = (storage.foldername(name))[1]'
);

-- Allow public access to read all papers
INSERT INTO storage.policies (name, bucket_id, definition)
VALUES (
  'Public can read papers',
  'papers',
  'true'
);
```

### 3. Add Environment Variables

Add these to your **Vercel Dashboard** → **Settings** → **Environment Variables**:

| Variable                        | Value                       | Where to Find                                            |
| ------------------------------- | --------------------------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://xxxxx.supabase.co` | Project Settings → API → Project URL                     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...`                | Project Settings → API → Project API keys → anon/public  |
| `SUPABASE_SERVICE_ROLE_KEY`     | `eyJhbGc...`                | Project Settings → API → Project API keys → service_role |

### 4. Test the Upload

1. Deploy your changes to Vercel
2. Try uploading a PDF
3. Check your Supabase Storage dashboard to see the uploaded file
4. The PDF should be accessible at: `https://xxxxx.supabase.co/storage/v1/object/public/papers/paper-{id}/{filename}.pdf`

## 📁 File Organization

Files will be organized as:

```
papers/
├── paper-1/
│   └── my-research-paper-1726123456.pdf
├── paper-2/
│   └── another-paper-1726123789.pdf
└── paper-3/
    └── data-analysis-1726124000.pdf
```

## 🔧 How It Works

1. **Upload**: User uploads PDF → API processes → Uploads to Supabase Storage
2. **Storage**: Files stored in organized folders by paper ID
3. **Access**: PDFs accessible via direct public URLs
4. **Database**: Only stores the public URL, not the file content

## 🚨 Important Notes

- **File Size Limit**: Currently set to 5MB (adjustable)
- **File Types**: Only PDF files allowed
- **Naming**: Filenames are sanitized and timestamped to avoid conflicts
- **Cleanup**: Temporary files are automatically cleaned up after upload

## 🎉 Result

After setup, your paper uploads will:

- ✅ Work seamlessly on Vercel
- ✅ Store files in Supabase Storage
- ✅ Generate direct public URLs for PDFs
- ✅ Organize files by paper ID
- ✅ Handle the folder structure you requested: `/uploads/paper-{id}/{title}.pdf`
