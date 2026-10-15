import db from "../models/index.js";
import logger from "../config/logger.js";

const exports = {};

exports.findAll = async (req, res) => {
  try {
    const courses = await db.course.findAll();
    return res.send(courses);
  } catch (err) {
    logger.error(`course findAll failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to fetch courses." });
  }
};

export default exports;
