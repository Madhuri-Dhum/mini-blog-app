"use strict";
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "users",
    {
      name: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
      },
    },
    {
      tableName: "users",
      timestamps: false,
    }
  );

  User.associate = function (models) {
    User.hasMany(models.blogs, { foreignKey: "author", as: "blogs" });
  };
  return User;
};
