const express = require("express");
require("dotenv/config");
const app = express();
const authRoute = require("./routes/auth.route");
const blogRoute = require("./routes/blog.route");
const userRoute = require("./routes/user.route");
const authVAlidate = require("./middleware/auth.validate");

app.use(express.json());

app.use("/auth", authRoute);
app.use(authVAlidate);
app.use("/blog", blogRoute);
app.use("/user", userRoute);

app.use(function (error, req, res, next) {
  const message = error.message;
  const data = error.data;
  const code = error.statusCode || 500;
  res.status(code).json({ status: false, message, data });
});

app.listen(process.env.PORT, () => {
  console.log(`Server start on port ${process.env.PORT}`);
});
