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
}, { timestamps: true, strict: false }); // Disable strict to ensure it saves

const Category = mongoose.model('Category', CategorySchema);

async function patchCategories() {
    try {
        await mongoose.connect(process.env.DATABASE);
        console.log('Connected to MongoDB');

        // Let's set some defaults for everything just to get the Navbar working
        const result = await Category.updateMany(
            { name: { $in: ['New Arrivals', 'Luxury Eid', 'Pret', 'Lawn', 'Garmi ke kapray'] } },
            { $set: { showInNavbar: true, order: 1 } }
        );

        console.log(`Matched ${result.matchedCount} and updated ${result.modifiedCount} categories.`);

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

patchCategories();
