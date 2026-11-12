import { PrismaClient } from "@prisma/client";
import { resolve } from "node:path";

const file = resolve("desktop/base.db").replaceAll(String.fromCharCode(92), "/");
process.env.DATABASE_URL = `file:${file}`;

const db = new PrismaClient();
const [users, products, settings, stages, orders] = await Promise.all([
  db.user.count(),
  db.product.count(),
  db.setting.count(),
  db.stage.count(),
  db.order.count(),
]);

console.log("users", users, "| products", products, "| settings", settings, "| stages", stages, "| orders", orders);
await db.$disconnect();
