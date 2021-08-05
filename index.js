const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const bodyParser = require("body-parser");
const cors = require("cors");
app.use(cors());
app.use(express.json());
require("dotenv").config();
console.log(process.env.DB_USER);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const MongoClient = require("mongodb").MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dz2ta.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(uri);
const ObjectID = require("mongodb").ObjectID;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const serviceCollection = client.db("iFocus").collection("services");
  const reviewCollection = client.db("iFocus").collection("reviews");
  const orderCollection = client.db("iFocus").collection("orders");
  const adminCollection = client.db("iFocus").collection("admin");
  // perform actions on the collection object
  console.log("Database Connected");

  app.get("/services", (req, res) => {
    serviceCollection.find().toArray((err, items) => {
      res.send(items);
    });
  });
  app.get("/reviews", (req, res) => {
    reviewCollection.find().toArray((err, items) => {
      res.send(items);
    });
  });
  app.get("/orders", (req, res) => {
    console.log(req.query.email);
    adminCollection.find({ email: req.query.email }).toArray((err, admin) => {
      if (admin.length !== 0) {
        orderCollection.find().toArray((err, items) => {
          res.send(items);
        });
      } else {
        orderCollection
          .find({ email: req.query.email })
          .toArray((err, items) => {
            res.send(items);
          });
      }
    });
  });
  app.post("/addOrders", (req, res) => {
    const newOrder = req.body;
    console.log(newOrder);
    orderCollection.insertOne(newOrder).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  app.get("/services/:name", (req, res) => {
    serviceCollection.find({ name: req.params.name }).toArray((err, items) => {
      res.send(items[0]);
    });
  });
  app.post("/addServices", (req, res) => {
    const newService = req.body;
    console.log("Adding Services", newService);
    serviceCollection.insertOne(newService).then((result) => {
      console.log(result.insertedCount);
      res.send(result.insertedCount > 0);
    });
  });
  app.post("/addReviews", (req, res) => {
    const newReviews = req.body;
    console.log("Adding Reviews", newReviews);
    reviewCollection.insertOne(newReviews).then((result) => {
      console.log(result.insertedCount);
      res.send(result.insertedCount > 0);
    });
  });
  app.post("/addAdmin", (req, res) => {
    const newAdmin = req.body;
    console.log("Adding Admin", newAdmin);
    adminCollection.insertOne(newAdmin).then((result) => {
      console.log(result.insertedCount);
      res.send(result.insertedCount > 0);
    });
  });

  app.delete("/deleteService/:id", (req, res) => {
    const id = ObjectID(req.params.id);
    console.log("delete this", id);
    serviceCollection
      .findOneAndDelete({ _id: id })
      .then((documents) => res.send(documents.deletedCount > 0));
  });

  app.patch("/updateOrders/:id", (req, res) => {
    console.log(req.body.status);
    console.log(req.params.id);
    orderCollection
      .updateOne({ _id: req.params.id }, { $set: { status: req.body.status } })
      .then((result) => {
        console.log(result);
        res.send(result.modifiedCount > 0);
      });
  });

  app.post("/isAdmin", (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email }).toArray((err, admin) => {
      res.send(admin.length > 0);
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
