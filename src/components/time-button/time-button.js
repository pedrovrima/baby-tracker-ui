import { SLEEP_CHANGED, SleepTimes, createSleep } from "../../graphql";
import {
  useQuery,
  useMutation,
  useSubscription,
  NetworkStatus,
} from "@apollo/client";
import React, { useState, useEffect } from "react";
import { ReactComponent as Loader } from "../../assets/loading.svg";

import plotFunc from "../plot/plot_function"

const createDate = (time) => {
  const date = new Date(time);
  return date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
};

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
          console.log(createTimeSeries(data.sleeps))
          plotFunc(createTimeSeries(data.sleeps),".plot");
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
          <button
            className="but"
            onClick={(e) => {
              createSleepHook({
                variables: {
                  time: Date.now(),
                  type: sleepObj.type === "start" ? "end" : "start",
                },
              }).then((res) =>
                setSleepObj({ ...res.data.createSleep, last_load: new Date() })
              );

              e.target.blur();
            }}
          >
            {sleepObj.type === "start" ? "Acordou" : "Dormiu"}
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
            <div className="plot" id="plot"></div>

        </div>
      )}
    </>
  );
}

const TimeCalculator = (time_array) => {
  return time_array.reduce(
    (accum, time, i) => {
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
    // 10800000 = 3 hours (to account for Timezone)
    { awake: 10800000, asleep: 10800000 }
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

function createTimeSeries(sleeps) {
  let sorted_sleeps = [...sleeps];
  let arr = sorted_sleeps.sort((a, b) => a.time - b.time);

  const series = sorted_sleeps.reduce(
    (cont, sleep, i) => {
      if (i === 0) {
        const new_cont = [createNewDay(sleep)];
        return new_cont;
      } else {
        if (createDate(sleep.time) === cont[cont.length - 1].date) {
          const new_cont = cont;
          new_cont[cont.length - 1].sleeps = [
            ...new_cont[cont.length - 1].sleeps,
            sleep,
          ];
          return new_cont;
        } else {
          const last_day = {
            ...cont[cont.length - 1],
            endType: sleep.type,
            endTime: new Date(cont[cont.length - 1].date + " 23:59"),
            sleepCount: TimeCalculator([
              {
                type: cont[cont.length - 1].startType,
                time: cont[cont.length - 1].startTime.getTime(),
              },
              ...cont[cont.length - 1].sleeps,
              {
                type: sleep.type,
                time: new Date(cont[cont.length - 1].date + " 23:59").getTime(),
              },
            ]),
          };
          const new_cont = [...cont, createNewDay(sleep)];
          new_cont[cont.length - 1] = last_day;
          return new_cont;
        }
      }
    },

    []
  );
  return series;
}

function createNewDay(sleep) {
  return {
    date: createDate(sleep.time),
    sleeps: [sleep],
    startType: sleep.type === "start" ? "end" : "start",
    startTime: new Date(createDate(sleep.time) + " 00:00"),
  };
}



console.log(createNewDay({ time: new Date(), type: "start" }));

export default TimeButton;
