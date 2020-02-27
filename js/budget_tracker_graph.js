const dims = { height: 400, width: 400, radius: 200 }
const cent = { x: (dims.width / 2 + 5), y: (dims.height / 2 + 5) };

const svg = d3.select('.canvas').append('svg')
	.attr('width', dims.width + 150)
	.attr('height', dims.height + 150);

const graph = svg.append('g')
	.attr("transform", `translate(${cent.x}, ${cent.y})`);

const pie = d3.pie()
	.sort(null)
	.value(d => d.cost);

const duration = 1000;

// // hardcoded data for testing
// const angles = pie([
//   { name: 'rent', cost: 500 },
//   { name: 'bills', cost: 300 },
//   { name: 'gaming', cost: 200 }
// ]);

const arcPath = d3.arc()
	.outerRadius(dims.radius)
	.innerRadius(dims.radius/2);

const colour = d3.scaleOrdinal(d3['schemePastel2'])

const legendGroup = svg.append('g')
	.attr("transform", `translate(${dims.width + 40}, ${10})`);

const legend = d3.legendColor()
	.shape('circle')
	.shapePadding(10)
	.scale(colour);

const tip = d3.tip()
	.attr('class', 'tip card')
	.attr("transform", "translate(30,10)")
	.html(d => {
		let content = `<div class="name">${d.data.name}</div>`;
		content += `<div class="cost">${d.data.cost}</div>`;
		content += `<div class="delete">Click slice to delete</div>`;
		return content;
	});

graph.call(tip);

// update function
const update = (data) => {

	// update colour scales
	colour.domain(data.map(d => d.name));

	// update and call legend
	legendGroup.call(legend)
		.selectAll('text')
		.attr('fill', 'white');

	// join enhanced (pie) data to path elements
	const paths = graph.selectAll('path')
		.data(pie(data));

	// handle DOM exits
	paths.exit()
		.transition().duration(duration)
		.attrTween("d", arcTweenExit)
		.remove();

	// handle DOM updates
	paths
		.transition().duration(duration)
		.attrTween('d', arcTweenUpdate);

	// handle new DOM additions
	paths.enter()
		.append('path')
		.attr('class', 'arc')
		.attr('stroke', '#fff')
		.attr('stroke-width', 2)
		.attr('fill', d => colour(d.data.name))
		.each(function(d) { this._current = d })
		.transition().duration(duration)
		.attrTween("d", arcTweenEnter);

	// add events
	graph.selectAll('path')
		.on('mouseover', (d,i,n) => {
			tip.show(d, n[i]);
			handleMouseOver(d,i,n);
		})
		.on('mouseout', (d,i,n) => {
			tip.hide();
			handleMouseOut(d,i,n);
		})
		.on('click', handleClick);

}


// realtime updates from firestore
var data = [];

db.collection('expenses').onSnapshot(res => {

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

	})

	update(data);

});

const arcTweenEnter = (d) => {
	var i = d3.interpolate(d.endAngle, d.startAngle);

	return function (t) {
		d.startAngle = i(t);
		return arcPath(d);
	}
};

const arcTweenExit = (d) => {
	var i = d3.interpolate(d.startAngle, d.endAngle);

	return function (t) {
		d.startAngle = i(t);
		return arcPath(d);
	}
};

// use function keyword to allow for use of 'this'
function arcTweenUpdate(d) {
	// console.log(this._current, d);
	// interpolate between the two objects
	var i = d3.interpolate(this._current, d);
	// update this._current with the new data
	this._current = i(1);

	return function (t) {
		return arcPath(i(t));
	}
};

// event handers
const handleMouseOver = (d, i, n) => {
	// console.log(n[i]);
	d3.select(n[i])
		.transition('changeSliceFill').duration(300)
		.attr('fill', 'white');
}

const handleMouseOut = (d, i, n) => {
	// console.log(n[i]);
	d3.select(n[i])
		.transition('changeSliceFill').duration(300)
		.attr('fill', d => colour(d.data.name));
}

const handleClick = (d) => {
	const id = d.data.id;
	db.collection('expenses').doc(id).delete();
}
