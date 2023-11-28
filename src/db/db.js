import mongoose from "mongoose";
import { DB_NAME } from "../constans.js";

const ConnetDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`\n MONGODB CONNECTED !!! :-) DB_HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB CONNECTION FAILED: ", error);
        process.exit(1);
    }
};

export default ConnetDB;