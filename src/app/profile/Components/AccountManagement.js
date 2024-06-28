import React, { useState ,useEffect} from "react";
import TextField from "@mui/material/TextField";
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { Button } from "@mui/material";
import { doc } from "firebase/firestore";
function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
        className="w-96"
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  }
  
CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};
function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function AccountManagement({ personalInfo, user }) {
    const [value, setValue] = React.useState(0);
  
    const handleChange = (event, newValue) => {
      setValue(newValue);
    };
    const [personalInfoState, setPersonalInfoState] = useState({
      userName:"",
      email: "",
      phoneNumber: "",
      address: "",
    });
  
    useEffect(() => {
      if (personalInfo) {
        setPersonalInfoState(personalInfo);
      }
    }, [personalInfo]);
  
    const [password, setPassword] = useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  
    const handlePersonalInfoChange = (e) => {
      const { name, value } = e.target;
      setPersonalInfoState({
        ...personalInfoState,
        [name]: value,
      });
    };
  
    const handlePasswordChange = (e) => {
      const { name, value } = e.target;
      setPassword({
        ...password,
        [name]: value,
      });
    };
  
    const handlePersonalInfoSubmit = async (e) => {
      e.preventDefault();
      try {
        const userDocRef = doc(db, "Users", auth.currentUser.uid);
        await setDoc(userDocRef, personalInfoState, { merge: true });
        alert("Personal information updated successfully");
      } catch (error) {
        console.error("Error updating personal information:", error);
        alert("Error updating personal information");
      }
    };
  
    const handlePasswordSubmit = async (e) => {
      e.preventDefault();
      if (password.newPassword !== password.confirmPassword) {
        alert("New password and confirm password do not match");
        return;
      }
  
      try {
        const credential = EmailAuthProvider.credential(
          user.email,
          password.currentPassword
        );
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, password.newPassword);
        alert("Password updated successfully");
        setPassword({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } catch (error) {
        console.error("Error updating password:", error);
        alert(
          "Error updating password. Please make sure the current password is correct."
        );
      }
    };
  
    const handleAccountDeletion = () => {
      // Add code to handle account deletion
    };
  
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">Account Management</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Personal Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Details about your account.
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Full name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {personalInfoState.userName}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Email address
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {personalInfoState.email}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Phone number
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {personalInfoState.phoneNumber}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {personalInfoState.address}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="Personal Information" {...a11yProps(0)} />
            <Tab label="Change Password" {...a11yProps(1)} />
            <Tab label="Delete Account" {...a11yProps(2)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
        <div className="w-96">
        <h3 className="text-lg font-semibold mb-2">
          Update Personal Information
        </h3>
          <div className="grid grid-cols-12 gap-4">
          <TextField
            id="outlined-required"
            label="User Name"          
            className="col-start-1 col-end-13 w-full"
            value={personalInfoState.userName}
            name="userName"
            onChange={handlePersonalInfoChange}
          />
          </div>
          
          <div className="grid grid-cols-12 gap-4 mt-5">
          <TextField
            id="outlined-required"
            label="Email"
            className="col-start-1 col-end-5 w-full"
            value={personalInfoState.email}
            name="email"
            onChange={handlePersonalInfoChange}
          />
          <TextField
            id="outlined-required"
            label="Phone Number"
            className="col-start-5 col-end-8 w-full"
            value={personalInfoState.phoneNumber}
            name="phoneNumber"
            onChange={handlePersonalInfoChange}
          />
          <TextField
            id="outlined-required"
            label="Address"
            className="col-start-8 col-end-13 w-full"
            value={personalInfoState.address}
            name="address"
            onChange={handlePersonalInfoChange}
          />
          </div>
          <div className="mt-4 w-full">
         <Button onClick={handlePersonalInfoSubmit} style={{
            backgroundColor: 'black',
            color: 'white',
            padding: '10px 20px',
         }} variant="contained" color="primary" fullWidth>Save Changes</Button>
         </div>
        </div>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Change Password</h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="grid grid-cols-12 gap-4">
            <TextField  
              type="password"
              name="currentPassword"
              value={password.currentPassword}
              onChange={handlePasswordChange}
              label="Current Password"
              className="col-start-1 col-end-5 w-full"
              fullWidth
            />
            <TextField
              type="password"
              name="newPassword"
              value={password.newPassword}
              className="col-start-5 col-end-9 w-full"
              onChange={handlePasswordChange}
              label="New Password"
              fullWidth
            />
            <TextField
              type="password"
              name="confirmPassword"
              className="col-start-9 col-end-13 w-full"
              value={password.confirmPassword}
              onChange={handlePasswordChange}
              label="Confirm New Password"
              fullWidth
            />
            </div>
            <Button type="submit" style={{
              backgroundColor: 'black',
              color: 'white',
              padding: '10px 20px',
            }} variant="contained" color="primary" fullWidth>Change Password</Button>
          </form>
        </div>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Delete Account</h3>
          <p className="text-sm text-gray-600">
            Warning: This action cannot be undone.
          </p>
          <button
            onClick={handleAccountDeletion}
            className="mt-2 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete Account
          </button>
        </div>
        </CustomTabPanel>
      </Box>
        
      </div>
    );
  }