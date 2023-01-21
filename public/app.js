const toCurrency = (price) => {
	return new Intl.NumberFormat('en-En', {
		currency: 'usd',
		style: 'currency'
	}).format(price);
};

document.querySelectorAll('.price').forEach(node => {
	node.textContent = toCurrency(node.textContent);
});

const toDate = (date) => {
	return new Intl.DateTimeFormat('en-En', {
		day: '2-digit',
		month: 'long',
		year: 'numeric',
		hour:  '2-digit',
		minute: '2-digit',
		second: '2-digit'
	}).format(new Date(date));
};

document.querySelectorAll('.date').forEach(node => {
	node.textContent = toDate(node.textContent);
});

const $card = document.querySelector('#card')
if($card){
	$card.addEventListener('click', async (event) => {
		if(event.target.classList.contains('js-remove')){
			const id = event.target.dataset.id;
			const csrf = event.target.dataset.csrf;

			await fetch('/card/remove/' + id, 
			{   method: 'delete', 
				// body: JSON.stringify({csrf}),
				headers: new Headers({
					lang: navigator.language,
					Accept: 'application/json, text/plain, */*',
					'Content-type': 'application/json;charset=utf-8',
					'X-XSRF-TOKEN': csrf
				}),
			})	.then(res => res.json())
				.then(card => {
					if(card.courses.length){
						const html = card.courses.map(item => (
							`<tr>
								<td>${item.title}</td>
								<td>${item.count}</td>
								<td>
								<button class='btn btn-small js-remove' data-id='${item.id}'>Delete</button>
								</td>
							</tr>`
						)).join('');
						
						$card.querySelector('tbody').innerHTML = html;
						$card.querySelector('.price').textContent = toCurrency(card.price);
					}else{
						$card.innerHTML = '<p>Basket is empty</p>'
					}
				})
				.catch(error => console.log(error))
			
		}
	})
}

// tabs interaction
M.Tabs.init(document.querySelectorAll('.tabs'));