const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const express = require("express");
const router = express.Router();

/**
 * @swagger
 * /goal-expenses/add:
 *   post:
 *     summary: Add a new goal expense for a user
 *     description: Create a new goal expense associated with a user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The ID of the user
 *               desiredAmount:
 *                 type: number
 *                 description: Ideal amount to be spent in this month.
 *     responses:
 *       200:
 *         description: Goal expense created successfully.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
router.post("/add", async (req, res) => {
  try {
    const { id, desiredAmount } = req.body;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create the goal expense
    const newGoalExpense = await prisma.goalExpense.create({
      data: {
        userId: id,
        desiredAmount: parseFloat(desiredAmount),
        endDate,
      },
    });

    res.json(newGoalExpense);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /goal-expenses:
 *   get:
 *     summary: Get all goal expenses
 *     description: Retrieve a list of all goal expenses.
 *     responses:
 *       200:
 *         description: Successful response with a list of goal expenses.
 *       500:
 *         description: Internal server error.
 */
router.get("/", async (req, res) => {
  try {
    const goalExpenses = await prisma.goalExpense.findMany();
    return res.json(goalExpenses);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
