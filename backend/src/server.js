import { app } from "./app.js";
import { config } from "./config.js";

app.listen(config.port, () => {
  console.log(`Backend läuft auf http://localhost:${config.port}`);
});
