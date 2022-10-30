//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

// loading mongodb package
const mongoose = require("mongoose");
// adding lodash
const _ = require('lodash');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// creating database with .connect ++++
mongoose.connect("mongodb+srv://admin-shubham:test123@cluster0.s1tgtbp.mongodb.net/todolistDB", {
  useNewUrlParser: true
});

// switching to heroku port from localhost
app.listen(process.env.PORT || 3000, function(){
  console.log("Server is running.....");
});


// creating item database model +++++
// crating Schema
const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<== Tab here to delete item."
});

const defaultItems = [item1, item2, item3];

// Creating custom list schema ++++++
const listSchema = {
  name : String,
  items : [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  // finding list data and fetching it in ejs +++++++
  Item.find(function(err, founditems) {
    if (err) {
      console.log(err);
    } else if (founditems.length === 0) {
      // save multiple collectins +++++++++
      Item.insertMany([item1, item2, item3], function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved all items to todolistDB.")
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: founditems
      });
    }
  });
});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  // to store user input in mongoDB Server
  const item = new Item({
    name: itemName
  });

  // saving user data based on page home or other by selecting value in submit button and save data from home page or other page
  if (listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }


});

app.post("/delete", function(req, res) {
  // storing deleting id in variable
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  // deleting id from DB by findByIdAndRemove(_id, function(err))
  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name : listName},{$pull:{items: {_id : checkedItemId}}}, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }

});

// creating custome lists
app.get("/:customeListName", function(req, res) {
  const customeListName = _.capitalize(req.params.customeListName);

  List.findOne({name : customeListName}, function(err, foundList){
    if (!err){
      if (!foundList){
        //  list doesnt exist so creating one
        const list = new List({
          name : customeListName,
          items : defaultItems
        });

        list.save();
        res.redirect("/" + customeListName);
      }else{
        res.render("list",{ listTitle: foundList.name, newListItems: foundList.items});

      }
    }
  });



});

app.get("/about", function(req, res) {
  res.render("about");
});

// switching to heroku port from localhost

app.listen(process.env.PORT || 3000, function() {
  console.log("Server has started successfully");
});
