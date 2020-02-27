const canvas = d3.select("#canvas");

const svg = canvas.append('svg')
	.attr('height', 600)
	.attr('width', 600);

const group = svg.append('g')
	.attr('transform', 'translate(0, 100)')

// append some shapes
group.append('rect')
	.attr('width', 200)
	.attr('height', 100)
	.attr('fill', 'blue')
	.attr('x', 20)
	.attr('y', 20);

group.append('circle')
	.attr('r', 50)
	.attr('cx', 300)
	.attr('cy', 70)
	.attr('fill', 'pink');

group.append('line')
	.attr('x1', 370)
	.attr('y1', 400)
	.attr('x2', 20)
	.attr('y2', 120)
	.attr('stroke', 'red');

svg.append('text')
	.attr('x', 20)
	.attr('y', 200)
	.attr('fill', 'grey')
	.text('Jimmy')
	.style('font-family', 'arial');