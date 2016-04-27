// alliances highlight if hover over country
// clicking dragging still scrolls down

var width = 1000,
	height = 600,
	center = [width / 2, height / 2];

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
		updateVisualization(false);
	}
});

$('.global-vis-btn').click(function() {
	if (!$(this).hasClass('active')) {
		$('#global-vis-select').find('.active').removeClass('active');
		$(this).addClass('active');
		animateAlliances("end");
		console.log($(this).attr("vtype"));
		if ($(this).attr("vtype") == "map") {
			$('#zoom-buttons').show();
			svg.style("display", "block");
			forceSvgPre.style("display", "none");
		}
		else {
			$('#zoom-buttons').hide();
			svg.style("display", "none");
			forceSvgPre.style("display", "block");
		}
	}
});

$('#map-footer-expand').click(function() {
	if ($(this).hasClass("open")) {
		$(this).css("padding-left", "1%");
		$('#map-footer').css("height", 0);
		$(this).css("bottom", 0);
		$("#footer-label").text("Change Year");
		$(".map-footer-icon").removeClass("fa-chevron-down");
		$(".map-footer-icon").addClass("fa-chevron-up");
	}
	else {
		$('#map-footer').css("height", "10%");
		$(this).css("bottom", "10%");
		$(this).css("padding-left", "0%");
		$("#footer-label").text("");
		$(".map-footer-icon").removeClass("fa-chevron-up");
		$(".map-footer-icon").addClass("fa-chevron-down");
	}
	$(this).toggleClass("open");
	// $("#map-footer").css("height", '10%');
	// $(this).hide();
});

var year;

var zoom = d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", move);


var svg = d3.select("#world-map").append("svg")
	.attr("width", width)
	.attr("height", height)
	.style("display", "block")
	.style("margin", "auto");

var g = svg.append("g");

svg.call(zoom);

var countrySvg = d3.select("#country-view").append("svg")
	.attr("width", width)
	.attr("height", height)
	.style("display", "block")
	.style("margin", "auto");
	

var forceSvgPre = d3.select("#world-map").append("svg")
	.attr("width", width)
	.attr("height", height)
	.attr("class", "force")
	.style("display", "block")
	// .style("display", "none")
	.style("margin", "auto")

var forceSvg = forceSvgPre.append("g");

var loadingScreen = d3.select("#force-map svg").append("rect")
	.attr("x", 0)
	.attr("y", 0)
	.attr("width", width)
	.attr("height", height)
	.attr("fill", "grey")
	.style("fill-opacity", 0);

force = d3.layout.force()
			.size([width, height])
			.gravity(0.01)
			// .linkDistance(30)
			.linkDistance(function(d) { return 2 * getDistance(d.alliance_type); });

var world;

var country_id;

var codes;

var nodesById;

var projection = d3.geo.mercator()
	.translate(center);

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
		forceSvgPre.style("display", "none");
		updateVisualization(false);
	});

function updateVisualization(fromAnimation) {
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


	g.selectAll("path")
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
			console.log(svg.selectAll("line"));
			// svg.selectAll("line").filter(function(l) {
			// 	if (codes[d.id].ccode == l.source || codes[d.id].ccode == l.target) {
			// 		return true;
			// 	}
			// 	return false;
			// }).style("stroke", "red");
			return tip
				.style("top", (d3.event.pageY - 40) + "px")
				.style("left", (d3.event.pageX) + "px");
		})
		.on('mouseout', function (d) {
			var currentState = this;
			d3.select(this).style("fill", "#126e61");
			// svg.selectAll("line").filter(function(l) {
			// 	if (codes[d.id].ccode == l.source || codes[d.id].ccode == l.target) {
			// 		return true;
			// 	}
			// 	return false;
			// }).style("stroke", "#a4dbbd");
			tip.hide();
		})
		.on("click", function(d) {
			country_id = d.id;
			updateCountry(country_id);
			$('html, body').animate({
				scrollTop: $('.country-alliance-title').offset().top
			}, 500);
		});

	g.selectAll("circle")
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

	var line = g.selectAll("line")
		.data(linkdata);

	line
		.enter()
		.append("line")
		.style("stroke", "#a4dbbd")
		.style("opacity", 0.5)
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
	if (!fromAnimation) {
		updateForce(data2.nodes, linkdata);
	};

}

