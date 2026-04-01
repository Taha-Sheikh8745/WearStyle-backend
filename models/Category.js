import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true },
        description: { type: String, default: '' },
        image: { public_id: String, url: String },
        parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
        showInNavbar: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const Category = mongoose.model('Category', categorySchema);
export default Category;
