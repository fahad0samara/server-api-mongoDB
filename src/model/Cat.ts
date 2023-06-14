import mongoose from "mongoose"

const catSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  breed: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  min_weight: {
    type: Number,
    required: true,
  },
  max_weight: {
    type: Number,
    required: true,
  },
  description: {
      type: String,
    required: true,
  },
});

const catTranslationSchema = new mongoose.Schema({
  catId: {
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
