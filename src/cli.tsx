import React, { useEffect } from "react";
import { render, Text } from "ink";
import { scaffoldProject } from "./steps/scaffold.js";

export default function App() {
  const projectName = process.argv[2];

  useEffect(() => {
    if (!projectName) {
      console.log("❌ Please provide a project name.");
      console.log("👉 npx ozone-project my-app");
      process.exit(1);
    }

    scaffoldProject({ repoUrl: "https://github.com/aguungprasetyo/project-base", targetDir: projectName });
  }, []);

  return <Text>🚀 Creating project: {projectName}</Text>;
}
