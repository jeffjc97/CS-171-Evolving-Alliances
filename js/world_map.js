var width = 1000,
	height = 600;

var intervalID = -1;
$('.animate-btn').click(function() {
	animateAlliances("start");
});
$('.stop-btn').click(function() {
	animateAlliances("end");
});

$('.alliance-type-btn').click(function() {
	if (!$(this).hasClass('active')) {
		$('#alliance-type-select').find('.active').removeClass('active');
		$(this).addClass('active');
		animateAlliances("end");
		updateVisualization();
	}
});

var zoom = d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", move);

var svg = d3.select("#world-map").append("svg")
	.attr("width", width)
	.attr("height", height)
	.append("g")
		.call(zoom)
	.append("g");


var countrySvg = d3.select("#country-view").append("svg")
	.attr("width", width)
	.attr("height", height);

var world;


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
	.await(function(error, mapTop, alliances){
		data1 = mapTop;
		data2 = alliances;

		nodesById = {};
		data2.nodes.forEach(function(d){nodesById[d.id] = d});

		updateVisualization();
		updateCountry();
	});

function updateVisualization() {
	world = topojson.feature(data1, data1.objects.countries).features;

	year = d3.select("#year").property("value");
	document.querySelector('#output').value = year;


	alliance_type = +$('#alliance-type-select').find('.active').attr('atype');


	console.log(data1);
	var tip = d3.tip()
		.attr('class', 'd3-tip')
		.offset([-10, 0])
		.html(function(d) {
			var id = d.id;
			console.log(id);
			if(!(id in nodesById)){
				return "No Data";
			}

			else {
				return "Yay!";
			}
		});

	svg.call(tip);


	svg.append("g")
		.attr("class","countries")
		.selectAll("path")
		.data(world)
		.enter()
		.append("path")
		.attr("d", path)
		.on('mouseover',tip.show)
		.on('mouseout',tip.hide);

	svg.selectAll("circle")
		.data(data2.nodes)
		.enter()
		.append("circle")
		.attr("r", 3)
		.attr("cx", 0)
		.attr("cy", 0)
		.style("fill", "red")
		.attr("transform", function(d) {
			return "translate(" + projection([d.longitude, d.latitude]) + ")";
		});

	linkdata = data2.links[year];
	if (alliance_type < 4) {
		linkdata = linkdata.filter(function(a) {
			return (+a.alliance_type[alliance_type] == 1);
		});
	}

	var line = svg.selectAll("line")
		.data(linkdata);

	line
		.enter()
		.append("line")
		.style("stroke", "red")
		.attr("x1", function(d) {
			var id = d.source;
			if (id in nodesById){
				var xy = projection([nodesById[id].longitude, nodesById[id].latitude]);
				return xy[0];
			}
			return 0
		})
		.attr("y1", function(d) {
			var id = d.source;
			if (id in nodesById){
				var xy = projection([nodesById[id].longitude, nodesById[id].latitude]);
				return xy[1];
			}
			return 0
		})
		.attr("x2", function(d) {
			var id = d.target;
			if (id in nodesById){
				var xy = projection([nodesById[id].longitude, nodesById[id].latitude]);
				return xy[0];
			}
			return 0
		})
		.attr("y2", function(d) {
			var id = d.target;
			if (id in nodesById){
				var xy = projection([nodesById[id].longitude, nodesById[id].latitude]);
				return xy[1];
			}
			return 0
		});

	line.exit().remove();
}

function animateAlliances(type) {
	if (type == "start" && intervalID == -1) {
		curYear = 0;
		intervalID = setInterval(function() {
			$('#year').val(curYear + 1816);
			curYear = (curYear + 1) % 195;
			updateVisualization();
		}, 100);

	}
	else if (type == "end") {
		if (intervalID != -1) {
			clearInterval(intervalID);
			intervalID = -1;
		}
	}
}

function move() {
	svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	svg.selectAll("circle")
		.attr("r", 3 / d3.event.scale);
	svg.selectAll("line")
		.attr("stroke-width", 1/d3.event.scale);
}

function updateCountry(){

	var	codes;

	year = d3.select("#year").property("value");
	console.log(year);

	countrySvg.selectAll("path")
		.data(world)
		.enter()
		.append("path")
		.attr("d", path);
	};
