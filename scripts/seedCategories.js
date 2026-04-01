import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';
import connectDB from '../config/db.js';

dotenv.config({ path: './.env' });

const categories = [
    { name: 'New Arrivals', slug: 'new-arrivals' },
    { name: 'Luxury Eid', slug: 'luxury-eid' },
    { name: 'Eid Premium', slug: 'eid-premium' },
    { name: 'Eid Festival', slug: 'eid-festival' },
    { name: 'Wedding Festival', slug: 'wedding-festival' },
    { name: 'Pret', slug: 'pret' },
];

const subCategories = [
    { name: 'Casual Lawn', slug: 'casual-lawn', parent: 'pret' },
    { name: 'Casual Cotton', slug: 'casual-cotton', parent: 'pret' },
    { name: 'Fancy', slug: 'fancy', parent: 'pret' },
];

const seedCategories = async () => {
    try {
        await connectDB();

        // Clear existing categories (optional, but good for a fresh start with requested ones)
        // await Category.deleteMany();
        // console.log('Cleared existing categories.');

        for (const cat of categories) {
            await Category.findOneAndUpdate(
                { slug: cat.slug },
                cat,
                { upsert: true, new: true }
            );
            console.log(`Upserted category: ${cat.name}`);
        }

        const pretCategory = await Category.findOne({ slug: 'pret' });

        for (const sub of subCategories) {
            await Category.findOneAndUpdate(
                { slug: sub.slug },
                { ...sub, parent: pretCategory._id },
                { upsert: true, new: true }
            );
            console.log(`Upserted sub-category: ${sub.name}`);
        }

        console.log('Categories seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding categories:', error);
        process.exit(1);
    }
};

seedCategories();
