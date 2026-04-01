import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import mongoose from 'mongoose';
import app from "./app.js";
import dns from "dns"

dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"])
dns.setDefaultResultOrder("ipv4first")


const DB = process.env.DATABASE;

mongoose
    .connect(DB)
    .then(() => console.log('DB connection successful!'))
    .catch((err) => {
        console.error('DB connection error:', err);
        process.exit(1);
    });

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});



