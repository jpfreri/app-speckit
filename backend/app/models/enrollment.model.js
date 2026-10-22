export default (sequelize, Sequelize) => {
    const Enrollment = sequelize.define(
      "enrollment",
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        sectionId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
      },
      {
        indexes: [{ unique: true, fields: ["userId", "sectionId"] }],
      }
    );
  
    return Enrollment;
  };