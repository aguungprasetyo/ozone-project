import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { LoadingSpinner } from "./ui/spinner.js";
import { scaffoldProject } from "./steps/scaffold.js";
const templates = [
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
const progressLabels = {
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
    const [status, setStatus] = useState(argProjectName ? "chooseTemplate" : "promptName");
    const [error, setError] = useState(null);
    const [templateIndex, setTemplateIndex] = useState(0);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [progress, setProgress] = useState(null);
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
                }
                else {
                    setRepoInput("");
                    setStatus("customRepo");
                }
            }
            return;
        }
        if (status === "customRepo") {
            if (key.escape) {
                setError(null);
                setStatus("chooseTemplate");
                return;
            }
            if (key.return) {
                const trimmed = repoInput.trim();
                if (trimmed.toLowerCase() === "back") {
                    setError(null);
                    setStatus("chooseTemplate");
                    return;
                }
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
            }
            catch (err) {
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
            process.exit(0);
        }, 700);
        return () => clearTimeout(timer);
    }, [status, exit]);
    if (status === "promptName") {
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { children: "What is the name of your project?" }), _jsxs(Text, { children: ["> ", nameInput] }), error ? _jsx(Text, { color: "red", children: error }) : null] }));
    }
    if (status === "chooseTemplate") {
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { children: "Select a template:" }), templates.map((template, index) => {
                    const isSelected = index === templateIndex;
                    return (_jsxs(Text, { backgroundColor: isSelected ? "white" : undefined, color: isSelected ? "black" : undefined, children: [isSelected ? ">" : " ", " ", template.label] }, template.id));
                }), _jsx(Text, { children: "Use up/down arrows and Enter to select." })] }));
    }
    if (status === "customRepo") {
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { children: "Template repo URL:" }), _jsxs(Text, { children: ["> ", repoInput] }), _jsx(Text, { children: "Press Esc or type \"back\" to return." }), error ? _jsx(Text, { color: "red", children: error }) : null] }));
    }
    if (status === "error") {
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "red", children: "Scaffolding failed." }), error ? _jsx(Text, { color: "red", children: error }) : null] }));
    }
    if (status === "done") {
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "green", children: "Project ready." }), _jsx(Text, { children: "Next steps:" }), _jsxs(Text, { children: ["cd ", projectName] }), _jsx(Text, { children: "pnpm dev" })] }));
    }
    const steps = [
        { id: "validate", label: "Validate project" },
        { id: "clone", label: "Clone template" },
        { id: "install", label: "Install dependencies" }
    ];
    const progressIndex = progress === "done"
        ? steps.length
        : progress
            ? steps.findIndex((step) => step.id === progress)
            : -1;
    const progressText = progress ? progressLabels[progress] : "Starting";
    return (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Text, { children: ["Project: ", projectName] }), _jsxs(Text, { children: ["Template: ", selectedTemplate?.label ?? "Unknown"] }), _jsx(LoadingSpinner, { label: progressText }), steps.map((step, index) => {
                const isDone = index < progressIndex;
                const isCurrent = index === progressIndex;
                const marker = isDone ? "✔" : isCurrent ? "●" : "○";
                const color = isDone ? "green" : isCurrent ? "blue" : "gray";
                return (_jsxs(Text, { color: color, children: [marker, " ", step.label] }, step.id));
            })] }));
}
