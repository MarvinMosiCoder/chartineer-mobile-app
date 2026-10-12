import { createApp } from "./app.mjs";
import { createDatabasePool } from "./db.mjs";

const port = Number(process.env.PORT ?? 3000);
const pool = createDatabasePool();
const app = await createApp({ pool });

app.listen(port, "0.0.0.0", () => {
  console.log(`API running at http://localhost:${port}`);
});