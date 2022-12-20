const fs = require('fs');
const AWS = require('./aws');
const path = require('path');
const config = require('config');
const { sequelize, BaseModel, DataTypes } = require('./../database');
let currentDomain;
if (config.has('currentDomain')) {
	currentDomain = config.get('currentDomain');
} else console.warn('Missing currentDomain config');
class Asset extends BaseModel {
	static associate() {}

	async destroy(options) {
		if (this.isLocal) {
			fs.unlink(path.join('assets', this.isPrivate ? 'private' : 'public', this.url), (err) => {
				if (err) {
					console.error(err);
				} else {
					console.info(`successfully deleted local file: assets/${this.url} `);
				}
			});
		} else {
			await AWS.deleteFromS3(this.key, this.isPrivate);
		}

		await super.destroy(options);
	}

	static initialize() {
		Asset.init(
			{
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true,
					allowNull: false,
				},
				filename: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				url: {
					type: DataTypes.STRING,
					allowNull: false,
					get() {
						const rawURL = this.getDataValue('url');
						const rawIsLocal = !rawURL.startsWith('http');
						const assets = rawURL.startsWith('/') ? '/assets' : '/assets/';
						return rawIsLocal ? `${currentDomain}${assets}${rawURL}` : rawURL;
					},
				},
				key: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				sizeInBytes: {
					type: DataTypes.BIGINT,
					allowNull: false,
				},
				isPrivate: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
				},
				isLocal: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
				},
			},
			{
				sequelize,
				updatedAt: false,
			}
		);
	}
}

Asset.register();

module.exports = Asset;
