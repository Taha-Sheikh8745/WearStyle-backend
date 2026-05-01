import Order from '../models/Order.js';
import Product from '../models/Product.js';
import sendEmail from '../utils/sendEmail.js';
// import User from '../models/User.js';
import mongoose from 'mongoose';

// @desc   Create new order
// @route  POST /api/orders
export const createOrder = async (req, res, next) => {
    try {
        const { items, shippingAddress, paymentMethod } = req.body;
        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'No order items.' });
        }

        // Validate that all items contain valid Mongoose ObjectIds
        for (const item of items) {
            if (!mongoose.Types.ObjectId.isValid(item.product)) {
                return res.status(400).json({ success: false, message: 'Invalid product ID detected in your cart. This could be leftover from an old session. Please clear your cart and try again.' });
            }
        }

        const itemsPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const shippingPrice = 350;
        const taxPrice = parseFloat((0.05 * itemsPrice).toFixed(2));
        const totalPrice = itemsPrice + shippingPrice + taxPrice;

        const order = await Order.create({
            items,
            shippingAddress,
            paymentMethod: paymentMethod || 'cod',
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice,
        });

        // Send Order Confirmation Email
        try {
            const formattedPaymentMethod = (paymentMethod || 'cod').toUpperCase();
            const emailItems = items.map(item => `- ${item.title} (x${item.quantity}) - Rs. ${item.price}`).join('\n');
            const message = `
Hello ${shippingAddress.name || 'Valued Customer'},

Thank you for your order at WearStylewithImtisall! Your order has been successfully placed and is being processed.

---
Order ID: ${order.orderId || order._id}
Total Amount: Rs. ${totalPrice.toFixed(2)}
Payment Method: ${formattedPaymentMethod}

Items Ordered:
${emailItems}

Shipping To:
${shippingAddress.street || 'N/A'}, ${shippingAddress.city || 'N/A'}, ${shippingAddress.state || ''} ${shippingAddress.zipCode || ''}, ${shippingAddress.country || 'Pakistan'}
---

We will notify you once your order is shipped.

Best regards,
The WearStyle Team
`;
            await sendEmail({
                email: shippingAddress.email,
                subject: `Order Confirmation - ${order.orderId || order._id}`,
                message: message
            });

            // Send Alert to Admin
            try {
                await sendEmail({
                    email: 'Wearstylewithimtisall@gmail.com',
                    subject: `New Order Placed - ${order.orderId || order._id}`,
                    message: `A new order has been placed on the website.\n\nCustomer: ${shippingAddress.name}\nEmail: ${shippingAddress.email}\nPhone: ${shippingAddress.phone || 'N/A'}\n\n--- Order Details ---\nOrder ID: ${order.orderId || order._id}\nTotal Amount: Rs. ${totalPrice.toFixed(2)}\nPayment Method: ${formattedPaymentMethod}\n\nItems Ordered:\n${emailItems}\n\nShipping To:\n${shippingAddress.street || 'N/A'}, ${shippingAddress.city || 'N/A'}, ${shippingAddress.state || ''} ${shippingAddress.zipCode || ''}, ${shippingAddress.country || 'Pakistan'}`
                });
            } catch (adminErr) {
                console.warn('[Email Warning]: Could not send admin order alert email via SMTP.');
            }
        } catch (emailErr) {
            console.warn('[Email Warning]: Could not send confirmation email via SMTP. It has been logged to backend/logs/email_failures.log.');
        }

        res.status(201).json({ success: true, order });
    } catch (err) { 
        console.error('[Order Error]: Failed to create order:', {
            error: err.message,
            stack: err.stack,
            body: req.body
        });
        next(err); 
    }
};

// @desc   Get order by ID
// @route  GET /api/orders/:id
export const getOrderById = async (req, res, next) => {
    try {
        // user population removed
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
        res.json({ success: true, order });
    } catch (err) { next(err); }
};

// @desc   Update order status (Admin)
// @route  PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
        order.orderStatus = req.body.orderStatus || order.orderStatus;
        if (req.body.orderStatus === 'Delivered') order.deliveredAt = Date.now();
        await order.save();
        res.json({ success: true, order });
    } catch (err) { next(err); }
};

// @desc   Get all orders (Admin)
// @route  GET /api/orders
export const getAllOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const query = status ? { orderStatus: status } : {};
        const total = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        res.json({ success: true, orders, total, pages: Math.ceil(total / limit) });
    } catch (err) { next(err); }
};

// @desc   Get sales analytics (Admin)
// @route  GET /api/orders/analytics
export const getAnalytics = async (req, res, next) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalRevenueResult = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } },
        ]);
        const totalRevenue = totalRevenueResult[0]?.total || 0;

        const monthlySales = await Order.aggregate([
            {
                $group: {
                    _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
                    revenue: { $sum: '$totalPrice' },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 12 },
        ]);

        res.json({ success: true, totalOrders, totalRevenue, monthlySales });
    } catch (err) { next(err); }
};
