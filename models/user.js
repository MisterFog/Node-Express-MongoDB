const {Schema, model} = require('mongoose');

const userSchema = new Schema({
	email: {
		type: String,
		require: true
	},
	name: String,
	password:{
		type: String,
		require: true
	},
	avatarUrl: String,
	resetToken: String,
	resetTokenExp: Date,
	cart: {
		items: [
			{
				count: {
					type: Number,
					require: true,
					default: 1
				},
				courseId: {
					type: Schema.Types.ObjectId,
					ref: 'Course',
					require: true
				}
			}
		]
	}
});

userSchema.methods.addToCart = function(course){
	const cloneItems = [...this.cart.items];
	const idx = cloneItems.findIndex(clone => (clone.courseId.toString() === course._id.toString()));

	if(idx >= 0){
		cloneItems[idx].count = cloneItems[idx].count + 1;
	} else {
		cloneItems.push({
			courseId: course._id,
			count: 1
		});
	}
	
	this.cart = { items: cloneItems };
	return this.save();	
}

userSchema.methods.clearCard = function(){
	this.cart = {items: []};
	return this.save();
};

userSchema.methods.removeFromCart = function(id){
	let items = [...this.cart.items];
	const idx = items.findIndex(item => item.courseId.toString() === id.toString());

	if(items[idx].count === 1){
		items = items.filter(item => item.courseId.toString() !== id.toString());
	}else{
		items[idx].count--;
	}

	this.cart = {items};
	return this.save();
}

module.exports = model('User', userSchema);