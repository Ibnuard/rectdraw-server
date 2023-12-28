// server.js
const express = require("express");
const bodyParser = require("body-parser");
const startConversation = require("./bin/sidney");
const {
  buildImageUploadApiPayload,
  uploadImageToBlob,
  decrypt,
} = require("./bin/utils");
const cors = require("cors");
const app = express();
const port = 4000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.set("trust proxy", true);
app.disable("etag");
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, OPTION, DELETE"
  );
  next();
});

// Set up home route
app.get("/", (req, res) => {
  res.send("Dev by Ibnuputraard");
});

// Set up second page
app.post("/uploadImage", async (req, res) => {
  const { image } = req.body;

  const { data, boundary } = buildImageUploadApiPayload(image);
  const uploadImage = await uploadImageToBlob(data, boundary);

  res.send({
    status: "OK",
    data: uploadImage,
  });
});

// ask ai
app.post("/ask", async (req, res) => {
  const { image, prompt } = req.body;

  const ai = await startConversation(image, prompt);
  res.send({
    status: "OK",
    data: ai?.text,
  });
});

app.listen(port, () => {
  console.log(`Success! Your application is running on port ${port}.`);
});
