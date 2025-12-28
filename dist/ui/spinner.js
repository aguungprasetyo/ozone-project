import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Spinner from "ink-spinner";
import { Text, Box } from "ink";
export function LoadingSpinner({ label }) {
    return (_jsxs(Box, { children: [_jsx(Text, { color: "cyan", children: _jsx(Spinner, { type: "dots" }) }), _jsxs(Text, { children: [" ", label] })] }));
}
