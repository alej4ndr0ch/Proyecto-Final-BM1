import User from '../users/user.model.js';
import Categorie from '../categories/category.model.js';
import Product from '../products/product.model.js';

export const existenteEmail = async (correo = ' ') => {

    const existeEmail = await User.findOne({ correo });

    if(existeEmail){
        throw new Error(`El correo ${ correo } ya existe en la base de datos`);
    }
}

export const existeUserById = async (id = '') => {
    
    const existeUsuario = await User.findById(id);
    console.log(existeUsuario)
    if(!existeUsuario){
        throw new Error(`El ID ${id} no existe`);
    }
    console.log("error")
}

export const existenteNameCategorie = async (name = ' ') => {

    const existeName = await Categorie.findOne({ name });

    if (existeName) {
        throw new Error(`El nombre ${ name } ya existe en la base de datos`);
    }
}

export const existenteNameProduct = async (name = ' ') => {

    const existeName = await Product.findOne({ name });

    if (existeName) {
        throw new Error(`El nombre ${ name } ya existe en la base de datos`);
    }
}

export const existeProductById = async (id = '') => {

    const existeProduct = await Product.findById(id);

    if (!existeProduct) {
        throw new Error(`El ID ${ id } no existe en la base de datos`);
    }
}

export const existeCategorieById = async (id = '') => {

    const existeCategorie = await Categorie.findById(id);

    if (!existeCategorie) {
        throw new Error(`El ID ${ id } no existe en la base de datos`);
    }
}