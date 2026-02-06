import express from "express";
import cors from "cors";
import noteRoutes from "./routes/note.routes.js";
import bookmarkRoutes from "./routes/bookmark.routes.js";
import errorHandler from "./middlewares/error.middleware.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(errorHandler);

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/bookmarks", bookmarkRoutes);

app.get("/", (req, res) => {
  res.send("API running...");
});

export default app;
