const Category = require("../models/category");
const slugify = require("slugify");
const shortid = require("shortid");


function createCategory(categories, parentId = null) {
    const categoryList = [];
    let category;
    if (parentId === null) {
        category = categories.filter((cate) => cate.parentId === null);
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

exports.addCategory = (req, res) => {
    const { name } = req.body;
    let parentId = null;

    let categoryImage = [];
    // neu co doi tuong la file thi lay ra va gan vao thuoc tinh categoryImage voi fileName
    if (req.files.length > 0) {
        categoryImage = req.files.map((file) => {
            return { img: "/public/" + file.filename };
        });
    }

    if (req.body.parentId && req.body.parentId !== "undefined") {
        parentId = req.body.parentId;
    }

    const cat = new Category({ name, slug: `${slugify(name)}-${shortid.generate()}`, parentId, categoryImage, createdBy: req.user._id });
    cat.save((error, category) => {
        if (error) return res.status(400).json({ error });
        if (category) {
            return res.status(201).json({ category, files: req.files });
        }
    });
}

exports.getCategories = (req, res) => {
    Category.find({}).exec((error, categories) => {
        if (error) return res.status(400).json({ error });
        if (categories) {
            const categoryList = createCategory(categories);
            res.status(200).json({ categoryList });
        }
    });
}

exports.updateCategories = async (req, res) => {
    const { _id, name, parentId } = req.body;
    const updatedCategories = [];
    if (name instanceof Array) {
        for (let i = 0; i < name.length; i++) {
            const category = {
                name: name[i]
            };
            if (name[i] === "") {
                return res.status(400).json({ error: "Category name is required" });
            }
            if (parentId[i] !== "") {
                if (parentId[i] !== _id[i]) {
                    category.parentId = parentId[i];
                } else {
                    return res.status(400).json({ error: "Can't select parentId" });
                }
            } else {
                category.parentId = undefined;
            }
            const updatedCategory = await Category.findOneAndUpdate(
                { _id: _id[i] },
                category,
                { new: true }
            );
            updatedCategories.push(updatedCategory);
        }
        return res.status(201).json({ updateCategories: updatedCategories });
    } else {
        const category = {
            name
        };
        if (name === "") {
            return res.status(400).json({ error: "Category name is required" });
        }
        if (parentId !== "") {
            if (parentId !== _id) {
                category.parentId = parentId;
            } else {
                return res.status(400).json({ error: "Can't select parentId" });
            }
        } else {
            category.parentId = null;
        }
        const updatedCategory = await Category.findOneAndUpdate({ _id }, category,
            { new: true, }
        );
        return res.status(201).json({ updatedCategory });
    }
};

exports.deleteCategories = async (req, res) => {
    const ids = req.body;
    const deletedCategories = [];
    for (let i = 0; i < ids.length; i++) {
        const deleteCategory = await Category.findOneAndDelete({
            _id: ids[i]._id,
            createdBy: req.user._id,
        });
        deletedCategories.push(deleteCategory);
    }
    if (deletedCategories.length === ids.length) {
        res.status(200).json({ message: "Categories removed" });
    } else {
        res.status(400).json({ message: "Something went wrong" });
    }
};

exports.dragCategory = async (req, res) => {
    const { dropKey, dragKey, dropToGap, parentIdDrop } = req.body;
    const parentId = dropToGap ? parentIdDrop : dropKey;
    await Category.findByIdAndUpdate(
        { _id: dragKey },
        { parentId: parentId },
        { upsert: true },
        function (err, result) {
            if (err) {
                res.send(err);
            } else {
                return res.status(200).json(result)
            }
        });
}