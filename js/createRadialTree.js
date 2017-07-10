function creatRadialTree(life, info) {
    $("#zoomValue").val('100');
    var selectedNode = null;
    var draggingNode = null;
    var overCircle = function(d) {
        selectedNode = d;
        //updateTempConnector();
    }
    var outCircle = function(d) {
        selectedNode = null;
        //updateTempConnector();
    }

    zoom = d3.zoom().scaleExtent([0.5, 3]).on("zoom", function() {
        chart.attr("transform", "translate(" + (d3.event.transform.x + outerRadius - 50) + "," + (d3.event.transform.y + outerRadius) + ")scale(" + d3.event.transform.k + ")")
    })

    var baseSvg = d3.select("#radialtree").append("svg")
        .attr("width", outerRadius * 2)
        .attr("height", outerRadius * 2).call(zoom);

    creatDefs(baseSvg, info);

    $("#zoomValue").change(function() {
        zoomValue = $("#zoomValue").val();
        console.log(zoomValue);
        baseSvg.transition()
            .duration(150)
            .call(zoom.transform, d3.zoomIdentity
                .translate(0, 0)
                .scale(zoomValue / 100));
    });

    var chart = baseSvg.append("g")
        .attr("transform", "translate(" + (outerRadius - 50) + "," + outerRadius + ")");

    console.log(newick.parse(life));
    var root = d3.hierarchy(newick.parse(life), function(d) {
            return d.branchset;
        })
        .sum(function(d) {
            return d.branchset ? 0 : 1;
        });

    var linearTree = d3.cluster()
        .size([360, innerRadius])
        .separation(function(a, b) {
            return 1;
        });

    linearTree(root);

    setRadius(root, root.data.length = 0, innerRadius / maxLength(root));
    

    var link = chart.append("g")
        .attr("class", "links")
        .selectAll("path")
        .data(root.links())
        .enter().append("path")
        .each(function(d) {
            d.target.linkNode = this;
        })
        .attr("d", linkConstant);

    var node = chart.selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .attr("id", function(d) {
            return d.data.name;
        })
        .attr("class", function(d) {
            if (d.data.name != '') {
                return "node" +
                    (d.children ? " node--internal" : " node--leaf");
            }
        })
        .attr("transform", function(d) {
            return "translate(" + project(d.x, d.y) + ")";
        })
        .attr("initial-transform", function(d) {
            return "rotate(" + (d.x - 96) + ")translate(" + (d.y - 10) + ")" + (d.x <= 180 ? "rotate(0)" : "rotate(180)");
        })
        .on("click", function(d) {
            if (selected == 0) {
                firstNode = d;
                firstNodeName = d.data.name;
                if (firstNode.parent !== null) {
                    while (firstNode.parent.data.name == "") {
                        firstNode = firstNode.parent;
                    }
                    firstParentNode = firstNode.parent;
                    firstParentNodeName = firstNode.parent.data.name;
                }
                $("#speOne").html("<img src=png/" + d.data.name + "_sm.png style=\"width:60px;height:60px;\"><p style=\"display: inline-block;\">" + sName[d.data.name] + "</p><p class=\"textArea\">" + wiki[d.data.name] + "</p>");
                $("#speTwo").html("");
                selected = 1;
                d3.selectAll('#miniTree svg').remove();
            } else if (selected == 1) {
                secondNode = d;
                secondNodeName = d.data.name;
                if (secondNode.parent !== null) {
                    while (secondNode.parent.data.name == "") {
                        secondNode = secondNode.parent;
                    }
                    secondParentNode = secondNode.parent;
                    secondParentNodeName = secondNode.parent.data.name;
                }
                $("#speTwo").html("<img src=png/" + d.data.name + "_sm.png style=\"width:60px;height:60px;\"><p style=\"display: inline-block;\">" + sName[d.data.name] + "</p><p class=\"textArea\">" + wiki[d.data.name] + "</p>");
                selected = 0;
                var miniLife;
                if (secondParentNodeName == firstParentNodeName) {
                    miniLife = "(" + firstNodeName + ":5," + secondNodeName + ":5)" + secondParentNodeName + "";
                } else {
                    if (checkIfParent(firstParentNode, secondParentNode)) {
                        miniLife = "((" + firstNodeName + ":5)" + firstParentNodeName + ":5," + secondNodeName + ":5)" + secondParentNodeName + "";
                    } else {
                        miniLife = "((" + firstNodeName + ":5)" + secondParentNodeName + ":5," + secondNodeName + ":5)" + firstParentNodeName + "";
                    }
                }
                createMiniTree(miniLife, info);
            }
        });
    
    var rootRadius = root.descendants().map(function(n) {
                                            return n.radius;
                                            });
    
    var rootDists = root.descendants().map(function(n) {
                                           return n.data.length;
                                           });
    
    var yscale = d3.scaleLinear()
    .domain([d3.max(rootDists),0])
    .rangeRound([0, -d3.max(rootRadius)]).nice();
    
    console.log(root.descendants());
    var xAxis = d3.axisRight(yscale);
    
    chart.append("g")
    .attr("class", "xaxis")
    .attr("transform", "translate(" + 30 +"," + 18 + ")")
    .call(xAxis.ticks(5))
    .selectAll("text")
    .style("font-size","15px");
    
    // adds the circle to the node
    chart.selectAll('g.node')
        .append("rect")
        .attr("width", 60)
        .attr("height", 60)
        .attr("fill", function(d) {
            return "url(#svg" + d.data.name + ")";
        })



    chart.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(root.leaves())
        .enter().append("text")
        .attr("dy", ".51em")
        .attr("transform", function(d) {
            return "rotate(" + (d.x - 90) + ")translate(" + (innerRadius + 72) + ",0)" + (d.x < 180 ? "" : "rotate(180)");
        })
        .attr("text-anchor", function(d) {
            return d.x < 180 ? "start" : "end";
        })
        .text(function(d) {
            return d.data.name.replace(/_/g, " ");
        })
}
