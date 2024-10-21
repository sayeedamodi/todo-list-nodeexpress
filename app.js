const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
require('dotenv').config(); // This should be at the top before using process.env


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Connect to MongoDB using Mongoose
const uri = process.env.MONGODB_URI;

mongoose.connect(uri, {
})
  .then(() => {
    console.log("Successfully connected to MongoDB!");
  })
  .catch((err) => {
    console.log("Connection error: " + err);
  });

// Define schema and model
const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

// Default item
const item1 = new Item({
  name: "Welcome "
});

const defaultItems = [item1];

// Insert default items only if collection is empty
async function insertDefaultItems() {
  const foundItems = await Item.find({});
  if (foundItems.length === 0) {
    await Item.insertMany(defaultItems);
    console.log("Successfully inserted default items!");
  }
}
insertDefaultItems();

// Home route - Get all items from the database
app.get("/", async function (req, res) {
  try {
    const foundItems = await Item.find({});
    const today = new Date();
    const options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };

    const day = today.toLocaleDateString("en-US", options);
    
    // Render the list.ejs with the found items from the database
    res.render("list", { kindOfday: day, newListItems: foundItems });
  } catch (err) {
    console.log(err);
  }
});

// Post route to add new item
app.post("/", async function (req, res) {
  const itemName = req.body.newItem;

  const newItem = new Item({
    name: itemName,
  });

  try {
    await newItem.save(); // Save the new item to the database
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

// Post route to delete checked items
app.post("/delete", async function (req, res) {
  const checkedItemId = req.body.itemId;

  try {
    await Item.findByIdAndDelete(checkedItemId); // Delete the checked item
    res.redirect("/"); // Redirect back to home
  } catch (err) {
    console.log(err);
    res.status(500).send("Error deleting item"); // Handle error
  }
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server is running on port 3000");
});
