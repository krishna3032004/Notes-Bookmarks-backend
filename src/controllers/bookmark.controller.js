import Bookmark from "../models/Bookmark.js";
import fetchTitleFromURL from "../utils/fetchTitle.js";

// CREATE BOOKMARK
export const createBookmark = async (req, res) => {
  try {
    const { url, title, description, tags } = req.body;

    if (!url) {
      return res.status(400).json({ message: "URL is required" });
    }
    const isValidURL = (url) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };
    if (!isValidURL(url)) {
      return res.status(400).json({ message: "Invalid URL" });
    }

    let finalTitle = title;

    // BONUS: auto-fetch title
    if (!finalTitle) {
      finalTitle = await fetchTitleFromURL(url);
    }

    const bookmark = await Bookmark.create({
      url,
      title: finalTitle,
      description,
      tags,
      user: req.user._id,
    });

    res.status(201).json(bookmark);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL BOOKMARKS (search + tags)
// GET ALL BOOKMARKS (search + pagination)
export const getBookmarks = async (req, res) => {
  try {
    const { q, tags, page = 1, limit = 6 } = req.query;

    let filter = {};

    if (q) {
      filter.$text = { $search: q };
    }

    if (tags) {
      filter.tags = { $in: tags.split(",") };
    }

    const bookmarks = await Bookmark.find({user:req.user._id,...filter,})
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Bookmark.countDocuments(filter);

    res.json({
      data: bookmarks,
      hasMore: page * limit < total,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// GET BY ID
export const getBookmarkById = async (req, res) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id);

    if (!bookmark) {
      return res.status(404).json({ message: "Bookmark not found" });
    }

    res.json(bookmark);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
export const updateBookmark = async (req, res) => {
  try {
    const updated = await Bookmark.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Bookmark not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE
export const deleteBookmark = async (req, res) => {
  try {
    const deleted = await Bookmark.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Bookmark not found" });
    }

    res.json({ message: "Bookmark deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const toggleBookmarkFavorite = async (req, res) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id);

    if (!bookmark) {
      return res.status(404).json({ message: "Bookmark not found" });
    }

    bookmark.favorite = !bookmark.favorite;
    await bookmark.save();

    res.json(bookmark);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
