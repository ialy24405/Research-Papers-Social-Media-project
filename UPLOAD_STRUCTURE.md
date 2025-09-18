# PDF Upload Structure

## Overview
The PDF upload system has been reorganized to create a clean, organized folder structure for each paper.

## File Organization

### Directory Structure
```
uploads/
├── temp/                          # Temporary storage during upload
│   └── temp-paper-*.pdf          # Files being processed
└── paper-{id}/                   # One folder per paper
    └── {sanitized-title}.pdf     # Final PDF file
```

### Example
For a paper with ID 123 and title "The Future of AI Research":
```
uploads/
└── paper-123/
    └── The-Future-of-AI-Research.pdf
```

## Implementation Details

### Upload Process
1. **Temporary Storage**: Files are first uploaded to `uploads/temp/` with a temporary filename
2. **Database Creation**: Paper record is created in the database to get a paper ID
3. **File Organization**: File is moved from temp to `uploads/paper-{id}/` and renamed with sanitized title
4. **Database Update**: Paper record is updated with the final PDF path

### File Naming
- **Sanitization**: Special characters are removed, spaces become hyphens
- **Length Limit**: Filenames are truncated to 100 characters if needed
- **Extension**: Always preserved as `.pdf`

### Benefits
- **Organization**: Each paper has its own dedicated folder
- **Clarity**: Filenames reflect the actual paper title
- **Scalability**: Easy to find and manage files
- **Future-proofing**: Room for additional paper-related files (thumbnails, versions, etc.)

## Technical Changes

### Frontend Changes
- Updated `src/lib/api/paper.service.ts` to use FormData for actual file upload
- Changed endpoint from Next.js API route to server endpoint
- Proper multipart/form-data handling

### Backend Changes
- Modified multer configuration for temporary storage
- Added file organization logic after paper creation
- Created organized folder structure with sanitized filenames
- Added `updatePdfUrl` method to PaperModel

### Directory Initialization
- Automatic creation of upload directories on server startup
- Ensures `uploads/` and `uploads/temp/` exist

## Error Handling
- If file organization fails, paper is still saved with temporary path
- Cleanup of temporary files on upload errors
- Proper validation of file types and categories