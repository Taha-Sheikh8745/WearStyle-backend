import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    title: String,
    image: String,
    price: Number,
    selectedSize: String,
    quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
    {
        orderId: { type: String, unique: true },
// User field removed as per guest-only checkout architecture
        items: [orderItemSchema],
        shippingAddress: {
            name: { type: String, required: true },
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: String,
            zipCode: { type: String, required: true },
            country: { type: String, required: true },
            phone: String,
            email: { type: String, required: true },
        },
        paymentMethod: { type: String, enum: ['stripe', 'paypal', 'cod', 'easypaisa', 'jazzcash'], default: 'cod' },
        paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
        paymentResult: { id: String, status: String, updateTime: String, email: String },
        itemsPrice: { type: Number, required: true },
        shippingPrice: { type: Number, required: true, default: 0 },
        taxPrice: { type: Number, required: true, default: 0 },
        totalPrice: { type: Number, required: true },
        orderStatus: {
            type: String,
            enum: ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
            default: 'Processing',
        },
        deliveredAt: Date,
    },
    { timestamps: true }
);

orderSchema.pre('save', async function () {
    if (!this.orderId) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        this.orderId = `WSI-${result}`;
    }
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
