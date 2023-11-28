import mongoose, { Mongoose, Schema, model } from "mongoose";

const paymentSchema = new Schema(
    {
        razorpay_payment_id:{
            type: String,
            required: true,
        },
        razorpay_payment_id: {
            type: String,
            required: true
        },
        razorpay_signature: {
            type: String,
            required: true
        }
    },{timestamps: true}
)

export const Payment = Mongoose.model('Payment', paymentSchema)