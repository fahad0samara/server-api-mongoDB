// Create a new cat

import express from "express";

import { Cat, CatTranslation } from "../model/Cat";
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



router.post("/api/cats", async (req, res) => {
  try {
      const { name, breed, image, min_weight, max_weight,
        description
      } = req.body;
      const cat = new Cat({
          name, breed,
          image, min_weight, max_weight,
            description
      });
    await cat.save();

    // Save the translations for the created cat
    const translations = req.body.translations || [];
      translations.forEach(async (translation: {
          language: unknown; name: unknown; breed: any;
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
    });

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







