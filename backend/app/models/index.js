import { Sequelize } from "sequelize";
import userModel from "./user.model.js";
import sessionModel from "./session.model.js";
import sequelize from "../config/sequelizeInstance.js";
import semesterModel from "./semester.model.js";
import courseModel from "./course.model.js";
import sectionModel from "./section.model.js";
import enrollmentModel from "./enrollment.model.js";

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.user = userModel(sequelize, Sequelize);
db.session = sessionModel(sequelize, Sequelize);
db.semester = semesterModel(sequelize, Sequelize);
db.course = courseModel(sequelize, Sequelize);
db.section = sectionModel(sequelize, Sequelize);
db.enrollment = enrollmentModel(sequelize, Sequelize);
db.user.hasMany(db.session, {
  foreignKey: "userId",
  as: "sessions",
  onDelete: "CASCADE",
});

db.session.belongsTo(db.user, {
  foreignKey: "userId",
  as: "user",
});

db.semester.hasMany(db.course, {
  foreignKey: "semesterId",
  as: "courses",
  onDelete: "CASCADE",
});

db.course.belongsTo(db.semester, {
  foreignKey: "semesterId",
  as: "semester",
});

db.section.belongsTo(db.course, {
  foreignKey: "courseId",
  as: "course",
});

db.course.hasMany(db.section, {
  foreignKey: "courseId",
  as: "sections",
});

db.section.belongsTo(db.semester, {
  foreignKey: "semesterId",
  as: "semester",
});

db.semester.hasMany(db.section, {
  foreignKey: "semesterId",
  as: "sections",
});

db.enrollment.belongsTo(db.user, {
  foreignKey: "userId",
  as: "user",
});

db.user.hasMany(db.enrollment, {
  foreignKey: "userId",
  as: "enrollments",
});

db.enrollment.belongsTo(db.section, {
  foreignKey: "sectionId",
  as: "section",
});

db.section.hasMany(db.enrollment, {
  foreignKey: "sectionId",
  as: "enrollments",
});

export default db;
