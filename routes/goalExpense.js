const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const express = require("express");
const router = express.Router();
const moment = require("moment");

const { verifyToken, isAdmin } = require("../middlewares/auth");
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
    const startDate = moment().format("YYYY-MM-DD").toString();
    const endDate = moment().add(30, "days").format("YYYY-MM-DD").toString();
    const user = await prisma.user.findUnique({
      where: { id: id },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const newGoalExpense = await prisma.goalExpense.create({
      data: {
        userId: id,
        desiredAmount: desiredAmount,
        startDate: startDate,
        endDate: endDate,
      },
    });
    res.json(newGoalExpense);
  } catch (error) {
    console.log("Error creating new goal expense");
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
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const goalExpenses = await prisma.goalExpense.findMany();
    return res.json(goalExpenses);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /goal-expenses/delete:
 *   delete:
 *     summary: Delete a goal expense
 *     description: Delete a goal expense from the database by its ID.
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the goal expense to delete
 *     responses:
 *       200:
 *         description: Goal expense deleted successfully.
 *       404:
 *         description: Goal expense not found.
 *       500:
 *         description: Internal server error.
 */
router.delete("/delete", async (req, res) => {
  try {
    const { id } = req.query;

    const deletedGoalExpense = await prisma.goalExpense.delete({
      where: {
        id: id,
      },
    });

    res.json({ message: "Goal Expense deleted successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      res.status(404).json({ error: "Goal expense not found" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

/**
 * @swagger
 * /goal-expenses/update:
 *   put:
 *     summary: Update a goal expense
 *     description: Update the desired amount of a goal expense.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The ID of the goal expense to update
 *               desiredAmount:
 *                 type: number
 *                 description: The new desired amount for the goal expense
 *     responses:
 *       200:
 *         description: Goal expense updated successfully.
 *       404:
 *         description: Goal expense not found.
 *       500:
 *         description: Internal server error.
 */
router.put("/update", async (req, res) => {
  try {
    const { id, desiredAmount } = req.body;
    const goalExpenseUpdated = await prisma.goalExpense.update({
      where: {
        id: id,
      },
      data: { desiredAmount: desiredAmount },
    });
    res.json(goalExpenseUpdated);
  } catch (error) {
    if (error.code === "P2025") {
      res.status(404).json({ error: "Goal Expense not found" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});
module.exports = router;
