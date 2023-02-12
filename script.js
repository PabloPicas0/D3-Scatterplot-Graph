"use strict";

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

//Dimensions for graph
const w = 900;
const h = 600;
const padding = 60;

const innerWidth = -w + padding * 2;
const innerheight = 480;

const svg = d3.select("body").append("svg").attr("width", w).attr("height", h);

const req = new XMLHttpRequest();
const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";
req.open("GET", url, true);
req.send();
req.onload = () => {
  const json = JSON.parse(req.responseText);
  drawChart(json);
};

function drawChart(dataset) {
  const newDataset = dataset.map((elem) => {
    const time = elem.Time.split(":"); //split time string
    const minutes = Number(time[0]); //first element in array is minutes we need convert it to number
    const seconds = Number(time[1]); //second element in array is seconds we do the same

    const date = new Date("August 19, 1975 23:15:30");
    date.setMinutes(minutes);
    date.setSeconds(seconds);

    return { ...elem, newTime: date };
  });
  //x lowest and highest values
  const xMin = d3.min(newDataset, (d) => d.Year - 1);
  const xMax = d3.max(newDataset, (d) => d.Year + 1);

  //y lowest time and max time
  const yMin = d3.min(newDataset, (d) => d.newTime);
  const yMax = new Date("August 19, 1975 23:40:00");

  //x scale and axis
  const xScale = d3
    .scaleLinear()
    .domain([xMin, xMax])
    .range([padding, w - padding]);
  const xAxis = d3
    .axisBottom(xScale)
    .tickFormat((x) => `${Math.floor(x)}`)
    .tickSize(-innerheight);

  //y scale and axis
  const yScale = d3
    .scaleTime()
    .domain([yMax, yMin])
    .range([h - padding, padding]);
  const timeFormat = d3.timeFormat("%M:%S");
  const yAxis = d3.axisLeft(yScale).tickFormat(timeFormat).tickSize(innerWidth);

  //Inner g content element
  const content = d3
    .select("svg")
    .append("g")
    .attr("transform", `translate(${padding / 2}, 0)`);

  //Title
  content.append("text").attr("x", 0).attr("y", 20).attr("id", "title").text("Doping in Professional Bicycle Racing");
  content.append("text").attr("x", 0).attr("y", 40).text("35 Fastest times up Alpe d'Huez");

  //x and y Axis
  content
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${h - padding})`)
    .call(xAxis);

  content
    .append("g")
    .attr("id", "y-axis")
    .attr("transform", `translate(${padding}, 0)`)
    .call(yAxis)
    .call((g) => g.selectAll(".tick text").attr("x", -10));

  content
    .selectAll("circle")
    .data(newDataset)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(d.Year))
    .attr("cy", (d) => yScale(d.newTime))
    .attr("r", 5)
    .attr("class", "dot")
    .attr("data-xvalue", (d) => d.Year)
    .attr("data-yvalue", (d) => d.newTime)
    .style("fill", (d) => {
        if(d.Doping !== "") {
            return "red"
        }
        return "navy"
    })

  console.log(newDataset, yMin);
}
