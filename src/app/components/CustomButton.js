import { Button } from "@mui/material";

const CustomButton = ({ label, onClick, colStart, colEnd, disabled = false }) => {
  return (
    <div className={`col-start-${colStart} col-end-${colEnd}`}>
      <Button
        variant="contained"
        onClick={onClick}
        disabled={disabled}
        fullWidth
        style={{
          backgroundColor: disabled ? "#555" : "black",
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
