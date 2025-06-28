const Blog = require("../model/blogModel");
const cloudinary = require("../middlewares/cloudinaryConfig");
const ApiError = require("../utils/apiError");

// create Blog
exports.createBlog = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    let imageUrls = [];

    // الصور اختيارية
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              { folder: "Blog Images", resource_type: "image" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              }
            )
            .end(file.buffer);
        });
      });

      imageUrls = await Promise.all(uploadPromises);
    }

    // Create blog
    const blog = await Blog.create({
      title,
      content,
      images: imageUrls,
      author: req.user._id,
    });

    res.status(201).json({
      message: "Blog created successfully",
      data: blog,
    });
  } catch (err) {
    console.error("Blog creation error:", err);
    next(new ApiError("Failed to create blog", 500));
  }
};

// updat blog
exports.updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    // 1️⃣ جيب الـ blog
    const blog = await Blog.findById(id);
    if (!blog) {
      return next(new ApiError("Blog not found", 404));
    }

    // 2️⃣ الصور الجديدة
    let imageUrls = blog.images; // default: الصور القديمة

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              { folder: "Blog Images", resource_type: "image" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              }
            )
            .end(file.buffer);
        });
      });

      imageUrls = await Promise.all(uploadPromises);
    }

    // 3️⃣ نحدّث الحقول
    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.images = imageUrls;

    await blog.save();

    res.status(200).json({
      message: "Blog updated successfully",
      data: blog,
    });
  } catch (err) {
    console.error("Blog update error:", err);
    next(new ApiError("Failed to update blog", 500));
  }
};

// get all blog with search and pagination
///blogs?page=2&limit=5
//blogs?search=summer
///blogs?search=summer&page=2&limit=5
exports.getAllBlogs = async (req, res, next) => {
  try {
    // Search by title (optional)
    const searchQuery = req.query.search
      ? { title: { $regex: req.query.search, $options: "i" } }
      : {};

    // Pagination params
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Query blogs
    const blogs = await Blog.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "firstName lastName") // Populate author names
      .populate("comments.user", "firstName lastName"); // Populate comment users if needed

    // Count total
    const totalBlogs = await Blog.countDocuments(searchQuery);

    res.status(200).json({
      status: "success",
      results: blogs.length,
      page,
      totalPages: Math.ceil(totalBlogs / limit),
      data: blogs,
    });
  } catch (err) {
    console.error("Get blogs error:", err);
    next(new ApiError("Failed to get blogs", 500));
  }
};

exports.getBlogById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // get blog
    const blog = await Blog.findById(id).populate(
      "author",
      "firstName lastName email"
    );
    if (!blog) {
      return next(new ApiError("Blog not found", 404));
    }

    // Check if user already viewed
    const userId = req.user ? req.user._id.toString() : null;

    if (userId && !blog.viewedBy.includes(userId)) {
      blog.viewedBy.push(userId);
      blog.views = blog.viewedBy.length;
      await blog.save();
    }

    res.status(200).json({
      status: "success",
      data: blog,
    });
  } catch (err) {
    console.error("Get blog by id error:", err);
    next(new ApiError("Failed to get blog", 500));
  }
};

exports.deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return next(new ApiError("Blog not found", 404));
    }

    await blog.deleteOne();

    res.status(200).json({
      status: "success",
      message: "Blog deleted successfully",
    });
  } catch (err) {
    console.error("Delete blog error:", err);
    next(new ApiError("Failed to delete blog", 500));
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return next(new ApiError("Blog not found", 404));
    }

    const newComment = {
      user: req.user._id,
      text,
    };

    blog.comments.push(newComment);
    await blog.save();

    res.status(201).json({
      status: "success",
      data: blog.comments[blog.comments.length - 1],
    });
  } catch (err) {
    console.error("Add comment error:", err);
    next(new ApiError("Failed to add comment", 500));
  }
};

// add like on comment
exports.likeComment = async (req, res, next) => {
  try {
    const { blogId, commentId } = req.params;
    const userId = req.user._id.toString();

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return next(new ApiError("Blog not found", 404));
    }

    const comment = blog.comments.id(commentId);
    if (!comment) {
      return next(new ApiError("Comment not found", 404));
    }

    // Remove from dislikes if exists
    comment.dislikes = comment.dislikes.filter(
      (id) => id.toString() !== userId
    );

    // Check if already liked
    if (comment.likes.includes(userId)) {
      // Remove like (toggle off)
      comment.likes = comment.likes.filter((id) => id.toString() !== userId);
    } else {
      // Add like
      comment.likes.push(userId);
    }

    await blog.save();

    res.status(200).json({
      status: "success",
      message: "Comment like status updated",
      data: comment,
    });
  } catch (err) {
    console.error("Like comment error:", err);
    next(new ApiError("Failed to like comment", 500));
  }
};

