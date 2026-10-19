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

exports.update = async (req, res) => {
  try {
    const semesterId = parseInt(req.params.semesterId, 10) || req.body.semesterId;
    const { semesterName, startDate, endDate } = req.body;

    if (semesterId == null || Number.isNaN(Number(semesterId))) {
      return res.status(400).send({ message: "Invalid semester id." });
    }

    const semester = await db.semester.findByPk(semesterId);
    if (!semester) {
      return res.status(404).send({
        message: `Semester with id=${semesterId} not found.`,
      });
    }

    if (!semesterName?.trim() || !startDate || !endDate ) {
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
    if (existing && existing.id !== Number(semesterId)) {
      return res.status(400).send({
        message: "Semester name is already taken.",
      });
    }

    await db.semester.update(
      {
        semesterName: semesterName.trim(),
        startDate,
        endDate,
      },
      {
        where: { id: semesterId },
      }
    );

    return res.status(200).send({ message: "semester updated successfully." });
  } catch (err) {
    logger.error(`semester update failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to update semester." });
  }
};

exports.remove = async (req, res) => {
  try {
    const semesterId = parseInt(req.params.semesterId, 10);
    if (Number.isNaN(semesterId)) {
      return res.status(400).send({ message: "Invalid semester id." });
    }

    const existing = await db.semester.findByPk(semesterId);
    if (!existing) {
      return res.status(404).send({
        message: `Semester with id=${semesterId} not found.`,
      });
    }

    await db.semester.destroy({ where: { id: semesterId } });

    return res.status(200).send({ message: "semester deleted successfully." });
  } catch (err) {
    logger.error(`semester delete failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to delete semester." });
  }
};

export default exports;
