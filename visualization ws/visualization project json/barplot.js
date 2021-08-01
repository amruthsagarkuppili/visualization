// set the dimensions and margins of the graph
var margin = { top: 60, right: 30, bottom: 70, left: 100 },
    width = 645 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var flag = 0;

// append the svg object to the body of the page
var svg = d3.select("#barplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Initialize the X axis
var x = d3.scaleBand()
    .range([0, width])
    .padding(0.2);
var xAxis = svg.append("g")
    .attr("transform", "translate(0," + height + ")")

// Initialize the Y axis
var y = d3.scaleLinear()
    .range([height, 0]);
var yAxis = svg.append("g")
    .attr("class", "myYaxis")

var defsbar = vis.append("defs");
var filterbar = defs.append("filter")
    .attr("id", "drop-shadow-bar")
    .attr("height", "200%");

filterbar.append("feGaussianBlur")
    .attr("in", "SourceAlpha")
    .attr("stdDeviation", 2)
    .attr("result", "blur");

filterbar.append("feOffset")
    .attr("in", "blur")
    .attr("dx", 3)
    .attr("dy", 3)
    .attr("result", "offsetBlur");
var feMergebar = filterbar.append("feMerge");

feMergebar.append("feMergeNode")
    .attr("in", "offsetBlur")
feMergebar.append("feMergeNode")
    .attr("in", "SourceGraphic");



var defsbartool = vis.append("defs");
var filterbartool = defsbartool.append("filter")
    .attr("id", "drop-shadow-tool")
    .attr("height", "200%");

filterbartool.append("feGaussianBlur")
    .attr("in", "SourceAlpha")
    .attr("stdDeviation", 5)
    .attr("result", "blur");

filterbartool.append("feOffset")
    .attr("in", "blur")
    .attr("dx", 6)
    .attr("dy", 6)
    .attr("result", "offsetBlur");
var feMergebartool = filterbartool.append("feMerge");

feMergebartool.append("feMergeNode")
    .attr("in", "offsetBlur")
feMergebartool.append("feMergeNode")
    .attr("in", "SourceGraphic");


var tooltip = d3.select("body").append("div").attr("class", "toolTip");

// A function that create / update the plot for a given variable:
function update(selectedVar) {

    d3.selectAll(".barsplot")
        .on("mousemove", "")
        .on("mouseout", "")
        .on("mouseover", "")

    // Parse the Data
    d3.csv("sales_bar.csv", function (data) {

        // X axis
        x.domain(data.map(function (d) { return d.group; }))
        xAxis.transition().duration(1000).call(d3.axisBottom(x))

        // Add Y axis
        y.domain([0, d3.max(data, function (d) { return +d[selectedVar] })]);
        yAxis.transition().duration(1000).call(d3.axisLeft(y));

        // variable u: map data to existing bars
        var u = svg.selectAll("rect")
            .data(data)

        // update bars
        u
            .enter()
            .append("rect")
            .attr("class", "barsplot")
            .merge(u)
            .transition()
            .duration(1000)
            .attr("x", function (d) { return x(d.group); })
            .attr("y", function (d) { return y(d[selectedVar]); })
            .attr("width", x.bandwidth())
            .attr("height", function (d) { return height - y(d[selectedVar]); })
            .attr("fill", "#A2D9CE")
            .on("end", function (d) {
                d3.selectAll(".barsplot")
                    .on("mousemove", function (d) {
                        d3.select(this)
                            .style("filter", "url(#drop-shadow-bar)")
                            .attr("fill", "#17A589")
                            
                        tooltip
                            .style("left", d3.event.pageX - 50 + "px")
                            .style("top", d3.event.pageY - 70 + "px")
                            .style("display", "inline-block")
                            .style("border-radius", "10px")
                            .style("background-color", "#F8F9F9")
                            // .style("color","#fff")
                            .style("filter", "url(#drop-shadow-tool)")
                            .html("<b>Consumer Price Index<br>" + d[selectedVar] + "</b>");
                    })
                    .on("mouseout", function (d) {
                        d3.select(this)
                            .transition()
                            .duration(500)
                            .attr("fill", "#A2D9CE")
                            .style("filter", "")
                        tooltip.style("display", "none");

                    })
            })





    })



}

// Initialize plot

update('var1')

