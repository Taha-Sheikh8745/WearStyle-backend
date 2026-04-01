import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const CategorySchema = new mongoose.Schema({
    name: String,
    showInNavbar: Boolean,
    parent: mongoose.Schema.Types.ObjectId,
    order: Number
});

const Category = mongoose.model('Category', CategorySchema);

async function checkCategories() {
    try {
        await mongoose.connect(process.env.DATABASE);
        console.log('Connected to MongoDB');

        const categories = await Category.find({}).sort({ createdAt: -1 }).lean();
        console.log('--- All Categories in DB (Raw) ---');
        console.log(JSON.stringify(categories, null, 2));

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkCategories();
