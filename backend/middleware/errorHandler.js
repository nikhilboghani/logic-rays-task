export function errorHandler(err,req,res,next){
    console.error(err);
    
    const status = err.type === "entity.parse.failed" || err.name === "ValidationError"
        ? 400 : err.status || 500;
    res.status(status).json({
        success:false,
        message: status < 500 ? "Invalid request data" : "Internal Server Error",
    });
}
