require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5001;

const app = express();

// adding middleware
app.use(cors());
app.use(express.json());


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
    const blog = {
        title: "this is the bloggers blog",
        postedIn: new Date()
    }
    const result = await blogCollection.insertOne(blog);
    console.log(result);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
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