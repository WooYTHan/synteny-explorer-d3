var firstNode, secondNode, firstNodeName, secondNodeName,firstParentNode, secondParentNode,firstParentNodeName,secondParentNodeName;
var outerRadius = 1060 / 2,
innerRadius = outerRadius - 170;
var w = 700,h = 4300;
var zoomValue, zoom;
var selected = 0;
var wiki = {};
var sName = {};
d3.queue()
  .defer(d3.text,"treetime.txt")
  .defer(d3.csv,"info.csv")
  .await(function(error,life,info){
        if (error) throw error;
        
        creatLinearTree(life, info);
        $("#radial").click(function() {
                           d3.select("svg").remove();
                           creatRadialTree(life, info);
                           });
        $("#linear").click(function() {
                           d3.select("svg").remove();
                           creatLinearTree(life, info);
                           });
         info.forEach(function(d) {
                         var name= d.Id;
                         wiki[name] = d.Wiki;
                         sName[name] = d.Name;
        });
     });

function creatDefs(svg,info){
 svg.selectAll("defs")
         .data(info)
         .enter()
         .append("pattern")
         .attr("id", function(d) {
               return "svg" + d.Id;
               })
         .attr('patternUnits', 'userSpaceOnUse')
         .attr("width", 60)
         .attr("height", 60)
         .append("image")
         .attr("xlink:href",function(d) {
           var url = "png/" + d.Id + "_sm.png";
           if(imageExists(url)){
           		return "png/" + d.Id + "_sm.png";
           }
           else{
           		return "png/dummy.png";
           }
         })
         .attr("width", 60)
         .attr("height",60);
         
}
// Compute the maximum cumulative length of any node in the tree.
function maxLength(d) {
    return d.data.length + (d.children ? d3.max(d.children, maxLength) : 0);
}
// Set the radius of each node by recursively summing and scaling the distance from the root.
function setRadius(d, y0, k) {
    d.radius = (y0 += d.data.length) * k;
    if (d.children) d.children.forEach(function(d) {
                                       setRadius(d, y0, k);
                                       });
}
function linkVariable(d) {
    return linkStep(d.source.x, d.source.radius, d.target.x, d.target.radius);
}
function linkConstant(d) {
    return linkStep(d.source.x, d.source.y, d.target.x, d.target.y);
}
// Like d3.svg.diagonal.radial, but with square corners.
function linkStep(startAngle, startRadius, endAngle, endRadius) {
    var c0 = Math.cos(startAngle = (startAngle - 90) / 180 * Math.PI),
    s0 = Math.sin(startAngle),
    c1 = Math.cos(endAngle = (endAngle - 90) / 180 * Math.PI),
    s1 = Math.sin(endAngle);
    return "M" + startRadius * c0 + "," + startRadius * s0 +
    (endAngle === startAngle ? "" : "A" + startRadius + "," + startRadius + " 0 0 " + (endAngle > startAngle ? 1 : 0) + " " + startRadius * c1 + "," + startRadius * s1) +
    "L" + endRadius * c1 + "," + endRadius * s1;
}
function getDiagonal() {
    var projection = function(d) {
        return [d.y, d.x];
    }
    var path = function(pathData) {
        return "M" + pathData[0] + ' ' + pathData[1] + " " + pathData[2];
    }
    
    function diagonal(diagonalPath, i) {
        var source = diagonalPath.source,
        target = diagonalPath.target,
        midpointX = (source.x + target.x) / 2,
        midpointY = (source.y + target.y) / 2,
        pathData = [source, {
                    x: target.x,
                    y: source.y
                    }, target];
        pathData = pathData.map(projection);
        return path(pathData)
    }
    
    diagonal.projection = function(x) {
        if (!arguments.length) return projection;
        projection = x;
        return diagonal;
    };
    
    diagonal.path = function(x) {
        if (!arguments.length) return path;
        path = x;
        return diagonal;
    };
    
    return diagonal;
}

function reset() {
  return d3.transition().duration(350).tween("zoom", function () {
        var iTranslate = d3.interpolate(zoom.translate(), translate),
            iScale = d3.interpolate(zoom.scale(), scale);
        return function (t) {
            zoom
                .scale(iScale(t))
                .translate(iTranslate(t));
            zoomed();
        };
    });
}

function project(x, y) {
  var angle = (x - 90) / 180 * Math.PI, radius = y + 20;
  return [radius * Math.cos(angle) - 30 , radius * Math.sin(angle) - 25];
}
function imageExists(url){
    var image = new Image();
    image.src = url;
    if (!image.complete) {
        return false;
    }
    else if (image.height === 0) {
        return false;
    }
    return true;
}
 function checkIfParent(nodeOne,nodeTwo){
        while(nodeOne.parent !== null)
        {
            if(nodeOne.parent.data.name == nodeTwo.data.name){
            	return true;
            }
            else{
        		nodeOne = nodeOne.parent;
        	}
        }
        return false;
        }



