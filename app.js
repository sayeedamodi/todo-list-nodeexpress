const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/todolistDB");

// Define schema and model
const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

// Default item
const item1 = new Item({
  name: "Welcome to your to-do list!",
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
    var today = new Date();
    var options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };

    var day = today.toLocaleDateString("en-US", options);
    async function findItems() {
      try {
        const foundItems = await Item.find({});
        console.log(foundItems); // Handle the found items
      } catch (err) {
        console.log(err); // Handle the error
      }
    }
    
    findItems();
    
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
    res.send("Item deleted"); // Send a response back
  } catch (err) {
    console.log(err);
    res.status(500).send("Error deleting item"); // Handle error
  }
});


app.listen(process.env.PORT || 3000, function (){
    console.log("server is running on port 3000");
});