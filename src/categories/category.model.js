import { Schema, model } from "mongoose";

const CategorieSchema = Schema({
    name: {
        type: String,
        required: [true, "El nombre del curso es obligatorio"],
        unique: true
    },
    description: {
        type: String,
        required: [true, "La descripción del curso es obligatoria"]
    },
    estado: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
})

export default model("Categorie", CategorieSchema);