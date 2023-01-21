const {Schema, model, SchemaTypes} = require('mongoose');

const orderSchema = new Schema({
	courses:[
		{
			course: {
				type: Object,
				required: true
			},
			count: {
				type: Number,
				required: true
			}
		}		
	],
	user: {
		name: String,
		userId: {
			type:SchemaTypes.ObjectId,
			ref: 'User',
			required: true
		}
	},
	date: {
		type: Date,
		default: Date.now
	}
});

module.exports = model('Order', orderSchema);