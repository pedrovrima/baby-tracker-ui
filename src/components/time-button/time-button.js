import {SLEEP_CHANGED,SleepTimes,createSleep} from "../../graphql"
import {useQuery,useMutation, useSubscription} from "@apollo/client"
import React,{useState,useEffect} from "react"


function TimeButton() {
    const sub = useSubscription(SLEEP_CHANGED);
    const { loading, error, data, refetch } = useQuery(SleepTimes,{pollInterval:300});
    const [createSleepHook, { slp_data }] = useMutation(createSleep);
    const [sleepObj, setSleepObj] = useState({ type: "", last_load: new Date(0)});
  
    useEffect(() => {
      if (!loading) {
        if (sub.data) {
          setSleepObj({...sub.data.sleepChanged,last_load: new Date()});
        } else {
          if (data.sleeps) {
              
            setSleepObj({...data.sleeps[data.sleeps.length - 1],last_load:new Date()});
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
        <h3> desde as {createTimeString(new Date(sleepObj.time))}</h3>
        <button
          className="but"
          onClick={(e) => {
            createSleepHook({
              variables: {
                time: Date.now(),
                type: sleepObj.type === "start" ? "end" : "start",
              },
            }).then(res=>setSleepObj({...res.data.createSleep,last_load: new Date()}));
  
            e.target.blur();
          }}
        >
          {sleepObj.type === "start" ? "Acordou" : "Dormiu"}
        </button>

        <a style={{cursor:"pointer"}} onClick={(e) => {console.log("ref");refetch()}}>Atualizado as {createTimeString(sleepObj.last_load)}</a>

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



function addZero(number) {
    return `${number}`;
  }
  
  function createTimeString(date) {
    const minutes = date.getMinutes();
    // console.log(minutes);
    const hours = date.getHours();
    return `${hours}:${minutes > 9 ? "" : "0"}${minutes}`;
  }
  

export default TimeButton
