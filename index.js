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
    strict: false,
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
    // creating a text index for the title field in docuemnts of blogCollection
    await blogCollection.createIndex({title:"text"})
    const wishlistCollection = database.collection("wishList");
    const commentsCollection = database.collection("comments")
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

   
    /* ************************************** */
    /* ********** GET APIs */
    /* ************************************** */
    // Get all blogs
    app.get("/allBlogs", async(req, res)=>{
      const cursor =  blogCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // Get blogs by text serch or by category API
    app.get("/blogs-by-search", async(req, res)=>{
      const {title, category} = req.query;
      const query = {};
      if(title){
        query.$text = {$search: title};
        
      }
      else if(category){
        query.category = category;
      
      }
      try{
        const cursor = blogCollection.find(query);
        const result = await cursor.toArray();
        res.send(result)
       
      }catch(err){
        console.error("ERROR GETTING DATA FRM MONGODB", err);
        res.status(500).send({error:"Search Faild"});
      }
    });

    // Get blog by ID for a single blog data to show detail in frontend
    app.get("/blogDetails/:id", async(req, res)=>{
      const id = req.params.id;
      
      const query = {_id: new ObjectId(id)};
      const result = await blogCollection.findOne(query);
      
      res.send(result);
    } );

    // Get API for updating a blog data
    app.get("/update-blog/:id", async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await blogCollection.findOne(query);
      res.send(result);
    });
    
    // Get API by user email for wishlist blog data

    app.post("/get-wishlist", async(req, res)=>{
      const {email} = req.body;
      const cursor =  wishlistCollection.find({wishListUserEmail: email
      });
      const result = await cursor.toArray();      
      
      res.send(result);

    })

    // GET API for my blog
    app.post("/myblogs", async(req, res)=>{
      const {email} = req.body;
      const cursor = blogCollection.find({email:email});
      const result = await cursor.toArray();      
      console.log(result);
      res.send(result);

    });

    // GET API for featured bkogs
    app.get("/featured", async (req, res) => {
	const featuredBlogs = await blogCollection.aggregate([
		{
			$addFields: {
				wordCount: {
					$size: {
						$filter: {
							input: { $split: ["$blogPost", " "] },
							as: "word",
							cond: { $ne: ["$$word", ""] },
						},
					},
				},
			},
		},
		{ $sort: { wordCount: -1 } },
		{ $limit: 10 },
		{ $project: {title: 1,
    blogPost: 1,
    image: 1,
    shortDescription: 1,
    category: 1,
    wordCount: 1,
    userName: 1,
    email: 1} },
	]).toArray();

	res.send(featuredBlogs);
});



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

    // add wishlist API
    app.post("/wishlist", async(req, res)=>{
      const newWishlist = req.body;
      const result = await wishlistCollection.insertOne(newWishlist);
      res.send(result);
    })

    // Add User API
    app.post("/user", async(req, res)=>{
      const user = req.body;
      const result = await userCollection.insertOne(user);
      console.log("user added", result);
      res.send(result);
    })




    // Update blog API
    app.patch("/update-blog/:id", async (req, res) => {
      const id = req.params.id;
      
      const filter = { _id: new ObjectId(id)};
      const updateDoc = { $set: req.body };
     
      const result = await blogCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // DELETE APIs

    app.delete("/wishlist/:id", async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await wishlistCollection.deleteOne(query)
      console.log(result);
      res.send(result)
    })

    app.delete("/my-blog/:id", async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new  ObjectId(id)};
      const result = await blogCollection.deleteOne(query);
      console.log(result);
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