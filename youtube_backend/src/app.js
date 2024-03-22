import express from "express";
import dotenv from "dotenv";

dotenv.config();
export const app = express();

import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

//packages
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PUT"],
  })
);

//routes
import userRouters from "./routes/user.routes.js";
import videoRouters from "./routes/video.routes.js";
import commentRouters from "./routes/comment.routes.js";
import tweetRouters from "./routes/tweet.routes.js";
import playlistRouters from "./routes/playlist.routes.js";
import likeRouters from "./routes/like.routes.js";

app.use("/api/users", userRouters);
app.use("/api/videos", videoRouters);
app.use("/api/comments", commentRouters);
app.use("/api/tweets", tweetRouters);
app.use("/api/playlists", playlistRouters);
app.use("/api/likes", likeRouters);

//test route
app.get("/", (req, res) => {
  res.send("Hello World");
});

//custom error handlers
import { handleError, notFound } from "./middlewares/errorHandler.js";
app.use(notFound);
app.use(handleError);
