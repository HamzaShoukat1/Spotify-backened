let databaseConnection: Promise<void> | undefined;

const handler = async (request: any, response: any) => {
    if (request.method === "GET" && request.url === "/") {
        response.status(200).send("Backend API running on Vercel!");
        return;
    }

    try {
        const [{ app }, { default: connectDB }] = await Promise.all([
            import("../src/app.js"),
            import("../src/db/db.js"),
        ]);

        databaseConnection ??= connectDB();
        await databaseConnection;
        app(request, response);
    } catch (error) {
        databaseConnection = undefined;
        console.error("Database connection failed:", error);
        response.status(503).json({ message: "Database unavailable" });
    }
};

export default handler;