import { Box, Tab, Tabs } from "@mui/material";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import React from "react";
import IncomingAppointmentCard from "./IncomingAppointmentCard";
import OutgoingAppointmentCard from "./OutgoingAppointmentCard";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../firebase/Config";
import { collection, getDocs, query, where } from "firebase/firestore";
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
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const Appointments = () => {
  const [value, setValue] = useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const [user]=useAuthState(auth);
  const [incomingAppointments, setIncomingAppointments] = useState([]);
  const [outgoingAppointments, setOutgoingAppointments] = useState([]);
  const fetchAppointments = async () => {
    if (user) {
        try {
          const incoming = query(
            collection(db, "appointments"),
            where("ownerId", "==", user.uid)
          );
          const outgoing = query(
                collection(db, "appointments"),
                where("userId", "==", user.uid)
            );
  
          
          const [incomingSnapShot ,outgoingSnapShot] = await Promise.all([
            getDocs(incoming),
            getDocs(outgoing)
          ]);
  
          const incomingListing = incomingSnapShot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
            const outgoingListing = outgoingSnapShot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setIncomingAppointments(incomingListing);
            setOutgoingAppointments(outgoingListing);
        } catch (error) {
          console.error("Error fetching data: ", error);
        }
      }
  }
    useEffect(() => {
        fetchAppointments();
    }, [user]);


  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab label="In coming" {...a11yProps(0)} />
          <Tab label="Out going" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <div className="flex flex-row flex-wrap gap-4">
        {incomingAppointments.map((appointment,index) =>(
            <IncomingAppointmentCard appointment={appointment} fetchAppointments={fetchAppointments} key={index}/>
        ))}
        </div>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <div className="flex flex-row flex-wrap gap-4">
          {outgoingAppointments.map((appointment,index) => (
            <OutgoingAppointmentCard appointment={appointment} fetchAppointments={fetchAppointments} key={index}/>
          ))}
        </div>
      </CustomTabPanel>
    </Box>
  );
};
export default Appointments;
