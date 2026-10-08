export default (sequelize, Sequelize) => {
    const User = sequelize.define(
      "user",
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        fName: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        lName: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        username: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        password: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        role: {
          type: Sequelize.STRING(20),
          allowNull: false,
          defaultValue: "student",
        },
      },
      {
        indexes: [
          { unique: true, fields: ["email"] },
          { unique: true, fields: ["username"] },
        ],
        defaultScope: {
          attributes: { exclude: ["password"] },
        },
        hooks: {
          beforeValidate(user) {
            if (user.username) {
              user.username = user.username.trim().toLowerCase();
            }
          },
        },
      
       
      }
    );
  
    return User;
  };
  