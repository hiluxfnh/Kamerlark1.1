import { Button } from "@mui/material";

const CustomButton = ({ label, onClick, colStart, colEnd }) => {
  return (
    <div className={`col-start-${colStart} col-end-${colEnd}`}>
      <Button variant="contained" onClick={onClick} fullWidth style={{
        backgroundColor: 'black',
        color: 'white',
        fontWeight: 'bold',
        padding: '15px 0'
      }}>
        {label}
      </Button>
    </div>
  );
};
export default CustomButton;
