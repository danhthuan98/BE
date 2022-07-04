const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        reqired: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    color: {
        type: String,
        required: true
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    sale: {
        type: Number
    },
    offer: { type: Number },
    productPictures: [
        { img: { type: String }, name: { type: String } }
    ],
    screenSize: { type: Number },
    screenTechnology: { type: String },
    camera: { type: String },
    cameraSelfie: { type: String },
    chipSet: { type: String },
    ram: { type: Number },
    internalMemory: { type: Number },
    battery: { type: String },
    pixelWide: { type: Number },
    pixelHigh: { type: Number },
    operatingSystem: { type: String },
    weight: { type: String },
    backMaterial: { type: String },
    cpu: { type: String },
    graphicCard: { type: String },
    communication: { type: String },
    chargingTime: { type: String },
    chargingPort: { type: String },
    waterProof: { type: String },
    diameter: { type: String },
    frequency: { type: Number },
    reviews: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            review: String
        }
    ],
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedAt: Date,

}, { timestamps: true });


module.exports = mongoose.model('Product', productSchema);