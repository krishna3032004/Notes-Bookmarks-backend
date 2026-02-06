import express from "express";
import {
  createBookmark,
  getBookmarks,
  getBookmarkById,
  updateBookmark,
  deleteBookmark,
  toggleBookmarkFavorite ,
  fetchMetadata,
} from "../controllers/bookmark.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/fetch-metadata", fetchMetadata);
router.post("/", createBookmark);
router.get("/", getBookmarks);
router.get("/:id", getBookmarkById);
router.put("/:id", updateBookmark);
router.delete("/:id", deleteBookmark);
router.patch("/:id/favorite", toggleBookmarkFavorite);


export default router;
