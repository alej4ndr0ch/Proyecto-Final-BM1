import User from '../users/user.model.js';

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