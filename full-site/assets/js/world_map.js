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

var year;

var zoom = d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", move);

var svg = d3.select("#world-map").append("svg")
	.attr("width", width)
	.attr("height", height)
	.style("display", "block")
	.style("margin", "auto")
	.append("g")
		.call(zoom)
	.append("g");

var countrySvg = d3.select("#country-view").append("svg")
	.attr("width", width)
	.attr("height", height)
	.style("display", "block")
	.style("margin", "auto")
	

var forceSvg = d3.select("#force-map").append("svg")
	.attr("width", width)
	.attr("height", height)
	.style("display", "block")
	.style("margin", "auto")

force = d3.layout.force().size([width, height]);

var world;

var country_id;

var codes;

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
	.defer(d3.csv, "data/ids_to_codes.csv")
	.await(function(error, mapTop, alliances, ids){
		data1 = mapTop;
		data2 = alliances;
		data3 = ids;

		nodesById = {};
		data2.nodes.forEach(function(d){nodesById[d.id] = d});

		codes = {};
		data3.forEach(function(d){codes[d.id] = d});
		country_id = 840;
		animateAlliances("end");
		updateVisualization();
	});

function updateVisualization() {
	world = topojson.feature(data1, data1.objects.countries).features;

	year = d3.select("#year").property("value");
	$('.timeline-year').text('Year: ' + year);

	alliance_type = +$('#alliance-type-select').find('.active').attr('atype');

	var tip = d3.tip()
		.attr('class', 'd3-tip')
		.html(function(d) {
			var id = d.id;
			if(!(id in codes)){
				return "No Data";
			}

			else {
				return codes[id].statenme;
			}
		});

	svg.call(tip);


	svg
		.selectAll("path")
		.data(world)
		.enter()
		.append("path")
		.attr("d", path)
		.style("fill", "#126e61")
		.on('mouseover',tip.show)
		.on("mousemove", function (d) {
			var currentState = this;
			d3.select(this)
				.style("fill", "#4EB980")
				.style("cursor", "pointer");
			return tip
				.style("top", (d3.event.pageY - 40) + "px")
				.style("left", (d3.event.pageX) + "px");
		})
		.on('mouseout', function (d) {
			var currentState = this;
			d3.select(this).style("fill", "#126e61");
			tip.hide();
		})
		.on("click", function(d) {
			country_id = d.id;
			updateCountry(country_id);
			$('html, body').animate({
				scrollTop: $('.country-alliance-title').offset().top
			}, 500);
		});

	svg.selectAll("circle")
		.data(data2.nodes)
		.enter()
		.append("circle")
		.attr("r", 3)
		.attr("cx", 0)
		.attr("cy", 0)
		.style("fill", "#b6c6e2")
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
		.style("stroke", "#a4dbbd")
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

	updateCountry(country_id);

	updateForce(data2.nodes, linkdata);

}

function updateForce(nodes, links) {
	nodes = nodes.filter(function(a) {
		console.log(a);
		return true
		// return (+a.alliance_type[alliance_type] == 1);
	});

	idIndices = [];
	nodes.forEach(function(d) {
		p = projection([d.longitude, d.latitude])
		d.x = p[0];
		d.y = p[1];
		idIndices.push(+d.id);
	});
	world.forEach(function(d) {
		if (codes[d.id] !== undefined) {
			ccode = +codes[d.id].ccode;
			if (idIndices.indexOf(ccode) > -1) {
				nodes[idIndices.indexOf(ccode)].feature = d;
			}
		}
	})
	links.forEach(function(d) {
		d.source = idIndices.indexOf(+d.source);
		d.target = idIndices.indexOf(+d.target);
	});

	console.log(nodes);
	console.log(links);
	console.log(idIndices);
	force
		.gravity(0.1)
		.nodes(nodes)
		.links(links)
		.linkDistance(1)
		// .linkDistance(function(d) { return getDistance(d.alliance_type); })
		.start();

	var link = forceSvg.selectAll("line")
		.data(links)
		.enter().append("line")
		.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; }); 

	var node = forceSvg.selectAll("g")
		.data(nodes)
		.enter().append("g")
		.attr("transform", function(d) { return "translate(" + -d.x + "," + -d.y + ")"; })
		.call(force.drag)
		.append("path")
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
		.attr("d", function(d) { return path(d.feature); });

	force.on("tick", function(e) {
		link.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });
		node.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")";
		});
	});

}

function animateAlliances(type) {
	if (type == "start" && intervalID == -1) {
		$('.animate-btn').prop('disabled', true);
		$('.stop-btn').prop('disabled', false);
		curYear = 0;
		intervalID = setInterval(function() {
			$('#year').val(curYear + 1816);
			curYear = (curYear + 1) % 195;
			updateVisualization();
		}, 100);

	}
	else if (type == "end") {
		$('.animate-btn').prop('disabled', false);
		$('.stop-btn').prop('disabled', true);
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

function updateCountry(id){

	year = d3.select("#year").property("value");
	$('.timeline-year').text('Year: ' + year);

	country = codes[id].ccode;
	statename = codes[id].statenme;

	$('.country-alliance-title').text("Country Alliances: " + statename);

	countrySvg.selectAll("path")
		.data(world)
		.enter()
		.append("path")
		.attr("d", path)
		.attr("class", "country");

	var allies = {};
		//console.log(data2.links);
	data2.links[year].forEach(function(d){
		if (d.source == country){
			allies[d.target] = d.alliance_type;
		} else if (d.target == country){
			allies[d.source] = d.alliance_type;
		}
	});

	d3.selectAll(".country")
		.style("fill", function(d) {
			//console.log(d.id);
			//console.log(codes[d.id]);
			if (d.id == id){
				return "#126e61"
			} else if (d.id in codes){
				var code = codes[d.id].ccode;
				if (isNaN(code) || !(code in allies) ){
					return "gray"
				} else if (allies[code][0] == 1){
					return "#8856a7"
				} else if (allies[code][1] == 1){
					return "#8c96c6"
				} else if (allies[code][2] == 1){
					return "#9ebcda";
				} else if (allies[code][3] == 1){
					return "#bfd3e6";
				}
			}
			return "gray"
		});

	var g = countrySvg.append("g")
		.attr("class", "key")
		.attr("transform", "translate(" + 100 + "," + (height-200) + ")");

	g.selectAll("rect")
		.data(["#126e61","#8856a7","#8c96c6","#9ebcda","#bfd3e6","gray"])
		.enter().append("rect")
		.attr("height", 15)
		.attr("y", function(d,i) { return i*16; })
		.attr("width", 10)
		.style("fill", function(d) { return d });

	legend = g.selectAll("text")
		.data(["Selected Country","Defense","Neutrality","Nonaggression","Entente","No Alliance"])
		.enter().append("text")
		.text(function(d){ return d; })
		.attr("y", function(d,i) { return (i*16 + 15); })
		.attr("x", 13);

};

function getDistance(arr) {
	return 4 * +arr[0] + 3 * +arr[1] + 2 * +arr[2] + +arr[3];
}
