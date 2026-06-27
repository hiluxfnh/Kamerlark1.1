import { Button } from "@mui/material";
import ButtonSpinner from "./ButtonSpinner";

const CustomButton = ({
  label,
  onClick,
  colStart,
  colEnd,
  disabled = false,
  loading = false,
}) => {
  return (
    <div className={`col-start-${colStart} col-end-${colEnd}`}>
      <Button
        variant="contained"
        onClick={onClick}
        disabled={disabled || loading}
        fullWidth
        startIcon={loading ? <ButtonSpinner size={16} /> : null}
        style={{
          backgroundColor: disabled || loading ? "#555" : "black",
          color: "white",
          fontWeight: "bold",
          padding: "15px 0",
        }}
      >
        {label}
      </Button>
    </div>
  );
};
export default CustomButton;
