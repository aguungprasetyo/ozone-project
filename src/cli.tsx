import React, { useEffect, useState } from "react";
import { Box, Text, useInput } from "ink";
import { scaffoldProject } from "./steps/scaffold.js";

type Status = "prompt" | "scaffold" | "done" | "error";

const repoUrl = "https://github.com/aguungprasetyo/project-base";

export default function App() {
  const argProjectName = process.argv[2];
  const [input, setInput] = useState(argProjectName ?? "");
  const [projectName, setProjectName] = useState(argProjectName ?? "");
  const [status, setStatus] = useState<Status>(argProjectName ? "scaffold" : "prompt");
  const [error, setError] = useState<string | null>(null);

  useInput((inputChar, key) => {
    if (status !== "prompt") {
      return;
    }

    if (key.return) {
      const trimmed = input.trim();
      if (!trimmed) {
        setError("Please provide a project name.");
        return;
      }
      setError(null);
      setProjectName(trimmed);
      setStatus("scaffold");
      return;
    }

    if (key.backspace || key.delete) {
      setInput((prev) => prev.slice(0, -1));
      return;
    }

    if (key.ctrl || key.meta || key.tab || key.escape || key.upArrow || key.downArrow || key.leftArrow || key.rightArrow) {
      return;
    }

    if (inputChar) {
      setInput((prev) => prev + inputChar);
    }
  });

  useEffect(() => {
    if (status !== "scaffold") {
      return;
    }

    const trimmed = projectName.trim();
    if (!trimmed) {
      setError("Please provide a project name.");
      setStatus("prompt");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        await scaffoldProject({ repoUrl, targetDir: trimmed });
        if (!cancelled) {
          setStatus("done");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to scaffold project.");
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, projectName]);

  if (status === "prompt") {
    return (
      <Box flexDirection="column">
        <Text>What is the name of your project?</Text>
        <Text>{"> "}{input}</Text>
        {error ? <Text color="red">{error}</Text> : null}
      </Box>
    );
  }

  if (status === "error") {
    return (
      <Box flexDirection="column">
        <Text color="red">Scaffolding failed.</Text>
        {error ? <Text color="red">{error}</Text> : null}
      </Box>
    );
  }

  if (status === "done") {
    return <Text>Project created: {projectName}</Text>;
  }

  return <Text>Creating project: {projectName}</Text>;
}
