/*const ROOT = '/monsters';
document.addEventListener('DOMContentLoaded',() => {
    document.getElementById('withoutAccount').addEventListener('click',async event => {
	//event.preventDefault;
	var context = {};
	context.userName = 'anonymous';
	context.password = 'password';
	console.log('send');
	const response = await fetch(`${ROOT}/login`, {
	    method: 'POST',
	    mode: 'cors',
	    cache: 'no-cache',
	    credentials: 'same-origin',
	    headers: {
		'Content-Type': 'application/json'
		// 'Content-Type': 'application/x-www-form-urlencoded',
	    },
	    redirect: 'follow', 
	    referrer: 'no-referrer',
	    body: JSON.stringify(context)
	});
	redirect(`${ROOT}/home`);
    });
});
*/
