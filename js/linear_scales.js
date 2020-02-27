// select svg container
const svg = d3.select('.canvas')
	.append('svg')
	.attr('width', 600)
	.attr('height', 600);

// create margins and dimensions
const margin = {top: 20, right: 20, bottom: 100, left: 100};
const graphWidth = 600 - margin.left - margin.right;
const graphHeight = 600 - margin.bottom - margin.top;

const graph = svg.append('g')
	.attr('width', graphWidth)
	.attr('height', graphHeight)
	.attr('transform', `translate(${margin.left},${margin.top})`);

const yAxisGroup = graph.append('g')
	.attr('transform', `translate(0,${graphHeight})`);
const xAxisGroup = graph.append('g');

d3.json('data/menu.json').then(data => {
	
	const y = d3.scaleLinear()
		.domain([0, d3.max(data, d => d.orders)])
		.range([graphHeight, 0]);

	const min = d3.min(data, d => d.orders);
	const max = d3.max(data, d => d.orders);
	const extent = d3.extent(data, d => d.orders);

	console.log(min);
	console.log(max);
	console.log(extent);

	const x = d3.scaleBand()
		.domain(data.map(item => item.name))
		.range([0, graphWidth])
		.paddingInner(0.2)
		.paddingOuter(0.2);

	// join data to rects
	const rects = graph.selectAll('rect')
		.data(data);

	rects
		.attr('width', x.bandwidth)
		.attr('height', d => graphHeight - y(d.orders))
		.attr('fill', 'orange')
		.attr('y', d => y(d.orders))
		.attr('x', d => x(d.name));

	rects.enter()
		.append('rect')
		.attr('width', x.bandwidth)
		.attr('height', d => graphHeight - y(d.orders))
		.attr('fill', 'orange')
		.attr('y', d => y(d.orders))
		.attr('x', d => x(d.name));

	// create and call the axes
	const yAxis = d3.axisBottom(x);		
	const xAxis = d3.axisLeft(y)
		.ticks(3)
		.tickFormat(d => d + ' orders');

	xAxisGroup.call(xAxis);
	yAxisGroup.call(yAxis);

	yAxisGroup.selectAll('text')
		.attr("transform", "rotate(-30)")
		.attr('text-anchor', 'end')
		.attr('fill', 'purple');
})