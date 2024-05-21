const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

let express = require("express");
let router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get a list of users
 *     description: Retrieve a list of users from the database.
 *     responses:
 *       200:
 *         description: Successful response with a list of users.
 */
// only admin can do this
router.get("/", async (req, res) => {
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

// only admin can do this
router.get("/all-users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
/**
 * @swagger
 * /users/create-user:
 *   post:
 *     summary: Create a user in the database
 *     description: It will be used for signup section (name,email and password)
 *     responses:
 *       200:
 *         description: User was added successfully
 */
router.post("/create-user", async (req, res) => {
  const { email, name, password } = req.body;
  const result = await prisma.user.create({
    data: {
      name,
      email,
      password,
      transaction: {},
    },
  });
  res.json(result);
});

// only admin can do this
router.delete("/delete-user/", async (req, res) => {
  try {
    const { id } = req.query;

    // Attempt to delete the user
    const deletedUser = await prisma.user.delete({
      where: {
        id: id,
      },
    });

    // Respond with the deleted user data or a success message
    res.json({ message: "User deleted successfully", user: deletedUser });
  } catch (error) {
    if (error.code === "P2025") {
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

router.put("/update-user/", async (req, res) => {});

module.exports = router;