// add dislike on comment
exports.dislikeComment = async (req, res, next) => {
  try {
    const { blogId, commentId } = req.params;
    const userId = req.user._id.toString();

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return next(new ApiError("Blog not found", 404));
    }

    const comment = blog.comments.id(commentId);
    if (!comment) {
      return next(new ApiError("Comment not found", 404));
    }

    // Remove from likes if exists
    comment.likes = comment.likes.filter((id) => id.toString() !== userId);

    // Check if already disliked
    if (comment.dislikes.includes(userId)) {
      // Remove dislike (toggle off)
      comment.dislikes = comment.dislikes.filter(
        (id) => id.toString() !== userId
      );
    } else {
      // Add dislike
      comment.dislikes.push(userId);
    }

    await blog.save();

    res.status(200).json({
      status: "success",
      message: "Comment dislike status updated",
      data: comment,
    });
  } catch (err) {
    console.error("Dislike comment error:", err);
    next(new ApiError("Failed to dislike comment", 500));
  }
};

// get all comments for blog
exports.getAllComments = async (req, res, next) => {
  try {
    const { blogId } = req.params;

    const blog = await Blog.findById(blogId).populate(
      "comments.user",
      "firstName lastName profileImg"
    );
    if (!blog) {
      return next(new ApiError("Blog not found", 404));
    }

    // Prepare comments with counts
    const comments = blog.comments.map((comment) => ({
      _id: comment._id,
      user: comment.user,
      text: comment.text,
      likesCount: comment.likes.length,
      dislikesCount: comment.dislikes.length,
      createdAt: comment.createdAt,
    }));

    res.status(200).json({
      status: "success",
      results: comments.length,
      data: comments,
    });
  } catch (err) {
    console.error("Get all comments error:", err);
    next(new ApiError("Failed to get comments", 500));
  }
};

exports.likeBlog = async (req, res, next) => {
  try {
    const { blogId } = req.params;
    const userId = req.user._id.toString();

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return next(new ApiError("Blog not found", 404));
    }

    // تأكد إن arrays موجودة
    if (!blog.likes) blog.likes = [];
    if (!blog.dislikes) blog.dislikes = [];

    // Remove from dislikes if exists
    blog.dislikes = blog.dislikes.filter((id) => id.toString() !== userId);

    if (blog.likes.includes(userId)) {
      // Already liked → remove like (toggle off)
      blog.likes = blog.likes.filter((id) => id.toString() !== userId);
    } else {
      // Add like
      blog.likes.push(userId);
    }

    await blog.save();

    res.status(200).json({
      status: "success",
      message: "Blog like status updated",
      likesCount: blog.likes.length,
      dislikesCount: blog.dislikes.length,
    });
  } catch (err) {
    console.error("Like blog error:", err);
    next(new ApiError("Failed to like blog", 500));
  }
};

// Dislike Blog
exports.dislikeBlog = async (req, res, next) => {
  try {
    const { blogId } = req.params;
    const userId = req.user._id.toString();

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return next(new ApiError("Blog not found", 404));
    }

    // تأكد إن arrays موجودة
    if (!blog.likes) blog.likes = [];
    if (!blog.dislikes) blog.dislikes = [];

    // Remove from likes if exists
    blog.likes = blog.likes.filter((id) => id.toString() !== userId);

    if (blog.dislikes.includes(userId)) {
      // Already disliked → remove dislike (toggle off)
      blog.dislikes = blog.dislikes.filter((id) => id.toString() !== userId);
    } else {
      // Add dislike
      blog.dislikes.push(userId);
    }

    await blog.save();

    res.status(200).json({
      status: "success",
      message: "Blog dislike status updated",
      likesCount: blog.likes.length,
      dislikesCount: blog.dislikes.length,
    });
  } catch (err) {
    console.error("Dislike blog error:", err);
    next(new ApiError("Failed to dislike blog", 500));
  }
};

// update comment
exports.updateComment = async (req, res, next) => {
  try {
    const { blogId, commentId } = req.params;
    const { text } = req.body;

    const blog = await Blog.findById(blogId);
    if (!blog) return next(new ApiError("Blog not found", 404));

    const comment = blog.comments.id(commentId);
    if (!comment) return next(new ApiError("Comment not found", 404));

    if (comment.user.toString() !== req.user._id.toString()) {
      return next(
        new ApiError("You are not authorized to update this comment", 403)
      );
    }

    comment.text = text;
    await blog.save();

    res.status(200).json({
      status: "success",
      data: comment,
    });
  } catch (err) {
    console.error("Update comment error:", err);
    next(new ApiError("Failed to update comment", 500));
  }
};

// delete comment
exports.deleteComment = async (req, res, next) => {
  try {
    const { blogId, commentId } = req.params;

    const blog = await Blog.findById(blogId);
    if (!blog) return next(new ApiError("Blog not found", 404));

    const comment = blog.comments.id(commentId);
    if (!comment) return next(new ApiError("Comment not found", 404));

    // Check if the comment belongs to current user
    if (comment.user.toString() !== req.user._id.toString()) {
      return next(
        new ApiError("You are not authorized to delete this comment", 403)
      );
    }

    // Remove comment using filter
    blog.comments = blog.comments.filter((c) => c._id.toString() !== commentId);

    await blog.save();

    res.status(200).json({
      status: "success",
      message: "Comment deleted successfully",
    });
  } catch (err) {
    console.error("Delete comment error:", err);
    next(new ApiError("Failed to delete comment", 500));
  }
};
