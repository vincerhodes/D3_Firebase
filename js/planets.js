// select svg container
const svg = d3.select('#canvas')
	.append('svg')
	.attr('width', 600)
	.attr('height', 600);

d3.json('data/planets.json').then(data => {
	
	const circs = svg.selectAll('circle')
		.data(data);
	
	// add attrs to circs already in the DOM
	circs
		.attr('cy', 100)
		.attr('cx', d => d.distance)
		.attr('r', d => d.radius)
		.attr('fill', d => d.fill);

	// append the enter selection to the DOM
	circs
		.enter()
		.append('circle')
		.attr('cy', 100)
		.attr('cx', d => d.distance)
		.attr('r', d => d.radius)
		.attr('fill', d => d.fill);
})