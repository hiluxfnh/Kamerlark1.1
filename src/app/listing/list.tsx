import TextField from '@mui/material/TextField';
const AddListing = () => {
    return (
        <div>
            <div>
            <TextField
          required
          id="outlined-required"
          label="Required"
          defaultValue="Hello World"
        />
            </div>
        </div>
    );
};
export default AddListing;