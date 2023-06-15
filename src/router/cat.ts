// Create a new cat
import express from "express";
import { Cat, CatTranslation } from "../model/Cat";
import {
  containerClient,

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
  const language = req.headers["accept-language"];

  // Set the language for the current request
  if (language && (language.includes("ar") || language.includes("arabic"))) {
    req.headers["accept-language"] = "ar";
  } else {
    req.headers["accept-language"] = "en";
  }

  next();
});


// Create a new cat


router.post("/api/cats", async (req, res) => {
  try {
    const {name, breed, image, minWeight, maxWeight, description} = req.body;

    // Create a new cat record
    const cat = new Cat({
      name,
      breed,
      image,
      min_weight: minWeight,
      max_weight: maxWeight,
      description,
    });

    // Save the cat record to the database
    await cat.save();

    // Check if the Arabic translation is provided
    if (req.body.nameAr) {
      const catTranslationAr = new CatTranslation({
        cat: cat._id, // Assign the cat's ID to the catId field
        language: "ar",
        name: req.body.nameAr,
        breed: req.body.breedAr,
        description: req.body.descriptionAr,
      });

      // Save the Arabic translation to the database
      await catTranslationAr.save();
    }

    res
      .status(201)
      .json({message: "Cat created successfully", cat: cat.toObject()});
  } catch (error) {
    console.error("Error creating cat:", error);
    res.status(500).json({error: "An error occurred while creating the cat"});
  }
});





// Get all cats
router.get("/api/cats", async (req, res) => {
  try {
    // Check if the user wants the Arabic translation
    const language = req.query.lang; // lang query parameter: ?lang=ar

    if (language === "ar") {
      // If the requested language is Arabic, retrieve all cats with translations
      const cats = await Cat.find();

      // Fetch translations for all cats
      const catTranslations = await CatTranslation.find({
        cat: {$in: cats.map(cat => cat._id)},
        language: "ar",
      });

      // Merge translations with cats data
      const catsData = cats.map(cat => {
        const translation = catTranslations.find(
          translation => translation.cat.toString() === cat._id.toString()
        );
        return {
          ...cat.toObject(),
          name: translation ? translation.name : cat.name,
          breed: translation ? translation.breed : cat.breed,
          description: translation ? translation.description : cat.description,
        };
      });

      return res.status(200).json(catsData);
    }

    // If no translation is requested, return all cats without translations
    const cats = await Cat.find();
    return res.status(200).json(cats);
  } catch (error) {
    console.error("Error fetching cats:", error);
    res.status(500).json({error: "An error occurred while fetching cats"});
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







