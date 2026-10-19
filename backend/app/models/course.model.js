export default (sequelize, Sequelize) => {
    const Course = sequelize.define("course", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      courseName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      semesterId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    });
  
    return Course;
  };
  