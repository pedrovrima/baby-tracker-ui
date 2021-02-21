import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// import App from "./App";
import reportWebVitals from "./reportWebVitals";
import Times from "./components/time-button/time-button"
import {
  ApolloProvider,
} from "@apollo/client";

import {client} from "./graphql"
console.log("here");
// 4
ReactDOM.render(
  <ApolloProvider client={client}>
    <Times />
  </ApolloProvider>,
  document.getElementById("root")
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
serviceWorkerRegistration.register();
