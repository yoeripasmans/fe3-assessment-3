//Projection with properties to show only europe
var projection = d3.geoMercator()
  .scale(1000) //Zoom level for the d3 data
  .center([-6, 53.5]); //Starting point

//Define default path generator
var path = d3.geoPath()
  .projection(projection);

//Define threshold scale to sort data values into color
var color = d3.scaleThreshold()
  .domain([50, 200, 750])
  .range(["#F2CED1", "#E5A2A1", "#CC4A4B", "#C22626"]);

//Adds the map svg to the container in the HTML
var svg = d3.select(".container")
  .append("svg")
  .attr('class', 'map')
  .attr("width", 100 + "%")
  .attr("height", 100 + "%");

//Legend based on https://bl.ocks.org/zanarmstrong/0b6276e033142ce95f7f374e20f1c1a7
var colorLegend = d3.legendColor()
  .labelFormat(d3.format(".0f"))
  .scale(color)
  .labels(d3.legendHelpers.thresholdLabels)
  .shapePadding(5)
  .shapeWidth(50)
  .shapeHeight(20)
  .labelOffset(12);

//Append legend to conainer
d3.select(".container")
  .append("svg")
  .attr('class', 'legend')
  .attr("width", 166.17)
  .attr("height", 95)
  .call(colorLegend);

//Append tool-tip to conainter
var tooltip = d3.select(".container")
  .append("div")
  .attr("class", "tool-tip");

//Declare global clickedCountry varialbe
var clickedCountry;

//Load in terrorism data
d3.csv("total.csv", function(data) {

  //Merge the terrorism data and GeoJSON
  d3.json("eu.geo.med.json", function(err, json) {

    for (var i = 0; i < data.length; i++) {
      //Grab country name
      var dataCountry = data[i].country;
      //Parse the total Fatalities amount to a float
      var dataValue = parseFloat(data[i].value);
      //Find the corresponding country in the GeoJSON
      for (var j = 0; j < json.features.length; j++) {
        var jsonCountry = json.features[j].properties.name;
        if (dataCountry == jsonCountry) {
          //Copy the data value into the JSON
          json.features[j].properties.value = dataValue;

          break;
        }
      }
    }

    //Bind data and create one path per GeoJSON feature = (countries)
    svg.selectAll("path")
      .data(json.features)
      .enter()
      .append("path")
      .attr("d", path)
      //Gives countries a class with the name of that counrty
      .attr("class", function(d) {
        return d.properties.name;
      })
      //Showing tool-tip only on the countries with a fatalities value
      .on("mouseover", function(d) {
        //Get data value
        var value = d.properties.value;
        if (value) {
          tooltip.text("Total Fatalities:" + " " + d.properties.value);
          tooltip.style("visibility", "visible");

        }
      })
      //Folows cursor
      .on("mousemove", function() {
        return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
      })
      //Hides tool-tip on mouse out
      .on("mouseout", function() {
        return tooltip.style("visibility", "hidden");
      })
      //Update the line graph on click
      .on("click", function(d) {
        //Get data value
        var value = d.properties.value;
        if (value) {
          //Saves clicked country into variable
          clickedCountry = d.properties.name;
          updateData();
        }
      })
      //Map transition
      .style("fill", "none")
      .transition()
      .ease(d3.easeElastic) // Ease animation
      .duration(1000)
      .delay(function(d, i) {
        return i * 25;
      })
      .style("fill", function(d) {
        //Get data value
        var value = d.properties.value;
        if (value) {
          //If value exists…
          return color(value);
        } else {
          //If value is undefined
          return "#767676";
        }

      })
      //Pointer cursor on the countries with a value
      .style("cursor", function(d) {
        //Get data value
        var value = d.properties.value;
        if (value) {
          return "pointer";
        }
      });

    //World map Based on dataviscourse.net/2016/lectures/lecture-d3-layouts-maps/

    //Line graph

    //Set margins, width and height
    var margin = {
        top: 20,
        right: 20,
        bottom: 40,
        left: 20
      },
      width = 400 - margin.left - margin.right,
      height = 220 - margin.top - margin.bottom;

    //Add a new svg to the container
    var svg2 = d3.select(".container").append("svg")
      .attr('class', 'line-graph')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style('display', 'none')
      .style('position', 'absolute')
      .style('left', '10')
      .style('bottom', '25')
      .style('background-color', '#383838')
      //Append a 'group' element to 'svg'
      .append("g")
      //Moves the 'group' element to the top left margin
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    //Parse the time
    var parseTime = d3.timeParse("%Y");
    var bisectDate = d3.bisector(function(d) {
      return d.year;
    }).left;

    //Set the ranges
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);


    //Define the line
    var line = d3.line()
      .x(function(d) {
        return x(d.year);
      })
      .y(function(d) {
        return y(d.value);
      });

    //Append group to the new svg
    var g = svg2.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    //Filter the data so that only the clicked country data is displayed source https://bl.ocks.org/fabiomainardi/00fd581dc5ba92d99eec
    data = data.filter(function(d) {
      return d.country == clickedCountry;
    });

    //Set the domain of the axises by return min and max of the values
    x.domain(d3.extent(data, function(d) {
      return d.year;
    }));
    y.domain([d3.min(data, function(d) {
      return d.value;
    }) / 1.005, d3.max(data, function(d) {
      return d.value;
    }) * 1.005]);

    //Add the X Axis
    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    //Add the Y Axis
    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(6).tickFormat(function(d) {
        return d;
      }))
      //Y-axis text
      .append("text")
      .attr("class", "axis-title")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .attr("fill", "#5D6971")
      .text("Fatalities");

    //Append the line path
    g.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);

    //Append graph-title
    g.append("text")
      .attr("class", "graph-title")
      .attr("x", '-8')
      .attr('y', '-25')
      .attr("dy", ".31em");

    //Data update function to show new data for on clicked country
    function updateData() {

      //Show graph
      d3.select(".line-graph")
        .style('display', 'block');

      //Adds graph title
      d3.select(".graph-title")
        .text("Fatalities by year in " + clickedCountry);

      //Get the data again
      d3.csv("year.csv", function(data) {
        //Filter the data so that only the clicked country data is displayed
        data = data.filter(function(d) {
          return d.country == clickedCountry;
        });

        //Format the data
        data.forEach(function(d) {
          d.year = parseTime(d.year);
          d.value = +d.value;
        });

        //Scale the range of the data again
        x.domain(d3.extent(data, function(d) {
          return d.year;
        }));
        y.domain([d3.min(data, function(d) {
          return d.value;
        }) / 1.005, d3.max(data, function(d) {
          return d.value;
        }) * 1.005]);

        //Select the section that needs to be changed
        var svg2 = d3.select("body").transition();

        //Make the changes
        svg2.select(".line") //Change the line
          .transition()
          .duration(750)
          .attr("d", line(data));
        svg2.select(".axis--x") //Change the x axis
          .duration(750)
          .call(d3.axisBottom(x));
        svg2.select(".axis--y") //Change the y axis
          .duration(750)
          .call(d3.axisLeft(y).ticks(6).tickFormat(function(d) {
            return d;
          }));

      });

    }

  });

});
