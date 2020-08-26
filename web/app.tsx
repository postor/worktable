import React from "react";
import ReactDOM from "react-dom";
import Index from './Index';

const wrapper = document.getElementById("app");

// eslint-disable-next-line
wrapper ? ReactDOM.render(<Index />, wrapper) : false;
