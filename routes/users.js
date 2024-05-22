const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

//middlewares
const { verifyToken, isAdmin } = require("../middlewares/auth");
const { validationRules, validate } = require("../middlewares/signUpCheck");
const hashPasswordMiddleware = require("../middlewares/prisma");

const express = require("express");
const router = express.Router();

const prisma = new PrismaClient().$extends({
  query: {
    user: {
      create(args) {
        return hashPasswordMiddleware(args);
      },
      update(args) {
        return hashPasswordMiddleware(args);
      },
    },
  },
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get a user by email
 *     description: Retrieve a user from the database by their email.
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: The email of the user
 *     responses:
 *       200:
 *         description: Successful response with the user data.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const { email } = req.query;
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /users/all-users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users from the database.
 *     responses:
 *       200:
 *         description: Successful response with a list of users.
 *       500:
 *         description: Internal server error.
 */
router.get("/all-users", verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /users/signup:
 *   post:
 *     summary: Create a user
 *     description: Create a new user in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User was added successfully.
 *       500:
 *         description: Internal server error.
 */
router.post("/signup", validationRules, validate, async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const result = await prisma.user.create({
      data: {
        name,
        email,
        password,
      },
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /users/signin:
 *   post:
 *     summary: Sign in to the application
 *     description: Sign in with the provided email and password to get an access token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email of the user.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The password of the user.
 *     responses:
 *       200:
 *         description: Successfully signed in. Returns a JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: The JWT token for authentication.
 *       404:
 *         description: The user doesn't exist. You should signup!
 *       401:
 *         description: Incorrect password. Please try again!
 *       500:
 *         description: Internal server error.
 */
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res
        .status(404)
        .json({ error: "The user doesn't exist. You should signup!" });
    }
    let passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ error: "Incorrect password. Please try again!" });
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      "secret_key_generated",
      { expiresIn: "2h" }
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /users/delete-user:
 *   delete:
 *     summary: Delete a user
 *     description: Delete a user from the database by their ID.
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
router.delete("/delete-user", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.query;

    const deletedUser = await prisma.user.delete({
      where: {
        id: id,
      },
    });

    res.json({ message: "User deleted successfully", user: deletedUser });
  } catch (error) {
    if (error.code === "P2025") {
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

/**
 * @swagger
 * /users/update-password:
 *   put:
 *     summary: Update a user password
 *     description: Update user password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully.
 *       500:
 *         description: Internal server error.
 */
router.put("/update-password", async (req, res) => {
  try {
    const { id, password } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: { password },
    });
    res.json(updatedUser);
  } catch (error) {
    if (error.code === "P2025") {
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

/**
 * @swagger
 * /users/add-budget:
 *   put:
 *     summary: Update a user budget
 *     description: Add a budget for a user.
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user
 *       - in: query
 *         name: budget
 *         schema:
 *           type: number
 *         required: true
 *         description: The new budget for the user
 *     responses:
 *       200:
 *         description: User's budget updated successfully.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

router.put("/add-budget", async (req, res) => {
  try {
    const { id, budget } = req.query;
    console.log("ID:", id, "Budget:", budget);
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: { budget },
    });
    res.json(updatedUser);
  } catch (error) {
    if (error.code === "P2025") {
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

module.exports = router;
