import { Schema, model } from "mongoose";

const billSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productos: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            precio: {
                type: Number,
                required: true
            },
        }
    ], 
    fecha: {
        type: Date,
        default: Date.now
    }
},
{
    timestamps: true,
    versionKey: false
})

billSchema.methods.toJSON = function () {
    const { __v, _id, ...bill } = this.toObject();
    bill.id = _id;
    return bill;
}

export default model('Bill', billSchema);