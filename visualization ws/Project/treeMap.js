d3.json("tree.json", function (data) {

    var treewidth = treeheight = 100, // % of the parent element

        treex = d3.scaleLinear().domain([0, treewidth]).range([0, treewidth]),
        treey = d3.scaleLinear().domain([0, treeheight]).range([0, treeheight]),



        color = d3.scaleOrdinal()
            .range(["#36688D", "#14325C", "#F18904", "#BDA589", "#A7414A", "#6A8A82", "#A37C27", "#C1403D", "#9199BE", "#54678F", "#594346", "#81A3A7", "#03353E", "#54678F", "#A3445D", "#8C7547", "#0878A4", "#BE7052", "#C05640","#52591F","#328DAA","#585B51","#5AA382","#02231C","#BE7052","#383140","#8D2D56"]                                                                     
                .map(function (c) {
                    c = d3.rgb(c);
                    return c;
                })
            ),

        treemap = d3.treemap()
            .size([treewidth, treeheight])
            .paddingInner(0)
            .round(false), //true



        nodes = d3.hierarchy(data)
            .sum(function (d) { return d.value ? 1 : 0; }),

        currentDepth;

    treemap(nodes);



    var chart = d3.select("#treechart");
    var cells = chart
        .selectAll(".node")
        .data(nodes.descendants())
        .enter()
        .append("div")
        .attr("class", function (d) { return "node level-" + d.depth; })
        .attr("title", function (d) { return d.data.name ? d.data.name : "null"; });

    cells
        .style("left", function (d) { return treex(d.x0) + "%"; })
        .style("top", function (d) { return treey(d.y0) + "%"; })
        .style("width", function (d) { return treex(d.x1) - treex(d.x0) + "%"; })
        .style("height", function (d) { return treey(d.y1) - treey(d.y0) + "%"; })
        .style("background-color", function (d) { while (d.depth > 5) d = d.parent; return color(d.data.name); })
        .on("click", zoom)
        .append("p")
        .attr("class", "label")
        .text(function (d) { return d.data.name ? d.data.name : "---"; })

    var parent = d3.select(".up")
        .datum(nodes)
        .on("click", zoom);

    function zoom(d) { 

        console.log('clicked: ' + d.data.name + ', depth: ' + d.depth);

        currentDepth = d.depth;
        parent.datum(d.parent || nodes);

        treex.domain([d.x0, d.x1]);
        treey.domain([d.y0, d.y1]);

        var t = d3.transition()
            .duration(800)
            .ease(d3.easeCubicOut);

        cells
            .transition(t)
            .style("left", function (d) { return treex(d.x0) + "%"; })
            .style("top", function (d) { return treey(d.y0) + "%"; })
            .style("width", function (d) { return treex(d.x1) - treex(d.x0) + "%"; })
            .style("height", function (d) { return treey(d.y1) - treey(d.y0) + "%"; });

        cells // hide this depth and above
            .filter(function (d) { return d.ancestors(); })
            .classed("hide", function (d) { return d.children ? true : false });

        cells // show this depth + 1 and below
            .filter(function (d) { return d.depth > currentDepth; })
            .classed("hide", false);

    }


})

