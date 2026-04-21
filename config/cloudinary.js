import cloudinary from 'cloudinary';

const requiredVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingVars = requiredVars.filter(v => !process.env[v] || process.env[v] === 'your_' + v.toLowerCase());

if (missingVars.length > 0) {
    const errorMsg = `Missing Cloudinary environment variables: ${missingVars.join(', ')}. Please add them to your environment settings.`;
    console.error(`[Cloudinary Config] ${errorMsg}`);
    // We don't throw here to avoid crashing the whole server, but we log clearly.
}

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary.v2;
