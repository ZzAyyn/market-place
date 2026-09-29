import { app } from "./app.js";

const port = Number(process.env.PORT);

if (!Number.isInteger(port)) {
  throw new Error("PORT must be set to an integer in server/.env");
}

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
