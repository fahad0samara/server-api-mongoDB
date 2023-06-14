// Create a new cat
import express from "express";
import { Cat, CatTranslation } from "../model/Cat";
import {
  containerClient,
  createContainerIfNotExists,
} from "../config/azure-config";
import sharp from "sharp";

import multer from "multer";
// configure Multer to use Azure Blob Storage as the storage engine
const storage = multer.memoryStorage();
const upload = multer({storage: storage});
const router = express.Router();
// Middleware to handle language preferences
// Middleware to handle language preferences
router.use((req, res, next) => {
  // Check for language preference in request headers
  const language = req.headers['accept-language'];

  // Set the language for the current request
    if (language && (language.includes('ar') || language.includes('arabic'))) {
        req.headers['accept-language'] = 'ar';
    } else {
        req.headers['accept-language'] = 'en';
    }
    
   
 

  next();
});

// Create a new cat



router.post("/api/cats", upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      breed,
      image,
      min_weight,
      max_weight,
      description,
      translations,
    } = req.body;

    const file = req.file;

    if (!file) {
      return res.status(400).json({error: "No file uploaded"});
    }

    // compress the image using Sharp
    const compressedImage = await sharp(file.buffer)
      .resize(500, 500)
      .jpeg({quality: 80})
      .toBuffer();

    // generate a unique filename for the file
    const filename = `${file.originalname}-${Date.now()}`;

    // create a new block blob with the generated filename
    const blockBlobClient = containerClient.getBlockBlobClient(filename);

    // upload the compressed image to Azure Blob Storage
    await blockBlobClient.upload(compressedImage, compressedImage.length);

    console.log(`Image uploaded to: ${blockBlobClient.url}`);

    const cat = new Cat({
      name,
      breed,
      image: blockBlobClient.url,
      image_url: blockBlobClient.url,
      min_weight,
      max_weight,
      description,
    });
    await cat.save();

    // Save the translations for the created cat
    if (Array.isArray(translations)) {
      translations.forEach(
        async (translation: {
          language: unknown;
          name: unknown;
          breed: any;
          description: any;
        }) => {
          const {language, name, breed, description} = translation;
          const catTranslation = new CatTranslation({
            catId: cat._id,
            language,
            name,
            breed,
            description,
          });
          await catTranslation.save();
        }
      );
    }

    res.status(201).json(cat);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "An error occurred"});
  }
});


// Get all cats
router.get("/api/cats", async (req, res) => {
  try {
    const cats = await Cat.find();
    const language = req.headers["accept-language"];

    const response = [];

    for (const cat of cats) {
      const translation = await CatTranslation.findOne({
        catId: cat._id,
        language,
      });

      response.push({
        name: translation ? translation.name : cat.name,
          breed: translation ? translation.breed : cat.breed,
          max_weight:
              cat.max_weight,
          min_weight:
                cat.min_weight,
        image: cat.image,
          description: translation ? translation.description : cat.description,
        
      });
    }

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "An error occurred"});
  }
});


// Get a specific cat by ID
router.get("/api/cats/:id", async (req, res) => {
  try {
    const cat = await Cat.findById(req.params.id);
    if (!cat) {
      return res.status(404).json({error: "Cat not found"});
    }

    const language = req.headers["accept-language"];

    const translation = await CatTranslation.findOne({
      catId: cat._id,
      language,
    });

    const response = {
      name: translation ? translation.name : cat.name,
      breed: translation ? translation.breed : cat.breed,
    };

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "An error occurred"});
  }
});

// Delete a cat by ID
router.delete("/api/cats/:id", async (req, res) => {
  try {
    const cat = await Cat.findByIdAndDelete(req.params.id);
    if (!cat) {
      return res.status(404).json({error: "Cat not found"});
    }

    // Delete the translations for the deleted cat
    await CatTranslation.deleteMany({catId: cat._id});

    res.json({message: "Cat deleted successfully"});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "An error occurred"});
  }
});


export default router







