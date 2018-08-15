'use strict';

var w = window;
var doc = document;
var el = doc.documentElement;
var body = doc.getElementsByTagName('body')[0];
var width = w.innerWidth || el.clientWidth || body.clientWidth;
var height = w.innerHeight|| el.clientHeight|| body.clientHeight;



var projection = d3.geoEquirectangular().scale(140);
var path = d3.geoPath()
  .projection(projection);

var color = d3.scaleSequential(d3.interpolateGnBu);

var tooltip = d3.select('#Map').append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0);

var svg = d3.select('#Map')
  .append('svg')
  .attrs({
   width: width - 10 ,
    height: height -75
	
  });
  
var formatDateIntoYear = d3.timeFormat("%Y");
var formatDate = d3.timeFormat("%b %Y");
var parseDate = d3.timeParse("%m/%d/%y");

var colorDensityfirst = d3.select(options).node().value;
var renewable = d3.select(renew).node().value;
var optionSelect = d3.select("#options"); 
var optionSelectRe = d3.select("#renew"); 
var disatext = d3.select("#disapear").innerHTML;
var selectedCountry ;
var selectedRECountry;
var g = svg.append('g');
/*
 newsvg.append('g')
  .attr('class', 'textCon')
  .append('text')
  .text("First Filter: Points to the country which uses 'selected' Renewable Resources    " + country)
  .attr("transform", "translate(-140, -120)"); 
*/
runbaby(colorDensityfirst);
function runbaby(colorDensity){

	queue()
	.defer(d3.json, 'Countrysecond.json')
	.defer(d3.json, 'treemapRfinal.json')
	.defer(d3.json, 'point.json')
	.await(makeMyMap);

	
	
function makeMyMap(error, data, datatree,point){
  if (error) {
    return console.error(error);
  }

  console.log(point);

// var countiesTree = topojson.feature(datatree,datatree.objects.CountrysecondT).features;
 
 var counties = topojson.feature(data,data.objects.Countrysecond).features;
 //var point = topojson.feature(point,point.objects.point).features;
 console.log(point);
	   var meanDensity = ""
   if(colorDensity == "Carbon Emission(kt)"){
	//    var button  = d3.select("#namemap");
//	 button.text = "Color density of the map Carbon Emission"
   meanDensity = d3.mean(counties, function(d) {
	  
    return Math.round(d.properties.CarbonEmision * 100) / 100;
	
  });
 
   }else{
     meanDensity = d3.mean(counties, function(d) {
	 
    return Math.round(d.properties.TotalGeneration * 100) / 100;
	  
  });
   }
  var scaleDensity = d3.scaleQuantize()
    .domain([0, meanDensity])
    .range([0, 0.2, 0.4, 0.6, 0.8, 1]);
if(colorDensity == "Carbon Emission(kt)"){
  g.append('g')
    .attr('class', 'county')
    .selectAll('path')
    .data(counties)
    .enter()
    .append('path')
	//.filter(function(d) { return d.properties.year == Year })
    .attrs({
      'd': path,
      'class': 'county',
      'stroke': 'grey',
      'stroke-width': 0.3,
      'cursor': 'pointer',
      'fill': function(d) {
        var countyGDP = Math.round(d.properties.CarbonEmision * 100) / 100;
        var GDP = countyGDP ? countyGDP : 0;
        return color(scaleDensity(GDP))
      }
    })
    .on('click', function(d) {
		
	      clicked(d.properties.Country);
		  
	})
    .on('mouseover', function(d) {
	  d3.select(this).classed("selected",true)
      tooltip.transition()
        .duration(200)
        .style('opacity', .9);
      tooltip.html(d.properties.Country + '<br/>'+colorDensity+ ":"+ Math.round(d.properties.CarbonEmision * 100) / 100)
        .styles({
          'left': (d3.event.pageX) + 'px',
          'top': (d3.event.pageY) + 'px'
        })
    })
    .on('mouseout', function(d) {
	  d3.select(this).classed("selected",false)
      tooltip.transition()
        .duration(300)
        .style('opacity', 0);
    });
	
	}
	else 
	{
	g.append('g')
    .attr('class', 'county')
    .selectAll('path')
    .data(counties)
    .enter()
    .append('path')
	//.filter(function(d) { return d.properties.year == Year })
    .attrs({
      'd': path,
      'class': 'county',
      'stroke': 'grey',
      'stroke-width': 0.3,
      'cursor': 'pointer',
      'fill': function(d) {
        var countyGDP = Math.round(d.properties.TotalGeneration * 100) / 100;
        var GDP = countyGDP ? countyGDP : 0;
        return color(scaleDensity(GDP))
      }
    })
    .on('click', function(d) {
		  	
	      clicked(d.properties.Country);
		  
	})
    .on('mouseover', function(d) {
	  d3.select(this).classed("selected",true)
      tooltip.transition()
        .duration(200)
        .style('opacity', .9);
      tooltip.html(d.properties.Country + '<br/>'+colorDensity+ ":"+ Math.round(d.properties.TotalGeneration * 100) / 100)
        .styles({
          'left': (d3.event.pageX) + 'px',
          'top': (d3.event.pageY) + 'px'
        })
    })
    .on('mouseout', function(d) {
	  d3.select(this).classed("selected",false)
      tooltip.transition()
        .duration(300)
        .style('opacity', 0);
    });
}
	
	function clicked(country) {
	 d3.selectAll("svg.svgPie").remove()
	 
	 
	
	 function filterdata(contryData) {
	 return (contryData.Country == country && contryData.type == "NonRenwable" ) 
}
  
  	selectedCountry = datatree.filter(filterdata)
		console.log(selectedCountry);
		
		 function filterRedata(contryData) {
	 return (contryData.Country == country && contryData.value != 0 && contryData.type != "NonRenwable" ) 
}
  
  	selectedRECountry = datatree.filter(filterRedata)
		
			console.log(selectedRECountry);

	createTreeMap(selectedRECountry,selectedCountry,country);
	
    }
var tooltipNew = d3.select("#PieChart")
		.append('div')
		.attr('class', 'tooltipNew');
		tooltipNew.append('div')
		.attr('class', 'label');
		tooltipNew.append('div')
		.attr('class', 'percent');	
		
		
// clicked function		

 function createTreeMap(newtree,nomdata,country){
	var headText="Renewable resources used by ";
	var nonReValue = Math.round(nomdata[0].value *100/100);
	 if (newtree.length == 0)
	 {
		newtree =  nomdata;
		headText="Only NonRenwable resources used by ";
	 }
	   document.getElementById("disapear").innerHTML = "";
var newcolor = d3.scaleOrdinal()
    .range([ "#1f78b4","#33a02c","#00441b","#e31a1c","#800026","#ff7f00","#6a3d9a","#ffff99","#b15928"]);

 var arc = d3.arc()
  .innerRadius(0)
  .outerRadius(100);



var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d.value; });
var newsvg = d3.select("#PieChart").append("svg")
    .attr("width", 400)
    .attr("height", 500)
	.attr("class", 'svgPie')
	.append("g")
	.attr('class', 'pie')
    .attr('transform', 'translate(200, 132)');
	
	
  var newg = newsvg.selectAll(".arc")
      .data(pie(newtree))
	  .enter().append("g")
      .attr("class", "arc");

  newg.append("path")
      .attr("d", arc)
      .style("fill", function(d) { return newcolor(d.data.type); })
	  .on('mouseover', function(d) {
			var total = d3.sum(newtree.map(function(d) {
				return (d.enabled) ? d.value : 0;
			}));

			var percent = Math.round(d.data.value * 100) / 100;
			tooltipNew.select('.label').html(d.data.type).style('color','black');
			//tooltipNew.select('.count').html(d.data.value);
			tooltipNew.select('.percent').html(percent + '%');

			tooltipNew.style('display', 'block');
			tooltipNew.style('opacity',2);
			})
			.on('mousemove', function(d) {
			tooltipNew.style('top', (d3.event.layerY + 10) + 'px')
			.style('left', (d3.event.layerX - 25) + 'px');
		})
		.on('mouseout', function() {
			tooltipNew.style('display', 'none');
			tooltipNew.style('opacity',0);
		});
	
		
		
	 newsvg.append('g')
  .attr('class', 'legendnew')
    .selectAll('text')
    .data(newtree)
      .enter()
        .append('text')
          .text(function(d) { return '• ' +d.type+" : " + Math.round(d.value * 10000) / 10000 +"%" ; })
          .attr('fill', function(d) { return newcolor(d.type); })
       	  .attr("transform", function(d,i){
    return "translate(" + (-100) + "," + (i * 20 + 150) + ")"; 
  }) 
  newsvg.append('g')
  .attr('class', 'textCon')
  .append('text')
  .text(headText + country)
  .attr("transform", "translate(-140, -120)"); 
  
  console.log(nomdata);
  newsvg.append('g')
  .attr('class', 'textCon')
  .append('text')
  .text("NonRenwable resources used by " + country +": " +nonReValue +"%")
  .attr("transform", "translate(-160, 290)"); 
  
	  
 }
	

  var legendContainerSettings = {
    x: width * 0.04,
    y: height * 0.63,
    width: 650,
    height: 90,
    roundX: 10,
    roundY: 10
  }

 
  var legendContainer = svg.append('rect')
    .attrs({
      'x': legendContainerSettings.x,
      'y': legendContainerSettings.y,
      'rx': legendContainerSettings.roundX,
      'ry': legendContainerSettings.roundY,
      'width': legendContainerSettings.width,
      'height': legendContainerSettings.height,
      'id': 'legend-container'
    });

  var legendBoxSettings = {
    width: 100,
    height: 15,
    y: legendContainerSettings.y + 55
  };

  var legendData = [0, 0.2, 0.4, 0.6, 0.8, 1];

  var legend = svg.selectAll('g.legend')
    .data(legendData)
    .enter().append('g')
    .attr('class', 'legend');

  legend.append('rect')
    .attrs({
      'x': function(d, i) {
        return legendContainerSettings.x + legendBoxSettings.width * i + 20;
      },
      'y': legendBoxSettings.y,
      'width': legendBoxSettings.width,
      'height': legendBoxSettings.height
    })
    .styles({
      'fill': function(d, i) {
        return color(d);
      },
      'opacity': 1
    });

  var formatDecimal = d3.format('.1f');

  function getPopDensity(rangeValue) {
    return formatDecimal(scaleDensity.invertExtent(rangeValue)[1]);
  }

  var legendLabels = [
    '<' + getPopDensity(0),
    '>' + getPopDensity(0),
    '>' + getPopDensity(0.2),
    '>' + getPopDensity(0.4),
    '>' + getPopDensity(0.6),
    '>' + getPopDensity(0.8)
  ];

  legend.append('text')
    .attrs({
      'x': function(d, i) {
        return legendContainerSettings.x + legendBoxSettings.width * i + 30;
      },
      'y': legendContainerSettings.y + 52
    })
    .style('font-size', 12)
    .text(function(d, i) {
      return legendLabels[i];
    });

  legend.append('text')
    .attrs({
      'x': legendContainerSettings.x + 13,
      'y': legendContainerSettings.y + 29
    })
    .styles({
      'font-size': 16,
      'font-weight': 'bold'
    })
    .text(colorDensity);
  
  optionSelect
    .on("change", function() {
    var option = d3.select(options).node().value;
d3.selectAll("circle").remove()
   // if (option == "all") {
		//ig = "all"
	 d3.selectAll("path.county").remove()
	 d3.selectAll("g.legend").remove()
	// d3.selectAll("image").remove()
	 d3.selectAll("g.bar").remove()
    runbaby(option);
	
	   
    });
  
  optionSelectRe
    .on("change", function() {
    var optionrenew = d3.select(renew).node().value;
	d3.selectAll("image").remove()

	d3.selectAll("circle").remove()
	d3.selectAll("text.markertext").remove()
	  
    marker(optionrenew);
	
	 });
  
  function marker(renewable){
	  
	  var Recountry;
   
console.log(point);
  if(renewable == "Hydro" ){
  	Recountry = d3.entries(point).filter(function(d) { return d.value.HydroPower != 0})
  } else if(renewable == "Wind") {

  	Recountry = d3.entries(point).filter(function(d) { return d.value.WindPower != 0})
	  
  }
  else if(renewable == "Biomasswaste") {

  	Recountry = d3.entries(point).filter(function(d) { return d.value.BiomassWaste != 0})
	  
  }
  else if(renewable == "Solar") {

  	Recountry = d3.entries(point).filter(function(d) { return d.value.SolarPower != 0})
	  
  }else if(renewable == "Geothermal") {

  	Recountry = d3.entries(point).filter(function(d) { return d.value.GeoThermal != 0})
	  
  }else if(renewable == "Wavetidal") {

  	Recountry = d3.entries(point).filter(function(d) { return d.value.Wave_Tide != 0})
	  
  }
g.selectAll(".marker")
  .transition()
    .duration(750)
    .attr("transform", function(d) {
      var t = d3.transform(d3.select(this).attr("transform")).translate;//maintain aold marker translate 
      return "translate(" + t[0] +","+ t[1] + ")scale("+1/scale+")";//inverse the scale of parent
    });   
	
	  g.selectAll(".marker")
    .attr("transform", function(d) {
      var t = d3.transform(d3.select(this).attr("transform")).translate;
      console.log(t)
      return "translate(" + t[0] +","+ t[1] + ")scale("+1+")";
    });   
	
	 g.selectAll(".marker")//adding mark in the group
    .data(Recountry)
    .enter()
    .append("circle")
	.attr("class","mapCircle")
	.attr("r",3.2)
	.attr("cx",function(d){
		var coords = projection([d.value.longitude,d.value.latitude])
		return coords[0];
	})
    .attr("cy" ,function(d){
		var coords = projection([d.value.longitude,d.value.latitude])
		return coords[1];
	});
/*	
	g.selectAll(".markertext")//adding mark in the group
    .data(Recountry)
    .enter()
    .append("text")
	.attr('class', 'markertext')
	.attr("x",function(d){
		var coords = projection([d.value.longitude,d.value.latitude])
		return coords[0];
	})
    .attr("y" ,function(d){
		var coords = projection([d.value.longitude,d.value.latitude])
		return coords[1];
	}).text(function(d){
		return d.value.Country;
	
	});
	*/
	
	
	/*
	 g.selectAll(".marker")//adding mark in the group
    .data(Recountry)
    .enter()
    .append("image")
    .attr('class', 'marker')
    .attr('width', 20)
    .attr('height', 30)
    .attr("xlink:href", 'flash.png')
    .attr("transform", function(d) {
      return "translate(" + projection([d.value.longitude, d.value.latitude]) + ")";*/
 
 //  });
  
  
	  
	  
	  
	  
  }
  
  
  
  
 
	}
}


