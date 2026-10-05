import { app } from "./app.js";
import connectDB from "./db/db.js";


const startServer = async (): Promise<void> => {

    try {
        await connectDB()

        const PORT: number = Number(process.env.PORT) || 9000
        const server = app.listen(PORT, () => {

            console.log(`server is running on port, ${PORT}`)
        })
        server.on("error", (error: Error) => {
            console.error("server error", error)
            process.exit(1)

        });

    } catch (error) {
        console.error(" Failed to start server:", error);
        process.exit(1);

    }
}


startServer()