var express = require("express");
var router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * @swagger
 * /items:
 *   get:
 *     summary: Get all items
 *     description: Retrieves all items from the database.
 *     responses:
 *       200:
 *         description: List of items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
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
router.get("/", async (req, res) => {
  try {
    const items = await prisma.item.findMany();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /items/filter-items:
 *   get:
 *     summary: Filter items by price
 *     description: Retrieves items from the database with prices greater than or equal to the specified value.
 *     parameters:
 *       - in: query
 *         name: price
 *         schema:
 *           type: string
 *         required: true
 *         description: The minimum price to filter items.
 *     responses:
 *       200:
 *         description: List of filtered items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
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
router.get("/filter-items", async (req, res) => {
  try {
    const { price } = req.query;
    console.log(price);
    const items = await prisma.item.findMany({
      orderBy: [
        {
          price: "asc",
        },
      ],
      where: {
        price: {
          gte: price,
        },
      },
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /items/delete-items:
 *   delete:
 *     summary: Delete all items
 *     description: Deletes all items from the database.
 *     responses:
 *       200:
 *         description: Items deleted successfully
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
router.delete("/delete-items", async (req, res) => {
  try {
    await prisma.item.deleteMany();
    res.json({ message: "Items deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /items/update-item-price:
 *   put:
 *     summary: Update item price
 *     description: Updates the price of an item and adjusts the corresponding transaction and user budget.
 *     parameters:
 *       - in: query
 *         name: itemId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the item to update.
 *       - in: query
 *         name: newPrice
 *         schema:
 *           type: string
 *         required: true
 *         description: The new price for the item.
 *     responses:
 *       200:
 *         description: Item price updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the success of the operation.
 *       404:
 *         description: Item or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: An error message indicating that the item or user was not found.
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
router.put("/update-item-price", async (req, res) => {
  try {
    const { itemId, newPrice } = req.query;

    // Find the item to update
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Calculate the price difference
    const priceDifference = parseFloat(newPrice) - parseFloat(item.price);

    // Update the item's price
    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: { price: newPrice },
    });

    // Update the transaction's amount
    const updatedTransaction = await prisma.transaction.update({
      where: { id: item.transactionId },
      data: { amount: { increment: priceDifference } },
    });

    // Update the user's budget
    const user = await prisma.user.findUnique({
      where: { id: updatedTransaction.userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newBudget = user.budget - priceDifference;
    await prisma.user.update({
      where: { id: user.id },
      data: { budget: newBudget },
    });

    res.status(200).json({ message: "Item price updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
