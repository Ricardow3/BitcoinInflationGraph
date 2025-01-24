import { init } from './APIRest.js';

// set the dimensions and margins of the graph
var margin = {top: 20, right: 50, bottom: 80, left: 100};
let width = window.innerWidth - margin.left - margin.right;
let height = window.innerHeight - margin.top - margin.bottom;

const main = async () => {
  const blockData = await init(); // Wait for the `block` JSON to be returned
  console.log("BLOCKDATA:", JSON.stringify(blockData, undefined, 2)); // Logs: { blockTipHeight: ..., date: ... }

//Read the data
d3.csv("data/btc_inflation.csv",

  // Now I can use this dataset:
  function(data) {
    // append the svg object to the body of the page
    var svg = d3.select("#my_dataviz")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // append div text element
    var myDataViz = document.getElementById("my_dataviz")
    var divText = document.createElement("div")
    myDataViz.appendChild(divText)
    divText.setAttribute("id", "div-text")
    var blockText = divText.appendChild(document.createElement("p"))
    var inflationText = divText.appendChild(document.createElement("p"))
    divText.style.position = "absolute"

    // current inflation rectangle
    var divInflation = document.createElement("div")
    myDataViz.appendChild(divInflation)
    divInflation.classList.add("current-inflation")
    divInflation.style.position = "absolute";
    divInflation.style.right = "150px"; divInflation.style.top = "50px";
    divInflation.style.backgroundColor = "snow";
    divInflation.style.padding = "10px"; divInflation.style.borderRadius = "5px";
    divInflation.style.textAlign = "center";

    var t1 = document.createElement("p")
    t1.textContent = "Current Inflation:"; t1.style.fontSize = "18px"; t1.style.margin = "0";
    var t3 = document.createElement("p")
    t3.textContent = `Block tip height: ${blockData.blockTipHeight}`; t3.style.color = "dimgrey";
    t3.style.fontSize = "15px"; t3.style.margin = "5px 0";
    var t4 = document.createElement("p")
    t4.textContent = blockData.date; t4.style.color = "dimgrey";
    t4.style.fontSize = "10px"; t4.style.margin = "5px 0";
    
    // current inflation based on most recent block of data
    const arrayBlocks = data.map(x => x.blockNumber)
    var mostRecentBlock = findClosestValue(arrayBlocks, blockData.blockTipHeight)
    var currentInf = data.find(d => d.blockNumber === mostRecentBlock)
    var t2 = document.createElement("p")
    t2.textContent = `${currentInf.annualInflationRate}%`; t2.style.fontSize = "30px"; t2.style.bold = "bold"; t2.style.margin = "5px 0";
    
    divInflation.appendChild(t1);
    divInflation.appendChild(t2);
    divInflation.appendChild(t3);
    divInflation.appendChild(t4);

    // Add background color
    svg.append("rect")
      .attr("class", "rect-color")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#eef7f8")

    // Add X axis
    console.log("Width:", width);
    console.log("x0:", data[0].blockNumber)
    console.log("xf:", data[data.length - 1].blockNumber)

    var x = d3.scaleLinear()
      .domain([Number(data[0].blockNumber), Number(data[data.length - 1].blockNumber)])
      .range([ 0, width ])
      //.nice();
    var xAxis = svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    console.log("domain: ", x.domain());

    // Add Y axis
    var y = d3.scaleLog()
      .domain([data[0].annualInflationRate, data[data.length - 1].annualInflationRate])
      .range([ 0, height ])
      .nice();
    // Change y format
    //let axis = y.tickFormat(10, ",.0f") // d3.format(",.0f")
    //let ticks = y.ticks(50)
    // console.log(ticks.map(axis))
    // let logAxis = d3.axisLeft(y)
    // Custom tick format to display as [1, 2, 3, 10...]
    var logAxis = d3.axisLeft(y)
    .tickValues([1, 2, 3, 4, 5, 10, 20, 50, 100, 500, 1000, 10000, 100000, 500000, 1000000]) // Adjust the y-ticks
    .tickFormat(d => d);
    var yAxis = svg.append("g")
      .call(logAxis); // d3.axisLeft(y)
    
    
    var lineZoom = svg.append('g')
    .attr("clip-path", "url(#clip)")

    // Add the area
    var halving1 = []
    for(let i=0; i<=410; i++) {
        halving1.push(data[i])
      }
    var halving2 = []
    for(let i=410; i<=910; i++) {
      halving2.push(data[i])
    }
    var halving3 = []
    for(let i=910; i<=1410; i++) { // change limit to i<=1410 with next halving era
      halving3.push(data[i])
    }
    var halving4 = []
    for(let i=1410; i<=1910; i++) {
      halving4.push(data[i])
    }
    var halving5 = []
    for(let i=1910; i<2410; i++) {
      halving5.push(data[i])
    }

    // Add halving era colors
    lineZoom.append("path")
    .data([halving1])
    .attr("class", "era1")
    .attr("fill", "#69b3a2")
    .attr("fill-opacity", .9)
    .attr("stroke", "none")
    .attr("d", d3.area()
      .x(function(d) { return x(d.blockNumber) })
      .y0( height )
      .y1(function(d) { return y(d.annualInflationRate) })
      )
    lineZoom.append("path")
    .data([halving2])
    .attr("class", "era2")
    .attr("fill", "#efadad")
    .attr("fill-opacity", .9)
    .attr("stroke", "none")
    .attr("d", d3.area()
      .x(function(d) { return x(d.blockNumber) })
      .y0( height )
      .y1(function(d) { return y(d.annualInflationRate) })
      )
    lineZoom.append("path")
    .data([halving3])
    .attr("class", "era3")
    .attr("fill", "#f0df35")
    .attr("fill-opacity", .9)
    .attr("stroke", "none")
    .attr("d", d3.area()
      .x(function(d) { return x(d.blockNumber) })
      .y0( height )
      .y1(function(d) { return y(d.annualInflationRate) })
      )
    lineZoom.append("path")
    .data([halving4])
    .attr("class", "era4")
    .attr("fill", "#8aa4e2")
    .attr("fill-opacity", .9)
    .attr("stroke", "none")
    .attr("d", d3.area()
      .x(function(d) { return x(d.blockNumber) })
      .y0( height )
      .y1(function(d) { return y(d.annualInflationRate) })
      )
    lineZoom.append("path")
    .data([halving5])
    .attr("class", "era5")
    .attr("fill", "#d884d8")
    .attr("fill-opacity", .9)
    .attr("stroke", "none")
    .attr("d", d3.area()
      .x(function(d) { return x(d.blockNumber) })
      .y0( height )
      .y1(function(d) { return y(d.annualInflationRate) })
      )
    
    // Add a clipPath: everything out of this area won't be drawn.
    var clip = svg.append("defs").append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", width )
    .attr("height", height )
    .attr("x", 0)
    .attr("y", 0);
    
    // Add brushing
    const brush = d3.brushX()
      .extent([ [0,0], [width,height] ])
      .on("end", updateChart)
    
    // Add the line
    var blueLine = lineZoom.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x(d.blockNumber) })
        .y(function(d) { return y(d.annualInflationRate) })
        )
    // Add the circles
    const filteredData = []
    for (let i=0; i<data.length; i=i+10) {
      filteredData.push({ blockNumber: data[i].blockNumber, annualInflationRate: data[i].annualInflationRate })
    }
    // var filteredData = data.slice(0, 10);
    lineZoom.selectAll("circle")
    .data(filteredData)
    .enter()
    .append("circle")
      .attr("fill", "rgb(255,255,255,0.5")
      .attr("stroke", "black")
      .attr("cx", function(d) { return x(d.blockNumber) })
      .attr("cy", function(d) { return y(d.annualInflationRate) })
      .attr("r", 3)
    
    // Add text info.
    var textHalv1 = {
      x: x(210000),
      y: y(33.38 * 1.5)-10
    }
    var textHalving1 = lineZoom.append('g')
    .attr("class", "textHalv1")
    .append("text") // add a text element inside group
    .attr("x", textHalv1.x)
    .attr("y", textHalv1.y)
    .attr("text-anchor", "middle")
    .attr("fill", "black")
    .attr("font-size", "12px")
    .style("font-family", "'Roboto Condensed', serif") //  google font
    .selectAll("tspan") // add multiple <tspan> elements
    .data([
      `1st Halving: Block 210,000`,
      "(November 28, 2012)"
    ])
    .enter()
    .append("tspan")
    .attr("x", textHalv1.x) // keep the same x for all lines
    .attr("dy", (d, i) => i * 15) // offset each line vertically by 15px
    .text(d => d)

    var textHalv2 = {
      x: x(420000),
      y: y(9.12 * 1.5)-10
    }
    var textHalving2 = lineZoom.append('g')
    .attr("class", "textHalv2")
    .append("text") // add a text element inside group
    .attr("x", textHalv2.x)
    .attr("y", textHalv2.y) // Add manually
    .attr("text-anchor", "middle")
    .attr("fill", "black")
    .attr("font-size", "12px")
    .style("font-family", "'Roboto Condensed', serif") //  google font
    .selectAll("tspan") // add multiple <tspan> elements
    .data([
      `2nd Halving: Block 420,000`,
      "(July 09, 2016)"
    ])
    .enter()
    .append("tspan")
    .attr("x", textHalv2.x) // keep the same x for all lines
    .attr("dy", (d, i) => i * 15) // offset each line vertically by 15px
    .text(d => d)

    var textHalv3 = {
      x: x(630000),
      y: y(3.71 * 1.5)-10
    }
    var textHalving3 = lineZoom.append('g')
    .attr("class", "textHalv3")
    .append("text") // add a text element inside group
    .attr("x", textHalv3.x)
    .attr("y", textHalv3.y) // Add manually
    .attr("text-anchor", "middle")
    .attr("fill", "black")
    .attr("font-size", "12px")
    .style("font-family", "'Roboto Condensed', serif") //  google font
    .selectAll("tspan") // add multiple <tspan> elements
    .data([
      `3rd Halving: Block 630,000`,
      "(May 11, 2020)"
    ])
    .enter()
    .append("tspan")
    .attr("x", textHalv3.x) // keep the same x for all lines
    .attr("dy", (d, i) => i * 15) // offset each line vertically by 15px
    .text(d => d)

    var textHalv4 = {
      x: x(840000),
      y: y(1.68 * 1.5)-10
    }
    var textHalving4 = lineZoom.append('g')
    .attr("class", "textHalv4")
    .append("text") // add a text element inside group
    .attr("x", textHalv4.x)
    .attr("y", textHalv4.y) // Add manually
    .attr("text-anchor", "middle")
    .attr("fill", "black")
    .attr("font-size", "12px")
    .style("font-family", "'Roboto Condensed', serif") //  google font
    .selectAll("tspan") // add multiple <tspan> elements
    .data([
      `4th Halving: Block 840,000`,
      "(April 19, 2024)"
    ])
    .enter()
    .append("tspan")
    .attr("x", textHalv4.x) // keep the same x for all lines
    .attr("dy", (d, i) => i * 15) // offset each line vertically by 15px
    .text(d => d)

    
    // function returnValues(x) { return data.map(x => x.blockNumber) };
    // const values = returnValues(data);
    // console.log(values);

    // A function that set idleTimeOut to null
    var idleTimeout
    function idled() { idleTimeout = null; }


    function updateChart() {

      const extent = d3.event.selection

      let x0, x1;
      // If no selection, back to initial coordinate. Otherwise, update X axis domain
      if(!extent){
        if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
        x.domain([Number(data[0].blockNumber), Number(data[data.length - 1].blockNumber)])//.nice()
        y.domain([data[0].annualInflationRate, data[data.length - 1].annualInflationRate]).nice()

        logAxis.tickValues([1, 2, 3, 4, 5, 10, 20, 50, 100, 500, 1000, 10000, 100000, 500000, 1000000]) // Adjust the y-ticks
        
      } else{
        x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
        x0 = x.domain()[0]
        x1 = x.domain()[1]
        let arrayBlocks = data.map(x => x.blockNumber)
        x0 = findClosestValue(arrayBlocks, x0)
        x1 = findClosestValue(arrayBlocks, x1)
        // y.domain([ y.invert(extent[0]), y.invert(extent[1]) ])
        lineZoom.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
        let ix0 = arrayBlocks.indexOf(x0), ix1 = arrayBlocks.indexOf(x1)
        console.log("NEW DOMAIN: ", data[ix0].annualInflationRate, data[ix1].annualInflationRate)
        let y0 = data[ix0].annualInflationRate, y1 = data[ix1].annualInflationRate
        y.domain([ y0, y1 ])
        console.log(x0, x1)
        console.log(x.range(), y.range())

        console.log("NEW DOMAIN: ", y.domain())
        function range(start, end, step = 1) {
          const result = [];
          const precision = Math.pow(10, 10); // Adjust precision to avoid floating-point errors
          for (let i = start; i < end; i += step) {
              result.push(Math.round(i * precision) / precision);
          }
          return result;
      }      
        const zoomTickValues = [
          ...range(0, 2, 0.1),
          ...range(2, 20, 1),
          ...range(20, 100, 10),
          ...range(100, 1000, 100),
          ...[1000, 5000, 10000, 50000, 100000, 500000]
        ];
        console.log("ZOOMTICKS: ", zoomTickValues)

        var newTicks = zoomTickValues.filter(d => d >= y1 && d <= y0)
        console.log("NEW TICKS: ", newTicks)

        logAxis.tickValues(newTicks) // Adjust the y-ticks
      }

      // Update axis and circle position
      xAxis.transition().duration(500).call(d3.axisBottom(x))
      yAxis.transition().duration(500).call(logAxis.scale(y))

      lineZoom
        .selectAll("circle")
        .data(filteredData)
        .transition().duration(500)
        .attr("cx", function(d) { return x(d.blockNumber) })
        .attr("cy", function(d) { return y(d.annualInflationRate) })
      lineZoom
        .select(".line")
        .transition().duration(500)
        .attr("d", d3.line()
          .x(function(d) { return x(d.blockNumber) })
          .y(function(d) { return y(d.annualInflationRate) })
        )

      // Update era halving areas
      lineZoom
        .select(".era1")
        .transition().duration(500)
        .attr("d", d3.area()
          .x(function(d) { return x(d.blockNumber) })
          .y0( height )
          .y1(function(d) { return y(d.annualInflationRate) })
          )
      lineZoom
        .select(".era2")
        .transition().duration(500)
        .attr("d", d3.area()
          .x(function(d) { return x(d.blockNumber) })
          .y0( height )
          .y1(function(d) { return y(d.annualInflationRate) })
          )
      lineZoom
        .select(".era3")
        .transition().duration(500)
        .attr("d", d3.area()
          .x(function(d) { return x(d.blockNumber) })
          .y0( height )
          .y1(function(d) { return y(d.annualInflationRate) })
          )
      lineZoom
        .select(".era4")
        .transition().duration(500)
        .attr("d", d3.area()
          .x(function(d) { return x(d.blockNumber) })
          .y0( height )
          .y1(function(d) { return y(d.annualInflationRate) })
          )
      lineZoom
      .select(".era5")
      .transition().duration(500)
      .attr("d", d3.area()
        .x(function(d) { return x(d.blockNumber) })
        .y0( height )
        .y1(function(d) { return y(d.annualInflationRate) })
        )
      
      // Add text info.
      var textHalv1 = { x: x(210000), y: y(33.38)-height*0.1 } //adjust manually
      lineZoom
      .select(".textHalv1 text") 
      .transition().duration(500)
      .attr("x", textHalv1.x)
      .attr("y", textHalv1.y)
      .selectAll("tspan")
      .attr("x", textHalv1.x)
      
      var textHalv2 = { x: x(420000), y: y(9.12)-height*0.05 } //adjust manually
      lineZoom
      .select(".textHalv2 text") 
      .transition().duration(500)
      .attr("x", textHalv2.x)
      .attr("y", textHalv2.y)
      .selectAll("tspan")
      .attr("x", textHalv2.x)

      var textHalv3 = { x: x(630000), y: y(3.71)-height*0.05 }
      lineZoom
      .select(".textHalv3 text") 
      .transition().duration(500)
      .attr("x", textHalv3.x)
      .attr("y", textHalv3.y)
      .selectAll("tspan")
      .attr("x", textHalv3.x)

      var textHalv4 = {x: x(840000), y: y(1.68)-height*0.05 }
      lineZoom
      .select(".textHalv4 text") 
      .transition().duration(500)
      .attr("x", textHalv4.x)
      .attr("y", textHalv4.y)
      .selectAll("tspan")
      .attr("x", textHalv4.x)

      
      // console.log(extent[0] / width)
      // let indexY = Math.round(data.length * extent[0] / width) // data.length == 1410
      // console.log(indexY)
      // // let updateY = data[indexY].annualInflationRate
      // // console.log(updateY)
          // Add text info.

    }

    // reset zoom chart
    // This function is applied in <g class="brush">
    function resetChart() {
      //reset elements on double-click
      lineZoom.select(".textHalv1 text")
      .transition().duration(500)
      .attr("x", textHalv1.x)
      .attr("y", textHalv1.y)
      .selectAll("tspan")
      .attr("x", textHalv1.x);

      lineZoom.select(".textHalv2 text")
      .transition().duration(500)
      .attr("x", textHalv2.x)
      .attr("y", textHalv2.y)
      .selectAll("tspan")
      .attr("x", textHalv2.x);

      lineZoom.select(".textHalv3 text")
      .transition().duration(500)
      .attr("x", textHalv3.x)
      .attr("y", textHalv3.y)
      .selectAll("tspan")
      .attr("x", textHalv3.x);

      lineZoom.select(".textHalv4 text")
      .transition().duration(500)
      .attr("x", textHalv4.x)
      .attr("y", textHalv4.y)
      .selectAll("tspan")
      .attr("x", textHalv4.x);
  
    }
    

    function findClosestValue(arr, num) {
      let closest = arr[0]; // Initialize closest with the first element
    
      arr.forEach(function(element) {
        const difference = Math.abs(element - num); // Calculate the absolute difference
        
        if (difference < Math.abs(closest - num)) {
          closest = element; // Update closest if a smaller difference is found
        }
      });
    
      return closest;
    }

    const num = 59035
    const closestValue = findClosestValue(arrayBlocks, num); // "arrayBlock" defined away ahead
    console.log(closestValue);
    
    
    console.log(y.domain(), y.range(), y.ticks())
    console.log(x.domain(), x.range(), x.ticks())
    console.log(x.domain()[0])

    // This allows to find the closest X index of the mouse:
    var bisect = d3.bisector(function(d) { return d.blockNumber; }).left;
    
    // Attach brush element along with cursor response functions
    lineZoom
    .append("g")
      .attr("class", "brush")
      .call(brush)
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseout', mouseout);
    
    // Create the circle that travels along the curve of chart
    var focus = lineZoom
    .append('g')
    .append('circle')
      .style("fill", "none")
      .attr("stroke", "black")
      .attr('r', 2)
      .attr("cx", "100")
      .attr("cy", "100")
      .style("opacity", 0)
    

    // Apply zoom out <g class="brush"> element
    svg.select("g.brush")
    .on("dblclick", function() {
      const event = d3.event;
      event.stopPropagation();
      console.log("Double-clicked!");
      resetChart();
    });


    // Create the text that travels along the curve of chart
    // var focusText = lineZoom
    //   .append('g')
    //   .style("opacity", 0)
    // var textBlock = focusText.append('text')
    //   .attr("text-anchor", "left")
    //   .attr("alignment-baseline", "middle")
    // var textInflation = focusText.append('text')
    //   .attr("text-anchor", "left")
    //   .attr("alignment-baseline", "middle")
    

    // What happens when the mouse move -> show the annotations at the right positions.
    function mouseover() {
      focus.style("opacity", 1)
      // focusText.style("opacity",1)
      divText.style.opacity = "1"
    }

    function mousemove() {
      // recover coordinate we need
      var x0 = x.invert(d3.mouse(this)[0]);
      var i = bisect(data, x0, 1);
      var selectedData = data[i]
      var numValueBlock = +selectedData.blockNumber, numValueInflation = +selectedData.annualInflationRate
      focus
        .attr("cx", x(selectedData.blockNumber))
        .attr("cy", y(selectedData.annualInflationRate))
      // textBlock
      //   .html("x:" + numValueBlock.toLocaleString())
      //   .attr("x", x(selectedData.blockNumber)+15)
      //   .attr("y", y(selectedData.annualInflationRate)-50)
      // textInflation
      //   .html("y:" + numValueInflation.toLocaleString())
      //   .attr("x", x(selectedData.blockNumber)+15)
      //   .attr("y", y(selectedData.annualInflationRate)-20)

      // This is the div block that travels along the curve of chart
      blockText.innerHTML = "block number: " + numValueBlock.toLocaleString()
      inflationText.innerHTML = "annual inflation: " + numValueInflation.toLocaleString() + "%"
      divText.style.left = x(selectedData.blockNumber) + margin.left + "px"
      divText.style.top = y(selectedData.annualInflationRate) + margin.top + "px"
      divText.style.transform = "translate(5%,-110%)"
      if(parseInt(divText.style.top) < divText.offsetHeight + 5) {
        divText.style.transform = "translate(5%, 10%)"
      }
      if(document.body.offsetWidth - parseInt(divText.style.left) < divText.offsetWidth + 5) {
        divText.style.transform = "translate(-105%,-110%)"
      }
      }
    function mouseout() {
      focus.style("opacity", 0)
      // focusText.style("opacity", 0)
      divText.style.opacity = "0"
    }
  }
)

};
main();
