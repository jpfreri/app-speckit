import { Sequelize } from "sequelize";
import userModel from "./user.model.js";
import sessionModel from "./session.model.js";
import sequelize from "../config/sequelizeInstance.js";

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;


db.user = userModel(sequelize, Sequelize);
db.session = sessionModel(sequelize, Sequelize);

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
  
 
  

export default db;
