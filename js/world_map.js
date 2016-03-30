var width = 1000,
	height = 600;

var svg = d3.select("#world-map").append("svg")
	.attr("width", width)
	.attr("height", height);

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
			return "translate(" + projection([d.longitude, d.latitude]) + ")";
		});

	// svg.selectAll("line")
	// 	.data(data2.links["1816"])
	// 	.enter()
	// 	.append("line")
	// 	.attr("x1", function(d) {
	// 		data2.nodesd["source"]
			
	// 	})
}

function outputUpdate(y) { 
	document.querySelector('#output').value = y; 
	var year = d3.select("#year").property("value"); 
	console.log(year);
  }

