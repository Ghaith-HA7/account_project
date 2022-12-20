const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const init = (app) => {
	const options = {
		definition: {
			openapi: '3.0.2', // Specification (optional, defaults to swagger: '2.0')
			info: {
				title: '’Muslim API Documentation', // Title (required)
				version: '1.1.1', // Version (required)
			},
			components: {
				securitySchemes: {
					bearerAuth: {
						type: 'http',
						scheme: 'bearer',
						bearerFormat: 'JWT',
					},
				},
			},
			security: [
				{
					bearerAuth: [],
				},
			],
		},
		// Path to the API docs
		apis: ['./**/docs.yaml'],
	};

	// Initialize swagger-jsdoc -> returns validated swagger spec in json format
	const swaggerSpec = swaggerJSDoc(options);
	const swagger_ui_options = {
		swaggerOptions: {
			authAction: {
				JWT: {
					name: 'JWT',
					schema: { type: 'apiKey', in: 'header', name: 'authorization' },
				},
			},
		},
	};

	app.get('/docs/json', (req, res) => {
		res.setHeader('Content-Type', 'application/json');
		res.send(swaggerSpec);
	});

	app.get('/docs/json/download', (req, res) => {
		res.setHeader('Content-disposition', 'attachment; filename=swagger.json');
		res.setHeader('Content-type', 'application/json');
		res.write(JSON.stringify(swaggerSpec));
		res.end();
	});

	app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = init;
