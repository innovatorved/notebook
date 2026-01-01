require("dotenv").config();

const connectToMongo = require("./db");
const express = require("express");
const path = require("path");
const morgan = require("morgan");

connectToMongo();

const app = express();
const reactRouter = express.Router();
const buildPath = path.normalize(path.join(__dirname, "./frontend/build"))
const port = process.env.PORT || 3000;

app.use(morgan("combined"));
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

reactRouter.get('(/*)?', async (req, res, next) => {
  res.sendFile(path.join(buildPath, 'index.html'));
})
app.use(reactRouter)


app.listen(port, () => {
  console.log(`Notebook app listening at https://localhost:${port}/`);
});
