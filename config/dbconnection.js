const mongoose = require("mongoose");

const dbConnection = () => {
  mongoose.connect(process.env.DB_URL1).then((connect) => {
    console.log(`DateBase connnected: ${connect.connection.host}`);
  });
  // .catch((err) => {
  //   console.error(`Database Error:${err}`);
  //   process.exit(1);
  // });
};

module.exports = dbConnection;
