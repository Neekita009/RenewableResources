'use strict';

var w = window;
var doc = document;
var el = doc.documentElement;
var body = doc.getElementsByTagName('body')[0];
var width = w.innerWidth || el.clientWidth || body.clientWidth;
var height = w.innerHeight|| el.clientHeight|| body.clientHeight;
var centered;

var ig ="all"
var projection = d3.geoEquirectangular().scale(140);
var path = d3.geoPath()
  .projection(projection);

var color = d3.scaleSequential(d3.interpolateYlOrRd);

var tooltip = d3.select('#Map').append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0);

var svg = d3.select('#Map')
  .append('svg')
  .attrs({
    width: width -10 ,
    height: height -100
	
  });
 var Year = 1990

 
  
var formatDateIntoYear = d3.timeFormat("%Y");
var formatDate = d3.timeFormat("%b %Y");
var parseDate = d3.timeParse("%m/%d/%y");
var timer=0
var startDate = new Date("1990-11-01"),
    endDate = new Date("2014-04-01");
var margin = {top:0, right:50, bottom:-100, left:450},
    widthslider = width * .29 ,
    heightslider = height + 1790;
	
var moving = false;
var currentValue = 0;
var targetValue = widthslider;

var playButton = d3.select("#play-button");
 var optionSelect = d3.select("#sel"); 
var x = d3.scaleTime()
    .domain([startDate, endDate])
    .range([0, targetValue])
    .clamp(true);

var slider = svg.append("g")
    .attr("class", "slider")
    .attr("transform", "translate(" + margin.left + "," + heightslider/5 + ")");

svg.append('rect')
  .attrs({
    'class': 'background',
    'width': width,
    'height': height * .09
  })
  .on('click', clicked);

var g = svg.append('g');

var zoomSettings = {
  duration: 1000,
  ease: d3.easeCubicOut,
  zoomLevel: 2
};

