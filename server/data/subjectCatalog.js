import Subject from "../models/Subject.js";

export const subjectNames = [
  "Business Communication 500",
  "Data Science 500",
  "Information Systems 622",
  "Internet Programming 622*",
  "Business Management 622*",
  "Networks 622*",
  "Programming 512",
  "Management Information Systems 600",
  "Programming 732",
  "Intro to Information Technology 500",
  "Networks 512",
  "Machine Learning 600",
  "Programming 622",
  "IT Help Desk 500",
  "Mobile App Development 700",
  "Operating Systems 600",
  "M-Commerce 622",
  "Mathematics 512",
  "Information Systems 512",
  "Operating Systems 700",
  "Big Data & IOT 600",
  "Web Tech 512",
  "Programming 632*",
  "Business Analysis 632*",
  "eCommerce 512",
  "Networks 632*",
  "Database Systems 622",
  "Programming 742*",
  "IT Strategic Management 732*",
  "Networks 732*",
  "Autonomous Systems & Robotics 700*",
  "Stats for Data Science 600*",
  "Server Technology 600*",
  "Business Analysis 622*",
];

const keyFor = (name) =>
  name
    .toLowerCase()
    .replace(/\*/g, " star")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export async function seedSubjectCatalog() {
  await Subject.init();
  await Subject.bulkWrite(
    subjectNames.map((name) => ({
      updateOne: {
        filter: {
          $or: [{ catalogKey: keyFor(name) }, { name }],
        },
        update: {
          $set: { catalogKey: keyFor(name) },
          $setOnInsert: {
            name,
            category: "General",
          },
        },
        upsert: true,
      },
    })),
    { ordered: false },
  );
}
