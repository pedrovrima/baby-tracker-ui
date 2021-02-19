import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./index.css";
// import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";

import {
  gql,
  split,
  ApolloProvider,
  ApolloClient,
  useQuery,
  ApolloLink,
  useSubscription,
  HttpLink,
  InMemoryCache,
  useMutation,
} from "@apollo/client";

// 3
const httpLink = new HttpLink({
  uri: "https://sono-morena.herokuapp.com/graphql",
});

const wsLink = new WebSocketLink({
  uri: "ws://sono-morena.herokuapp.com/graphql",
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([splitLink]),
});

const SleepTimes = gql`
  query getSleep {
    sleeps {
      time
      type
    }
  }
`;

const SLEEP_CHANGED = gql`
  subscription Sub {
    sleepChanged {
      time
      type
    }
  }
`;

// function NumberInv() {
//   const {
//     data,
//     loading,
//   } = useSubscription(SLEEP_CHANGED);
//   console.log(data)
//   if(!loading){
//   return <h4>New comment: {data.sleepChanged.time} </h4>;}else{
//     return ""
//   }

const createSleep = gql(`
mutation  createSleep($time:DateTime!, $type:String!){
        createSleep(time:$time,  type:$type){
   time
}}`);

console.log("here");
// 4
ReactDOM.render(
  <ApolloProvider client={client}>
    <Times />
  </ApolloProvider>,
  document.getElementById("root")
);

function addZero(number) {
  return `${number}`;
}

function createTimeString(date) {
  const minutes = date.getMinutes();
  // console.log(minutes);
  const hours = date.getHours();
  return `${hours}:${minutes > 9 ? "" : "0"}${minutes}`;
}

function Times() {
  const sub = useSubscription(SLEEP_CHANGED);
  const { loading, error, data } = useQuery(SleepTimes);
  const [createSleepHook, { slp_data }] = useMutation(createSleep);
  const [sleepObj, setSleepObj] = useState({ type: "" });

  useEffect(() => {
    if (!loading) {
      if (sub.data) {
        setSleepObj(sub.data.sleepChanged);
      } else {
        if (data.sleeps) {
          setSleepObj(data.sleeps[data.sleeps.length - 1]);
          console.log(TimeCalculator(data.sleeps));
        }
      }
    }
  }, [data, sub.data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;
  // function displayTime() {
  //   let date = new Date();
  //   let time = date.toLocaleTimeString();
  //   console.log(time);
  // }

  // const createClock = setInterval(displayTime, 1000);
  return (
    <div
      className={`${
        sleepObj.type === "start" ? "container-blue" : "container-green"
      } container`}
    >
      <h1>
        {" "}
        Morena está {sleepObj.type === "start" ? "dormindo" : "acordada"}
      </h1>
      <h3>
        {" "}
desde as{" "}
        {createTimeString(new Date(sleepObj.time))}
      </h3>

      <button
        className="but"
        onClick={(e) => {
          createSleepHook({
            variables: {
              time: Date.now(),
              type: sleepObj.type === "start" ? "end" : "start",
            },
          });

          e.target.blur()
        }}
      >
        {sleepObj.type === "start" ? "Acordou" : "Dormiu"}
      </button>
      {/* <NumberInv></NumberInv> */}
    </div>
  );
}

const TimeCalculator = (time_array) => {
  time_array.reduce(
    (accum, time, i) => {
      console.log(accum);
      if (i > 0) {
        const this_time = time.time - time_array[i - 1].time;
        if (time.type === "end") {
          return { ...accum, asleep: accum.asleep + this_time };
        } else {
          return { ...accum, awake: accum.awake + this_time };
        }
      } else {
        return accum;
      }
    },
    { awake: 0, asleep: 0 }
  );
};
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
