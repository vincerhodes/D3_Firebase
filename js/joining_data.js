const data = [
	{width: 200, height: 100, fill: 'purple'},
	{width: 100, height: 60, fill: 'pink'},
	{width: 50, height: 30, fill: 'red'}
]

const svg = d3.select('svg');

// assign data
const rects = svg.selectAll('rect')
	.data(data)

// att attributes to rects already in the DOM
rects.attr('width', (d, i, n) => d.width )
	.attr('height', d => d.height )
	.attr('fill', d => d.fill );

// append any additional rects to the DOM
rects.enter()
	.append('rect')
	.attr('width', (d, i, n) => d.width )
	.attr('height', d => d.height )
	.attr('fill', d => d.fill );

console.log(rects);