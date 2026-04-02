import './config/env.js';
import mongoose from 'mongoose';
import app from "./app.js";
import dns from "dns"
import User from "./models/User.js";

dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"])
dns.setDefaultResultOrder("ipv4first")


const DB = process.env.DATABASE;

mongoose
    .connect(DB)
    .then(async () => {
        console.log('DB connection successful!');
        await initAdmin();
    })
    .catch((err) => {
        console.error('DB connection error:', err);
        // Do not fail hard if script is being run for different purposes, 
        // but for server.js we usually want it to stay alive if possible.
        // process.exit(1);
    });

const initAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            console.log('Admin credentials not found in env, skipping init.');
            return;
        }

        const user = await User.findOne({ email: adminEmail });
        if (!user) {
            console.log(`Creating initial admin account: ${adminEmail}`);
            await User.create({
                firstName: 'Admin',
                lastName: 'Owner',
                email: adminEmail,
                password: adminPassword,
                role: 'admin',
                isVerified: true
            });
        } else if (user.role !== 'admin') {
            user.role = 'admin';
            user.isVerified = true;
            await user.save();
            console.log(`Ensured admin privileges for: ${adminEmail}`);
        }
    } catch (err) {
        console.error('Failed to initialize admin:', err.message);
    }
};

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});



