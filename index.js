// import your node modules
const express = require("express");

const cors = require("cors");

const postDb = require("./data/helpers/postDb.js");

const userDb = require("./data/helpers/userDb.js");

// add your server code starting here

const app = express();

app.use(cors());
app.use(express.json());


function upperName(req, res, next) {
  req.body.name = req.body.name.toUpperCase();
  next();
}

app.get("/", (req, res) => {
  res.send("This is working");
});

app.get("/users", (req, res) => {
  userDb
    .get()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(err => {
      console.log("error", err);
      res
        .status(500)
        .json({ error: "The users information could not be retrieved." });
    });
});

app.get("/posts", (req, res) => {
  postDb
    .get()
    .then(posts => {
      res.status(200).json(posts);
    })
    .catch(err => {
      console.log("error", err);
      res
        .status(500)
        .json({ error: "The posts information could not be retrieved." });
    });
});

app.get("/users/:id", (req, res) => {
  const { id } = req.params;
  userDb
    .get(id)
    .then(user => {
      if (user.id) {
        res.status(200).json(user);
      } else {
        res
          .status(404)
          .json({ message: "The user with the specified ID does not exist." });
      }
    })
    .catch(err => {
      console.log("error", err);
      res
        .status(500)
        .json({ error: "The user information could not be retrieved." });
    });
});

app.get("/posts/:id", (req, res) => {
  const { id } = req.params;
  postDb
    .get(id)
    .then(post => {
      if (post) {
        res.status(200).json(post);
      } else {
        res
          .status(404)
          .json({ message: "The post with the specified ID does not exist." });
      }
    })
    .catch(err => {
      console.log("error", err);
      res
        .status(500)
        .json({ error: "The post information could not be retrieved." });
    });
});

app.get("/users/:id/posts", (req, res) => {
  const { id } = req.params;
  userDb
    .getUserPosts(id)
    .then(posts => {
      if (posts.length > 0) {
        res.status(200).json(posts);
      } else {
        res.status(404).json({ message: "The user has no posts" });
      }
    })
    .catch(err => {
      console.log("error", err);
      res
        .status(500)
        .json({ error: "The posts information could not be retrieved." });
    });
});

app.post("/users", upperName, (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    userDb
      .insert(newUser)
      .then(user => {
        res.status(201).json(user);
      })
      .catch(err => {
        console.log("error", err);
        res.status(500).json({
          error: "There was an error while saving the user to the database"
        });
      });
  } else {
    res.status(400).json({ error: "Please provide a name for the user." });
  }
});

app.post("/posts", (req, res) => {
  const newPost = req.body;
  if (newPost.userId && newPost.text) {
    postDb
      .insert(newPost)
      .then(post => {
        res.status(201).json(post);
      })
      .catch(err => {
        console.log("error", err);
        res.status(500).json({
          error: "There was an error while saving the post to the database"
        });
      });
  } else {
    res
      .status(400)
      .json({ error: "Please provide a userId and text for the post." });
  }
});

app.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  userDb
    .get(id)
    .then(user => {
      userDb
        .remove(user.id)
        .then(count => {
          if (count) {
            res.status(200).json(user);
          } else {
            res.status(404).json({
              message: "The user with the specified ID does not exist."
            });
          }
        })
        .catch(err => {
          console.log("error", err);
          res.status(500).json({ error: "The user could not be removed" });
        });
    })
    .catch(err => {
      console.log("error", err);
      res.status(404).json({
        message: "The user with the specified ID does not exist."
      });
    });
});

app.delete("/posts/:id", (req, res) => {
  const { id } = req.params;
  postDb
    .remove(id)
    .then(count => {
      console.log(count);
      if (count > 0) {
        res.status(200).json({ message: "The post was successfully deleted" });
      } else {
        res.status(404).json({
          message: "The post with the specified ID does not exist."
        });
      }
    })
    .catch(err => {
      console.log("error", err);
      res.status(500).json({ error: "The post could not be removed" });
    });
});

app.put("/users/:id", upperName, (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  if (id != Number(id)) {
    res.status(400).json({ message: "Please enter a valid user id" });
  } else if (name) {
    userDb
      .update(id, req.body)
      .then(count => {
        if (count) {
          userDb
            .get(id)
            .then(user => {
              console.log(user);
              if (user.id) {
                res.status(200).json(user);
              } else {
                res.status(404).json({
                  message: "The user with the specified ID does not exist."
                });
              }
            })
            .catch(err => {
              console.log("error", err);
              res.status(500).json({
                error: "The user information could not be retrieved."
              });
            });
        } else {
          res.status(404).json({
            message: "The user with the specified ID does not exist."
          });
        }
      })
      .catch(err => {
        console.log("error", err);
        res
          .status(500)
          .json({ error: "The user information could not be modified." });
      });
  } else {
    res.status(400).json({ error: "Please provide a name for the user." });
  }
});

app.put("/posts/:id", (req, res) => {
  const { userId, text } = req.body;
  const { id } = req.params;
  if (id != Number(id)) {
    res.status(400).json({ message: "Please enter a valid post id" });
  } else if (userId && text) {
    postDb
      .update(id, req.body)
      .then(count => {
        if (count) {
          postDb
            .get(id)
            .then(post => {
              if (post) {
                res.status(200).json(post);
              } else {
                res.status(404).json({
                  message: "The post with the specified ID does not exist."
                });
              }
            })
            .catch(err => {
              console.log("error", err);
              res.status(500).json({
                error: "The post information could not be retrieved."
              });
            });
        } else {
          res.status(404).json({
            message: "The post with the specified ID does not exist."
          });
        }
      })
      .catch(err => {
        console.log("error", err);
        res
          .status(500)
          .json({ error: "The post information could not be modified." });
      });
  } else {
    res
      .status(400)
      .json({ error: "Please provide a userId and text for the post." });
  }
});

app.listen(7000, () => console.log("\n== API on port 7k==\n"));
