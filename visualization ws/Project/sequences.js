// Dimensions of sunburst.
var width = 625;
var height = 500;
var radius = Math.min(width, height) / 2;

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = {
    w: 100, h: 40, s: 3, t: 10
};

//constructing filter to display when hovered



// Mapping of step names to colors.
var colors = {
    "Store1": "#BB8FCE",
    "Store2": "#48C9B0",
    "Store3": "#D98880",
    "Store4": "#58D68D",
    "Store5": "#F1C40F",
    "Store6": "#F39C12",
    "Store7": "#85C1E9",
    "Store8": "#F1948A",
    "Store9": "#A04000",
    "Store10": "#DC7633",
    "Dept1": "#ABB2B9",
    "Dept2": "#FF6666",
    "Dept3": "#43CEE1",
    "Dept4": "#9AB249",
    "Dept5": "#F7DC6F",
    "2010": "#F0B27A",
    "2011": "#5499C7",
    "2012": "#EB984E",
    "January": "#154360",
    "February": "#CB4335",
    "March": "#117A65",
    "April": "#2980B9",
    "May": "#6C3483",
    "June": "#1B2631",
    "July": "#7E5109",
    "August": "#1E8449",
    "September": "#641E16",
    "October": "#A990D5",
    "November": "#3B867D",
    "December": "#08E1FB"
};

var Lcolors = {
    "Store1": "#BB8FCE",
    "Store2": "#48C9B0",
    "Store3": "#D98880",
    "Store4": "#58D68D",
    "Store5": "#F1C40F",
    "Store6": "#F39C12",
    "Store7": "#85C1E9",
    "Store8": "#F1948A",
    "Store9": "#A04000",
    "Store10": "#DC7633",
    "Dept1": "#ABB2B9",
    "Dept2": "#FF6666",
    "Dept3": "#43CEE1",
    "Dept4": "#9AB249",
    "Dept5": "#F7DC6F",
    "2010": "#F0B27A",
    "2011": "#5499C7",
    "2012": "#EB984E",
    
};

// Total size of all segments; we set this later, after loading the data.
var totalSize = 0;

var vis = d3.select("#chart").append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .append("svg:g")
    .attr("id", "container")
    .attr("transform", "translate( 300," + height / 2 + ")");

var partition = d3.partition()
    .size([2 * Math.PI, radius * radius]);



var defs = vis.append("defs");
var filter = defs.append("filter")
    .attr("id", "drop-shadow")
    .attr("height", "230%");

filter.append("feGaussianBlur")
    .attr("in", "SourceAlpha")
    .attr("stdDeviation", 1)
    .attr("result", "blur");

filter.append("feOffset")
    .attr("in", "blur")
    .attr("dx", 2)
    .attr("dy", 4)
    .attr("result", "offsetBlur");
var feMerge = filter.append("feMerge");

feMerge.append("feMergeNode")
    .attr("in", "offsetBlur")
feMerge.append("feMergeNode")
    .attr("in", "SourceGraphic");





var arc = d3.arc()
    .startAngle(function (d) { return d.x0; })
    .endAngle(function (d) { return d.x1; })
    .innerRadius(function (d) { return Math.sqrt(d.y0); })
    .outerRadius(function (d) { return Math.sqrt(d.y1); });

// Use d3.text and d3.csvParseRows so that we do not need to have a header
// row, and can receive the csv as an array of arrays.
d3.text("sales.csv", function (text) {
    var csv = d3.csvParseRows(text);
    var json = buildHierarchy(csv);
    createVisualization(json);
});

