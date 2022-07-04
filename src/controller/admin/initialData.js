const Category = require("../../models/category");
const Product = require("../../models/product");
const Order = require("../../models/order");

function createCategory(categories, parentId = null) {
    const categoryList = [];
    let category;
    if (parentId === null) {
        category = categories.filter((cate) => cate.parentId === null); // 2 dau bang la so sanh gia tri 3 dau bang la so sanh them ca kieu du lieu
    } else {
        category = categories.filter((cate) => cate.parentId &&
            cate.parentId.toString() === parentId.toString());
    }
    for (let cate of category) {
        categoryList.push({
            _id: cate._id,
            name: cate.name,
            slug: cate.slug,
            parentId: cate.parentId,
            type: cate.type,
            children: createCategory(categories, cate._id)
        });
    }
    return categoryList;
}

exports.initialData = async (req, res) => {
    const categories = await Category.find({}).exec();
    const products = await Product.find({})
        .select("_id name price quantity slug description productPictures category parentId color sale type screenSize ")
        .select("screenTechnology camera cameraSelfie chipSet ram internalMemory battery pixelHigh pixelWide operatingSystem ")
        .select("weight backMaterial cpu graphicCard communication chargingTime chargingPort waterProof diameter frequency")
        .populate({ path: "category", select: "_id name" })
        .exec();
    const orders = await Order.find({})
        .populate("items.productId", "name")
        .exec();
    res.status(200).json({ categories: createCategory(categories), products, orders });
};