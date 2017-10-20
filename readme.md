# Assessment 3 - Interactive Combined Terrorism Fatalities chart

For this assignment I've made a multiple interactive data visualization of terrorism fatalities in Europe.

![][cover]

## Background

First I've chosen a dataset from 'fivethirtyeight'. This data consist all of the Terrorism Fatalities in Europe between 1970 and 2014.
This was a clean dataset because I couldn't find a dirty one right away and didn't want to waste a lot of time. Instead I focused more on creating a nice interactive data visualization. I've made a map were you get an overview of all the total terrorism fatalities in Europe by country. If you click on a country you can see the fatalities by year in a line graph.

**Steps**
1. Downloaded the Terrorism Fatalities dataset from ['fivethirtyeight'](https://github.com/fivethirtyeight/data/blob/master/terrorism/eu_terrorism_fatalities_by_country.csv)

2. Started project by adding the `HTML`, `CSS` and `JS` files.

3. Made the map of Europe working. After a little bit of research I found out that `geoJSON` was a good library to make this kind of maps. So I downloaded a `JSON` file containing a complete world map. To get the map working locally I copied this code from  [dataviscourse](http://dataviscourse.net/2016/lectures/lecture-d3-layouts-maps/)

```Javascript
    var w = 800;
    var h = 500;
    var projection = d3.geoAlbersUsa()
            .translate([w/2, h/2])
            .scale([700]);

    var path = d3.geoPath()
            .projection(projection);

    var color = 0
            .range(["rgb(237,248,233)","rgb(186,228,179)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"]);

    var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

```

Changed it to my own because the example had a map of the United States and I wanted the map of Europe and on the full width and height of the container.

```javascript
var projection = d3.geoMercator()
  .scale(1000)
  .center([-6, 53.5]);

var path = d3.geoPath()
  .projection(projection);

var color = 0
        .range(["rgb(237,248,233)","rgb(186,228,179)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"]);

var svg = d3.select(".container")
  .append("svg")
  .attr('class', 'map')
  .attr("width", 100 + "%")
  .attr("height", 100 + "%");

```

4. Edit the data by myself so that it can be used in the map (see data).

5. Adding the data to the map and merged it with the terrorism data so only the countries with data have a color. The for loop is based on the example used earlier

```javascript
d3.csv("total.csv", function(data) {

  d3.json("eu.geo.med.json", function(err, json) {

    for (var i = 0; i < data.length; i++) {
      var dataCountry = data[i].country;
      var dataValue = parseFloat(data[i].value);

      for (var j = 0; j < json.features.length; j++) {
        var jsonCountry = json.features[j].properties.name;
        if (dataCountry == jsonCountry) {

          json.features[j].properties.value = dataValue;

          break;
        }
      }
    }

    svg.selectAll("path")
      .data(json.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class", function(d) {
        return d.properties.name;
      })

      .style("fill", function(d) {
        var value = d.properties.value;
        if (value) {
          return color(value);
        } else {
          return "#767676";
        }

      })
```

6. Created a new scale with a matching domain and range to show the differences in the amount of fatalities between the countries
```javascript
var color = d3.scaleThreshold()
  .domain([50, 200, 750])
  .range(["#F2CED1", "#E5A2A1", "#CC4A4B", "#C22626"]);
```

7. Added a tooltip that shows the total amount of fatalities when an user hovers on a country with data

```javascript
var tooltip = d3.select(".container")
  .append("div")
  .attr("class", "tool-tip");
```


```javascript
svg.selectAll("path")
  ...
.on("mouseover", function(d) {
  var value = d.properties.value;
  if (value) {
    tooltip.text("Total Fatalities:" + " " + d.properties.value);
    tooltip.style("visibility", "visible");
  }
})
.on("mousemove", function() {
  return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
})
.on("mouseout", function() {
  return tooltip.style("visibility", "hidden");
})
```

8. Made another csv file with all years in rows by country to show in the line chart (see data)

9. Created another svg for the linechart based on [Simple line graph with v4](https://bl.ocks.org/d3noob/402dd382a51a4f6eea487f9a35566de0) and append it also to the container

```javascript
var svg2 = d3.select(".container").append("svg")
  .attr('class', 'line-graph')
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)

  .style('display', 'none')
  .style('position', 'absolute')
  .style('left', '10')
  .style('bottom', '25')
  .style('background-color', '#383838')

  .append("g")

  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");
```

10. Made the line graph working by using this code from the example.

```javascript
var parseTime = d3.timeParse("%Y");
var bisectDate = d3.bisector(function(d) {
  return d.year;
}).left;

var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

var line = d3.line()
  .x(function(d) {
    return x(d.year);
  })
  .y(function(d) {
    return y(d.value);
  });

var g = svg2.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  x.domain(d3.extent(data, function(d) {
    return d.year;
  }));
  y.domain([d3.min(data, function(d) {
    return d.value;
  }) / 1.005, d3.max(data, function(d) {
    return d.value;
  }) * 1.005]);

  g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  g.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y).ticks(6).tickFormat(function(d) {
      return d;
    }))

```

12. Started with linking the line graph with the map data by declaring a global variable with the name of the clicked country in it.

```javascript
var clickedCountry;
```

13. Made an onclick function in the path of all countries which calls an update data function and saves the clicked country.

```javascript
.on("click", function(d) {
  //Get data value
  var value = d.properties.value;
  if (value) {
    //Saves clicked country into variable
    clickedCountry = d.properties.name;
    updateData();
  }
})
```

14. Created a data filter function so only the data of the clicked country gets displayed in the line graph

```javascript
data = data.filter(function(d) {
  return d.country == clickedCountry;
});
```

15. Made an update data function which updates the data in the line graph when the user clicks on a country with data

```javascript
function updateData() {

  //Show graph
  d3.select(".line-graph")
    .style('display', 'block');

  d3.csv("year.csv", function(data) {
    //Filter the data so that only the clicked country data is displayed
    data = data.filter(function(d) {
      return d.country == clickedCountry;
    });

    data.forEach(function(d) {
      d.year = parseTime(d.year);
      d.value = +d.value;
    });

    // Scale the range of the data again
    x.domain(d3.extent(data, function(d) {
      return d.year;
    }));
    y.domain([d3.min(data, function(d) {
      return d.value;
    }) / 1.005, d3.max(data, function(d) {
      return d.value;
    }) * 1.005]);

    // Select the section that needs to be changed
    var svg2 = d3.select("body").transition();

    d3.select(".graph-title")
      .text("Fatalities by year in " + clickedCountry);

    // Make the changes
    svg2.select(".line") // change the line
      .transition()
      .duration(750)
      .attr("d", line(data));
    svg2.select(".axis--x") // change the x axis
      .duration(750)
      .call(d3.axisBottom(x));
    svg2.select(".axis--y") // change the y axis
      .duration(750)
      .call(d3.axisLeft(y).ticks(6).tickFormat(function(d) {
        return d;
      }));

  });

}
```
16. Lastly I added a legend for the map using susielu's [Legend](https://github.com/susielu/d3-legend) library based on this example  https://bl.ocks.org/zanarmstrong/0b6276e033142ce95f7f374e20f1c1a7
```javascript
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
```

## Changes

### index.html

- Linked Javascript and CSS files.
- Added [D3@4](https://d3js.org/) library
- Added [TopoJSON](https://github.com/topojson/topojson) library
- Added susielu's [Legend](https://github.com/susielu/d3-legend) library
- Added heading
- Added container

### index.css

- Added basic styles to the body and heading
- Added styles to `svg`'s

### index.js
- Imported data
- Added map of Europe
- Added tooltip for map
- Added legend for map
- Added line graph

## Data

The data I chose consist all of the Terrorism Fatalities in Europe between 1970 and 2014 and originates from [fivethirtyeight](https://github.com/fivethirtyeight/data/blob/master/terrorism/eu_terrorism_fatalities_by_country.csv). This was a clean dataset because I couldn't find a dirty one right away and didn't want to waste a lot of time. However I've edited and cleaned the dataset by myself so it works together with the used graphs.

By downloading this dataset, I got a `csv` file where all of the countries were separated in columns. Like this:

year | Belgium | France | Denmark | Germany | Italy | ..
--- | --- | --- | --- | --- | --- | --- | --- | ---
1970 | 0 | 2 | 43 | 54 | 6 | ..
1971 | 0 | 3 | 0 | 46 | 0 | ..
1972 | 0 | 5 | 6 | 5 | 0 | ..

Because I wanted to show the total amount of all years together in a map I made a new `csv` file with all of the countries in one column and the total fatalities in another column like this:  

country | value
--- | --- |
Belgium | 43
Netherlands | 41
France | 274
.. | ..

From here it was easier to make a map and show the data. Then I wanted to show the amount of fatalities by year in another line graph. For this I also made a new `csv` file with three columns. Like this:

year | country | value
--- | --- | --- |
1970 | Belgium | 43
1971 | Belgium | 5
1972 | Belgium | 0
.. | .. | ..
1970 | Netherlands | 0
1971 | Netherlands | 3
1972 | Netherlands | 0
.. | .. | ..

- `year` -- Year of research
- `country` -- The country
- `value` -- Amount of fatalities

## Features

- [d3.transition](https://github.com/d3/d3-transition/blob/master/README.md#transition)
- [d3.select](https://github.com/d3/d3-selection/blob/master/README.md#select)
- [d3.selectAll](https://github.com/d3/d3-selection/blob/master/README.md#selectAll)
- [_selection_.append](https://github.com/d3/d3-selection/blob/master/README.md#selection_append)
- [_selection_.attr](https://github.com/d3/d3-selection/blob/master/README.md#selection_attr)
- [_selection_.enter](https://github.com/d3/d3-selection/blob/master/README.md#selection_enter)
- [d3.pack](https://github.com/d3/d3-hierarchy/blob/master/README.md#pack)
- [_node_.sum](https://github.com/d3/d3-hierarchy/blob/master/README.md#node_sum)
- [_node_.each](https://github.com/d3/d3-hierarchy/blob/master/README.md#node_each)

## License

[MIT](https://opensource.org/licenses/MIT) © Yoeri Pasmans

[cover]: preview.png
