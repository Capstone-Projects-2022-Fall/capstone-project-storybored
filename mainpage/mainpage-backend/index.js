var express = require("express");
var cors = require('cors')

const app = express();


app.use(express.json());
app.use(cors())
app.locals.index = 1567829555;


app.get("/api/roomID", (req, res) => {
    let roomID = (app.locals.index++).toString(36);
    console.log(roomID)
    res.json({ roomID })
  });
  




const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`started server on port ${PORT}`);
});
