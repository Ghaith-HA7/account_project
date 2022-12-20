const emailer = require('./index');

//sending a successful email using the dafault account(nodemailer for a test):
//try to erase email config and see the results
emailer
	.send(['bishershihab@gmail.com'], {
		text: '123 test',
		subject: 'test message',
	})
	.then((r) => {
		console.log(r);
	});

//sending a successful email using optional account(mandrill for a test):
emailer
	.send(
		['bishershihab@gmail.com'],
		{
			text: '123 test',
			subject: 'test message',
			attachments: [
				{
					filename: 'test.txt',
					content: 'helloooo world!',
					type: 'text/*',
				},
			],
		},
		'support@morodigital.com'
	)
	.then((r) => {
		console.log(r);
	});

// //trying to send using a missing account:
emailer
	.send(
		['bishershihab@gmail.com'],
		{
			text: '123 test',
			subject: 'test message',
		},
		'missing@email.com'
	)
	.then((r) => {
		//console.log(r);
	});

// //sending a successful email with attachments:
emailer
	.send(
		['bishershihab@gmail.com'],
		{
			text: '123 test',
			subject: 'test message',
			attachments: [
				{
					filename: 'test.txt',
					content: 'hello world!',
				},
			],
		},
		'support@morodigital.com'
	)
	.then((r) => {
		console.log(r);
	});

// //sending to a wrong email :
emailer
	.send(['bishershihab'], {
		text: '123 test',
		subject: 'test message',
	})
	.then((r) => {
		//console.log(r);
	});