// Main function to draw and set up the visualization, once we have the data.
function createVisualization(json) {

    // Basic setup of page elements.
    initializeBreadcrumbTrail();
    drawLegend();
    d3.select("#togglelegend").on("click", toggleLegend);

    // Bounding circle underneath the sunburst, to make it easier to detect
    // when the mouse leaves the parent g.
    vis.append("svg:circle")
        .attr("r", radius)
        .style("opacity", 0);

    // Turn the data into a d3 hierarchy and calculate the sums.
    var root = d3.hierarchy(json)
        .sum(function (d) { return d.size; })
        .sort(function (a, b) { return b.value - a.value; });


    // For efficiency, filter nodes to keep only those large enough to see.
    var nodes = partition(root).descendants()
        .filter(function (d) {
            return (d.x1 - d.x0 > 0.005); // 0.005 radians = 0.29 degrees
        });

    var path = vis.data([json]).selectAll("path")
        .data(nodes)
        .enter().append("svg:path")
        .attr("id", function (d) {
            // console.log(d.data.name = "2010");
            if (d.data.name == "2010") {
                return "twentyten";
            } else if (d.data.name == "2011") {
                return "twentyeleven";
            } else if (d.data.name == "2012") {
                return "twentytwelve";
            }
            return d.data.name;
        })
        .attr("display", function (d) { return d.depth ? null : "none"; })
        .attr("d", arc)
        .attr("fill-rule", "evenodd")
        .style("fill", function (d) { return colors[d.data.name]; })
        .style("opacity", 0.8)
        .on("mouseover", mouseover)
        .on("mouseleave",function(d){d3.select(this).style("filter", "")})

    // Add the mouseleave handler to the bounding circle.
    d3.select("#container").on("mouseleave", mouseleave);

    // Get total size of the tree = value of root node from partition.
    totalSize = path.datum().value;
};

// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover(d) {

    // var percentage = (100 * d.value / totalSize).toPrecision(3);
    // var percentageString = percentage + "%";
    // if (percentage < 0.1) {
    //     percentageString = "< 0.1%";
    // }

    number = Math.ceil(d.value)
    number = number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    d3.select("#percentage")
        .text(number);

    d3.select("#explanation")
        .style("visibility", "");

    var sequenceArray = d.ancestors().reverse();
    sequenceArray.shift(); // remove root node from the array
    updateBreadcrumbs(sequenceArray, number);

    // Fade all the segments.
    d3.selectAll("path")
        .style("opacity", 0.3);

    // Then highlight only those that are an ancestor of the current segment.
    vis.selectAll("path")
        .filter(function (node) {
            return (sequenceArray.indexOf(node) >= 0);
        })
        .style("opacity", 1)
        .style("filter", "url(#drop-shadow)");
}

// Restore everything to full opacity when moving off the visualization.
function mouseleave(d) {

    // Hide the breadcrumb trail
    d3.select("#trail")
        .style("visibility", "hidden");

    // Deactivate all segments during transition.
    d3.selectAll("path").on("mouseover", null);

    // Transition each segment to full opacity and then reactivate it.
    d3.selectAll("path")
        .style("filter", "")
        .transition()
        .duration(300)
        .style("opacity", 0.8)
        .on("end", function () {
            d3.select(this).on("mouseover", mouseover);
        });

    d3.select("#explanation")
        .style("visibility", "hidden");
}

function initializeBreadcrumbTrail() {
    // Add the svg area.
    var trail = d3.select("#sequence").append("svg:svg")
        .attr("width", width)
        .attr("height", 50)
        .attr("id", "trail");
    // Add the label at the end, for the percentage.
    trail.append("svg:text")
        .attr("id", "endlabel")
        .style("fill", "#000");
}

// Generate a string that describes the points of a breadcrumb polygon.
function breadcrumbPoints(d, i) {
    var points = [];
    points.push("0,0");
    points.push(b.w + ",0");
    points.push(b.w + b.t + "," + (b.h / 2));
    points.push(b.w + "," + b.h);
    points.push("0," + b.h);
    if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
        points.push(b.t + "," + (b.h / 2));
    }
    return points.join(" ");
}

