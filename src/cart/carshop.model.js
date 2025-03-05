import { Schema, model } from "mongoose";

const cartshopSchema = Schema({
    user : {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products : [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            precio: {
                type: Number,
                required: true,
                default: 0
            },
            cantidad: {
                type: Number,
                required: true,
                default: 1
            }
        }
    ],

},
    {
        timestamps: true,
        versionKey: false,
    })

cartshopSchema.methods.toJSON = function () {
    const { __v, _id,...cartshop } = this.toObject();
    cartshop.id = _id;
    return cartshop;
}

export default model('Cartshop', cartshopSchema);