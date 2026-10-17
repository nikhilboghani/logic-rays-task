import mongoose from "mongoose";

export async function connectDB() {
    try {
        
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Database connected Successfully")

    } catch (error) {
        console.error("MongoDB Connection Failed",error.message);
        process.exit(1);
    }
}
