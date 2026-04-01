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
}, { timestamps: true, strict: false });

const Category = mongoose.model('Category', CategorySchema);

async function patchPretChildren() {
    try {
        await mongoose.connect(process.env.DATABASE);
        console.log('Connected to MongoDB');

        // Find Pret
        const pret = await Category.findOne({ name: 'Pret' });
        if (!pret) {
            console.log('Pret category not found.');
            return;
        }

        // Patch children to show in navbar and have sequence
        const updates = [
            { name: 'Casual Lawn', order: 1 },
            { name: 'Casual Cotton', order: 2 },
            { name: 'Fancy', order: 3 }
        ];

        for (const up of updates) {
            const result = await Category.updateOne(
                { name: up.name, parent: pret._id },
                { $set: { showInNavbar: true, order: up.order } }
            );
            console.log(`Updated ${up.name}: ${result.modifiedCount} matches.`);
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

patchPretChildren();
