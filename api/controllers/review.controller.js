import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

export const addReview = async (req, res) => {
  const { review, rating, postToId, grade } = req.body;
  const postById = req.userId; // ID of the user submitting the review

  try {
    const newReview = await prisma.review.create({
      data: {
        review: review,
        rating: rating,
        postBy:{
          connect: { id: postById }
        },
        postTo: {
          connect: { id: postToId }
        }, 
        grade: grade,
      },
    });
    res.status(200).json(newReview);
  } catch (err) {
    console.log("Failed to create review");
    res.status(500).json({ message: "Failed to create review" });
  }
};
  
export const getReview = async (req, res) => {
  const id = req.params.id;

  try{
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        postBy: {
          select: {
            username: true,
            avatar: true,
            email: true,
          }
        },

        postTo: {
          select: {
            username: true,
            avatar: true,
            email: true,
          }
        },
      }
    });
    res.status(200).json(review);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get review" });
  }
};

export const getReviews = async (req, res) => {
  const { userId } = req.userId;

  try {
    const reviews = await prisma.review.findMany({
      where: {
        postToId: userId,
      },
      include: {
        postBy: {
          select: {
            username: true,
            avatar: true,
            email: true,
          }
        },
        postTo: {
          select: {
            username: true,
            avatar: true,
            email: true,
          }
        },
      },
    });

    res.status(200).json(reviews);
  }catch (err){
    console.log("Failed to fetch reviews: ", err);
    res.status(500).json(
      {message: "Failed to fetch reviews."}
    )
  }
}

export const getUserReviewStats = async (req, res) => {
  const { userId } = req.userId;

  try {
      const reviews = await prisma.review.findMany({
          where: {
              postToId: userId,
          },
      });

      if (reviews.length === 0) {
          return res.status(200).json({ averageRating: 0, totalReviews: 0 });
      }

      const totalReviews = reviews.length;
      const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

      res.status(200).json({ averageRating, totalReviews});
  } catch (err) {
      console.log("Failed to fetch user review stats", err);
      res.status(500).json({ message: "Failed to fetch user review stats" });
  }
};

export const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "No token provided!" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(500).json({ message: "Failed to authenticate token." });
    }

    req.userId = decoded.id; // Set the user ID for the request
    next();
  });
};

