const request = require("supertest");
const app = require("../app");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

describe("GET /items", () => {
  beforeAll(async () => {
    await prisma.item.createMany({
      data: [
        { name: "Coca-Cola", price: 10, categoryName: "Suc" },
        { name: "Pizz", price: 35, categoryName: "Mancare" },
      ],
    });
  });

  afterAll(async () => {
    await prisma.item.deleteMany();
  });

  test("It should return a list of items with status OK (200).", async () => {
    const response = await request(app).get("/items");
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  test("It should respond with status 500 if there is an internal server error", async () => {
    prisma.$disconnect();
    const response = await request(app).get("/items");
    expect(response.statusCode).toBe(500);
    prisma.$connect();
  });
});

describe("GET /items/filter-items", () => {
  test("It should respond with status 200 and return a list of filtered items", async () => {
    const response = await request(app).get("/items/filter-items?price=15");
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].price).toBe(35);
  });

  test("It should respond with status 500 if there is an internal server error", async () => {
    prisma.$disconnect();
    const response = await request(app).get("/items/filter-items?price=15");
    expect(response.statusCode).toBe(500);
    prisma.$connect();
  });
});

describe("DELETE /items/delete-items", () => {
  test("It should respond with status 200 and delete all items", async () => {
    const response = await request(app).delete("/items/delete-items");
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Items deleted successfully!");
  });

  test("It should respond with status 500 if there is an internal server error", async () => {
    prisma.$disconnect();
    const response = await request(app).delete("/items/delete-items");
    expect(response.statusCode).toBe(500);
    prisma.$connect();
  });
});

describe("GET /goal-expenses", () => {
  beforeAll(async () => {
    // Create some test goal expenses in the database
    await prisma.goalExpense.createMany({
      data: [
        { userId: "test-user-id", desiredAmount: 500 },
        { userId: "test-user-id", desiredAmount: 1000 },
      ],
    });
  });

  afterAll(async () => {
    // Clean up test data from the database
    await prisma.goalExpense.deleteMany();
  });

  test("It should respond with status 200 and return a list of goal expenses", async () => {
    const response = await request(app).get("/goal-expenses");

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    expect(response.body[0]).toHaveProperty("id");
    expect(response.body[0]).toHaveProperty("userId");
    expect(response.body[0]).toHaveProperty("desiredAmount");
    expect(response.body[0]).toHaveProperty("startDate");
    expect(response.body[0]).toHaveProperty("endDate");
  });

  test("It should respond with status 500 if there is an internal server error", async () => {
    prisma.$disconnect();

    const response = await request(app).get("/goal-expenses");

    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Internal server error");

    prisma.$connect();
  });
});
