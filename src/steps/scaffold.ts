import { execa } from "execa";
import fs from "fs/promises";
import path from "path";

type Step = "validate" | "clone" | "install" | "done";

type Options = {
  repoUrl: string;
  targetDir: string;
  onStep?: (step: Step) => void;
};

export async function scaffoldProject({ repoUrl, targetDir, onStep }: Options) {
  onStep?.("validate");

  if (!/^[a-z0-9-_]+$/i.test(targetDir)) {
    throw new Error("Invalid project name.");
  }

  const absTarget = path.resolve(process.cwd(), targetDir);

  try {
    await fs.access(absTarget);
    throw new Error(`Folder "${targetDir}" already exists.`);
  } catch {}

  try {
    await execa("pnpm", ["-v"], { shell: true, stdio: "ignore" });
  } catch {
    throw new Error("pnpm is not installed. Run: npm install -g pnpm");
  }

  onStep?.("clone");
  await execa("git", ["clone", "--depth=1", repoUrl, targetDir], {
    stdio: "ignore",
    shell: true
  });

  await fs.rm(path.join(absTarget, ".git"), { recursive: true, force: true });

  onStep?.("install");
  await execa("pnpm", ["install"], {
    cwd: absTarget,
    stdio: "ignore",
    shell: true
  });

  onStep?.("done");
}
