"use strict";
module.exports = (sequelize, DataTypes) => {
  const Blog = sequelize.define(
    "blogs",
    {
      title: {
        type: DataTypes.STRING,
      },
      content: {
        type: DataTypes.STRING,
      },
      author: {
        type: DataTypes.INTEGER,
      },
      status: {
        type: DataTypes.STRING,
      },
    },
    {
      tableName: "blogs",
      timestamps: true,
    }
  );

  Blog.associate = function (models) {
    Blog.belongsTo(models.users, { foreignKey: "author", as: "authorDetails" });
  };
  return Blog;
};
