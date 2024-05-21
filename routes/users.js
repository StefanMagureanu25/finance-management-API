var express = require("express");
var router = express.Router();
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
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
router.get("/:id", async (req, res) => {
  //const
});

router.post("/create-user", async (req, res) => {
  const { name, email } = req.body;
});
router.delete("/delete-user/:id", async (req, res) => {});

router.put("/update-user/:id", async (req, res) => {});

module.exports = router;
