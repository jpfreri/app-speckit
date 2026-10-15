import { Sequelize } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";
import sectionModel from "./section.model.js";
import userModel from "./user.model.js";
import sessionModel from "./session.model.js";
import courseModel from "./course.model.js";
import semesterModel from "./semester.model.js";

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.section = sectionModel(sequelize, Sequelize);
db.user = userModel(sequelize, Sequelize);
db.session = sessionModel(sequelize, Sequelize);
db.course = courseModel(sequelize, Sequelize);
db.semester = semesterModel(sequelize, Sequelize);

db.user.hasMany(db.session, {
  foreignKey: "userId",
  as: "sessions",
  onDelete: "CASCADE",
});

db.session.belongsTo(db.user, {
  foreignKey: "userId",
  as: "user",
});

db.course.belongsTo(db.semester, {
  foreignKey: "semesterId",
  as: "semester",
});

db.semester.hasMany(db.course, {
  foreignKey: "semesterId",
  as: "courses",
  onDelete: "CASCADE",
});

db.section.belongsTo(db.course, { 
    foreignKey: "courseId",
     as: "course"
     });
db.course.hasMany(db.section, { 
    foreignKey: "courseId", 
    as: "sections" 
});
db.section.belongsTo(db.semester, { 
    foreignKey: "semesterId", 
    as: "semester" 
});
db.semester.hasMany(db.section, { 
    foreignKey: "semesterId", 
    as: "sections"
 });

export default db;