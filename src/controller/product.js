const Product = require("../models/product");
const shortid = require("shortid");
const slugify = require("slugify");
const Category = require("../models/category");


exports.createProduct = async (req, res) => {
  let { name, price, description, category, quantity, type, color, sale, screenSize,
    screenTechnology, camera, cameraSelfie, chipSet, ram, internalMemory, battery,
    pixelWide, pixelHigh, operatingSystem, weight, backMaterial, cpu, graphicCard,
    communication, chargingTime, chargingPort, waterProof, diameter, frequency } = req.body;
  let productPictures = [];

  if (req.files.length > 0) {
    productPictures = req.files.map((file) => {
      return { img: "/public/" + file.filename, name: file.originalname };
    });
  }

  let parentId = null;
  let parentProduct = null;

  if (req.body.parentId !== "") {
    parentId = req.body.parentId;
    parentProduct = await Product.findOne({ _id: parentId }).exec();
  }

  if (parentProduct) {
    screenSize = parentProduct.screenSize;
    screenTechnology = parentProduct.screenTechnology;
    camera = parentProduct.camera;
    cameraSelfie = parentProduct.cameraSelfie;
    chipSet = parentProduct.chipSet;
    ram = parentProduct.ram;
    internalMemory = parentProduct.internalMemory;
    battery = parentProduct.battery;
    pixelWide = parentProduct.pixelWide;
    pixelHigh = parentProduct.pixelHigh;
    operatingSystem = parentProduct.operatingSystem;
    weight = parentProduct.weight;
    backMaterial = parentProduct.backMaterial;
    cpu = parentProduct.cpu;
    graphicCard = parentProduct.graphicCard;
    communication = parentProduct.communication;
    chargingTime = parentProduct.chargingTime;
    chargingPort = parentProduct.chargingPort;
    waterProof = parentProduct.waterProof;
    diameter = parentProduct.diameter;
    frequency = parentProduct.frequency;
  }

  const product = new Product({
    name: name,
    slug: `${slugify(name)}-${shortid.generate()}`,
    price,
    type,
    sale,
    parentId,
    quantity,
    color,
    description,
    productPictures,
    category,
    createdBy: req.user._id,
    screenSize,
    screenTechnology, camera, cameraSelfie, chipSet, ram, internalMemory, battery,
    pixelWide, pixelHigh, operatingSystem, weight, backMaterial, cpu, graphicCard,
    communication, chargingTime, chargingPort, waterProof, diameter, frequency
  });

  product.save((error, product) => {
    if (error) return res.status(400).json({ error });
    if (product) {
      res.status(201).json({ product, files: req.files });
    }
  });
};

exports.getProductDetailsById = (req, res) => {
  const { productId } = req.params;
  if (productId) {
    Product.findOne({ _id: productId }).exec((error, product) => {
      if (error) return res.status(400).json({ error });
      if (product) {
        res.status(200).json({ product });
      }
    });
  } else {
    return res.status(400).json({ error: "Params required" });
  }
};

exports.getProductDetails = (req, res) => {
  const { productId } = req.body;
  if (productId) {
    Product.findOne({ _id: productId }).exec((error, product) => {
      if (error) return res.status(400).json({ error });
      if (product) {
        res.status(200).json({ product });
      }
    });
  } else {
    return res.status(400).json({ error: "Params required" });
  }
};

exports.getProducts = async (req, res) => {
  let query = {};
  if (req.body.search) {
    const { search } = req.body;
    if (search.length > 1) {
      query = { ...query, name: { $regex: '.*' + search + '.*' } }
    }
    const products = await Product.find(query).limit(5)
      .select("_id name price quantity slug description productPictures category parentId color sale type screenSize ")
      .select("screenTechnology camera cameraSelfie chipSet ram internalMemory battery pixelHigh pixelWide operatingSystem ")
      .select("weight backMaterial cpu graphicCard communication chargingTime chargingPort waterProof diameter")
      .populate({ path: "category", select: "_id name" })
      .exec();
    return res.status(200).json({ products });
  } else {
    const products = await Product.find(query)
      .select("_id name price quantity slug description productPictures category parentId color sale type screenSize ")
      .select("screenTechnology camera cameraSelfie chipSet ram internalMemory battery pixelHigh pixelWide operatingSystem ")
      .select("weight backMaterial cpu graphicCard communication chargingTime chargingPort waterProof diameter")
      .populate({ path: "category", select: "_id name" })
      .exec();
    return res.status(200).json({ products });
  }

};

exports.deleteProductById = (req, res) => {
  const { productId } = req.body.payload;
  if (productId) {
    Product.deleteOne({ _id: productId }).exec((error, result) => {
      if (error) return res.status(400).json({ error });
      if (result) {
        res.status(202).json({ result });
      }
    });
  } else {
    res.status(400).json({ error: "Params required" });
  }
};

