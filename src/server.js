// Simple server whit EXpress.js and MondoDB Atlas

// IMPORTS
const { Resend } = require("resend");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT;
const resend = new Resend(process.env.API_KEY_RESEND);
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
  try {
    const persons = await client
      .db("test")
      .collection("persons")
      .find()
      .toArray();
    res.status(200).json(persons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Función asincrónica para enviar el correo electrónico
async function sendEmail(newPerson) {
  try {
    // Envía el correo electrónico
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [process.env.MAIL_USERNAME],
      subject: "Estoy interesado en realizar un proyecto contigo!",
      html: `<p>Name: ${newPerson.name}</p>
            <p>Email: ${newPerson.email}</p>
            <p>Message: ${newPerson.message}</p>`,
    });

    // Maneja los resultados
    if (error) {
      console.error({ error });
    } else {
      console.log({ data });
    }
  } catch (error) {
    console.error(error);
  }
}

app.post("/pages/contact/contact", async (req, res) => {
  try {
    const newPerson = req.body;
    const result = await client
      .db("test")
      .collection("persons")
      .insertOne(newPerson);
    res.status(201).json(result);

    sendEmail(newPerson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/", async function (req, res) {
  try {
    const personId = req.body.id;
    const updatedPerson = req.body;
    const result = await client
      .db("test")
      .collection("persons")
      .updateOne({ _id: new ObjectId(personId) }, { $set: updatedPerson });
    if (result.modifiedCount > 0) {
      res.status(200).send("Person updated successfully");
    } else {
      res.status(404).send("Person not found");
    }
  } catch (err) {
    res.end("Person not updated");
  }
});

app.delete("/", async function (req, res) {
  try {
    const personId = req.body.id;
    const result = await client
      .db("test")
      .collection("persons")
      .deleteOne({ _id: ObjectId(personId) });
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
