var width = 1000,
	height = 600;
	sens = 0.25;

var focused;

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

//var zoom = d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", move);

var svg = d3.select("#world-map").append("svg")
	.attr("width", width)
	.attr("height", height)
	.style("display", "block")
	.style("margin", "auto")
	//.append("g")
	//	.call(zoom)
	//.append("g");


var countrySvg = d3.select("#country-view").append("svg")
	.attr("width", width)
	.attr("height", height);
	
var countries;

var country_id;

var codes;

var nodesById;

//var projection = d3.geo.mercator()
//					.translate([width/2, height/2]);

var projection = d3.geo.orthographic()
	.scale(245)
	.rotate([0, 0])
	.translate([width / 2, height / 2])
	.clipAngle(90);

var path = d3.geo.path().projection(projection);

//water
svg.append("path")
	.datum({type: "Sphere"})
	.attr("class", "water")
	.attr("d", path);

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
	countries = topojson.feature(data1, data1.objects.countries).features;

	year = d3.select("#year").property("value");
	$('.global-alliance-title').text('Global Alliances: ' + year);

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


	var world = svg.selectAll("path")
		.data(countries)
		.enter().append("path")
		.attr("class", "land")
		.attr("class","moveable")
		.attr("d", path)

		//mouse events

		.on('mouseover',tip.show)
		.on("mousemove", function () {
			//console.log(d3.event);
			return tip
				.style("top", (d3.event.pageY - 40) + "px")
				.style("left", (d3.event.pageX) + "px");
		})
		.on('mouseout',tip.hide)
		.on("click", function(d) {
			country_id = d.id;
			updateCountry(country_id);
		})

		//Drag event

		.call(d3.behavior.drag()
			.origin(function() { var r = projection.rotate(); return {x: r[0] / sens, y: -r[1] / sens}; })
			.on("drag", function() {
				var rotate = projection.rotate();
				projection.rotate([d3.event.x * sens, -d3.event.y * sens, rotate[2]]);
				svg.selectAll(".moveable").attr("d", path);
				svg.selectAll(".focused").classed("focused", focused = false);


				// svg.selectAll(".focused").classed("focused", focused = false);

			}));

	//Country focus on option select

	function country(cnt, sel) {
		for(var i = 0, l = cnt.length; i < l; i++) {
			if(cnt[i].id == sel.value) {return cnt[i];}
		}
	}

	svg.selectAll("circle")
		.data(data2.nodes)
		.enter()
		.append("circle")
		.attr("class","moveable")
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
		.data(linkdata)
		.attr("class","moveable");
	
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

	updateCountry(country_id);

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

//function move() {
//	svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
//	svg.selectAll("circle")
//		.attr("r", 3 / d3.event.scale);
//	svg.selectAll("line")
//		.attr("stroke-width", 1/d3.event.scale);
//}

function updateCountry(id){

	year = d3.select("#year").property("value");
	$('.global-alliance-title').text('Global Alliances: ' + year);

	country = codes[id].ccode;
	statename = codes[id].statenme;

	$('.country-alliance-title').text("Country Alliances: " + statename);

	countrySvg.selectAll("path")
		.data(countries)
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
	//console.log(allies);

	d3.selectAll(".country")
		.style("fill", function(d) {
			//console.log(d.id);
			//console.log(codes[d.id]);
			if (d.id == id){
				return "purple"
			} else if (d.id in codes){
				var code = codes[d.id].ccode;
				if (isNaN(code) || !(code in allies) ){
					return "gray"
				} else if (allies[code][0] == 1){
					return "red"
				} else if (allies[code][1] == 1){
					return "green"
				} else if (allies[code][2] == 1){
					return "blue";
				} else if (allies[code][3] == 1){
					return "yellow";
				}
			}
			return "gray"
		});

	var g = countrySvg.append("g")
		.attr("class", "key")
		.attr("transform", "translate(" + 100 + "," + (height-200) + ")");

	g.selectAll("rect")
		.data(["purple","red","green","blue","yellow","gray"])
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
