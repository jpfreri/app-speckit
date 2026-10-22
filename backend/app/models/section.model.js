export default (sequelize, Sequelize) => {
    const Section = sequelize.define(
      "section",
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        sectionName: {
          type: Sequelize.STRING(30),
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
        courseId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        semesterId: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
        },
      {
        indexes: [{ unique: true, fields: ["sectionName"] }],
      }
    );
  
    return Section;
  };