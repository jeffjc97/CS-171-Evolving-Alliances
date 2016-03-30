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
	.await(createVisualization);

function createVisualization(error, data1) {
	var world = topojson.feature(data1, data1.objects.countries).features;

	svg.selectAll("path")
		.data(world)
		.enter()
		.append("path")
		.attr("d", path);
}