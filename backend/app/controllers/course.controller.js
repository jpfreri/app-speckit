import db from "../models/index.js";
import logger from "../config/logger.js";

const exports = {};


exports.findAll = async (req, res) => {
  try {
    const courses = await db.course.findAll({
        include: [{ model: db.semester, as: "semester" }],
        order: [
          [{ model: db.semester, as: "semester" }, "startDate", "ASC"],
          ["courseName", "ASC"],
        ],
      });
    

    return res.send(courses);
  } catch (err) {
    logger.error(`course findAll failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to fetch courses." });
  }
};

exports.create = async (req, res) => {
  try {
    const { courseName, semesterId } = req.body;

    if (!courseName?.trim() || !semesterId) {
      return res.status(400).send({ message: "Required" });
    }

    if (courseName.trim().length > 30) {
      return res.status(400).send({
        message: "Course name must be 30 characters or fewer.",
      });
    }
    

    const existing = await db.course.findOne({
      where: { courseName: courseName.trim() },
    });

    const semester = await db.semester.findByPk(semesterId);
    
    if (existing) {
        return res.status(400).send({
          message: "Course name is already taken.",
        });
      }

    if (!semester) {
      return res.status(400).send({
        message: `Semester with id=${semesterId} not found.`,
      });
    }

    

    const created = await db.course.create({
      courseName: courseName.trim(),
      semesterId,
    });

    return res.status(201).send(await db.course.findByPk(created.id));
  } catch (err) {
    logger.error(`course create failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to create course." });
  }
};

exports.update = async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId, 10);
      const { courseName, semesterId } = req.body;
  
      const course = await db.course.findByPk(courseId);
      if (!course) {
        return res.status(404).send({
          message: `Course with id=${courseId} not found.`,
        });
      }
  
      if (!courseName?.trim() || !semesterId) {
        return res.status(400).send({ message: "Required" });
      }
  
      if (courseName.trim().length > 30) {
        return res.status(400).send({
          message: "Course name must be 30 characters or fewer.",
        });
      }
  
      const semester = await db.semester.findByPk(semesterId);
      if (!semester) {
        return res.status(404).send({
          message: `Semester with id=${semesterId} not found.`,
        });
      }
  
      const existing = await db.course.findOne({
        where: { courseName: courseName.trim() },
      });
      if (existing && existing.id !== courseId) {
        return res.status(400).send({
          message: "Course name is already taken.",
        });
      }
  
      await db.course.update(
        { courseName: courseName.trim(), semesterId },
        { where: { id: courseId } }
      );
  
      return res.status(200).send(await db.course.findByPk(courseId));
    } catch (err) {
      logger.error(`course update failed: ${err.message}`);
      return res.status(500).send({ message: "Failed to update course." });
    }
  };

exports.remove = async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId, 10);
    if (Number.isNaN(courseId)) {
      return res.status(400).send({ message: "Invalid course id." });
    }

    const existing = await db.course.findByPk(courseId);
    if (!existing) {
      return res.status(404).send({
        message: `Course with id=${courseId} not found.`,
      });
    }

    await db.course.destroy({ where: { id: courseId } });

    return res.status(200).send({ message: "course deleted successfully." });
  } catch (err) {
    logger.error(`course delete failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to delete course." });
  }
};

export default exports;
