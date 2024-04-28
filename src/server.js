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
app.use(cors(
  origin: 'https://mini-proyecto1-client.vercel.app/',
))

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

// Server startup confirmation
app.listen(port, () => {
  console.log("Server listening on port: ", port);
});

// Configuracion del Nodemailer


// Routes of acces methods
app.get("/", async (req, res) => {
  try {
    const persons = await client
      .db("test")
      .collection("persons")
      .find()
      .toArray();
    res.json(persons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/:id", async (req, res) => {
  try {
    const personId = req.params.id;
    const person = await client
      .db("test")
      .collection("persons")
      .findOne({ _id: ObjectId(personId) });
    if (!person) {
      throw new Error("Persona no encontrada");
    }
    res.json(person);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

app.post("/contact", async (req, res) => {
  try {
      const newData = req.body;
      const result = await client.db("test").collection("persons").insertOne(newData);

      const mailOptions = {
          from: newData.email, // El remitente es el correo electrónico proporcionado en el formulario
          to: process.env.EMAIL_TO,
          subject: "Nuevo mensaje de contacto",
          text: `Nuevo mensaje de contacto recibido de ${newData.name} (${newData.email}):\n\n${newData.message}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              console.error("Error sending email:", error);
              res.status(500).json({ error: "Error sending email" });
          } else {
              console.log("Email sent:", info.response);
              res.status(201).json({ message: "Data saved and email sent" });
          }
      });
  } catch (error) {
      console.error("Error processing request:", error);
      res.status(500).json({ error: error.message });
  }
});


