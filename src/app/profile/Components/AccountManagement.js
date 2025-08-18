import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import {
  Button,
  Avatar,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  LinearProgress,
} from "@mui/material";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateEmail,
  updateProfile,
  deleteUser,
} from "firebase/auth";
import { auth, db, storage } from "../../firebase/Config";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      className="w-full"
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
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function AccountManagement({ personalInfo }) {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const [personalInfoState, setPersonalInfoState] = useState({
    userName: "",
    email: "",
    phoneNumber: "",
    address: "",
    profileImage: "",
  });

  useEffect(() => {
    if (personalInfo) {
      setPersonalInfoState((prev) => ({ ...prev, ...personalInfo }));
    }
  }, [personalInfo]);

  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Snackbar feedback
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const openSnack = (message, severity = "success") =>
    setSnack({ open: true, message, severity });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  // Avatar upload state
  const [avatarUploading, setAvatarUploading] = useState(false);
  const onAvatarChange = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file || !user) return;
      setAvatarUploading(true);
      const path = `users/${user.uid}/avatar-${Date.now()}-${file.name}`;
      const ref = storageRef(storage, path);
      await uploadBytes(ref, file);
      const url = await getDownloadURL(ref);
      // Update Auth profile and Users doc
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: url });
      }
      await setDoc(
        doc(db, "Users", user.uid),
        { profileImage: url },
        { merge: true }
      );
      setPersonalInfoState((prev) => ({ ...prev, profileImage: url }));
      openSnack("Profile photo updated");
    } catch (e) {
      openSnack(e?.message || "Failed to upload photo", "error");
    } finally {
      setAvatarUploading(false);
      if (e?.target) e.target.value = null;
    }
  };

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
      const userDocRef = doc(db, "Users", user.uid);
      // Sync Auth profile where possible
      if (
        personalInfoState.userName &&
        user?.displayName !== personalInfoState.userName
      ) {
        try {
          await updateProfile(user, {
            displayName: personalInfoState.userName,
          });
        } catch {}
      }
      if (personalInfoState.email && user?.email !== personalInfoState.email) {
        try {
          await updateEmail(user, personalInfoState.email);
        } catch (err) {
          openSnack(
            err?.message || "Email update failed; recent login required",
            "warning"
          );
        }
      }
      await setDoc(userDocRef, personalInfoState, { merge: true });
      openSnack("Personal information updated");
    } catch (error) {
      console.error("Error updating personal information:", error);
      openSnack("Error updating personal information", "error");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (password.newPassword !== password.confirmPassword) {
      openSnack("New password and confirm password do not match", "warning");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        password.currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, password.newPassword);
      openSnack("Password updated successfully");
      setPassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      openSnack(
        "Error updating password. Please check current password.",
        "error"
      );
    }
  };

  // Delete account dialog flow
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const handleAccountDeletion = () => setDeleteOpen(true);
  const confirmDelete = async () => {
    try {
      if (!user?.email) throw new Error("Missing user email");
      const cred = EmailAuthProvider.credential(user.email, deletePassword);
      await reauthenticateWithCredential(user, cred);
      await deleteDoc(doc(db, "Users", user.uid)).catch(() => {});
      await deleteUser(user);
      openSnack("Account deleted");
      router.push("/login");
    } catch (e) {
      openSnack(e?.message || "Failed to delete account", "error");
    } finally {
      setDeleteOpen(false);
      setDeletePassword("");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Account Management</h2>
      {/* Profile summary and avatar */}
      <div className="flex items-center gap-4 mb-6 p-4 rounded-lg border bg-white">
        <Avatar
          src={personalInfoState.profileImage || user?.photoURL || ""}
          sx={{ width: 64, height: 64 }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600">Signed in as</p>
          <p className="text-base font-medium truncate">
            {personalInfoState.userName || user?.displayName || "User"}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {personalInfoState.email || user?.email}
          </p>
        </div>
        <div>
          <input
            type="file"
            accept="image/*"
            id="avatar-input"
            className="hidden"
            onChange={onAvatarChange}
          />
          <label htmlFor="avatar-input">
            <Button
              variant="outlined"
              component="span"
              disabled={avatarUploading}
            >
              Change photo
            </Button>
          </label>
        </div>
      </div>
      {avatarUploading ? <LinearProgress className="mb-4" /> : null}
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
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab label="Personal Information" {...a11yProps(0)} />
            <Tab label="Change Password" {...a11yProps(1)} />
            <Tab label="Delete Account" {...a11yProps(2)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <div className="w-full max-w-3xl">
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
              <Button
                onClick={handlePersonalInfoSubmit}
                style={{
                  backgroundColor: "black",
                  color: "white",
                  padding: "10px 20px",
                }}
                variant="contained"
                color="primary"
                fullWidth
              >
                Save Changes
              </Button>
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
              <Button
                type="submit"
                style={{
                  backgroundColor: "black",
                  color: "white",
                  padding: "10px 20px",
                }}
                variant="contained"
                color="primary"
                fullWidth
              >
                Change Password
              </Button>
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
        <Snackbar
          open={snack.open}
          autoHideDuration={4000}
          onClose={closeSnack}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={closeSnack}
            severity={snack.severity}
            sx={{ width: "100%" }}
          >
            {snack.message}
          </Alert>
        </Snackbar>
        <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
          <DialogTitle>Confirm account deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please enter your current password to confirm account deletion.
            </DialogContentText>
            <TextField
              margin="dense"
              label="Current Password"
              type="password"
              fullWidth
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button color="error" variant="contained" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </div>
  );
}
