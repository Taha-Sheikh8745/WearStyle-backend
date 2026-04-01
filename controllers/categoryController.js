import Category from '../models/Category.js';
import slugify from 'slugify';

// @desc   Get all categories
// @route  GET /api/categories
export const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({})
            .populate('parent', 'name')
            .sort({ order: 1, name: 1 });
        res.json({ success: true, categories });
    } catch (err) { next(err); }
};

// @desc   Create category (Admin)
// @route  POST /api/categories
export const createCategory = async (req, res, next) => {
    try {
        const { name, description, parent, showInNavbar, order } = req.body;
        const slug = slugify(name, { lower: true });

        const category = await Category.create({
            name,
            slug,
            description,
            parent: parent || null,
            showInNavbar: showInNavbar !== undefined ? (showInNavbar === true || showInNavbar === 'true') : true,
            order: order !== undefined ? Number(order) : 0
        });

        res.status(201).json({ success: true, category });
    } catch (err) { next(err); }
};

// @desc   Update category (Admin)
// @route  PUT /api/categories/:id
export const updateCategory = async (req, res, next) => {
    try {
        const updates = {};

        if (name) {
            updates.name = name;
            updates.slug = slugify(name, { lower: true });
        }
        if (description !== undefined) updates.description = description;
        if (parent !== undefined) updates.parent = parent || null;
        if (showInNavbar !== undefined) {
            updates.showInNavbar = showInNavbar === true || showInNavbar === 'true';
        }
        if (order !== undefined) updates.order = Number(order);

        const category = await Category.findByIdAndUpdate(req.params.id, updates, { new: true })
            .populate('parent', 'name');

        if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
        res.json({ success: true, category });
    } catch (err) { next(err); }
};

// @desc   Delete category (Admin)
// @route  DELETE /api/categories/:id
export const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
        res.json({ success: true, message: 'Category deleted.' });
    } catch (err) { next(err); }
};
