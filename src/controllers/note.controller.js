import Note from "../models/Note.js";
// CREATE NOTE
export const createNote = async (req, res) => {
    try {
        const { title, content, tags } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required" });
        }

        const note = await Note.create({
            title,
            content,
            tags,
            user: req.user._id,
        });

        res.status(201).json(note);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET ALL NOTES (search + tags)
export const getNotes = async (req, res) => {
    try {
        const { q, tags, page = 1, limit = 10 } = req.query;
        console.log(q)
        console.log(tags)

        let filter = {};

        if (q) {
            filter = { $text: { $search: q } };
        }

        if (tags) {
            filter.tags = { $in: tags.split(",") };
        }

        const skip = (page - 1) * limit;

        const notes = await Note.find({user:req.user._id,...filter})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Note.countDocuments(filter);

        res.json({
            data: notes,
            hasMore: page * limit < total,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// GET NOTE BY ID
export const getNoteById = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        res.json(note);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// UPDATE NOTE
export const updateNote = async (req, res) => {
    try {
        const updated = await Note.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Note not found" });
        }

        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE NOTE
export const deleteNote = async (req, res) => {
    try {
        const deleted = await Note.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: "Note not found" });
        }

        res.json({ message: "Note deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



export const toggleNoteFavorite = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        note.favorite = !note.favorite; // ⭐ toggle
        await note.save();

        res.json(note);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};