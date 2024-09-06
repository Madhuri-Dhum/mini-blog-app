"use strict";
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("1234", 10);

    return queryInterface.bulkInsert(
      "users",
      [
        {
          name : "admin",
          email: "admin@gmail.com",
          password: hashedPassword,
          isAdmin : "1"
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete(
      "users",
      {
        email: "admin@codesfortomorrow.com",
      },
      {}
    );
  },
};
