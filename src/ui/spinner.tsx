import React from "react";
import Spinner from "ink-spinner";
import { Text, Box } from "ink";

export function LoadingSpinner({ label }: { label?: string }) {
  return (
    <Box>
      <Text color="cyan">
        <Spinner type="dots" />
      </Text>
      <Text> {label}</Text>
    </Box>
  );
}
