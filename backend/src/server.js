import { app } from "./app.js";
import { config, validateDatabaseUrl } from "./config.js";

validateDatabaseUrl();
app.listen(config.port, () => {
  console.log(`Backend läuft auf http://localhost:${config.port}`);
});
