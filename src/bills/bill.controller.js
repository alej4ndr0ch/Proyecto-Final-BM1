import Bill from './bill.model.js';

export const editBill = async(req, res, next) => {
    try {
        
        const { id } = req.params;
        const bill = await Bill.findByIdAndUpdate(id, req.body, { new: true });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error, no se ha podido editar la factura',
            error
        })
    }
}