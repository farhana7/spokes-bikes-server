const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ir5um.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// console.log(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db("spokes_bikes");
    const productCollection = database.collection("products");
    const purchaseCollection = client
      .db("spokes_bikes")
      .collection("purchases");
    const usersCollection = database.collection("users");
    const reviewCollection = database.collection("viewers");

    // console.log("database connected successfully");

    //GET Products API
    app.get("/products", async (req, res) => {
      const cursor = productCollection.find({});
      const products = await cursor.toArray();
      res.json(products);
    });

    //Get Single Product
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      console.log("getting specific product", id);
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.json(product);
    });

    //POST API
    app.post("/products", async (req, res) => {
      const product = req.body;
      console.log("hit the post api", product);
      const result = await productCollection.insertOne(product);
      res.json(result);
    });

    //DELETE API
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.json(result);
    });

    //for Purchases--------------
    app.get("/purchases", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      // console.log(query);
      const cursor = purchaseCollection.find(query);
      const purchases = await cursor.toArray();
      res.json(purchases);
    });

    app.post("/purchases", async (req, res) => {
      const purchase = req.body;
      const result = await purchaseCollection.insertOne(purchase);
      console.log(result);
      res.json(result);
    });

    //DELETE API
    app.delete("/purchases/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await purchaseCollection.deleteOne(query);
      res.json(result);
    });

    //users
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      // console.log("put", user);
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
    app.put("/users/admin", async (req, res) => {
      // const email = req.body;
      const user = req.body;
      console.log("put", user);
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      console.log(result);
      res.json(result);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    //Review---------------
    const users = [
      { id: 0, name: "Jami", email: "jami@gmail.com" },
      { id: 1, name: "Tim", email: "tim@gmail.com" },
      { id: 2, name: "Rim", email: "rim@gmail.com" },
      { id: 3, name: "Dim", email: "dim@gmail.com" },
      { id: 4, name: "kim", email: "kim@gmail.com" },
      { id: 5, name: "Vim", email: "vim@gmail.com" },
      { id: 6, name: "Qim", email: "Qim@gmail.com" },
      { id: 7, name: "Pim", email: "pim@gmail.com" },
    ];

    app.get("/viewers", (req, res) => {
      // console.log(req.query.search);
      const search = req.query.search;
      //use query parameter
      if (search) {
        const searchResult = users.filter((user) =>
          user.name.toLocaleLowerCase().includes(search)
        );
        res.send(searchResult);
      } else {
        res.send(users);
      }
    });

    //app method
    app.post("/viewers", (req, res) => {
      const newUser = req.body;
      newUser.id = users.length;
      users.push(newUser);
      console.log("hitting the post", req.body);
      // res.send(JSON.stringify(newUser));
      res.json(newUser);
    });

    // dynamic API (particular/single person's id)
    app.get("/viewers/:id", (req, res) => {
      const id = req.params.id;
      const user = users[id];
      res.send(user);
      // console.log(req.params.id);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Spokes Bikes!");
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});
