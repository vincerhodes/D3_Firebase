const dimMap = {top: 150, right: 10, bottom: 20, left: 10};
    dimMap.width = 920 - dimMap.left - dimMap.right;
    dimMap.height = 900 - dimMap.top - dimMap.bottom;
console.log(dimMap);

const svgMap = d3.select('.canvas.map').append('svg')
    .attr('width', dimMap.width + dimMap.left + dimMap.right)
    .attr('height', dimMap.height + dimMap.top + dimMap.bottom);

// create a graph within the svgMap where the map will be drawn
const graphMap = svgMap.append('g')
    .attr('transform', `translate(${dimMap.left}, ${dimMap.top})`);

const tip = d3.select('body')
  .append('div')
	.attr('class', 'tooltip map')
  .style("top", "260px")
  .style("left", "660px")
  .style('opacity', 0);

// choropleth colour scale
var choropleth = d3.scaleThreshold()
  .range(d3.schemeReds[9]);

// setup the projection to be used and centre on China
const projection = d3.geoMercator()
 .center([110, 25])
 .scale([800])
 .translate([550,550])
 .precision([.1]);

// setup the path function to draw paths correctly
const boundaries = d3.geoPath()
    .projection(projection);

// declare variables that will be used for all charts
var selectedProvince = '中国'; // variable to contain the selected province

// fetch all data
var promises = [
  d3.json("data/china-provinces.json"),
  d3.json("https://raw.githubusercontent.com/BlankerL/DXY-COVID-19-data/master/json/DXYArea.json")
  // d3.json("data/DXYArea.json")
]

// sources.forEach(url => promises.push(d3.json(url)));

// fetch data and draw the map
Promise.all(promises).then(data => {

  // setup topo data
  const topo = data[0];
  // extract features from the map json using topojson
  features = topojson.feature(topo, topo.objects.provinces).features; // for topojson files
  // features = topo.features; // use this for geojson files

  // setup virus data and filter for China only
  virus_data = data[1].results
  virus_data = virus_data.filter(item  => item.countryName == '中国');
  console.log(virus_data);

  // setup data for use in the bar circle
  var totals = {confirmed: 0, cured: 0, dead: 0};
  var circleData =  [];
  virus_data.forEach(data => {
    totals.confirmed += data.confirmedCount;
    totals.cured += data.curedCount;
    totals.dead += data.deadCount;
    circleData.push({
      province_ch: data.provinceShortName,
      province_en: data.provinceEnglishName,
      name: 'confirmed',
      value: data.confirmedCount
    },
    {
      province_ch: data.provinceShortName,
      province_en: data.provinceEnglishName,
      name: 'cured',
      value: data.curedCount
    },
    {
      province_ch: data.provinceShortName,
      province_en: data.provinceEnglishName,
      name: 'deceased',
      value: data.deadCount
    });
  });
  circleData.push(
    {province_ch: '中国', province_en: 'China', name: 'confirmed', 'value': totals.confirmed},
    {province_ch: '中国', province_en: 'China', name: 'cured', 'value': totals.cured},
    {province_ch: '中国', province_en: 'China', name: 'deceased', 'value': totals.dead}
  );

  // update choropleth domain based on the virus data
  // fixed domain
  const fixed_domain = [0,50,100,500,1000,5000,10000,50000,100000]; // fixed domain

  // calculated domain using exponents
  const v_max = d3.max(virus_data, d => d.confirmedCount);
  const scale_stops = 9; // change to 7 for calculated domain
  var domain = [0];
  for (var i = 0; i <= scale_stops - 1; i++) {
    domain.push(Math.floor(Math.pow(6, i)));
  };
  // console.log(scale_stops, domain);
  choropleth
    .range(d3.schemeReds[scale_stops])
    .domain(fixed_domain);

  // draw the map
  const path = graphMap.selectAll('g')
      .data(features)
      .enter()
      .append('path')

  path
      .attr("d", boundaries)
      .attr("fill", d => choropleth(virus_data.find(item => item.provinceShortName == d.properties.NL_NAME_1).confirmedCount))
      .attr("id", d => d.properties.NL_NAME_1)
      .attr("stroke","#fff")
      .attr("stroke-width", 1)
      // setup mouse events
    .on('mouseover', (d,i,n) => {
      d3.select(n[i])
        .transition().duration(100)
        .attr('fill', '#3ed');
      tip
        .style('opacity', 0.8)
        .html(data => {
          data = virus_data.find(item => item.provinceShortName == d.properties.NL_NAME_1);
          let content = `<div class="en_name">${d.properties.NL_NAME_1} | ${d.properties.NAME_1}</div>` +
              `<div class="cases">Confirmed: ${data.confirmedCount}</div>` +
              `<div class="cases">Recovered: ${data.curedCount}</div>` +
              `<div class="cases">Deceased: ${data.deadCount}</div>`;
          return content;
        });
    })
    .on('mouseout', (d,i,n) => {
      d3.select(n[i])
        .transition().duration(100)
        .attr("fill", d => choropleth(virus_data.find(item => item.provinceShortName == d.properties.NL_NAME_1).confirmedCount));
      tip.style('opacity', 0);
    })
    // pin tooltip to mouse cursor
    .on('mousemove', d => {
      tip
        .style("top", (d3.event.pageY - 100) + "px")
        .style("left", (d3.event.pageX) + "px");
    })
    .on('click', d => {
      selectedProvince = d.properties.NL_NAME_1;
      updateCircle(circleData);
    });

    // initial update of the circle bar
    updateCircle(circleData);

});
