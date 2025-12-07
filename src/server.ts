import app from "./app";
import config from "./config";
import initDB from "./config/db";

async function main() {
  try {
    await initDB();
    console.log("🛢  Database Connected successfully");

    app.listen(config.port, () => {
      console.log(`🚀 Application listening on port ${config.port}`);
    });
  } catch (err) {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  }
}

main();

export default app;
