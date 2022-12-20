const whatsapp = require('./index');

//sending a successful whatsapp message request,
//p.s: provided whatsapp account queue is full, api can't send any message so message will fail but res status is OK
//function always returns the result data if there's any, it contains message status
whatsapp.send('963946966082', 'successful test message').then((r) => {
	//console.log(r);
});

//sending a failing whatsapp message request, empty body leads to fail sending message but res status still OK:
whatsapp.send('963946966082', '').then((r) => {
	//console.log(r);
});

//sending a failing whatsapp message request, missing phone:
whatsapp.send('', 'test message').then((r) => {
	//console.log(r);
});
