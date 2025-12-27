import { execa } from "execa";
import fs from "fs/promises";
import path from "path";
export async function scaffoldProject({ repoUrl, targetDir }) {
    if (!/^[a-z0-9-_]+$/i.test(targetDir)) {
        throw new Error("Invalid project name.");
    }
    const absTarget = path.resolve(process.cwd(), targetDir);
    try {
        await fs.access(absTarget);
        throw new Error(`Folder "${targetDir}" already exists.`);
    }
    catch { }
    try {
        await execa("pnpm", ["-v"], { shell: true });
    }
    catch {
        throw new Error("pnpm is not installed. Run: npm install -g pnpm");
    }
    console.log("📦 Cloning template...");
    await execa("git", ["clone", "--depth=1", repoUrl, targetDir], {
        stdio: "inherit",
        shell: true
    });
    await fs.rm(path.join(absTarget, ".git"), { recursive: true, force: true });
    console.log("📦 Installing dependencies...");
    await execa("pnpm", ["install"], {
        cwd: absTarget,
        stdio: "inherit",
        shell: true
    });
    console.log(`
✅ Project ready!

Next steps:
  cd ${targetDir}
  pnpm dev
`);
}
