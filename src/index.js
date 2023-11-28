import dotenv from 'dotenv';
import ConnetDB from "./db/db.js";
import app from './app.js';

dotenv.config({
    path: './.env'
});

ConnetDB()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log(`Server is running at port: ${process.env.PORT || 3000}`);
        });
    })
    .catch((err) => {
        console.log("MongoDB connection failed!!", err);
    });