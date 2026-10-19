import db from "../models/index.js";
import logger from "../config/logger.js";

const exports = {};

const enrollmentInclude = [
  {
    model: db.section,
    as: "section",
    include: [
      {
        model: db.course,
        as: "course",
        attributes: ["id", "courseName"],
      },
      {
        model: db.semester,
        as: "semester",
        attributes: ["id", "semesterName"],
      },
    ],
  },
];

const parseSectionId = (sectionId) => {
  if (sectionId === undefined || sectionId === null || sectionId === "") {
    return null;
  }
  const parsed = parseInt(sectionId, 10);
  return Number.isNaN(parsed) ? NaN : parsed;
};

const toEnrollmentResponse = (enrollment) => ({
  id: enrollment.id,
  userId: enrollment.userId,
  sectionId: enrollment.sectionId,
  sectionName: enrollment.section?.sectionName,
  courseName: enrollment.section?.course?.courseName,
  semesterName: enrollment.section?.semester?.semesterName,
  startDate: enrollment.section?.startDate,
  endDate: enrollment.section?.endDate,
  createdAt: enrollment.createdAt,
  updatedAt: enrollment.updatedAt,
});

const findEnrollment = (id) =>
  db.enrollment.findByPk(id, { include: enrollmentInclude });

exports.findAll = async (req, res) => {
  try {
    const enrollments = await db.enrollment.findAll({
      where: { userId: req.user.id },
      include: enrollmentInclude,
      order: [[{ model: db.section, as: "section" }, "startDate", "ASC"]],
    });

    return res.send(enrollments.map(toEnrollmentResponse));
  } catch (err) {
    logger.error(`enrollment findAll failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to fetch enrollments." });
  }
};

exports.create = async (req, res) => {
  try {
    const parsedSectionId = parseSectionId(req.body.sectionId);

    if (parsedSectionId === null) {
      return res.status(400).send({ message: "Required" });
    }

    if (Number.isNaN(parsedSectionId)) {
      return res.status(400).send({
        message: `Section with id=${req.body.sectionId} not found.`,
      });
    }

    const section = await db.section.findByPk(parsedSectionId);
    if (!section) {
      return res.status(400).send({
        message: `Section with id=${parsedSectionId} not found.`,
      });
    }

    const existing = await db.enrollment.findOne({
      where: { userId: req.user.id, sectionId: parsedSectionId },
    });
    if (existing) {
      return res.status(400).send({
        message: "You are already enrolled in this course section.",
      });
    }

    const created = await db.enrollment.create({
      userId: req.user.id,
      sectionId: parsedSectionId,
    });

    const full = await findEnrollment(created.id);
    return res.status(201).send(toEnrollmentResponse(full));
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).send({
        message: "You are already enrolled in this course section.",
      });
    }
    logger.error(`enrollment create failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to create enrollment." });
  }
};

export default exports;