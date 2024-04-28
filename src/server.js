// Simple server whit EXpress.js and MondoDB Atlas

// IMPORTS
const express = require("express");
const bodyParser = require("body-parser");
const transporter = require("./nodemailerConfig");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
  })
);

// Make connection to BD in this case MongoDB
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// Routes of acces methods
app.get("/", async (req, res) => {
  try{
      const persons = await client.db("test").collection("persons").find().toArray();
      res.status(200).json(persons);
  }catch(err){
      res.status(500).json({error: err.message})
  }
})

app.post("/", async (req, res) => {
  try{
      const newPerson = req.body;
      const result = await client.db("test").collection("persons").insertOne(newPerson);
      res.status(201).json(result);
  }catch(err){
      res.status(500).json({error: err.message})
  }
})

app.put('/contact', async function (req, res) {
  try {
    const personId = req.body.id;
    const updatedPerson = req.body;
    const result = await client.db("test").collection("persons").updateOne(
      { _id: new ObjectId(personId) },
      { $set: updatedPerson }
    );
    if (result.modifiedCount > 0) {
      res.status(200).send("Person updated successfully");
    } else {
      res.status(404).send("Person not found");
    }
  } catch (err) {
    res.end("Person not updated");
  }
});

app.delete('/', async function (req, res) {
  try {
    const personId = req.body.id;
    const result = await client.db("test").collection("persons").deleteOne({ _id: ObjectId(personId) });
    if (result.deletedCount > 0) {
      res.status(200).send("Person deleted successfully");
    } else {
      res.status(404).send("Person not found");
    }
  } catch (err) {
    res.end("Person not deleted");
  }
});


// Server startup confirmation
app.listen(port, () => {
  console.log("Welcome Server listening on port: ", port);
});