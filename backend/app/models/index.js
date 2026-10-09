import { Sequelize } from "sequelize";
import userModel from "./user.model.js";
import sessionModel from "./session.model.js";
import sequelize from "../config/sequelizeInstance.js";
import semesterModel from "./semester.model.js";
import courseModel from "./course.model.js";
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;


db.user = userModel(sequelize, Sequelize);
db.session = sessionModel(sequelize, Sequelize);
db.semester = semesterModel(sequelize, Sequelize);
db.course = courseModel(sequelize, Sequelize);
// Register models and associations here as features define them, e.g.:
// import userModel from "./user.model.js";
// db.user = userModel(sequelize, Sequelize);

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
  

export default db;
