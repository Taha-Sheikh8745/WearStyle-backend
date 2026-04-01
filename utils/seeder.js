import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import connectDB from '../config/db.js';

dotenv.config();
connectDB();

const categories = [
    { name: 'Unstitched', slug: 'unstitched', description: 'Premium unstitched fabric collections' },
    { name: 'Pret', slug: 'pret', description: 'Ready-to-wear luxury pret' },
    { name: 'Bridal Formals', slug: 'bridal-formals', description: 'Bridal and formal collections' },
    { name: 'Lawn', slug: 'lawn', description: 'Lawn summer collections' },
];

const seedDB = async () => {
    try {
        // Clear existing data
        await User.deleteMany();
        await Category.deleteMany();
        await Product.deleteMany();

        // Create admin user
        const admin = await User.create({
            firstName: 'System',
            lastName: 'Admin',
            email: 'admin@noorluxe.com',
            password: 'admin123456',
            role: 'admin',
        });
        console.log('Admin user created:', admin.email);

        // Create a demo user
        await User.create({
            firstName: 'Demo',
            lastName: 'User',
            email: 'user@noorluxe.com',
            password: 'user123456',
            role: 'user',
        });

        // Create categories
        const createdCategories = await Category.insertMany(categories);
        console.log('Categories seeded:', createdCategories.length);

        const unstitched = createdCategories.find(c => c.slug === 'unstitched');

        // Create sample products
        await Product.insertMany([
            {
                title: 'Noor Chikankari Luxury Set',
                description: 'Exquisitely crafted 3-piece chikankari set with intricate embroidery. Features a fully embroidered shirt, printed dupatta, and dyed trouser.',
                price: 189,
                comparePrice: 250,
                category: unstitched._id,
                sizes: ['S', 'M', 'L', 'XL'],
                stock: 30,
                isFeatured: true,
                images: [{ public_id: 'sample1', url: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800' }],
            },
            {
                title: 'Jasmine Embroidered Lawn',
                description: 'Pure lawn fabric with delicate floral embroidery and a premium finish. Perfect for summer luxury.',
                price: 95,
                comparePrice: 130,
                category: unstitched._id,
                sizes: ['S', 'M', 'L', 'XL', 'XXL'],
                stock: 50,
                isFeatured: true,
                images: [{ public_id: 'sample2', url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800' }],
            },
            {
                title: 'Rose Pret Kurta',
                description: 'Elegant ready-to-wear kurta with delicate prints and modern silhouette.',
                price: 75,
                category: createdCategories.find(c => c.slug === 'pret')._id,
                sizes: ['XS', 'S', 'M', 'L'],
                stock: 20,
                images: [{ public_id: 'sample3', url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800' }],
            },
            {
                title: 'Zari Bridal Formal',
                description: 'Heavy embroidered bridal formal with intricate zari work and mirror details.',
                price: 320,
                comparePrice: 420,
                category: createdCategories.find(c => c.slug === 'bridal-formals')._id,
                sizes: ['S', 'M', 'L'],
                stock: 10,
                isFeatured: true,
                images: [{ public_id: 'sample4', url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800' }],
            }
        ]);

        console.log('Sample products seeded.');
        console.log('\n--- Seed Complete ---');
        console.log('Admin: admin@noorluxe.com / admin123456');
        console.log('User: user@noorluxe.com / user123456');
        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err.message);
        process.exit(1);
    }
};

seedDB();
