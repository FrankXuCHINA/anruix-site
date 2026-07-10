import { cpSync, rmSync } from "node:fs";

const source = "dist/pagefind";
const destination = "public/pagefind";

rmSync(destination, { recursive: true, force: true });
cpSync(source, destination, { recursive: true });
