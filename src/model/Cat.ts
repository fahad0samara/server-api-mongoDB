import mongoose from "mongoose";

const catSchema = new mongoose.Schema({
  name: String,
  breed: String,
  image: String,
  min_weight: Number,
  max_weight: Number,
  description: String,
});

const catTranslationSchema = new mongoose.Schema({
  cat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cat",
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  breed: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});


const Cat = mongoose.model("Cat", catSchema);
const CatTranslation = mongoose.model("CatTranslation", catTranslationSchema);

export {Cat, CatTranslation};
