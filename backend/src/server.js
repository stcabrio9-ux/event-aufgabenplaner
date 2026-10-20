import { app } from "./app.js";
import { config, validateDatabaseUrl } from "./config.js";

validateDatabaseUrl();
app.listen(config.port, "0.0.0.0", () => {
  console.log(`Backend läuft auf 0.0.0.0:${config.port}`);
});
