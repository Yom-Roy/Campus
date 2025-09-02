import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

export async function POST(req) {
    try {
        const body = await req.json();
        const { file, fileName, mimeType } = body;

        if (!file || !mimeType) {
            return NextResponse.json(
                { error: 'Missing file or mimeType' },
                { status: 400 }
            );
        }

        // Convert to data URI
        const dataUri = `data:${mimeType};base64,${file}`;

        // Upload to Cloudinary
        const uploadRes = await cloudinary.uploader.upload(dataUri, {
            folder: 'campus',
            public_id: fileName ? fileName.replace(/\.[^/.]+$/, '') : undefined, // remove extension
            resource_type: 'auto', // supports all file types
            overwrite: true,       // overwrite if file exists with same public_id
        });

        return NextResponse.json(
            { url: uploadRes.secure_url, info: uploadRes },
            { status: 200 }
        );
    } catch (err) {
        console.error('[UPLOAD_ERROR]', err);
        return NextResponse.json(
            { error: 'Upload failed', details: err.message },
            { status: 500 }
        );
    }
}

