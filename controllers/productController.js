import Product from '../models/Product.js';
import cloudinary from '../config/cloudinary.js';
import mongoose from 'mongoose';

// @desc   Get all products (with filters, search, pagination)
// @route  GET /api/products
export const getProducts = async (req, res, next) => {
    try {
        const { keyword, category, minPrice, maxPrice, size, page = 1, limit = 12, sort } = req.query;
        const query = {};
        if (keyword) query.title = { $regex: keyword, $options: 'i' };

        if (category) {
            query.category = category;
        }
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (size) query.sizes = size;

        const sortOptions = {
            newest: { createdAt: -1 },
            'price-asc': { price: 1 },
            'price-desc': { price: -1 },
            rating: { rating: -1 },
        };
        const sortBy = sortOptions[sort] || { createdAt: -1 };

        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .sort(sortBy)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.json({
            success: true,
            products,
            page: Number(page),
            pages: Math.ceil(total / limit),
            total,
        });
    } catch (err) { next(err); }
};

// @desc   Get single product by ID
// @route  GET /api/products/:id
export const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('reviews.user', 'name avatar');
        if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
        res.json({ success: true, product });
    } catch (err) { next(err); }
};

// @desc   Create product (Admin)
// @route  POST /api/products
export const createProduct = async (req, res, next) => {
    try {
        console.log('[createProduct] Body:', req.body);
        console.log('[createProduct] Files:', req.files?.map(f => f.originalname));

        const { title, description, price, comparePrice, category, sizes, stock, isFeatured, tags } = req.body;

        if (!title || !description || !price || !category) {
            return res.status(400).json({ success: false, message: 'Title, description, price, and category are required.' });
        }

        const images = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const result = await cloudinary.uploader.upload(file.path, {
                        folder: 'noorluxe/products',
                        resource_type: 'image',
                    });
                    images.push({ public_id: result.public_id, url: result.secure_url });
                } catch (cloudErr) {
                    console.error('[createProduct] Cloudinary upload error:', cloudErr.message);
                    return res.status(500).json({ success: false, message: `Image upload failed: ${cloudErr.message}` });
                }
            }
        }

        const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : (sizes || []);
        const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : (tags || []);

        const product = await Product.create({
            title, description, price, comparePrice, category,
            sizes: parsedSizes,
            tags: parsedTags,
            stock, isFeatured, images,
        });

        console.log('[createProduct] Product created:', product._id);
        res.status(201).json({ success: true, product });
    } catch (err) {
        console.error('[createProduct] Error:', err.message, err.stack);
        next(err);
    }
};


// @desc   Update product (Admin)
// @route  PUT /api/products/:id
export const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
        const updates = req.body;
        if (updates.sizes && typeof updates.sizes === 'string') updates.sizes = JSON.parse(updates.sizes);
        if (updates.tags && typeof updates.tags === 'string') updates.tags = JSON.parse(updates.tags);
        if (req.files && req.files.length > 0) {
            const newImages = [];
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, { folder: 'noorluxe/products' });
                newImages.push({ public_id: result.public_id, url: result.secure_url });
            }
            updates.images = [...(product.images || []), ...newImages];
        }
        Object.assign(product, updates);
        await product.save();
        res.json({ success: true, product });
    } catch (err) { next(err); }
};

// @desc   Delete product (Admin)
// @route  DELETE /api/products/:id
export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
        for (const img of product.images) {
            await cloudinary.uploader.destroy(img.public_id);
        }
        await product.deleteOne();
        res.json({ success: true, message: 'Product deleted.' });
    } catch (err) { next(err); }
};

// @desc   Add product review
// @route  POST /api/products/:id/reviews
export const addReview = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
        const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );
        if (alreadyReviewed) {
            return res.status(400).json({ success: false, message: 'You already reviewed this product.' });
        }
        product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
        product.updateRating();
        await product.save();
        res.status(201).json({ success: true, message: 'Review added.' });
    } catch (err) { next(err); }
};
