import { TextField } from "@mui/material";

const InputFieldCustom = ({
  name,
  label,
  value,
  onChange,
  multiline = false,
  rows = 1,
  colStart,
  colEnd,
  disabled = false,
  size = "medium",
  my = 2,
  error = false,
  helperText = "",
}) => {
  return (
    <div className={`col-start-${colStart} col-end-${colEnd} my-${my}`}>
      <TextField
        required
        disabled={disabled}
        name={name}
        label={label}
        value={value}
        onChange={onChange}
        id="outlined-required"
        multiline={multiline}
        rows={rows}
        fullWidth
        size={size}
        inputProps={{ style: { fontSize: 14 } }} // font size of input text
        InputLabelProps={{ style: { fontSize: 14 } }}
        error={error}
        helperText={helperText}
      />
    </div>
  );
};
export default InputFieldCustom;
