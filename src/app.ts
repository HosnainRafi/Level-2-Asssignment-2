import cors from "cors";
import express, { Application, Request, Response } from "express";
import globalErrorHandler from "./middleware/globalErrorHandler";
import router from "./routes";

const app: Application = express();

app.use(express.json());
app.use(cors());

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello Next Level Developers!");
});

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    errorMessages: [
      {
        path: req.path,
        message: "API Not Found",
      },
    ],
  });
});

app.use(globalErrorHandler);

export default app;
