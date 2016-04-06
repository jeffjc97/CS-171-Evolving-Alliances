var width = 1000,
	height = 600;

var svg = d3.select("#world-map").append("svg")
	.attr("width", width)
	.attr("height", height);

var nodesById;

var projection = d3.geo.mercator()
					.translate([width/2, height/2]);

// var projection = d3.geo.azimuthalEqualArea()
// 					.translate([width/2, height/2]);

var path = d3.geo.path().projection(projection);

// Load data parallel
queue()
	.defer(d3.json, "data/world-110m.json")
	.defer(d3.json, "data/alliances.json")
	.await(createVisualization);

function createVisualization(error, data1, data2) {
	var world = topojson.feature(data1, data1.objects.countries).features;

	svg.selectAll("path")
		.data(world)
		.enter()
		.append("path")
		.attr("d", path);

	svg.selectAll("circle")
		.data(data2.nodes)
		.enter()
		.append("circle")
		.attr("r", 5)
		.attr("cx", 0)
		.attr("cy", 0)
		.style("fill", "red")
		.attr("transform", function(d) {
			console.log(projection([d.longitude, d.latitude]));
			return "translate(" + projection([d.longitude, d.latitude]) + ")";
		});

	nodesById = {};
	data2.nodes.forEach(function(d){nodesById[d.id] = d});

	svg.selectAll("line")
		.data(data2.links["2000"])
	 	.enter()
	 	.append("line")
		.style("stroke", "red")
	 	.attr("x1", function(d) {
			var id = d.source;
			if (id in nodesById){
				var xy = projection([nodesById[id].longitude, nodesById[id].latitude])
				return xy[0];
			}
			return 0
		})
		.attr("y1", function(d) {
			var id = d.source;
			if (id in nodesById){
				var xy = projection([nodesById[id].longitude, nodesById[id].latitude])
				return xy[1];
			}
			return 0
		})
		.attr("x2", function(d) {
			var id = d.target;
			if (id in nodesById){
				var xy = projection([nodesById[id].longitude, nodesById[id].latitude])
				return xy[0];
			}
			return 0
		})
		.attr("y2", function(d) {
			var id = d.target;
			if (id in nodesById){
				var xy = projection([nodesById[id].longitude, nodesById[id].latitude])
				return xy[1];
			}
			return 0
		})
}

function outputUpdate(y) { 
	document.querySelector('#output').value = y; 
	var year = d3.select("#year").property("value"); 
	console.log(year);
  }