function updateForce(n, l) {
	console.log("here");
	forceSvg.selectAll("*").remove();
	nodes = JSON.parse(JSON.stringify(n));
	links = JSON.parse(JSON.stringify(l));

	involvedCountries = [];
	links.forEach(function(l) {
		involvedCountries.push(l.source);
		involvedCountries.push(l.target);
	});
	involvedCountriesSet = new Set(involvedCountries);
	involvedCountries = Array.from(involvedCountriesSet);

	nodes = nodes.filter(function(n) {
		if (involvedCountries.indexOf(n.id) > -1) {
			return true;
		}
		else {
			return false;
		}
	});

	idIndices = [];
	nodes.forEach(function(d) {
		p = projection([d.longitude, d.latitude]);
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
	});
	links.forEach(function(d) {
		d.sourceid = d.source;
		d.targetid = d.target;
		d.source = idIndices.indexOf(+d.source);
		d.target = idIndices.indexOf(+d.target);
	});

	console.log(nodes);
	console.log(links);

	force
		.nodes(nodes)
		.links(links)
		.start();

	var tip = d3.tip()
		.attr('class', 'd3-tip')
		.html(function(d) {
			console.log(d);
			return d.country;
		});

	svg.call(tip);

	var link = forceSvg.selectAll("line")
		.data(links)
		.enter().append("line")
		.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; })
		.style("stroke", "#a4dbbd");

	var node = forceSvg.selectAll("g")
		.data(nodes)
		.enter().append("g")
		.attr("transform", function(d) { return "translate(" + -d.x + "," + -d.y + ")"; })
		.call(force.drag)
		.append("path")
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
		.attr("d", function(d) { return path(d.feature); })
		.style("fill", "#126e61")
		.style("fill-opacity", 0.8)
		.on('mouseover', tip.show)
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
			if (d3.event.defaultPrevented) return;
			country_id = codes_to_ids(d.id);
			updateCountry(country_id);
			$('html, body').animate({
				scrollTop: $('.country-alliance-title').offset().top
			}, 500);
		});

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
	year = +d3.select("#year").property("value");
	if (type == "start" && intervalID == -1) {
		loadScreen(true);
		$('.animate-btn').prop('disabled', true);
		$('.stop-btn').prop('disabled', false);
		curYear = year - 1816;
		intervalID = setInterval(function() {
			$('#year').val(curYear + 1816);
			curYear = (curYear + 1) % 195;
			updateVisualization(true);
		}, 100);

	}
	else if (type == "end") {
		loadScreen(false);
		$('.animate-btn').prop('disabled', false);
		$('.stop-btn').prop('disabled', true);
		if (intervalID != -1) {
			clearInterval(intervalID);
			intervalID = -1;
		}
		updateVisualization(false);
	}
}

function move() {

	var t = d3.event.translate,
		s = d3.event.scale;
	t[0] = Math.min(0 * (s - 1), Math.max(width * (1 - s), t[0]));
	t[1] = Math.min(height / 2 * (s - 1) + 230 * s, Math.max(height / 2 * (1 - s) - 230 * s, t[1]));
	zoom.translate(t);
	g.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");
	g.selectAll("circle").attr("r", 3 / s);
}

d3.selectAll('.zoom').on('click', function(){
	d3.event.preventDefault();
	var scale = zoom.scale(),
		extent = zoom.scaleExtent(),
		translate = zoom.translate(),
		x = translate[0], y = translate[1],
		factor = (this.id === 'zoom_in') ? 1.2 : 1/1.2,
		target_scale = scale * factor;
	// If we're already at an extent, done
	if (target_scale === extent[0] || target_scale === extent[1]) { return false; }
	// If the factor is too much, scale it down to reach the extent exactly
	var clamped_target_scale = Math.max(extent[0], Math.min(extent[1], target_scale));
	if (clamped_target_scale != target_scale){
		target_scale = clamped_target_scale;
		factor = target_scale / scale;
	}
	// Center each vector, stretch, then put back
	x = (x - center[0]) * factor + center[0];
	y = (y - center[1]) * factor + center[1];
	// Transition to the new view over 350ms
	d3.transition().duration(350).tween("zoom", function () {
		var interpolate_scale = d3.interpolate(scale, target_scale),
			interpolate_trans = d3.interpolate(translate, [x,y]);
		return function (t) {
			zoom.scale(interpolate_scale(t))
				.translate(interpolate_trans(t));
			g.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");
			g.selectAll("circle").attr("r", 3 / zoom.scale());
			g.selectAll("line").attr("stroke-width", 1/zoom.scale());
		};
	});
});

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
					return "#810f7c"
				} else if (allies[code][1] == 1){
					return "#8856a7"
				} else if (allies[code][2] == 1){
					return "#8c96c6";
				} else if (allies[code][3] == 1){
					return "#b3cde3";
				}
			}
			return "gray"
		})
		.on("click", function(d) {
			country_id = d.id;
			updateCountry(country_id);
		});

	var g = countrySvg.append("g")
		.attr("class", "key")
		.attr("transform", "translate(" + 100 + "," + (height-200) + ")");

	g.selectAll("rect")
		.data(["#126e61","#810f7c","#8856a7","#8c96c6","#b3cde3","gray"])
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
	if (arr[0] == 1) {
		return 30;
	}
	else if (arr[1] == 1) {
		return 50;
	}
	else if (arr[2] == 1) {
		return 70;
	}
	else if (arr[3] == 1) {
		return 100;
	}
	// should never happen
	else {
		console.log("wtf");
		return 1000;
	}
}

function loadScreen(toggle) {
	if (toggle) {
		if ($($('.global-vis-btn')[1]).hasClass("active")) {
			$('#loading-spinner').show();
		}
		console.log
		loadingScreen = d3.selectAll("#world-map svg.force").append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", width)
			.attr("height", height)
			.attr("fill", "grey")
			.style("fill-opacity", 0.5);
	}
	else {
		$('#loading-spinner').hide();
		loadingScreen.remove();
	}

}

function codes_to_ids (ccode) {
	for (var key in codes) {
  		if (codes.hasOwnProperty(key)) {
    		if (codes[key].ccode == ccode) {
    			return codes[key].id
			}
  		}
	}	
	return -1;
}
