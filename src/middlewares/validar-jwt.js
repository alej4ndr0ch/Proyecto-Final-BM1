import jwt from "jsonwebtoken";
import User from "../users/user.model.js";

export const validarUserJWT = async (req, res, next) => {

    const token = req.header("x-token");

    if (!token) {
        return res.status(400).json({
            msg: "No hay token en la petición"
        });
    }
    
    try {

        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);

        const user = await User.findById(uid);

        if (!user) {
            return res.status(400).json({
                msg: "Token de usuario no encontrado"
            });
        }

        if (user.estado === false) {
            return res.status(400).json({
                msg: "Token no válido - usuario con estado: false"
            });
        }

        req.user = user;
        
        next();
        
    } catch (e) {
        
        console.log(e);
        return res.status(400).json({
            msg: "Token no válido"
        });
    }
}