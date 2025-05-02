require("dotenv").config();
const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5001;

const app = express();

// adding middleware
app.use(cors());
app.use(express.json());









// getting the server live 
app.get("/", (req, res)=>{
    res.send("Alhamdulillah, server is getting ready for assignment 11");

});
app.listen(port, ()=>{
    console.log(`app is listening to port ${port}`);
})