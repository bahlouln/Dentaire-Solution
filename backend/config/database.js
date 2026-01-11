import { Sequelize } from "sequelize";

const db = new Sequelize("nnnnn", "root", "", {
  host: "localhost",
  dialect: "mysql", 
  logging: false,
});

export default db;
