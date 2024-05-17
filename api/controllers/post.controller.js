import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";


export const getPosts = async (req, res) => {
  const query = req.query;

  try {
    const posts = await prisma.post.findMany({
      where: {
        city: query.city || undefined,
        type: query.type || undefined,
        property: query.property || undefined,
        bedroom: parseInt(query.bedroom) || undefined,
        price: {
          gte: parseInt(query.minPrice) || undefined,
          lte: parseInt(query.maxPrice) || undefined,
        },
      },
      include: {
        _count: {
          select: { savedPosts: true }
        }
      }
    });

    const postsWithSavedCount = posts.map(post => ({
      ...post,
      savedCount: post._count.savedPosts
    }));

    res.status(200).json(postsWithSavedCount);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get posts" });
  }
};

// Allow agent to obtain their Post  
export const getPost = async (req, res) => {
  const id = req.params.id;
  try {
    // Retrieve the post
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    // Increment view count for the post
    await prisma.post.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    // Check if the request contains a token for authentication
    const token = req.cookies?.token;

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
        if (!err) {
          const saved = await prisma.savedPost.findUnique({
            where: {
              userId_postId: {
                postId: id,
                userId: payload.id,
              },
            },
          });
          res.status(200).json({ ...post, isSaved: saved ? true : false });
        } else {
          res.status(200).json({ ...post, isSaved: false });
        }
      });
    } else {
      res.status(200).json({ ...post, isSaved: false });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get post" });
  }
};




// Allow agent to add Post 
export const addPost = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;

  try {
    const newPost = await prisma.post.create({
      data: {
        ...body.postData,
        userId: tokenUserId,
        postDetail: {
          create: body.postDetail,
        },
      },
    });
    res.status(200).json(newPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create post" });
  }
};



// Allow agent to update their post
export const updatePost = async (req, res) => {
  const postId = req.params.id;
  const { postData, postDetail } = req.body;

  try {
    // review the post
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    // do the update when the post is exist
    if (existingPost) {
      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
          ...postData,
          postDetail: {
            update: {
              ...postDetail,
            },
          },
        },
      });

      res.status(200).json(updatedPost);
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update post on server" });
  }
};



export const deletePost = async (req, res) => {
  const postId = req.params.id;

  try {
    // Post와 연관된 PostDetail 삭제
    await prisma.postDetail.deleteMany({
      where: { postId },
    });

    // Post 삭제
    await prisma.post.delete({
      where: { id: postId },
    });

    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete post on server" });
  }
};
