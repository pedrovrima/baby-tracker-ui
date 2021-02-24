import { SLEEP_CHANGED, SleepTimes, createSleep } from "../../graphql";
import {
  useQuery,
  useMutation,
  useSubscription,
  NetworkStatus,
} from "@apollo/client";
import React, { useState, useEffect } from "react";
import { ReactComponent as Loader } from "../../assets/loading.svg";

function TimeButton() {
  const sub = useSubscription(SLEEP_CHANGED);
  const { loading, error, data, refetch, networkStatus } = useQuery(
    SleepTimes,
    { pollInterval: 30000, notifyOnNetworkStatusChange: true }
  );
  const [createSleepHook, { slp_data }] = useMutation(createSleep);
  const [sleepObj, setSleepObj] = useState({
    type: "",
    last_load: new Date(0),
  });

  const [actionTime, setActionTime] = useState("");

  const addHour = (time) => time + 3600000;
  const removeHour = (time) => time - 3600000;
  const addMinutes = (time, minutes) => time + 60000 * minutes;
  const removeMinutes = (time, minutes) => time - 60000 * minutes;

  useEffect(() => {
    if (!loading) {
      if (sub.data) {
        setSleepObj({ ...sub.data.sleepChanged, last_load: new Date() });
      } else {
        if (data.sleeps) {
          setSleepObj({
            ...data.sleeps[data.sleeps.length - 1],
            last_load: new Date(),
          });
          console.log(TimeCalculator(data.sleeps));
        }
      }
    }
  }, [data, sub.data]);

  return (
    <>
      {sleepObj.type === "" ? (
        <div className="container container-blue">
          <Loader></Loader>
        </div>
      ) : (
        <div
          className={`${
            sleepObj.type === "start" ? "container-blue" : "container-green"
          } container`}
        >
          <h1>
            {" "}
            Morena está {sleepObj.type === "start" ? "dormindo" : "acordada"}
          </h1>
          <h3> desde as {createTimeString(new Date(sleepObj.time))}</h3>
          <div className="button-grid">
            <div className={`set-time-flex ${actionTime ? "" : "hidden"}`}>
              <button
                className="change-time-button"
                onClick={() => setActionTime(addHour(actionTime))}
              >
                +
              </button>
              <button
                className="change-time-button"
                onClick={() => setActionTime(removeHour(actionTime))}
              >
                -
              </button>
            </div>
            <div className="central-button-flex">
              <button
                className="but"
                onClick={(e) => {
                  createSleepHook({
                    variables: {
                      time: actionTime ? actionTime : Date.now(),
                      type: sleepObj.type === "start" ? "end" : "start",
                    },
                  }).then((res) =>
                    setSleepObj({
                      ...res.data.createSleep,
                      last_load: new Date(),
                    })
                  );

                  e.target.blur();
                }}
              >
                <h1>{sleepObj.type === "start" ? "Acordou" : "Dormiu"} </h1>
                <h3>
                  {actionTime
                    ? createTimeString(new Date(actionTime))
                    : "Agora"}
                </h3>
              </button>
            </div>

            <div className={`set-time-flex ${actionTime ? "" : "hidden"}`}>
              <button
                className="change-time-button"
                onClick={() => setActionTime(addMinutes(actionTime, 1))}
              >
                +
              </button>
              <button
                className="change-time-button"
                onClick={() => setActionTime(removeMinutes(actionTime, 1))}
              >
                -
              </button>
            </div>
          </div>
          <button
            className="other-time-button"
            style={{ cursor: "pointer" }}
            onClick={(e) => {
              actionTime ? setActionTime("") : setActionTime(Date.now());
            }}
          >
            {actionTime ? "Cancelar" : "Outro horário?"}
          </button>

          {networkStatus === NetworkStatus.ready ? (
            <button
              className="update_button"
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                setSleepObj({ ...sleepObj, last_load: new Date() });
                refetch();
              }}
            >
              Atualizado as {createTimeString(sleepObj.last_load)}
            </button>
          ) : (
            <Loader className="loader"></Loader>
          )}
        </div>
      )}
    </>
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

function addZero(number) {
  return `${number}`;
}

function createTimeString(date) {
  const minutes = date.getMinutes();
  // console.log(minutes);
  const hours = date.getHours();
  return `${hours}:${minutes > 9 ? "" : "0"}${minutes}`;
}

export default TimeButton;