exports.updateProduct = async (req, res) => {
  const { _id, name, price, type, description, category, quantity, color, sale } = req.body;
  let productPictures = [];

  if (req.files.length > 0) {
    productPictures = req.files.map((file) => {
      return { img: "/public/" + file.filename, name: file.originalname };
    });
  }
  const product = req.files.length > 0 ? { _id, name, type, price, description, category, color, quantity, sale, productPictures } :
    { _id, name, type, price, description, category, color, quantity, sale };
  if (name === "") {
    return res.status(400).json("Product name is required");
  }

  if (price === "") {
    return res.status(400).json("Price is required");
  }

  if (category === "") {
    return res.status(400).json("Category is required");
  }

  if (price === "") {
    return res.status(400).json("Price is required");
  }

  if (quantity === "") {
    return res.status(400).json("Quantity is required");
  }

  if (req.body.parentId !== "") {
    product.parentId = req.body.parentId;
  } else {
    product.parentId = null;
    product.screenSize = req.body.screenSize;
    product.screenTechnology = req.body.screenTechnology;
    product.camera = req.body.camera;
    product.cameraSelfie = req.body.cameraSelfie;
    product.chipSet = req.body.chipSet;
    product.ram = req.body.ram;
    product.internalMemory = req.body.internalMemory;
    product.battery = req.body.battery;
    product.pixelWide = req.body.pixelWide;
    product.pixelHigh = req.body.pixelHigh;
    product.operatingSystem = req.body.operatingSystem;
    product.weight = req.body.weight;
    product.backMaterial = req.body.backMaterial;
    product.cpu = req.body.cpu;
    product.graphicCard = req.body.graphicCard;
    product.communication = req.body.communication;
    product.chargingTime = req.body.chargingTime;
    product.chargingPort = req.body.chargingPort;
    product.waterProof = req.body.waterProof;
    product.diameter = req.body.diameter;
    product.frequency = req.body.frequency;
  }

  const updatedProduct = await Product.findOneAndUpdate({ _id }, product, { new: true });
  return res.status(200).json({ updatedProduct });
}

exports.getProductsByCategoryId = async (req, res) => {
  const CategoryId = req.params.categoryId;
  let filter = {};
  if (req.body.objFilter) {
    const { price1, price2, ram1, ram2, memory1, memory2, screenSize1, screenSize2,
      pixelWide1, pixelWide2, frequency, graphicCard, cpu, chipset } = req.body.objFilter;
    if (price1 !== undefined && price2 !== undefined) {
      filter = { price: { $lte: price2, $gte: price1 } };
    }
    if (ram1 !== undefined && ram2 !== undefined) {
      filter = { ...filter, ram: { $lt: ram2, $gte: ram1 } };
    } else if (ram1 !== undefined) {
      filter = { ...filter, ram: ram1 };
    }
    if (memory1 !== undefined && memory2 !== undefined) {
      filter = { ...filter, internalMemory: { $lte: memory2, $gte: memory1 } };
    } else if (memory1 !== undefined) {
      filter = { ...filter, internalMemory: memory1 };
    }
    if (screenSize1 !== undefined && screenSize2 !== undefined) {
      filter = { ...filter, screenSize: { $lt: screenSize2, $gte: screenSize1 } };
    }
    if (pixelWide1 !== undefined && pixelWide2 !== undefined) {
      filter = { ...filter, pixelWide: { $lte: pixelWide1, $gte: pixelWide2 } };
    } else if (pixelWide1 !== undefined && pixelWide2 === undefined) {
      filter = { ...filter, pixelWide: pixelWide1 };
    }
    if (frequency !== undefined) {
      filter = { ...filter, frequency: frequency };
    }
    if (cpu !== undefined) {
      filter = { ...filter, cpu: { $regex: '.*' + cpu + '.*' } }
    }
    if (graphicCard !== undefined) {
      filter = { ...filter, graphicCard: { $regex: '.*' + graphicCard + '.*' } }
    }
    if (chipset !== undefined) {
      filter = { ...filter, chipSet: { $regex: '.*' + chipset + '.*' } }
    }
  }

  let condition = {};
  if (req.body.order !== 0) {
    condition = { price: req.body.order };
  }
  const cat = await Category.find({}).exec();
  const subcat = cat.filter(x => x.parentId == CategoryId);
  const parentCat = cat.find(x => x._id == CategoryId);
  let query = {};
  let products;
  if (parentCat.parentId) {
    if (subcat.length > 0) {
      query = { category: { "$in": subcat }, ...filter }
    } else {
      query = { category: CategoryId, ...filter }
    }
  }
  else {
    query = { type: CategoryId, ...filter }
  }

  products = await Product.find(query).sort(condition)
    .select("_id name price quantity slug description productPictures category color sale type screenSize ")
    .select("screenTechnology camera cameraSelfie chipSet ram internalMemory battery pixelHigh pixelWide operatingSystem ")
    .select("weight backMaterial cpu graphicCard communication chargingTime chargingPort waterProof diameter")
    .populate({ path: "category", select: "_id name" })
    .exec();

  res.status(200).json({ products });

}

exports.getProductSameType = async (req, res) => {

  const { description } = req.body;
  const products = await Product.find({ description: description, parentId: null })
    .select("_id name price quantity slug description productPictures category parentId color sale type screenSize ")
    .select("screenTechnology camera cameraSelfie chipSet ram internalMemory battery pixelHigh pixelWide operatingSystem ")
    .select("weight backMaterial cpu graphicCard communication chargingTime chargingPort waterProof diameter")
    .populate({ path: "category", select: "_id name" })
    .exec();

  res.status(200).json({ products });
}

exports.getProductByColor = async (req, res) => {
  const { _id, parentId } = req.body.productDetail;
  let querry = {};
  if (parentId) {
    querry = { $or: [{ '_id': parentId }, { 'parentId': parentId }] }
  } else {
    querry = { $or: [{ '_id': _id }, { 'parentId': _id }] }
  }
  const products = await Product.find(querry)
    .select("_id name price quantity slug description productPictures category parentId color sale type screenSize ")
    .select("screenTechnology camera cameraSelfie chipSet ram internalMemory battery pixelHigh pixelWide operatingSystem ")
    .select("weight backMaterial cpu graphicCard communication chargingTime chargingPort waterProof diameter")
    .populate({ path: "category", select: "_id name" })
    .exec();

  res.status(200).json({ products });

}