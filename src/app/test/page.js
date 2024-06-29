"use client"
import { useEffect } from "react";
import React from "react";
const Test= () => {
    useEffect(() => {
        const fetch=()=>{
            console.log("fetching")
        }
        fetch();
        return () => fetch();
    }, []); // eslint-disable-line
    return (
        <div>
            <h1>Test</h1>
        </div>
    );
};

export default Test;