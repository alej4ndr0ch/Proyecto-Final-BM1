import User from './user.model.js'
import { hash, verify } from 'argon2'
import { generateJWT } from '../helpers/generate-jwt.js'
import { response, request } from 'express'

export const login = async (req, res) => {

    const { email, password, username } = req.body

    try {
        const lowerEmail = email ? email.toLowerCase() : null;
        const lowerUsername = username ? username.toLowerCase() : null;

        const user = await User.findOne({
            $or: [{ email: lowerEmail }, { username: lowerUsername }]
        });

        if (!user) {
            return res.status(404).json({
                msg: 'Credenciales incorrectas, correo no existe en la base de datos'
            })
        }

        if (!user.estado) {
            return res.status(404).json({
                msg: 'El usuario no existe en la base de datos'
            })
        }

        const validPassword = await verify(user.password, password);

        if (!validPassword) {
            return res.status(404).json({
                msg: 'Contraseña incorrecta'
            })
        }

        const token = await generateJWT(user.id);

        res.status(200).json({
            msg: 'Inicio de secion',
            userDetails: {
                username: user.username,
                token: token
            }
        })

    } catch (e) {
        
        console.error(e);

        return res.status(500).json({
            msg: 'User registration failded',
            error: e.message
        })
    }
}

export const register = async (req, res) => {
    try {
        
        const data = req.body;

        const encryptedPassword = await hash(data.password);
        
        const user = await User.create({
            name: data.name,
            surname: data.surname,
            username: data.username.toLowerCase(),
            email: data.email.toLowerCase(),
            phone: data.phone,
            password: encryptedPassword
        })

        res.status(200).json({
            msg: 'User registered successfully',
            userDetails: {
                username: user.username
            }
        })

    } catch (error) {
        
        console.error(error);

        return res.status(500).json({
            msg: 'User registration failded',
            error: error.message
        })
    }
}

export const getUsers = async (req = request, res = response) => {
    try {

        const { limite = 10, desde = 0 } = req.body;
        const query = { estado: true };

        const [total, users] = await Promise.all([
            User.countDocuments(query),
            User.find(query)
           .skip(Number(desde))
           .limit(Number(limite))
        ])

        res.status(200).json({
            success: true,
            total,
            users
        })
    
    } catch (error) {

        res.status(500).json({
            success: false,
            msg: 'Error al obtener los usuarios',
            error
        })       
    }
}

export const getUserById = async (req, res) => {
    try {
        
        const { id } = req.params;

        const user = await User.findById(id);

        if (user.estado === false) {
            return res.status(400).json({
                success: false,
                msg: 'Error, este usuario buscado no esta disponible'
            })
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'Error, usuario no encontrado'
            })
        }

        res.status(200).json({
            success: true,
            user
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error, el usuario no ha sido encontrado',
            error
        })
    }
}

export const updateUser = async (req, res = response) => {
    try {
        
        const { id } = req.params;
        const { _id, email, role, password, currentPassword, ...data } = req.body;
        let { username } = req.body;

        if (username) {
            username = username.toLowerCase();
            data.username = username;
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(400).json({
                success: false,
                msg: 'Error, Usuario no encontrado'
            })
        }

        if (user.estado === false) {
            return res.status(400).json({
                success: false,
                msg: 'Error, Este usuario no esta disponible'
            })
        }

        if (req.user.id !== id && req.user.role !== "ADMIN") {
            return res.status(400).json({
                success: false,
                msg: 'Error, permiso denegado para actualizar un perfil que no es suyo'
            })
        }

        if (password) {
            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    msg: 'Error, la contraseña no es la correcta'
                })
            }
            
            const verifyPassword = await verify(user.password, currentPassword);
            
            if (!verifyPassword) {
                return res.status(400).json({
                    success: false,
                    msg: 'Contraseña actual incorrecta'
                })
            }

            data.password = await hash(password);
        }


        const updateUser = await User.findByIdAndUpdate(id, data, { new: true });

        res.status(200).json({
            success: true,
            msg: "El usuario se ha actualizado",
            updateUser
        })

    } catch (error) {
        
        res.status(500).json({
            success: false,
            msg: 'Error, no se ha podido actualizar el usuario',
            error
        })
    }
}

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;
        
        if(!password) {
            return res.status(400).json({
                success: false,
                msg: 'Error, la contraseña es obligatoria para desactivar un usuario'
            });
        }
        
        const user = await User.findByIdAndUpdate(id, { estado: false }, { new: true });
        const authenticatedUser = req.user;

        return res.status(200).json({
            success: true,
            msg: 'Usuario desactivado',
            user,
            authenticatedUser
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'Error al desactivar usuario',
            error
        });
    }
};


export const createAddAdmin = async () => {
    try {

        const verifyUser = await User.findOne({ username: "Administrador".toLowerCase() })

        if (!verifyUser) {
            const encryptedPassword = await hash("Admin100");
            const adminUser = new User({
                name: "Alejandro",
                surname: "Cuxún",
                username: "Administrador".toLowerCase(),
                email: "alejandrocuxun@gmail.com",
                phone: "42217005",
                password: encryptedPassword,
                role: "ADMIN"
            });
    
            await adminUser.save();
    
            console.log("Administrador creado exitosamente");
        } else {
            console.log("Administrado se ha creado exitosamente");
        }

    
    } catch (error) {
        console.error("Error, no se ha podido crear el administrado: ", 
        error
    );
    }
}