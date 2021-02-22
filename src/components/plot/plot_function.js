import * as d3 from "d3";

const plotFunc = (data, div) => {
  console.log("here");
  // set the dimensions and margins of the graph
  var margin = { top: 10, right: 30, bottom: 30, left: 60 },
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3
    .select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //Read the data
  console.log(svg);

  // Add X axis
  var x = d3
    .scaleLinear()
    .domain([0, 86400000])
    .range([0, width]);
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add Y axis
  var y = d3.scaleLinear().domain([0, data.length+2]).range([height, 0]);
  svg.append("g").call(d3.axisLeft(y));

  svg
  .append("g")
  .selectAll("back")
  .data([[0,18000000],[68400000,86400000]

  ])
  .enter()
  .append("rect")
  .attr("x", function (d, i) {
    return x(d[0]);
  })
  .attr("y", function (d, i) {
    return y(data.length+2);
  })
  .attr("width", function (d, i) {
    return x(d[1]-d[0])
  })
  .attr("height", y(0))
  .style("fill","black");



  // Add dots
  data.map((datum, ai) => {
    svg
      .append("g")
      .selectAll("dot")
      .data([
        { time: datum.startTime, type: datum.startType },
        ...datum.sleeps,
        { time: datum.endTime },
      ])
      .enter()
      .append("rect")
      .attr("x", function (d, i) {
        return x(d.time - datum.startTime);
      })
      .attr("y", function (d, i) {
        return y(ai)-10;
      })
      .attr("width", function (d, i) {
        if (i < datum.sleeps.length + 1) {
          console.log(i);
          return (
          x(  [
              { time: datum.startTime },
              ...datum.sleeps,
              { time: datum.endTime },
            ][i + 1].time - d.time)
          );
        }
      })
      .attr("height", 20)
      .style("fill", (d) => (d.type === "start" ? "green" : "red"));
  });
};

export default plotFunc;
