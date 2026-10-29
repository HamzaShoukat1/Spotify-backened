import { app } from "./app.js";
import connectDB from "./db/db.js";
const startServer = async () => {
    try {
        await connectDB();
        const PORT = Number(process.env.PORT) || 9000;
        const server = app.listen(PORT, () => {
            console.log(`server is running on port, ${PORT}`);
        });
        server.on("error", (error) => {
            console.error("server error", error);
            process.exit(1);
        });
    }
    catch (error) {
        console.error(" Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map