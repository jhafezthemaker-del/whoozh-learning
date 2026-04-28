import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads directory
    // In production (like Vercel), this won't persist across deployments. 
    // You should use AWS S3 or Vercel Blob for a real production app.
    const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    try {
      await import('fs/promises').then(fs => fs.mkdir(uploadDir, { recursive: true }));
    } catch (e) {
      // Ignore if directory already exists
    }

    const path = join(uploadDir, uniqueName);
    
    // Attempt to save file
    await writeFile(path, buffer);
    
    // Return the URL path
    const url = `/uploads/${uniqueName}`;
    
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
