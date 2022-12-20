const { Exception, statusCodes } = require('usol-utils');
const User = require('../models/user');
const { Op } = require('sequelize');
const _ = require('lodash');
const userSymptom = require('./userSymptom');
const moment = require('moment');
const momentHijri = require('moment-hijri');
momentHijri.locale('en-ca');
const bcrypt = require('bcryptjs');
const fs = require('fs/promises');
const path = require('path');
const UserInterest = require('../models/userInterest');
const adhan = require('adhan');
const { sequelize } = require('usol-utils/database');
const Occasions = require('../../../utils/occasions');
class UserService {
	constructor(data) {
		this.firstName = data.firstName;
		this.lastName = data.lastName;
		this.email = data.email;
		this.role = data.role;
		this.prayerTimeMethod = data.prayerTimeMethod;
		this.madhab = data.madhab;
		this.occupation = data.occupation;
		this.city = data.city;
		this.country = data.country;
		this.website = data.website;
		this.mobileNumber = data.mobileNumber;
		this.lng = data.lng;
		this.lat = data.lat;
		this.img = data.img;
		this.verificationCode = data.verificationCode;
		this.location = data.location;
	}
	async createUser() {
		if (await UserService.phoneDuplicated(this.mobileNumber))
			throw new Exception(statusCodes.DUPLICATED_ENTRY, 'A user with this number is already registered');
		if (await UserService.isDuplicated(this.email))
			throw new Exception(statusCodes.DUPLICATED_ENTRY, 'A user with this email is already registered');
		return await this.save();
	}
	static async isDuplicated(email) {
		return (
			(await User.count({
				where: { [Op.and]: [{ email }] },
			})) > 0
		);
	}
	static async phoneDuplicated(mobileNumber) {
		return (
			(await User.count({
				where: { [Op.and]: [{ mobileNumber }] },
			})) > 0
		);
	}

	static async findUserByEmail(email, attributes) {
		return await User.findOne({ where: { email }, attributes });
	}

	async save() {
		return User.create(this);
	}

	async checkInfo(userData) {
		if (this.email && userData.email !== this.email) {
			const duplicated = await UserService.isDuplicated(this.email);
			if (duplicated)
				throw new Exception(statusCodes.DUPLICATED_ENTRY, 'A user with this email is already registered');
		}
		if (this.mobileNumber && userData.mobileNumber !== this.mobileNumber) {
			const duplicated = await UserService.phoneDuplicated(this.mobileNumber);
			if (duplicated)
				throw new Exception(
					statusCodes.DUPLICATED_ENTRY,
					'A user with this mobileNumber is already registered'
				);
		}
	}

	async updateUser(userData) {
		await this.checkInfo(userData);
		await User.update(
			_.pick(this, [
				'firstName',
				'lastName',
				'occupation',
				'city',
				'country',
				'website',
				'mobileNumber',
				'email',
				'prayerTimeMethod',
				'madhab',
				'lng',
				'lat',
				'img',
				'location',
			]),
			{ where: { id: userData.id } }
		);
		const updatedUser = await UserService.findById(userData.id);
		return updatedUser;
	}

	async updateUserById(id) {
		const user = await UserService.findById(id);
		if (!user) throw new Exception(statusCodes.ITEM_NOT_FOUND, 'no such user');
		await this.checkInfo(user);
		return await user.update(this);
	}

	static async findById(id, attributes) {
		return await User.findByPk(id, { attributes });
	}

	static async getInfo(userId) {
		const user = await UserService.findById(userId);
		if (!user) throw new Exception(statusCodes.ITEM_NOT_FOUND, 'no such user');
		return _.omit(user.toJSON(), ['verificationCode']);
	}

	static async getUserStatus(id) {
		const event = await userSymptom.findLatestSymptomByUserId(id);
		const status = { banned: false, eligibleAt: null };
		let difference;
		if (event) {
			difference = moment().diff(event.createdAt, 'days');
			if (difference < 15) {
				status.banned = true;
				status.eligibleAt = moment(event.createdAt).add(15, 'days').format();
			}
		}
		return status;
	}

	static async findByNumber(mobileNumber) {
		const user = await User.findOne({ where: { mobileNumber } });
		if (!user)
			throw new Exception(statusCodes.ITEM_NOT_FOUND, `User with mobile number ${mobileNumber} was not found`);
		return user;
	}

	static async deleteUser(userId) {
		const user = await UserService.findById(userId);
		if (user) return await user.destroy();
		else throw new Exception(statusCodes.BAD_REQUEST, 'no such user.');
	}

	static async updateImage(assets, userId) {
		const user = await UserService.findById(userId);
		if (!user) throw new Exception(statusCodes.BAD_REQUEST, 'No such user');
		const data = {};
		if (!assets) throw new Exception(statusCodes.BAD_REQUEST, 'no image file');
		data.img = assets.file[0].url;
		const updatedUser = await new UserService(data).updateUser(user);
		if (user.img) await fs.unlink(path.join(process.cwd(), 'assets', 'public', user.img));
		return updatedUser;
	}

	static async saveUserInterest(userId, targetId, modelName) {
		const data = await sequelize.transaction(async (trx) => {
			const target = await sequelize.model(modelName).findByPk(targetId);
			if (!target) throw new Exception(statusCodes.ITEM_NOT_FOUND);
			return await UserInterest.upsert({
				userId,
				targetId,
				targetType: UserInterest.targetTypes[modelName],
			});
		});
		return { data: data[0] };
	}

	static async deleteUserInterest(userId, targetId, modelName) {
		await sequelize.transaction(async (trx) => {
			const interest = await UserInterest.findOne({
				where: {
					userId,
					targetId,
					targetType: UserInterest.targetTypes[modelName],
				},
			});
			if (!interest) throw new Exception(statusCodes.ITEM_NOT_FOUND);
			await interest.destroy();
		});
	}

	static async getList({ limit, offset }) {
		const { count: totalRecords, rows: data } = await User.findAndCountAll({
			offset,
			limit,
		});
		return { totalRecords, data };
	}

	static async getUserPrayersAndOccasions(userId) {
		const user = await User.findByPk(userId);
		const { lat, lng, prayerTimeMethod, madhab } = user;
		const coordinates = new adhan.Coordinates(lat, lng);
		const date = new Date();
		const params = User.prayerMethods[prayerTimeMethod];
		params.madhab = adhan.Madhab[madhab];
		const prayerTimes = new adhan.PrayerTimes(coordinates, date, params);
		const { fajr, sunrise, dhuhr, asr, maghrib, isha } = prayerTimes;
		const hijriDate = momentHijri().format('ddd iMMMM iYYYY/iM/iD');
		const occasions = Occasions.isOccasion();
		return { data: { hijriDate, occasions, prayerTimes: { fajr, sunrise, dhuhr, asr, maghrib, isha } } };
	}
}

module.exports = UserService;
