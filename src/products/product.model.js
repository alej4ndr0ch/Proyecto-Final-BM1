import { Schema, model } from "mongoose";
 
const ProductSchema = Schema({
    name: {
        type: String,
        required: [true, "The name is required"],
        maxlength: [50, "The name is more than 50 characters"]
    },
    description: {
        type: String,
        required: [true, "The description is required"],
        maxlength: [200, "The description is more than 200 characters"]
    },
    precio: {
        type: Number,
        required: [true, "The price is required"],
        min: 0
    },
    stock: {
        type: Number,
        required: [true, "The stock is required"],
        min: 0
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "category",
        required: [true, "The category is required"]
    },
    estado: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});
 
export default model("Product", ProductSchema);