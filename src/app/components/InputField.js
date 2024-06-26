import { TextField } from "@mui/material";

const InputFieldCustom = ({
  name,
  label,
  value,
  onChange,
  multiline = false,
  rows = 1,
  colStart,
  colEnd
}) => {
  return (
    <div className={`col-start-${colStart} col-end-${colEnd}`}>
      <TextField
        required
        name={name}
        label={label}
        value={value}
        onChange={onChange}
        id="outlined-required"
        multiline={multiline}
        rows={rows}
        fullWidth
      />
    </div>
  );
};
export default InputFieldCustom;
