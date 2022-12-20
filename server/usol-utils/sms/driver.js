const sms = require('./index');

// This is a successful sending sms request, but at the moment the provided sms configs needs payment
// so messages won't be sent, status code 200 but result data came back with "ERROR 402" message(needs payment)
sms.send(['963946966082'], 'successful test message').then((r) => {
	console.log(r);
});

// sending a bad request:
sms.send([], 'bad test message').then((r) => {
	console.log(r);
});

//sending an empty phone in phones array (handled that without failing the request) :
sms.send(['963946966082', '', '963946966082'], 'test message').then((r) => {
	console.log(r);
});
