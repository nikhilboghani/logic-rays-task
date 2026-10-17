import { Router } from "express";
import { getGrid, resetGrid, updateGrid } from "../controllers/gridController.js";



const router = Router();

router.get("/",getGrid);
router.put("/",updateGrid);
router.delete("/",resetGrid);

export default router;