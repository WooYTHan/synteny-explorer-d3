function createMiniTree(life,info) {
        var tree = d3.cluster()
        .size([200, 200]);
        var root = d3.hierarchy(newick.parse(life), function(d) {
                                return d.branchset;
                                });
        console.log(root);
        var diagonal = getDiagonal();
         
        var baseSvg = d3.select("#miniTree").append("svg")
        .attr("width", 350)
        .attr("height", 250);
        //creatDefs(baseSvg,info);
        var chart = baseSvg.append("g").attr("transform", "translate(30, -10)");
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
        .attr("id",function(d){return d.data.name;})
        .attr("class", function(d) {if(d.data.name != ''){
              return "node" +
              (d.children ? " node--internal" : " node--leaf");
              }})
            .attr("transform", function(d) {
              return "translate(" + (d.y - 25) + "," + (d.x-20) + ")";
              })
              .attr("initial-transform",function(d) {
              return "translate(" + (d.y - 25) + "," + (d.x-20) + ")";
              });
        
        //var yscale = scaleBranchLengths(root.descendants(), 200)
        
        chart.selectAll('g.node')
        .append("rect")
        .attr("width", 60)
        .attr("height", 60)
        .attr("fill", function(d) {
               return "url(#svg" + d.data.name + ")";
        });
        
        }