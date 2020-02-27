const btns = document.querySelectorAll('button');
const form = document.querySelector('form');
const formAct = document.querySelector('form span');
const input = document.querySelector('input');
const error = document.querySelector('.error');

var activity = 'cycling';

btns.forEach(btn => {

		btn.addEventListener('click', e => {

			// get activity
			activity = e.target.dataset.activity;

			// update active button status
			btns.forEach(btn => btn.classList.remove('active'));
			e.target.classList.add('active');

			// update id property of the input field
			input.setAttribute('id', activity);

			// update text in the span of the form
			formAct.textContent = activity;

			// call the update function
			update(data);

		})
})

// form submission
form.addEventListener('submit', e => {
	// prevent default action
	e.preventDefault();

	if (input.value) {
		const distance = parseInt(input.value);
		db.collection('activities').add({
			distance,
			activity,
			date: new Date().toString()
		}).then(() => {
			error.textContent = '';
			input.value = '';
		})
	} else {
		error.textContent = 'Please enter a value before submitting'
	}
})
