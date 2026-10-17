import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import Grid from "./models/Grid.js";


const PORT = process.env.PORT || 5000;


async function startServer() {
    await connectDB()
    // Ensure singleton uniqueness before accepting concurrent requests.
    await Grid.init();


    app.listen(PORT,()=>{
        console.log(`server is running on port ${PORT}`);
    })
}


 startServer().catch((error)=>{
    console.error("Server startup failed",error);
    process.exit(1)
 })
