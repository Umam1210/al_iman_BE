import { Sequelize } from 'sequelize';

// for XAMPP
// const db = new Sequelize("al_iman_boga", "root", "", {
//     host: "localhost",
//     dialect: "mysql"
// })

// for MAMP
const db = new Sequelize('al_iman_boga', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql'
});

export default db;
