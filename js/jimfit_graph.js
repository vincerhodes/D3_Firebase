var margin = {top: 40, right: 20, bottom: 50, left: 100},
  width = 560 - margin.left - margin.right,
  height = 360 - margin.top - margin.bottom;

var svg = d3.select('.canvas')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom);

const graph = svg.append('g')
  .attr('width', width)
  .attr('height', height)
  .attr('transform', `translate(${margin.left},${margin.right})`);

// scales
const x = d3.scaleTime().range([0,width]);
const y = d3.scaleLinear().range([height,0]);

// axes groups
const xAxisGroup = graph.append('g')
  .attr('class', 'x-axis')
  .attr('transform', `translate(0, ${height})`);

const yAxisGroup = graph.append('g')
  .attr('class', 'y-axis');

// d3 line path generator
const line = d3.line()
  .x(function(d) { return x(new Date(d.date)) })
  .y(function(d) { return y(d.distance) });

const path = graph.append('path');

// create dotted guideline group and append to the graph
const guideLines = graph.append('g')
  .style('opacity', 0);

// create x dotted line and append to guideline group
const xGuide = guideLines.append('line')
  .attr('stroke', '#f55')
  .attr('stroke-width', 1)
  .attr('stroke-dasharray', 6);

// create x dotted line and append to guideline group
const yGuide = guideLines.append('line')
  .attr('stroke', '#f55')
  .attr('stroke-width', 1)
  .attr('stroke-dasharray', 6);

// data and firestore
var data = [];

const update = (data) => {

  data = data.filter(item  => item.activity == activity);

  // sort date by date order
  data.sort((a,b) => new Date(a.date) - new Date(b.date));

  // set scale domains
  x.domain(d3.extent(data, d => new Date(d.date)));
  y.domain([0,d3.max(data, d => d.distance)]);

  // update path data
  path.data([data])
    .attr('fill', 'none')
    .attr('stroke', '#00bfa5')
    .attr('stroke-width', 2)
    .attr('d', line);

  // create circles for objects
  const circles = graph.selectAll('circle')
    .data(data);

  // handle DOM exits
  circles.exit().remove();

  // handle DOM updates
  circles
    .attr('cx', d => x(new Date(d.date)))
    .attr('cy', d => y(d.distance))

  // add new points
  circles.enter()
    .append('circle')
      .attr('r', 4)
      .attr('cx', d => x(new Date(d.date)))
      .attr('cy', d => y(d.distance))
      .attr('fill', '#ccc');

  // create the axes
  const xAxis = d3.axisBottom(x)
    .ticks(4)
    .tickFormat(d3.timeFormat('%b %d'));

  const yAxis = d3.axisLeft(y)
    .ticks(4)
    .tickFormat(d => d + ' m');

  // call axes to create inside the axis groups
  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);

  // rotate axis text
  xAxisGroup.selectAll('text')
    .attr("transform", "rotate(-30)")
    .attr('text-anchor', 'end');

  // add events
  graph.selectAll('circle')
		.on('mouseover', (d,i,n) => {
			d3.select(n[i])
        .transition().duration(100)
        .attr('r', '8')
			  .attr('fill', '#dd0');

      // set x line coords (x1,x2,y1,y2)
      xGuide
        .attr('x1', x(new Date(d.date)))
        .attr('x2', x(new Date(d.date)))
        .attr('y1', height)
        .attr('y2', y(d.distance));

      // set y line coords (x1,x2,y1,y2)
      yGuide
        .attr('x1', 0)
        .attr('x2', x(new Date(d.date)))
        .attr('y1', y(d.distance))
        .attr('y2', y(d.distance));

      // show the guideline group (.style, opacity)
      guideLines.style('opacity', 1);

		})
		.on('mouseleave', (d,i,n) => {
      d3.select(n[i])
        .transition().duration(100)
        .attr('r', '4')
			  .attr('fill', '#ccc');
      // hide the guideline group (.style, opacity)
      guideLines.style('opacity', 0);
		})

};

db.collection('activities').onSnapshot(res => {

  res.docChanges().forEach(change => {

    const doc = {...change.doc.data(), id: change.doc.id};
    switch (change.type) {
			case 'added':
				data.push(doc);
				break;
			case 'modified':
				const index = data.findIndex(item => item.id == doc.id)
				data[index] = doc;
				break;
			case 'removed':
				data = data.filter(item => item.id !== doc.id);
				break;
			default:
				break;
		}

  });

  update(data);

})
