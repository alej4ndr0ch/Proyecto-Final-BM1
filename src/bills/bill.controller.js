import Bill from './bill.model.js';
import Carshop from '../cart/carshop.model.js';
import Product from '../products/product.model.js';

export const addBill = async (req, res) => {
    try {
        const userId = req.user._id;

        const cartshop = await Carshop.findOne({ user: userId });

        if (!cartshop || !cartshop.products || cartshop.products.length === 0) {
            return res.status(400).json({
                success: false,
                message: "El carrito está vacío o no existe"
            });
        }

        for (let i = 0; i < cartshop.products.length; i++) {
            const product = cartshop.products[i];
            const productInDb = await Product.findById(product.product);
            if (!productInDb || productInDb.stock < product.cantidad) {
                return res.status(400).json({
                    success: false,
                    message: `El producto ${productInDb ? productInDb.name : 'desconocido'} no tiene stock suficiente.`,
                });
            }
        }

        const newBill = new Bill({
            user: userId,
            productos: cartshop.products.map(item => ({
                product: item.product,
                precio: item.precio,
                cantidad: item.cantidad
            })),
            fecha: new Date(),
        });

        await newBill.save();

        for (let i = 0; i < cartshop.products.length; i++) {
            const product = cartshop.products[i];
            const productInDb = await Product.findById(product.product);
            productInDb.stock -= product.cantidad;
            await productInDb.save();
        }

        await Carshop.deleteOne({ user: userId });

        res.status(201).json({
            success: true,
            message: "Factura creada exitosamente",
            invoice: newBill,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al generar la factura",
            error: error.message,
        });
    }
};

export const updateBill = async (req, res) => {
    const userId = req.user._id;
    const { billId, updatedProducts } = req.body;

    try {
        const bill = await Bill.findById(billId);
        if (!bill || bill.user.toString() !== userId.toString()) {
            return res.status(404).json({
                success: false,
                msg: 'Factura no encontrada o no tienes permisos para editarla.'
            });
        }

        for (const item of bill.productos) {
            const productInDb = await Product.findById(item.product);
            if (productInDb) {
                productInDb.stock += item.cantidad;
                await productInDb.save();
            }
        }

        for (const item of updatedProducts) {
            const productInDb = await Product.findById(item.product);
            if (!productInDb || productInDb.stock < item.cantidad) {
                return res.status(400).json({
                    success: false,
                    msg: `El producto ${productInDb?.name || 'desconocido'} no tiene stock suficiente.`
                });
            }
        }

        bill.productos = updatedProducts.map(item => ({
            product: item.product,
            precio: item.precio,
            cantidad: item.cantidad
        }));
        bill.fecha = new Date();

        await bill.save();

        for (const item of updatedProducts) {
            const productInDb = await Product.findById(item.product);
            productInDb.stock -= item.cantidad;
            await productInDb.save();
        }

        res.status(200).json({
            success: true,
            msg: 'La compra ha sido actualizada con éxito.',
            bill
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al editar la compra.',
            error: error.message
        });
    }
};

export const getBill = async (req, res) => {
    try {

        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "No autorizado. Debes iniciar sesión.",
            });
        }

        const userId = req.user._id; 

        const facturas = await Bill.find({ user: userId }).populate("productos.product");

        if (!facturas || facturas.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No se encontraron facturas para este usuario",
            });
        }

        res.json({
            success: true,
            facturas,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error al obtener las facturas",
            error: error.message,
        });
    }
};

export const historyBill = async (req, res) => {
    try {
        // Obtener el usuario autenticado
        const authenticatedUser = req.user;
        
        // Verificar si el usuario existe
        const user = await User.findById(authenticatedUser._id);
        if (!user) {
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }

        // Verificar si el rol del usuario es CLIENTE_ROLE
        if (authenticatedUser.role !== "CLIENTE_ROLE") {
            return res.status(403).json({ msg: "No tienes permisos para acceder al historial de compras" });
        }

        // Obtener todas las facturas del usuario autenticado
        const historialFacturas = await Bill.find({ user: authenticatedUser._id })
            .populate('user', 'name') // Poblamos el nombre del usuario
            .populate('productos.product') // Poblamos los productos
            .sort({ fecha: -1 }); // Ordenar por fecha descendente

        // Si no se encuentra ninguna factura, devolver un mensaje
        if (historialFacturas.length === 0) {
            return res.status(404).json({ msg: "No hay facturas registradas para este usuario" });
        }

        // Devolver el historial de compras
        res.status(200).json({
            success: true,
            historial: historialFacturas
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Hubo un error al obtener el historial de compras"
        });
    }
};