const Perfume = require("../models/Product");


// Hàm tạo dữ liệu ảo cho rating, reviewCount, purchaseCount
const generateFakeData = (productId) => {
  // Tạo dữ liệu ổn định dựa trên productId
  const seed = productId * 7 + 13;
  const rating = 3.5 + (seed % 15) / 10; // Rating từ 3.5 đến 5.0
  const reviewCount = 50 + (seed % 500); // Review từ 50 đến 550
  const purchaseCount = 100 + (seed % 2000); // Purchase từ 100 đến 2100
  
  return {
    rating: Math.round(rating * 10) / 10, // Làm tròn 1 chữ số
    reviewCount,
    purchaseCount,
  };
};

const getAllPerfumes = async (req, res) => {
  try {
    const perfumes = await Perfume.find();
    
    // Thêm dữ liệu ảo cho mỗi sản phẩm nếu chưa có
    const perfumesWithFakeData = perfumes.map(perfume => {
      const fakeData = generateFakeData(perfume.id);
      return {
        ...perfume.toObject(),
        rating: perfume.rating || fakeData.rating,
        reviewCount: perfume.reviewCount || fakeData.reviewCount,
        purchaseCount: perfume.purchaseCount || fakeData.purchaseCount,
      };
    });
    
    res.status(200).json(perfumesWithFakeData);
    
  } catch (error) {
    console.error("Error fetching perfumes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getPerfumeById = async (req, res) => {
  try {
    const perfume = await Perfume.findOne({ id: req.params.id }); 
    if (!perfume) {
      return res.status(404).json({ message: "Perfume not found" });
    }
    
    // Thêm dữ liệu ảo nếu chưa có
    const fakeData = generateFakeData(perfume.id);
    const perfumeWithFakeData = {
      ...perfume.toObject(),
      rating: perfume.rating || fakeData.rating,
      reviewCount: perfume.reviewCount || fakeData.reviewCount,
      purchaseCount: perfume.purchaseCount || fakeData.purchaseCount,
    };
    
    res.status(200).json(perfumeWithFakeData);
  } catch (error) {
    console.error("Error fetching perfume:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const createPerfume = async (req, res) => {
  const {
    id,
    name,
    scent,
    size,
    price,
    stock,
    quantity,
    image,
    ingredients,
    description,
    volume,
    concentration,
    madeIn,
    manufacturer,
    notes,
  } = req.body;

  try {
 
    const existingPerfume = await Perfume.findOne({ id });
    if (existingPerfume) {
      return res
        .status(400)
        .json({ message: "Perfume with this ID already exists" });
    }

    const newPerfume = new Perfume({
      id,
      name,
      scent,
      size,
      price,
      stock,
      quantity,
      image,
      ingredients,
      description,
      volume,
      concentration,
      madeIn,
      manufacturer,
      notes,
    });

    const savedPerfume = await newPerfume.save();
    res
      .status(201)
      .json({ message: "Perfume created successfully", perfume: savedPerfume });
  } catch (error) {
    console.error("Error creating perfume:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const updatePerfume = async (req, res) => {
  try {
    const perfume = await Perfume.findOne({ id: req.params.id });
    if (!perfume) {
      return res.status(404).json({ message: "Perfume not found" });
    }


    Object.assign(perfume, req.body);
    const updatedPerfume = await perfume.save();
    res
      .status(200)
      .json({ message: "Perfume updated successfully", perfume: updatedPerfume });
  } catch (error) {
    console.error("Error updating perfume:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deletePerfume = async (req, res) => {
  try {
    const perfume = await Perfume.findOneAndDelete({ id: req.params.id });
    if (!perfume) {
      return res.status(404).json({ message: "Perfume not found" });
    }
    res.status(200).json({ message: "Perfume deleted successfully" });
  } catch (error) {
    console.error("Error deleting perfume:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllPerfumes,
  getPerfumeById,
  createPerfume,
  updatePerfume,
  deletePerfume,
};
