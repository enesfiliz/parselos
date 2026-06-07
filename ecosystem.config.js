import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/** @type {import('pm2').StartOptions} */
export default require("./ecosystem.config.cjs");
