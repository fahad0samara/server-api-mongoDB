// Create a new cat
// eslint-disable-next-line @typescript-eslint/ban-ts-comment

import express from "express";

import {
  containerClient,

} from "../config/azure-config";
import sharp from "sharp";

import multer from "multer";
import Cat from "../model/Cat";
// configure Multer to use Azure Blob Storage as the storage engine
const storage = multer.memoryStorage();
const upload = multer({storage: storage});
const router = express.Router();
// Middleware to handle language preferences
// Middleware to handle language preferences
router.use((req, res, next) => {
  // Check for language preference in request headers
  const language = req.headers["accept-language"];

  // Set the language for the current request
  if (language && (language.includes("ar") || language.includes("arabic"))) {
    req.headers["accept-language"] = "ar";
  } else {
    req.headers["accept-language"] = "en";
  }

  next();
});



router.post("/api/cats", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({error: "No file uploaded"});
    }

    const file = req.file;

    // compress the image using Sharp
    const compressedImage = await sharp(file.buffer)
      .resize(500, 500)
      .webp({
        quality: 80,
        lossless: true,
        nearLossless: false,
      })
      .toBuffer();

    // generate a unique filename for the file
    const filename = `${
      new Date().getTime().toString() + Math.floor(Math.random() * 1000)
      }.webp`;
    



    // create a new block blob with the generated filename
    const blockBlobClient = containerClient.getBlockBlobClient(filename);

    // upload the compressed image to Azure Blob Storage
    await blockBlobClient.upload(compressedImage, compressedImage.length);



    const {min_weight, max_weight, translations} = req.body;

    // Parse the translations field as an array of objects
    const parsedTranslations = JSON.parse(translations);

    // Create a new cat object
    const cat = new Cat({
      image: blockBlobClient.url,
      min_weight,
      max_weight,
      translations: parsedTranslations,
    });

    // Save the cat to the database
    await cat.save();

    res.status(201).json({message: "Cat created successfully", cat});
  } catch (error) {
    res.status(500).json({message: "Failed to create cat", error});
  }
});


// Server-side code
router.get("/api/cats", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.perPage as string) || 10;

    const totalCats = await Cat.countDocuments({});
    const totalPages = Math.ceil(totalCats / perPage);

    const cats = await Cat.find({})
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.status(200).json({ message: "Cats retrieved successfully", cats, totalPages });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve cats", error });
  }
});



router.get("/api/cats/:id", async (req, res) => {
  try {
    const catId = req.params.id;
    
    let cat = null;
    if (catId) {
      cat = await Cat.findById(catId);
    }
    if (!cat) {
      return res.status(404).json({ message: "Cat not found" });
    }
    res.status(200).json({ message: "Cat retrieved successfully", cat });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve cat", error });
  }
});



router.delete("/api/cats/:id", async (req, res) => {

  try {

    const catId = req.params.id;
    const deletedCat = await Cat.findByIdAndDelete(catId);

    if (!deletedCat) {
      return res.status(404).json({message: "Cat not found"});
    }

    res.status(200).json({message: "Cat deleted successfully"});
  } catch (error) {
    console.error("Failed to delete cat:", error);
    res
      .status(500)
      .json({
        message: "Failed to delete cat",
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        error: error.message
      });
  }


});

// Server-side code
router.put("/api/cats/:id", upload.single("image"), async (req, res) => {
  try {
    const catId = req.params.id;

    const {min_weight, max_weight, translations} = req.body;

    // Parse the translations field as an array of objects
    const parsedTranslations = JSON.parse(translations);

    let updatedCatData = {
      min_weight,
      max_weight,
      translations: parsedTranslations,
    };

    if (req.file) {
      const file = req.file;

      // compress the image using Sharp
      const compressedImage = await sharp(file.buffer)
        .resize(500, 500)
        .webp({
          quality: 80,
          lossless: true,
          nearLossless: false,
        })
        .toBuffer();

      // generate a unique filename for the file
      const filename = `${
        new Date().getTime().toString() + Math.floor(Math.random() * 1000)
      }.webp`;

      // create a new block blob with the generated filename
      const blockBlobClient = containerClient.getBlockBlobClient(filename);

      // upload the compressed image to Azure Blob Storage
      await blockBlobClient.upload(compressedImage, compressedImage.length);

      updatedCatData = {
        ...updatedCatData,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        image: `${blockBlobClient.url}?${Date.now()}`,
      };
    }

    const updatedCat = await Cat.findByIdAndUpdate(catId, updatedCatData, {
      new: true,
    });

    if (!updatedCat) {
      return res.status(404).json({message: "Cat not found"});
    }

    res
      .status(200)
      .json({message: "Cat updated successfully", cat: updatedCat});
  } catch (error) {
    res.status(500).json({message: "Failed to update cat", error});
  }
});







export default router







