import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Box, Text, useInput } from "ink";
import { scaffoldProject } from "./steps/scaffold.js";
const repoUrl = "https://github.com/aguungprasetyo/project-base";
export default function App() {
    const argProjectName = process.argv[2];
    const [input, setInput] = useState(argProjectName ?? "");
    const [projectName, setProjectName] = useState(argProjectName ?? "");
    const [status, setStatus] = useState(argProjectName ? "scaffold" : "prompt");
    const [error, setError] = useState(null);
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
    }, [status, projectName]);
    if (status === "prompt") {
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { children: "What is the name of your project?" }), _jsxs(Text, { children: ["> ", input] }), error ? _jsx(Text, { color: "red", children: error }) : null] }));
    }
    if (status === "error") {
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "red", children: "Scaffolding failed." }), error ? _jsx(Text, { color: "red", children: error }) : null] }));
    }
    if (status === "done") {
        return _jsxs(Text, { children: ["Project created: ", projectName] });
    }
    return _jsxs(Text, { children: ["Creating project: ", projectName] });
}
