// set the dimensions and margins of the graph
var margin = {top: 20, right: 50, bottom: 80, left: 100};
let width = window.innerWidth - margin.left - margin.right;
let height = window.innerHeight - margin.top - margin.bottom;


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

//Read the data
d3.csv("data/btc_inflation.csv",

  // Now I can use this dataset:
  function(data) {
    // Add background color
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#eef7f8")

    // Add X axis
    var x = d3.scaleLinear()
      .domain([data[0].blockNumber, data[data.length - 1].blockNumber])
      .range([ 0, width ])
      .nice();
    var xAxis = svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLog()
      .domain([data[0].annualInflationRate, data[data.length - 1].annualInflationRate])
      .range([ 0, height ])
      .nice();
    // Change y format
    let axis = y.tickFormat(10, ",.0f") // d3.format(",.0f")
    let ticks = y.ticks(50)
    console.log(ticks.map(axis))
    let logAxis = d3.axisLeft(y)
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
    for(let i=910; i<1410; i++) { // change limit to i<=1410 with next halving era
      halving3.push(data[i])
    }

    // Add halving era colors
    lineZoom.append("path")
    .data([halving1])
    .attr("class", "era1")
    .attr("fill", "#69b3a2")
    .attr("fill-opacity", .3)
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
    .attr("fill-opacity", .3)
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
    .attr("fill-opacity", .3)
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
    
    // Add the brushing

    
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
        x.domain([data[0].blockNumber, data[data.length - 1].blockNumber]).nice()
        y.domain([data[0].annualInflationRate, data[data.length - 1].annualInflationRate]).nice()
      }else{
        x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
        x0 = x.domain()[0]
        x1 = x.domain()[1]
        let arrayBlocks = data.map(x => x.blockNumber)
        x0 = findClosestValue(arrayBlocks, x0)
        x1 = findClosestValue(arrayBlocks, x1)
        // y.domain([ y.invert(extent[0]), y.invert(extent[1]) ])
        lineZoom.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
        console.log(extent)
        let ix0 = arrayBlocks.indexOf(x0), ix1 = arrayBlocks.indexOf(x1)
        console.log(data[ix0].annualInflationRate, data[ix1].annualInflationRate)
        let y0 = data[ix0].annualInflationRate, y1 = data[ix1].annualInflationRate
        y.domain([ y0, y1 ])
        console.log(x0, x1)
        console.log(x.range(), y.range())

      }
      // Update axis and circle position
      xAxis.transition().duration(500).call(d3.axisBottom(x))
      yAxis.transition().duration(500).call(d3.axisLeft(y))
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
      
      // console.log(extent[0] / width)
      // let indexY = Math.round(data.length * extent[0] / width) // data.length == 1410
      // console.log(indexY)
      // // let updateY = data[indexY].annualInflationRate
      // // console.log(updateY)

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
    const arrayBlocks = data.map(x => x.blockNumber)
    const num = 59035
    const closestValue = findClosestValue(arrayBlocks, num);
    console.log(closestValue);
    
    
    console.log(y.domain(), y.range(), y.ticks())
    console.log(x.domain(), x.range(), x.ticks())
    console.log(x.domain()[0])
    const foundObj = data.find(obj => obj.annualInflationRate == 54.2)
    console.log(foundObj.blockNumber)

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
      inflationText.innerHTML = "annual inflation: " + numValueInflation.toLocaleString()
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
