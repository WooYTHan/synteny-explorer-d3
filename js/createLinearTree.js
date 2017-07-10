function creatLinearTree(life, info) {
    $("#zoomValue").val('100');
    var tree = d3.cluster()
        .size([h, w]);
    var parsedData = newick.parse(life);
    var root = d3.hierarchy(parsedData, function(d) {
        return d.branchset;
    });
    var diagonal = getDiagonal();

    zoom = d3.zoom().scaleExtent([0.5, 3]).on("zoom", function() {
        chart.attr("transform", "translate(" + (d3.event.transform.x + 50) + "," + (d3.event.transform.y + 20) + ")scale(" + d3.event.transform.k + ")")
    });

    var baseSvg = d3.select("#radialtree").append("svg")
        .attr("width", w + 200)
        .attr("height", h)
        .call(zoom);

    $("#zoomValue").change(function() {
        zoomValue = $("#zoomValue").val();
        console.log(zoomValue);
        baseSvg.transition()
            .duration(150)
            .call(zoom.transform, d3.zoomIdentity
                .translate(30, 0)
                .scale(zoomValue / 100));
    });
    creatDefs(baseSvg, info);

    var chart = baseSvg.append("g").attr("transform", "translate(50, 20)");

    tree(root);

    var link = chart.selectAll("path.link")
        .data(root.links())
        .enter().append("svg:path")
        .attr("class", "links")
        .attr("d", diagonal)
        .attr("fill", "none")
        .attr("stroke", "#aaa")
        .attr("stroke-width", "2px");

    var node = chart.selectAll("g.node")
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
            return "translate(" + (d.y - 25) + "," + (d.x - 20) + ")";
        })
        .attr("initial-transform", function(d) {
            return "translate(" + (d.y - 25) + "," + (d.x - 20) + ")";
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
                        miniLife = "((" + secondNodeName + ":5)" + secondParentNodeName + ":5," + firstNodeName + ":5)" + firstParentNodeName + "";
                    }
                }
                createMiniTree(miniLife, info);
            }


        });
    
    var rootDists = root.descendants().map(function(n) {
                              return n.data.length;
                              });

    var yscale = d3.scaleLinear()
    .domain([d3.max(rootDists),0])
    .rangeRound([0, w]).nice();
    
    console.log(root.descendants());
    var xAxis = d3.axisBottom(yscale);
    
    chart.append("g")
    .attr("class", "xaxis")
    .attr("transform", "translate(0," + 10 + ")")
    .call(xAxis.ticks(5))
    .selectAll("text")
    .style("font-size","15px");

    
    chart.selectAll('g.node')
        .append("rect")
        .attr("width", 60)
        .attr("height", 60)
        .attr("fill", function(d) {
            return "url(#svg" + d.data.name + ")";
        });


    chart.selectAll('g.node').append("svg:text")
        .attr("dx", 65)
        .attr("dy", 30)
        .attr("text-anchor", "start")
        .attr('font-family', 'Helvetica Neue, Helvetica, sans-serif')
        .attr('font-size', '10px')
        .attr('fill', 'black')
        .text(function(d) {
            return d.data.name;
        });

}
