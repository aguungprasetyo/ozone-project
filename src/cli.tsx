import React, { useEffect, useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { LoadingSpinner } from "./ui/spinner.js";
import { scaffoldProject } from "./steps/scaffold.js";

type Status = "promptName" | "chooseTemplate" | "customRepo" | "scaffold" | "done" | "error";

type ProgressStep = "validate" | "clone" | "install" | "done";

type Template = {
  id: string;
  label: string;
  repoUrl?: string;
};

const templates: Template[] = [
  {
    id: "default",
    label: "Next.js (default)",
    repoUrl: "https://github.com/aguungprasetyo/project-base"
  },
  {
    id: "custom",
    label: "Custom repo URL"
  }
];

const progressLabels: Record<ProgressStep, string> = {
  validate: "Validating project name",
  clone: "Cloning template",
  install: "Installing dependencies",
  done: "Finalizing"
};

export default function App() {
  const { exit } = useApp();
  const argProjectName = process.argv[2];
  const [nameInput, setNameInput] = useState(argProjectName ?? "");
  const [repoInput, setRepoInput] = useState("");
  const [projectName, setProjectName] = useState(argProjectName ?? "");
  const [repoUrl, setRepoUrl] = useState("");
  const [status, setStatus] = useState<Status>(argProjectName ? "chooseTemplate" : "promptName");
  const [error, setError] = useState<string | null>(null);
  const [templateIndex, setTemplateIndex] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [progress, setProgress] = useState<ProgressStep | null>(null);

  useInput((inputChar, key) => {
    if (status === "promptName") {
      if (key.return) {
        const trimmed = nameInput.trim();
        if (!trimmed) {
          setError("Please provide a project name.");
          return;
        }
        setError(null);
        setProjectName(trimmed);
        setStatus("chooseTemplate");
        return;
      }

      if (key.backspace || key.delete) {
        setNameInput((prev) => prev.slice(0, -1));
        return;
      }

      if (key.ctrl || key.meta || key.tab || key.escape) {
        return;
      }

      if (inputChar) {
        setNameInput((prev) => prev + inputChar);
      }

      return;
    }

    if (status === "chooseTemplate") {
      if (key.upArrow) {
        setTemplateIndex((prev) => (prev - 1 + templates.length) % templates.length);
        return;
      }

      if (key.downArrow) {
        setTemplateIndex((prev) => (prev + 1) % templates.length);
        return;
      }

      if (key.return) {
        const chosen = templates[templateIndex];
        setSelectedTemplate(chosen);
        if (chosen.repoUrl) {
          setRepoUrl(chosen.repoUrl);
          setStatus("scaffold");
        } else {
          setRepoInput("");
          setStatus("customRepo");
        }
      }

      return;
    }

    if (status === "customRepo") {
      if (key.return) {
        const trimmed = repoInput.trim();
        if (!trimmed) {
          setError("Please provide a template repo URL.");
          return;
        }
        setError(null);
        setRepoUrl(trimmed);
        setStatus("scaffold");
        return;
      }

      if (key.backspace || key.delete) {
        setRepoInput((prev) => prev.slice(0, -1));
        return;
      }

      if (key.ctrl || key.meta || key.tab || key.escape) {
        return;
      }

      if (inputChar) {
        setRepoInput((prev) => prev + inputChar);
      }
    }
  });

  useEffect(() => {
    if (status !== "scaffold") {
      return;
    }

    const trimmedName = projectName.trim();
    if (!trimmedName) {
      setError("Please provide a project name.");
      setStatus("promptName");
      return;
    }

    if (!selectedTemplate) {
      setError("Please select a template.");
      setStatus("chooseTemplate");
      return;
    }

    const trimmedRepo = repoUrl.trim();
    if (!trimmedRepo) {
      setError("Please provide a template repo URL.");
      setStatus("customRepo");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        await scaffoldProject({
          repoUrl: trimmedRepo,
          targetDir: trimmedName,
          onStep: (step) => setProgress(step)
        });
        if (!cancelled) {
          setProgress("done");
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
  }, [status, projectName, repoUrl, selectedTemplate]);

  useEffect(() => {
    if (status !== "done") {
      return;
    }

    const timer = setTimeout(() => {
      exit();
    }, 700);

    return () => clearTimeout(timer);
  }, [status, exit]);
  if (status === "promptName") {
    return (
      <Box flexDirection="column">
        <Text>What is the name of your project?</Text>
        <Text>{"> "}{nameInput}</Text>
        {error ? <Text color="red">{error}</Text> : null}
      </Box>
    );
  }

  if (status === "chooseTemplate") {
    return (
      <Box flexDirection="column">
        <Text>Select a template:</Text>
        {templates.map((template, index) => (
          <Text key={template.id}>
            {index === templateIndex ? ">" : " "} {template.label}
          </Text>
        ))}
        <Text>Use up/down arrows and Enter to select.</Text>
      </Box>
    );
  }

  if (status === "customRepo") {
    return (
      <Box flexDirection="column">
        <Text>Template repo URL:</Text>
        <Text>{"> "}{repoInput}</Text>
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
    return (
      <Box flexDirection="column">
        <Text>Project ready.</Text>
        <Text>Next steps:</Text>
        <Text>cd {projectName}</Text>
        <Text>pnpm dev</Text>
      </Box>
    );
  }

  const steps = [
    { id: "validate", label: "Validate project" },
    { id: "clone", label: "Clone template" },
    { id: "install", label: "Install dependencies" }
  ] as const;

  const progressIndex = progress === "done"
    ? steps.length
    : progress
      ? steps.findIndex((step) => step.id === progress)
      : -1;

  const progressText = progress ? progressLabels[progress] : "Starting";

  return (
    <Box flexDirection="column">
      <Text>Project: {projectName}</Text>
      <Text>Template: {selectedTemplate?.label ?? "Unknown"}</Text>
      <LoadingSpinner label={progressText} />
      {steps.map((step, index) => {
        const marker = index < progressIndex ? "[x]" : index === progressIndex ? "[*]" : "[ ]";
        return (
          <Text key={step.id}>
            {marker} {step.label}
          </Text>
        );
      })}
    </Box>
  );
}
