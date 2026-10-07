import db from "../models/index.js";
import logger from "../config/logger.js";

const exports = {};

const sectionInclude = [
    {
        model: db.course,
        as: "course",
        attributes: ["id", "name"],
    },
    {
        model: db.semester,
        as: "semester",
        attributes: ["id", "name"],
    },
]

const isEndAfterStart = (startDate, endDate) =>
  Boolean(startDate && endDate && endDate > startDate);

const parseCourseId = (courseId) => {
    if (courseId === undefined || courseId === null || courseId === "") {
         return null;
        }
    
    const parsed = parseInt(courseId, 10);
    return Number.isNaN(parsed) ? NaN : parsed;
    }

    const parseSemesterId = (semesterId) => {
        if (semesterId === undefined || semesterId === null || semesterId === "") {
             return null;
            }
        
        const parsed = parseInt(semesterId, 10);
        return Number.isNaN(parsed) ? NaN : parsed;
        }


const findSection = (sectionId) =>
  db.section.findByPk(sectionId, { include: sectionInclude });
  
exports.findAll = async (req, res) => {
  try {
    const sections = await db.section.findAll({
      include: sectionInclude,
      order: [["startDate", "ASC"]],
    });

    return res.send(sections);
  } catch (err) {
    logger.error(`season findAll failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to fetch sections." });
  }
};

exports.create = async (req, res) => {
  try {
    const { sectionName, startDate, endDate, courseId, semesterId } = req.body;
    const parsedCourseId = parseCourseId(courseId);
    const parsedSemesterId = parseSemesterId(semesterId);

    if (!sectionName?.trim() || !startDate || !endDate || parsedCourseId === null || parsedSemesterId === null) {
      return res.status(400).send({ message: "Required" });
    }

    if (sectionName.trim().length > 30) {
      return res.status(400).send({
        message: "Section name must be 30 characters or fewer.",
      });
    }

    if (!isEndAfterStart(startDate, endDate)) {
      return res.status(400).send({
        message: "End date must be after start date.",
      });
    }

    if (Number.isNaN(parsedCourseId)) {
      return res.status(400).send({ message: `Course with id=${courseId} not found.` });
    }

    const course = await db.course.findByPk(parsedCourseId);
    if (!course) {
      return res.status(400).send({ message: `Course with id=${courseId} not found.` });
    }

    if (Number.isNaN(parsedSemesterId)) {
      return res.status(400).send({ message: `Semester with id=${semesterId} not found.` });
    }

    const semester = await db.semester.findByPk(parsedSemesterId);
    if (!semester) {
      return res.status(400).send({ message: `Semester with id=${semesterId} not found.` });
    }

    const existing = await db.section.findOne({
      where: { sectionName: sectionName.trim() },
    });
    if (existing) {
      return res.status(400).send({
        message: "Section name is already taken.",
      });
    }

    const created = await db.section.create({
      sectionName: sectionName.trim(),
      startDate,
      endDate,
      courseId: parsedCourseId,
      semesterId: parsedSemesterId,
    });

    return res.status(201).send(await findSection(created.id));

  } catch (err) {
    logger.error(`Section create failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to create section." });
  }
};

exports.update = async (req, res) => {
  try {
    const sectionId = parseInt(req.params.sectionId, 10) || req.body.sectionId;

    const { sectionName, startDate, endDate, courseId, semesterId } = req.body;
    const parsedCourseId = parseCourseId(courseId);
    const parsedSemesterId = parseSemesterId(semesterId);

    if (sectionId == null || Number.isNaN(Number(sectionId))) {
      return res.status(400).send({ message: "Invalid section id." });
    }

    const section = await db.section.findByPk(sectionId);
    if (!section) {
      return res.status(404).send({
        message: `Section with id=${sectionId} not found.`,
      });
    }

    if (!sectionName?.trim() || !startDate || !endDate || parsedCourseId === null || parsedSemesterId === null) {
      return res.status(400).send({ message: "Required" });
    }

    if (sectionName.trim().length > 30) {
      return res.status(400).send({
        message: "Section name must be 30 characters or fewer.",
      });
    }

    if (!isEndAfterStart(startDate, endDate)) {
      return res.status(400).send({
        message: "End date must be after start date.",
      });
    }
    if (Number.isNaN(parsedCourseId)) {
      return res.status(400).send({ message: `Course with id=${courseId} not found.` });
    }

    const course = await db.course.findByPk(parsedCourseId);
    if (!course) {
      return res.status(400).send({ message: `Course with id=${courseId} not found.` });
    }

    if (Number.isNaN(parsedSemesterId)) {
      return res.status(400).send({ message: `Semester with id=${semesterId} not found.` });
    }

    const semester = await db.semester.findByPk(parsedSemesterId);
    if (!semester) {
      return res.status(400).send({ message: `Semester with id=${semesterId} not found.` });
    }

    const existing = await db.section.findOne({
      where: { sectionName: sectionName.trim() },
    });
    if (existing && existing.id !== Number(sectionId)) {
      return res.status(400).send({
        message: "Section name is already taken.",
      });
    }

    await db.section.update(
      {
        sectionName: sectionName.trim(),
        startDate,
        endDate,
        courseId: parsedCourseId,
        semesterId: parsedSemesterId,
      },
      {
        where: { id: sectionId },
      }
    );

    return res.status(200).send(await findSection(sectionId));
  } catch (err) {
    logger.error(`section update failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to update section." });
  }
};

exports.remove = async (req, res) => {
  try {
    const sectionId = parseInt(req.params.sectionId, 10);
    if (Number.isNaN(Number(sectionId))) {
      return res.status(400).send({ message: "Invalid section id." });
    }

    const existing = await db.section.findByPk(sectionId);
    if (!existing) {
      return res.status(404).send({
        message: `Section with id=${sectionId} not found.`,
      });
    }

    await db.section.destroy({ where: { id: sectionId } });

    return res.status(200).send({ message: "section deleted successfully." });
  } catch (err) {
    logger.error(`section delete failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to delete section." });
  }
};




export default exports;