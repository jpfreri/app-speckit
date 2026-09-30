import db from "../models/index.js";
import logger from "../config/logger.js";

const exports = {};

const isEndAfterStart = (startDate, endDate) =>
  Boolean(startDate && endDate && endDate > startDate);

exports.findAll = async (req, res) => {
  try {
    const semesters = await db.semester.findAll({
      order: [["startDate", "ASC"]],
    });

    return res.send(semesters);
  } catch (err) {
    logger.error(`semester findAll failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to fetch semesters." });
  }
};

exports.create = async (req, res) => {
  try {
    const { semesterName, startDate, endDate } = req.body;

    if (!semesterName?.trim() || !startDate || !endDate) {
      return res.status(400).send({ message: "Required" });
    }

    if (semesterName.trim().length > 30) {
      return res.status(400).send({
        message: "Semester name must be 30 characters or fewer.",
      });
    }

    if (!isEndAfterStart(startDate, endDate)) {
      return res.status(400).send({
        message: "End date must be after start date.",
      });
    }

    const existing = await db.semester.findOne({
      where: { semesterName: semesterName.trim() },
    });
    if (existing) {
      return res.status(400).send({
        message: "Semester name is already taken.",
      });
    }

    const created = await db.semester.create({
      semesterName: semesterName.trim(),
      startDate,
      endDate,
    });

    return res.status(201).send(await db.semester.findByPk(created.id));
  } catch (err) {
    logger.error(`semester create failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to create semester." });
  }
};

export default exports;
