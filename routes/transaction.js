const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Item = require("../models/Item");

const express = require("express");
const router = express.Router();

/**
 * @swagger
 * /create-transaction:
 *   post:
 *     summary: Create a new transaction
 *     description: Create a new transaction for a user with the provided items.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user.
 *               items:
 *                 type: array
 *                 description: An array of items to be included in the transaction.
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: The name of the item.
 *                     price:
 *                       type: number
 *                       description: The price of the item.
 *                     categoryName:
 *                       type: string
 *                       description: The category name of the item.
 *     responses:
 *       200:
 *         description: Transaction created successfully.
 *       400:
 *         description: Insufficient budget or invalid request.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
router.post("/create-transaction", async (req, res) => {
  try {
    const { userId, items } = req.body;
    const itemsArray = items.map(
      (item) => new Item(item.name, item.price, item.categoryName)
    );
    let amountSpent = 0;
    itemsArray.forEach((element) => {
      amountSpent += element.price;
    });
    console.log(amountSpent);
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Here I assure that I have the required amount of money to add this transaction
    if (user.budget < amountSpent) {
      return res.status(400).json({
        error:
          "Insufficient budget. You can't add this transaction with the current budget you have!",
      });
    }
    const newBudget = user.budget - amountSpent;
    // Update the user's budget
    const userAffected = await prisma.user.update({
      where: { id: userId },
      data: { budget: newBudget },
    });
    const transactionCreated = await prisma.transaction.create({
      data: {
        amount: amountSpent,
        userId: userId,
      },
    });

    // Now add the items that I have from the transaction.
    const itemsCreationPromises = itemsArray.map(async (element) => {
      return prisma.item.create({
        data: {
          name: element.name,
          price: element.price,
          categoryName: element.categoryName,
          transaction: {
            connect: { id: transactionCreated.id },
          },
        },
      });
    });

    const itemsAddedInTransaction = await Promise.all(itemsCreationPromises);

    // Update the transaction with the items
    await prisma.transaction.update({
      where: {
        id: transactionCreated.id,
      },
      data: {
        items: {
          connect: itemsAddedInTransaction.map((item) => ({ id: item.id })),
        },
      },
    });
    res.status(200).json({ message: "Transaction created successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get a transaction by ID
 *     description: Retrieve a transaction by its ID.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the transaction to retrieve.
 *     responses:
 *       200:
 *         description: Transaction found.
 *       404:
 *         description: Transaction not found.
 *       500:
 *         description: Internal server error.
 */
router.get("/", async (req, res) => {
  try {
    const { id } = req.query;
    const transaction = await prisma.transaction.findUnique({
      where: {
        id: id,
      },
    });
    res.json(transaction);
  } catch (error) {
    if (error.code === "P2025") {
      res.status(404).json({ error: "Transaction not found" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});
/**
 * @swagger
 * /delete-transactions:
 *   delete:
 *     summary: Delete all transactions
 *     description: Deletes all transactions from the database.
 *     responses:
 *       200:
 *         description: Transactions deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the success of the operation.
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: An error message indicating the failure of the operation.
 */

router.delete("/delete-transactions", async (req, res) => {
  try {
    await prisma.transaction.deleteMany();
    res.json({ message: "Transactions deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
