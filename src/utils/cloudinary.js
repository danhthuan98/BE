const cloudinary = require('cloudinary').v2;
const env = require("dotenv");

env.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
    secure: true
});

module.exports = { cloudinary };


// /**
//  * Uploads file to Cloudinary CDN
//  *
//  * @param {stream} object, image streaming content
//  * @param {folder} string, folder name, where to save image
//  * @param {string} imagePublicId
//  */
// exports.uploadToCloudinary = async (stream, folder, imagePublicId) => {
//     // if imagePublicId param is presented we should overwrite the image
//     const options = imagePublicId
//         ? { public_id: imagePublicId, overwrite: true }
//         : { public_id: `${folder}/${uuidv4()}` };

//     return new Promise((resolve, reject) => {
//         const streamLoad = cloudinary.v2.uploader.upload(options, (error, result) => {
//             if (result) {
//                 resolve(result);
//             } else {
//                 reject(error);
//             }
//         });

//         stream.pipe(streamLoad);
//     });
// };

// /**
//  * Delete file from Cloudinary CDN
//  *
//  * @param {string} publicId id for deleting the image
//  */
// exports.deleteFromCloudinary = async (publicId) => {
//     return new Promise((resolve, reject) => {
//         cloudinary.v2.uploader.destroy(publicId, (error, result) => {
//             if (result) {
//                 resolve(result);
//             } else {
//                 reject(error);
//             }
//         });
//     });
// };