// Update the breadcrumb trail to show the current sequence and percentage.
function updateBreadcrumbs(nodeArray, percentageString) {

    // Data join; key function combines name and depth (= position in sequence).
    var trail = d3.select("#trail")
        .selectAll("g")
        .data(nodeArray, function (d) { return d.data.name + d.depth; });

    // Remove exiting nodes.
    trail.exit().remove();

    // Add breadcrumb and label for entering nodes.
    var entering = trail.enter().append("svg:g");

    entering.append("svg:polygon")
        .attr("points", breadcrumbPoints)
        .style("fill", function (d) { return colors[d.data.name]; });

    entering.append("svg:text")
        .attr("x", (b.w + b.t) / 2)
        .attr("y", b.h / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(function (d) { return d.data.name; });

    // Merge enter and update selections; set position for all nodes.
    entering.merge(trail).attr("transform", function (d, i) {
        return "translate(" + i * (b.w + b.s) + ", 0)";
    });

    // Now move and update the percentage at the end.
    d3.select("#trail").select("#endlabel")
        .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
        .attr("y", b.h / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(percentageString);

    // Make the breadcrumb trail visible, if it's hidden.
    d3.select("#trail")
        .style("visibility", "");

}

function drawLegend() {

    // Dimensions of legend item: width, height, spacing, radius of rounded rect.
    var li = {
        w: 75, h: 30, s: 8, r: 8
    };

    var legend = d3.select("#legend").append("svg:svg")
        .attr("width", li.w)
        .attr("height", d3.keys(Lcolors).length * (li.h + li.s));


    var g = legend.selectAll("g")
        .data(d3.entries(Lcolors))
        .enter().append("svg:g")
        .style("opacity", 0.6)
        .on("mouseover", function (d) {
            // d3.selectAll("#legend")
            //     .style("opacity", 0.3)
            d3.select(this)
                .style("opacity", 1)
                .style("filter", "url(#drop-shadow)")
                .style("cursor", "pointer")
            d3.selectAll("path")
                .style("opacity", 0.3);
            var key = d.key;
            if (d.key == "2010") {
                key = "twentyten";
            } else if (d.key == "2011") {
                key = "twentyeleven";
            } else if (d.key == "2012") {
                key = "twentytwelve";
            }
            if (key.includes("Store")) {
                mouseover(d3.select('#' + key).datum())
            }
            var allKeyData = d3.selectAll('#' + key).data()
            // console.log(allKeyData.forEach(function(d,i){return d.value;}))
            var sum = 0
            for (i = 0; i < allKeyData.length; i++) {
                sum += allKeyData[i].value;
            }
            sum = Math.ceil(sum)
            sum = sum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            d3.select("#explanation")
                .style("visibility", "");
            d3.select("#percentage")
                .text(sum);
            d3.selectAll('#' + key)
                .style("opacity", 1)
                .style("filter", "url(#drop-shadow)")
        })
        .on("mouseout", function (d) {
            d3.select(this)
                .style("opacity", 0.8)
                .style("filter", null)
                .style("cursor", "default")
            d3.selectAll("path")
                .style("opacity", 0.8);
            var key = d.key;
            if (d.key == "2010") {
                key = "twentyten";
            } else if (d.key == "2011") {
                key = "twentyeleven";
            } else if (d.key == "2012") {
                key = "twentytwelve";
            }
            if (key.includes("Store")) {
                mouseleave(d3.select('#' + key).datum())
            }
            d3.select("#explanation")
                .style("visibility", "hidden");

            d3.selectAll('#' + key)
                .style("opacity", 0.6)
                .style("filter", null)
        })
        .attr("transform", function (d, i) {
            return "translate(0," + i * (li.h + li.s) + ")";
        });

    g.append("svg:rect")
        .attr("rx", li.r)
        .attr("ry", li.r)
        .attr("width", li.w)
        .attr("height", li.h)
        .style("fill", function (d) { return d.value; });

    g.append("svg:text")
        .attr("x", li.w / 2)
        .attr("y", li.h / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(function (d) { return d.key; });
}

function toggleLegend() {
    var legend = d3.select("#legend");
    if (legend.style("visibility") == "hidden") {
        legend.style("visibility", "");
    } else {
        legend.style("visibility", "hidden");
    }
}

// Take a 2-column CSV and transform it into a hierarchical structure suitable
// for a partition layout. The first column is a sequence of step names, from
// root to leaf, separated by hyphens. The second column is a count of how 
// often that sequence occurred.
function buildHierarchy(csv) {
    var root = { "name": "root", "children": [] };
    for (var i = 0; i < csv.length; i++) {
        var sequence = csv[i][0];
        var size = +csv[i][1];
        if (isNaN(size)) { // e.g. if this is a header row
            continue;
        }
        var parts = sequence.split("-");
        var currentNode = root;
        for (var j = 0; j < parts.length; j++) {
            var children = currentNode["children"];
            var nodeName = parts[j];
            var childNode;
            if (j + 1 < parts.length) {
                // Not yet at the end of the sequence; move down the tree.
                var foundChild = false;
                for (var k = 0; k < children.length; k++) {
                    if (children[k]["name"] == nodeName) {
                        childNode = children[k];
                        foundChild = true;
                        break;
                    }
                }
                // If we don't already have a child node for this branch, create it.
                if (!foundChild) {
                    childNode = { "name": nodeName, "children": [] };
                    children.push(childNode);
                }
                currentNode = childNode;
            } else {
                // Reached the end of the sequence; create a leaf node.
                childNode = { "name": nodeName, "size": size };
                children.push(childNode);
            }
        }
    }
    return root;
};