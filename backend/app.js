import express from "express";
import gridRoutes from "./routes/gridRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import cors from "cors";
const app = express();

app.use(
    cors({
        origin: [process.env.FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"],
        credentials: true
    })
);

app.use(express.json());

app.get("/api/health", (req,res)=>{
    res.json({
        success:true,
        message : "API is Working",
    })
})


app.use("/api/grid",gridRoutes);

app.use(errorHandler);


export default app;