const cache = require('./index');

//setting a new type safe value which expires in 2 minutes then getting it:

function getStrFirst() {
	cache
		.getString(
			'myStringKey',
			() => {
				console.log('not found');
				return 'firstDbCallValue';
			},
			2
		) // store value from db for 2 seconds
		.then((r) => {
			console.log('type of myStringKey is : ' + typeof r + ', value: ' + r);
		});
}

function getStrSecond() {
	cache
		.getString(
			'myStringKey',
			() => {
				return 'secondDbCallvalue';
			},
			2
		) // store second value from db for 2 seconds
		.then((r) => {
			console.log('type of myStringKey is : ' + typeof r + ', value: ' + r);
		});
}

// 1- String:
cache.set('myStringKey', 'myStringFirstValue', 1).then((r) => {
	console.log('myStringKey value has been cached.');
	getStrFirst(); //this will get the cached value
	setTimeout(getStrFirst, 1500); //after 1.5 seconds key will expire and it will get the value from the db
});
setTimeout(getStrSecond, 2000); //first value is still cached so no callback
setTimeout(getStrSecond, 4000); //value expired so the callback will set the second value

return;

//2- Number:
cache.set('myNumberKey', 666, 1).then((r) => {
	console.log('myNumberKey value has been cached.');
});

cache
	.getNumber('myNumberKey', () => {
		console.log('not found');
	})
	.then((r) => {
		console.log('type of myNumberKey is : ' + typeof r + ', value: ' + r);
	});

setTimeout(() => {
	console.log('After 2 seconds key will expire: ');
	cache
		.getNumber('myNumberKey', () => {
			console.log('not found, this is the callback value:');
			return 777;
		})
		.then((r) => {
			console.log('type of myNumberKey is : ' + typeof r + ', value: ' + r);
		});
}, 2000);

return;

//3- Objects:
cache.setObject('myObjectKey', { myValue1: 1, myValue2: 2 }, 1).then((r) => {
	console.log('myObjectKey value has been cached.');
});

cache
	.getObject('myObjectKey', () => {
		console.log('not found');
	})
	.then((r) => {
		console.log('type of myObjectKey is : ' + typeof r + ', value: ' + JSON.stringify(r));
	});

setTimeout(() => {
	console.log('After 2 seconds key will expire: ');
	cache
		.getObject('myObjectKey', () => {
			console.log('not found, this is the callback value:');
			return { myCallbackValue1: 1, myCallbackValue2: 2 };
		})
		.then((r) => {
			console.log('type of myObjectKey is : ' + typeof r + ', value: ' + JSON.stringify(r));
		});
}, 2000);

return;

//4- Arrays:
cache.setObject('myArrayKey', ['ArrayItem', { ArrayItem: 2 }], 1).then((r) => {
	console.log('myArrayKey value has been cached.');
});

cache
	.getArray('myArrayKey', () => {
		console.log('not found');
	})
	.then((r) => {
		console.log('myArrayKey value is Array : ' + Array.isArray(r) + ', value: ' + JSON.stringify(r));
	});

setTimeout(() => {
	console.log('After 2 seconds key will expire: ');
	cache
		.getArray('myArrayKey', () => {
			console.log('not found, this is the callback value:');
			return ['CallbackArrayItem', { CallBackArrayItem: 2 }];
		})
		.then((r) => {
			console.log('myArrayKey value is Array : ' + Array.isArray(r) + ', value: ' + JSON.stringify(r));
		});
}, 2000);