function clicked(d) {
  var x;
  var y;
  var zoomLevel;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    zoomLevel = zoomSettings.zoomLevel;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    zoomLevel = 1;
    centered = null;
  }

  g.transition()
    .duration(zoomSettings.duration)
    .ease(zoomSettings.ease)
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')scale(' + zoomLevel + ')translate(' + -x + ',' + -y + ')');
}
dosomething();
function dosomething(){
d3.json('CountryAll.json', function(error, Alldata) {
  if (error) {
    return console.error(error);
  }
	var   data = Alldata
//	var Year =1990
	updateData(Year);
	
	var counter = 0
	
	 
  function updateData(Year)
  {  
 var counties = topojson.feature(data,data.objects.CountryAll).features;
	 
 
  var meanResource = d3.mean(counties, function(d) {
	  if(d.properties.year == Year){
    return Math.round(d.properties.Renewable_Resource * 100) / 100;
	  }
  });
  

 var TopCountries = d3.entries(counties).filter(function(d) { return d.value.properties.year == Year })
 
    .sort(function(a, b) { return d3.descending(a.value.properties.Renewable_Resource, b.value.properties.Renewable_Resource); }).slice(0, 5);
	 
  var scaleDensity = d3.scaleQuantize()
    .domain([0, meanResource])
    .range([0, 0.2, 0.4, 0.6, 0.8, 1]);

 
    	
	// actual map 
  g.append('g')
    .attr('class', 'county')
    .selectAll('path')
    .data(counties)
    .enter()
    .append('path')
	.filter(function(d) { return d.properties.year == Year  })
    .attrs({
      'd': path,
      'class': 'county',
      'stroke': 'grey',
      'stroke-width': 0.3,
      'cursor': 'pointer',
      'fill': function(d) {

        var countyGDP = Math.round(d.properties.Renewable_Resource * 100) / 100;
        var GDP = countyGDP ? countyGDP : 0;
        return color(scaleDensity(GDP))
      }
    })
    .on('click', clicked)
    .on('mouseover', function(d) {
	  d3.select(this).classed("selected",true)
      tooltip.transition()
        .duration(200)
        .style('opacity', .9);
      tooltip.html(d.properties.country + '<br/> REnew(%):'  + Math.round(d.properties.Renewable_Resource * 100) / 100)
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

	
  var legendContainerSettings = {
     x: width * 0.04,
    y: height * 0.63,
    width: 350,
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
    width: 50,
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
   function getPopDensitynew(rangeValue) {
    return formatDecimal(scaleDensity.invertExtent(rangeValue));
  }

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
    .text('% of Renewable Electricity');
// bar char
		
  var barContainerSettings = {
    x: width * 0.72,
    y: height / 5000,
    width: 350,
    height: 290,
    roundX: 10,
    roundY: 10
  }

 
  var barContainer = svg.append('rect')
    .attrs({
      'x': barContainerSettings.x,
      'y': barContainerSettings.y,
      'rx': barContainerSettings.roundX,
      'ry': barContainerSettings.roundY,
      'width': barContainerSettings.width,
      'height': barContainerSettings.height,
      'id': 'bar-container'
    });

  var barBoxSettings = {
    width: 65,
    height: 55,
	barPadding : 6,
    y: barContainerSettings.y + 155
  };

  
  var bar = svg.selectAll('g.bar')
    .data(TopCountries)
    .enter().append('g')
    .attr('class', 'bar');

  bar.append('rect')
    .attrs({
      'x': function(d, i) {
        return barContainerSettings.x + (barBoxSettings.width) * i + 20;
      },
      'y': function(d){ 
				return barContainerSettings.height - d.value.properties.Renewable_Resource * 4;
	  },
      'width': barContainerSettings.width/ TopCountries.length - barBoxSettings.barPadding,
      'height':function(d){
		return d.value.properties.Renewable_Resource * 4;
	}
	})
    .styles({
      'fill': function(d, i) {
        return 'teal';
      },
      'opacity': 1
    });


  bar.append('text')
    .attrs({
      'x': function(d, i) {
        return barContainerSettings.x + (barBoxSettings.width) * i + 20;
      },
      'y': function(d){ return barContainerSettings.height - d.value.properties.Renewable_Resource * 4 - 2  ;}
    })
    .style('font-size', 5)
	.attr('class', 'text-con')
    .text(function(d) {
      return d.value.properties.country ;
    });
bar.append('text')
    .attrs({
      'x': function(d, i) {
        return barContainerSettings.x + barBoxSettings.width * i + 20;
      },
      'y':function(d){ return barContainerSettings.height - d.value.properties.Renewable_Resource * 4 +15 ;}
    })
    .style('font-size', 12)
    .text(function(d) {
      return Math.round(d.value.properties.Renewable_Resource * 100) / 100 ;
    });
  bar.append('text')
   .attrs({
      'x': barContainerSettings.x + 40,
      'y': barContainerSettings.y + 320
    })
    .styles({
      'font-size': 12,
      'font-weight': 'bold',
	  'font-family': '"Proxima Nova", Montserrat, sans-serif'
    })
    .text('Top 5 country Renewable Electricity');	
	
// marker code 

	
	
  }
  
  function updateIncomeandFilter(Year, x)
  {
	  
	var counties = topojson.feature(data,data.objects.CountryAll).features;
	 
 
  var meanResource = d3.mean(counties, function(d) {
	  if(d.properties.year == Year && d.properties.income == x ){
    return Math.round(d.properties.Renewable_Resource * 100) / 100;
	  }
  });
  
  var maxResource = d3.max(counties, function(d) {
	   if(d.properties.year == Year){
    return d.properties.Renewable_Resource;
	  }
	  
	  
  });
 var TopCountries = d3.entries(counties).filter(function(d) { return d.value.properties.year == Year && d.value.properties.income == x })
 
    .sort(function(a, b) { return d3.descending(a.value.properties.Renewable_Resource, b.value.properties.Renewable_Resource); }).slice(0, 5);
	 
  var scaleDensity = d3.scaleQuantize()
    .domain([0, meanResource])
    .range([0, 0.2, 0.4, 0.6, 0.8, 1]);

	
	// filter map 
	 g.append('g')
    .attr('class', 'county')
    .selectAll('path')
    .data(counties)
    .enter()
    .append('path')
	.filter(function(d) { return d.properties.year == Year  })
    .attrs({
      'd': path,
      'class': 'county',
      'stroke': 'grey',
      'stroke-width': 0.3,
      'cursor': 'pointer',
      'fill': '#F8F8FF'
    })
    .on('click', clicked);
	
 
    	
	// actual map 
  g.append('g')
    .attr('class', 'county')
    .selectAll('path')
    .data(counties)
    .enter()
    .append('path')
	.filter(function(d) { return d.properties.year == Year && d.properties.income == x })
    .attrs({
      'd': path,
      'class': 'county',
      'stroke': 'grey',
      'stroke-width': 0.3,
      'cursor': 'pointer',
      'fill': function(d) {

        var countyGDP = Math.round(d.properties.Renewable_Resource * 100) / 100;
        var GDP = countyGDP ? countyGDP : 0;
        return color(scaleDensity(GDP))
      }
    })
    .on('click', clicked)
    .on('mouseover', function(d) {
	  d3.select(this).classed("selected",true)
      tooltip.transition()
        .duration(200)
        .style('opacity', .9);
      tooltip.html(d.properties.country + '<br/> REnew(%):'  + Math.round(d.properties.Renewable_Resource * 100) / 100)
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

	
  var legendContainerSettings = {
     x: width * 0.04,
    y: height * 0.63,
    width: 350,
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
    width: 50,
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
   function getPopDensitynew(rangeValue) {
    return formatDecimal(scaleDensity.invertExtent(rangeValue));
  }

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
    .text('% of Renewable Electricity');
// bar char
		
  var barContainerSettings = {
    x: width * 0.72,
    y: height / 5000,
    width: 350,
    height: 290,
    roundX: 10,
    roundY: 10
  }

 
  var barContainer = svg.append('rect')
    .attrs({
      'x': barContainerSettings.x,
      'y': barContainerSettings.y,
      'rx': barContainerSettings.roundX,
      'ry': barContainerSettings.roundY,
      'width': barContainerSettings.width,
      'height': barContainerSettings.height,
      'id': 'bar-container'
    });

  var barBoxSettings = {
    width: 65,
    height: 55,
	barPadding : 6,
    y: barContainerSettings.y + 155
  };

  
  var bar = svg.selectAll('g.bar')
    .data(TopCountries)
    .enter().append('g')
    .attr('class', 'bar');

  bar.append('rect')
    .attrs({
      'x': function(d, i) {
        return barContainerSettings.x + (barBoxSettings.width) * i + 20;
      },
      'y': function(d){ 
				return barContainerSettings.height - d.value.properties.Renewable_Resource * 4;
	  },
      'width': barContainerSettings.width/ TopCountries.length - barBoxSettings.barPadding,
      'height':function(d){
		return d.value.properties.Renewable_Resource * 4;
	}
	})
    .styles({
      'fill': function(d, i) {
        return 'teal';
      },
      'opacity': 1
    });


  bar.append('text')
    .attrs({
      'x': function(d, i) {
        return barContainerSettings.x + (barBoxSettings.width) * i + 20;
      },
      'y':  function(d){ return barContainerSettings.height - d.value.properties.Renewable_Resource * 4 - 2;}
    })
    .style('font-size', 5)
	.attr('class', 'text-con')
    .text(function(d) {
      return d.value.properties.country ;
    });
bar.append('text')
    .attrs({
      'x': function(d, i) {
        return barContainerSettings.x + barBoxSettings.width * i + 20;
      },
      'y': function(d){ return barContainerSettings.height - d.value.properties.Renewable_Resource * 4 + 15;} 
    })
    .style('font-size', 12)
    .text(function(d) {
      return Math.round(d.value.properties.Renewable_Resource * 100) / 100 ;
    });
  bar.append('text')
   .attrs({
      'x': barContainerSettings.x + 40,
      'y': barContainerSettings.y + 320
    })
    .styles({
      'font-size': 16,
      'font-weight': 'bold'
    })
    .text('Top 5 '+ x +' countries');	
	  
	  
	 
  }
  
 //////////////////////// Slider /////////////////////////////////////
  
slider.append("line")
    .attr("class", "track")
    .attr("x1", x.range()[0])
    .attr("x2", x.range()[1])
	.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-inset")
	.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-overlay")
    .call(d3.drag()
        .on("start.interrupt", function() { slider.interrupt(); })
        .on("start drag", function() {
          currentValue = d3.event.x;
          update(x.invert(currentValue)); 
        })
    );

slider.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 18 + ")")
	.selectAll("text")
    .data(x.ticks(15))
    .enter()
    .append("text")
    .attr("x", x)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .text(function(d) { return formatDateIntoYear(d); });

var handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);

var label = slider.append("text")  
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .text(formatDateIntoYear(startDate))
    .attr("transform", "translate(0," + (-25) + ")")

 playButton
    .on("click", function() {
    var button = d3.select(this);
    if (button.text() == "Pause") {
      moving = false;
	  button.text("Play");
      clearInterval(timer);
       timer = 0;
      
    } else {
      moving = true;
	  button.text("Pause");
      timer = setInterval(step,1000);
      
    }
    console.log("Slider moving: " + moving);
  })
  
  
    function update(h) {
	counter ++;
  // update position and text of label according to slider scale
  handle.attr("cx", x(h));
  label
    .attr("x", x(h))
    .text(formatDateIntoYear(h));
     console.log(formatDateIntoYear(h));
	 d3.selectAll("path").remove()
	 d3.selectAll("g.legend").remove()
	 d3.selectAll("rect#legend-container").remove()
	 d3.selectAll("image").remove()
	 d3.selectAll("g.bar").remove()
	 if(ig == "all")
	 {
		
	 updateData(formatDateIntoYear(h));
	 }
	 else{
		
		 updateIncomeandFilter(formatDateIntoYear(h),ig)
	 }
	 
}
  function step() {
  update(x.invert(currentValue));
  currentValue = currentValue + (targetValue/151);
  if (currentValue > targetValue) {
		moving = false;
    currentValue = 0;
   clearInterval(timer);
    timer = 0;
    playButton.text("Play");
	console.log(x.invert(currentValue))
    console.log("Slider moving: " + moving);
  }
  }
optionSelect
    .on("change", function() {
    var option = d3.select(sel).node().value;

    if (option == "all") {
		ig = "all"
      update(x.invert(currentValue));
    } else {
		 ig = option
      update(x.invert(currentValue));
	  //updateIncomeandFilter(Year, ig)
     
    }
    console.log("dropdown change "+ig);
  })

});
}


