import db from "../models/index.js";

const exports = {};

exports.findAll = async (req, res) => {
  try {
    const semesters = await db.semester.findAll();
    return res.send(semesters);
  } catch (err) {
    return res.status(500).send({ message: "Failed to fetch semesters." });
  }
};

export default exports;