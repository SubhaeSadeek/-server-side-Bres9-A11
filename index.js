require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5001;

const app = express();

// adding middleware
app.use(cors({
  origin:["http://localhost:5173"],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());


/* 
mongoDb user and pass:
user: blogManagement
pass: 50SKYtZ4lq0nB6ev
*/

const uri = "mongodb+srv://blogManagement:50SKYtZ4lq0nB6ev@cluster0.i6qlf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const database = client.db("hikmahBlog");
    const blogCollection = database.collection("blogs");
    const wishlistCollection = database.collection("wishList");
    const userCollection = database.collection("users");

    // Auth related APIs
    app.post("/jwt", async(req, res)=>{
      const user = req.body;
      const token = jwt.sign(user, process.env.SECRET_JWT, {expiresIn: "1hr"});
      res
      .cookie("jwtToken", token, {
        httpOnly: true,
        secure: false,
        sameSite: "none",

      })
      .send(token);

    })

    // get APIs



    /* ************************************** */
    /* ********** POST APIs */
    /* ************************************** */

    // Add blog API
    app.post("/addBlog", async(req, res)=>{
      const newBlog = req.body;
      const result = await blogCollection.insertOne(newBlog);
      console.log(result);
      res.send(result);
    });

    
    
    // Add User API
    app.post("/user", async(req, res)=>{
      const user = req.body;
      const result = await userCollection.insertOne(user);
      console.log("user added", result);
      res.send(result);
    })







  

    
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






// getting the server live 
app.get("/", (req, res)=>{
    res.send("Alhamdulillah, server is getting ready for assignment 11");

});
app.listen(port, ()=>{
    console.log(`app is listening to port ${port}`);
})