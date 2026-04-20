import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
// User field removed for guest architecture
        name: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
    },
    { timestamps: true }
);

const productSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        comparePrice: { type: Number, default: 0 },
        category: { type: String, required: true },
        images: [{ public_id: String, url: String }],
        sizes: [{ type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'] }],
        stock: { type: Number, default: 0 },
        isFeatured: { type: Boolean, default: false },
        tags: [String],
        reviews: [reviewSchema],
        rating: { type: Number, default: 0 },
        numReviews: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Auto-calculate rating average
productSchema.methods.updateRating = function () {
    if (this.reviews.length === 0) {
        this.rating = 0;
        this.numReviews = 0;
    } else {
        this.numReviews = this.reviews.length;
        this.rating =
            this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length;
    }
};

const Product = mongoose.model('Product', productSchema);
export default Product;
