const Product = require('../models/product');
// DO NOT REMOVE THE FOLLOWING LINE. NEEDED FOR REGISTERING THE MODEL
const ProductImage = require('../models/productImage');
const { Op } = require('sequelize');
const {
	Exception,
	statusCodes,
	database: { sequelize },
} = require('usol-utils');
const fs = require('fs/promises');
const path = require('path');

class ProductService {
	/**
	 * save new product
	 * with product images
	 */
	static async save(productObject) {
		const data = await Product.create(productObject);
		return { data };
	}

	static async updateImages(files, productId, userId) {
		try {
			return await sequelize.transaction(async (t) => {
				let product = await Product.findByPk(productId);
				if (product && product.sellerId !== userId) {
					throw new Exception(statusCodes.UNAUTHORIZED, 'seller is not same as userId');
				}
				const oldImages = await ProductImage.findAll({ where: { productId } });
				await Promise.all(
					oldImages.map(async (image) => {
						const imagePath = path.join('assets', 'public', image.url);
						if (require('fs').existsSync(imagePath)) await fs.unlink(imagePath);
					})
				);
				await ProductImage.destroy({ where: { productId } });
				let values = [];
				files.forEach((file) => {
					values.push({ url: file.url, productId });
				});
				const data = await ProductImage.bulkCreate(values);
				return { data };
			});
		} catch (error) {
			throw new Exception(statusCodes.INTERNAL_SERVER_ERROR, '', error);
		}
	}

	static async getAll(filters, pagination, userId) {
		const where = {};
		const order = [];
		if (filters.onlyUser && userId) {
			where['sellerId'] = userId;
		}
		if (filters.type) {
			where['type'] = filters.type;
		}
		if (filters.q) {
			where['title'] = {
				[Op.like]: `${filters.q}%`,
			};
		}
		if (filters.sortByPrice) {
			order.push(['price', filters.sortByPrice]);
		}
		if (filters.sortByDate) {
			order.push(['createdAt', filters.sortByDate]);
		}
		return Product.paginate(
			{
				where: where,
				order: order,
				include: { model: sequelize.model('ProductImage'), attributes: ['id', 'url'] },
			},
			pagination
		);
	}

	/**
	 *
	 * i assumed that only seller can update
	 */
	static async update(updatedProduct, productId, userId) {
		let product = await Product.findByPk(productId);
		if (product && product.sellerId != userId) {
			throw new Exception(statusCodes.UNAUTHORIZED, 'seller is not same as userId');
		}
		return await Product.update(updatedProduct, { where: { id: productId } });
	}

	/**
	 * - Dont forget to delete all files before deleting
	 *
	 * - super admin can delete Any product
	 */
	static async delete(productId, userId, userRole) {
		return await sequelize.transaction(async (t) => {
			let product = await Product.findByPk(productId, { include: { model: sequelize.model('ProductImage') } });
			if (product) {
				if (product.sellerId !== userId && userRole !== 'superAdmin')
					throw new Exception(statusCodes.UNAUTHORIZED, 'Unauthorized');
				// loop through all product images and delete photos
				await Promise.all(
					product.ProductImages.map(async (productImg) => {
						await fs.unlink(productImg.url);
					})
				);
				return await Product.destroy({ where: { id: productId } });
			}
		});
	}
}

module.exports = ProductService;
