import Bill from './bill.model.js';
import Carshop from '../cart/carshop.model.js';
import Product from '../products/product.model.js';

export const addBill = async (req, res) => {
    try {
        const userId = req.user._id;

        const cartshop = await Carshop.findOne({ User: userId });

        console.log('Carrito encontrado:', cartshop);

        if (!cartshop || cartshop.productos.length === 0) {
            return res.status(400).json({
                success: false,
                message: "El carrito está vacío o no existe"
            });
        }

        for (let i = 0; i < cartshop.productos.length; i++) {
            const product = cartshop.productos[i];
            const productInDb = await Product.findById(product.product);
            if (!productInDb || productInDb.stock < product.cantidad) {
                return res.status(400).json({
                    success: false,
                    message: `El producto ${productInDb.name} no tiene stock suficiente.`,
                });
            }
        }

        const newInvoice = new Bill({
            user: userId,
            productos: cartshop.productos.map(item => ({
                product: item.product,
                precio: item.precio,
            })),
            fecha: new Date(),
        });

        await newInvoice.save();

        for (let i = 0; i < cartshop.productos.length; i++) {
            const product = cartshop.productos[i];
            const productInDb = await Product.findById(product.product);
            productInDb.stock -= product.cantidad;
            await productInDb.save();
        }

        await Carshop.deleteOne({ User: userId });

        res.status(201).json({
            success: true,
            message: "Factura creada exitosamente",
            invoice: newInvoice,
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
                productInDb.stock += 1;
                await productInDb.save();
            }
        }

        for (const item of updatedProducts) {
            const productInDb = await Product.findById(item.product);
            if (!productInDb || productInDb.stock < 1) {
                return res.status(400).json({
                    success: false,
                    msg: `El producto ${productInDb?.name || 'desconocido'} no tiene stock suficiente.`
                });
            }
        }

        bill.productos = updatedProducts.map(item => ({
            product: item.product,
            precio: item.precio
        }));
        bill.fecha = new Date();

        await bill.save();

        for (const item of updatedProducts) {
            const productInDb = await Product.findById(item.product);
            productInDb.stock -= 1;
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
        const userId = req.usuario._id; 

        const facturas = await Invoice.find({ user: userId }).populate("products.product");

        res.json({
            success: true,
            facturas,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error al obtener las facturas",
        });
    }
};