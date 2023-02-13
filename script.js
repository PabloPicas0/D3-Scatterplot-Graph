"use strict";

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

//Dimensions for graph
const w = 900;
const h = 600;
const padding = 60;

const innerWidth = -w + padding * 2;
const innerheight = 480;

const svg = d3.select("body").append("svg").attr("width", w).attr("height", h);

const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";
const req = new XMLHttpRequest();
req.open("GET", url, true);
req.send();
req.onload = () => {
  const json = JSON.parse(req.responseText);
  drawChart(json);
};

const onMouseMove = (event) => {
  const tooltip = d3.select("#tooltip");
  const h3 = d3.select("h3");
  const p = d3.select("p");

  //Data needed for tooltip
  const doping = event.target.__data__.Doping;
  const name = event.target.__data__.Name;
  const nationality = event.target.__data__.Nationality;
  const place = event.target.__data__.Place;
  const time = event.target.__data__.Time;
  const year = event.target.__data__.Year;

  tooltip
    .style("top", `${event.clientY - 30}px`)
    .style("left", `${event.clientX + 20}px`)
    .style("opacity", "0.9")
    .attr("data-year", `${year}`);

  h3.html(`${name}`);
  p.html(
    `Nationality: ${nationality} <br> Year: ${year} <br> Time: ${time} <br> Place: ${place} <br> Allegations: ${
      doping === "" ? "No Allegations" : doping
    }`
  );
};

const onMouseOut = () => {
  const tooltip = d3.select("#tooltip");

  tooltip.style("opacity", "0");
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
    .attr("transform", `translate(${padding / 2}, ${padding / 2})`);

  //main conatiner for legend
  const legend = svg
    .append("g")
    .attr("transform", `translate(${w - padding}, 210)`)
    .attr("id", "legend");

  //legend for no doping
  const noDoping = legend.append("g");
  noDoping.append("circle").attr("r", 10).attr("fill", "navy");
  noDoping.append("text").attr("x", -218).attr("y", 5).text("No doping allegations").style("font-size", "1.3rem").style("fill", "rgb(75, 67, 58)");

  //legend for doping
  const doping = legend.append("g").attr("transform", "translate(0, 40)");
  doping.append("circle").attr("r", 10).attr("fill", "red");
  doping.append("text").attr("x", -233).attr("y", 5).text("With doping allegations").style("font-size", "1.3rem").style("fill", "rgb(75, 67, 58)");

  //Title
  content.append("text").attr("x", 60).attr("y", 10).attr("id", "title").text("Doping in Professional Bicycle Racing");
  content.append("text").attr("x", 60).attr("y", 40).attr("id", "sub-title").text("35 Fastest times up Alpe d'Huez");

  //x and y Axis
  content
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${h - padding})`)
    .call(xAxis);

  const yAxisElement = content
    .append("g")
    .attr("id", "y-axis")
    .attr("transform", `translate(${padding}, 0)`)
    .call(yAxis)
    .call((g) => g.selectAll(".tick text").attr("x", -10));

  yAxisElement.append("text").attr("y", -50).attr("x", -242).attr("transform", `rotate(-90)`).attr("id", "yLabel").text("Time in minutes");

  content
    .selectAll("circle")
    .data(newDataset)
    .enter()
    .append("circle")
    .on("mouseover", onMouseMove)
    .on("mouseout", onMouseOut)
    .attr("cx", (d) => xScale(d.Year))
    .attr("cy", (d) => yScale(d.newTime))
    .attr("r", 10)
    .attr("class", "dot")
    .attr("data-xvalue", (d) => d.Year)
    .attr("data-yvalue", (d) => d.newTime)
    .style("fill", (d) => {
      if (d.Doping !== "") {
        return "red";
      }
      return "navy";
    });
}
