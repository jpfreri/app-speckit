export default (sequelize, Sequelize) => {
  const Course = sequelize.define(
    "course",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      courseName: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      semesterId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      startDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      endDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
    },
    {
      indexes: [{ unique: true, fields: ["courseName"] }],
    }
  );

  return Course;
};
