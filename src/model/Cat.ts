import mongoose from "mongoose";

const catSchema = new mongoose.Schema({
  image: String,
  min_weight: Number,
  max_weight: Number,
  translations: [
    {
      language: String,
      name: String,
      breed: String,
      description: String,
    },
  ],
});

const Cat = mongoose.model("Cat", catSchema);

export default Cat;
