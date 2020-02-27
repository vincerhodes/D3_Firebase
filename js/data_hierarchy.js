const data = [
  { name: 'news', parent: '' },
  { name: 'tech', parent: 'news' },
  { name: 'sport', parent: 'news' },
  { name: 'music', parent: 'news' },
  { name: 'ai', parent: 'tech', amount: 7 },
  { name: 'coding', parent: 'tech', amount: 5 },
  { name: 'tablets', parent: 'tech', amount: 4 },
  { name: 'laptops', parent: 'tech', amount: 6 },
  { name: 'd3', parent: 'tech', amount: 3 },
  { name: 'gaming', parent: 'tech', amount: 3 },
  { name: 'football', parent: 'sport', amount: 6 },
  { name: 'hockey', parent: 'sport', amount: 3 },
  { name: 'baseball', parent: 'sport', amount: 5 },
  { name: 'tennis', parent: 'sport', amount: 6 },
  { name: 'f1', parent: 'sport', amount: 1 },
  { name: 'house', parent: 'music', amount: 3 },
  { name: 'rock', parent: 'music', amount: 2 },
  { name: 'punk', parent: 'music', amount: 5 },
  { name: 'jazz', parent: 'music', amount: 2 },
  { name: 'pop', parent: 'music', amount: 3 },
  { name: 'classical', parent: 'music', amount: 5 },
];

// create the svg and append to the canvas
const svg = d3.select('.canvas')
  .append('svg')
  .attr('height', 800)
  .attr('width', 1060);

// create graph and append to the svg with margin of 50
const graph = svg.append('g')
  .attr('transform', 'translate(50, 50)');

const stratify = d3.stratify()
  .id(d => d.name)
  .parentId(d => d.parent);

const rootNode = stratify(data)
  .sum(d => d.amount);

const pack = d3.pack()
  .size([960, 700])
  .padding(5);

const bubbleData = pack(rootNode).descendants();

// create ordinal color scale
const colour = d3.scaleOrdinal(['#b2b', '#d5d', '#f7f']);

console.log(bubbleData);

// join data and add group for each node
const nodes = graph.selectAll('g')
  .data(bubbleData)
  .enter()
  .append('g')
  .attr('transform', d => `translate(${d.x}, ${d.y})`);

nodes.append('circle')
  .attr('r', d => d.r)
  .attr('stroke', 'white')
  .attr('stroke-width', 2)
  .attr('fill', d => colour(d.depth));

nodes.filter(d => !d.children)
  .append('text')
  .attr('text-anchor', 'middle')
  .attr('dy', '0.3em')
  .attr('fill', 'white')
  .style('font-size', d => d.value * 5)
  .text(d => d.data.name); // can also use d.id
