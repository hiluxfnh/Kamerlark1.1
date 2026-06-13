"use client";
import { useState, useCallback } from "react";
import { Snackbar, Alert } from "@mui/material";

/**
 * Reusable toast (MUI Snackbar) — replaces blocking alert() calls.
 *
 *   const { notify, toast } = useToast();
 *   notify("Saved!", "success");        // severity: success|error|warning|info
 *   return (<>...{toast}</>);            // render the element once
 */
export default function useToast() {
  const [state, setState] = useState({ open: false, message: "", severity: "success" });

  const notify = useCallback((message, severity = "success") => {
    setState({ open: true, message, severity });
  }, []);

  const handleClose = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  const toast = (
    <Snackbar
      open={state.open}
      autoHideDuration={5000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert onClose={handleClose} severity={state.severity} variant="filled" sx={{ width: "100%" }}>
        {state.message}
      </Alert>
    </Snackbar>
  );

  return { notify, toast };
}
