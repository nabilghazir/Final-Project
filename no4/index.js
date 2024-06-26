const express = require("express");
const path = require("path");
const { Sequelize, QueryTypes } = require("sequelize");
const config = require("./config/config.json");
const sequelize = new Sequelize(config.development);
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");
const app = express();

const port = 5002;

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "assets/views"));

app.use("/assets", express.static(path.join(__dirname, "/assets")));
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    name: "admin",
    secret: "ngr261027",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(flash());

app.use((req, res, next) => {
  res.locals.isLogin = req.session.isLogin || false;
  res.locals.user = req.session.user || {};
  next();
});

function auth(req, res, next) {
  console.log("Auth middleware:", req.session.isLogin);
  if (req.session.isLogin) {
    return next();
  }
  req.flash("danger", "You must be logged in to view this page.");
  res.redirect("/login");
}

app.get("/", home);
app.get("/collections", auth, collections);
app.get("/add-collection", auth, addCollectionsView);
app.post("/add-collections", auth, addCollections);
app.post("/delete-collections/:id", auth, deleteCollections);
app.get("/collections-detail/:id", auth, collectionsDetail);
app.post("/task-update/:id", auth, updateTask);
app.post("/task-delete/:id", auth, deleteTask);
app.get("/collections-detail/add-task/:id", auth, addTaskView);
app.post("/collections-detail/add-task/:id", auth, addTask);
app.get("/login", loginView);
app.post("/login", login);
app.get("/logout", logout);
app.get("/register", registerView);
app.post("/register", register);

function home(req, res) {
  res.render("index");
}

async function collections(req, res) {
  const userId = req.session.user.id;
  console.log("Fetching collections for user ID:", userId);

  const query = `
    SELECT *
    FROM collections
    WHERE user_id = :userId
  `;

  try {
    const collectionsData = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: { userId },
    });

    console.log("Collections data:", collectionsData);
    res.render("collections", { collections: collectionsData });
  } catch (error) {
    console.error("Error fetching collections:", error);
    req.flash("danger", "Failed to fetch collections. Please try again.");
    res.redirect("/");
  }
}

function addCollectionsView(req, res) {
  res.render("add-collection");
}

async function addCollections(req, res) {
  const { name } = req.body;
  const userId = req.session.user.id;
  console.log("Adding collection with name:", name, "for user ID:", userId);

  const query = `
    INSERT INTO collections (name, user_id) VALUES (:name, :userId)
  `;

  try {
    await sequelize.query(query, {
      type: QueryTypes.INSERT,
      replacements: { name, userId },
    });
    req.flash("success", "Collection added successfully!");
    res.redirect("/collections");
  } catch (error) {
    console.error("Error adding collection:", error);
    req.flash("danger", "Failed to add collection. Please try again.");
    res.redirect("/add-collection");
  }
}

async function deleteCollections(req, res) {
  const id = parseInt(req.params.id, 10);
  console.log("Deleting collection with ID:", id);

  if (isNaN(id)) {
    req.flash("danger", "Invalid collection ID.");
    return res.redirect("/collections");
  }

  const query = `DELETE FROM collections WHERE id = :id`;

  try {
    await sequelize.query(query, {
      type: QueryTypes.DELETE,
      replacements: { id },
    });

    req.flash("success", "Collection deleted successfully!");
    res.redirect("/collections");
  } catch (error) {
    console.error("Error deleting collection:", error);
    req.flash("danger", "Failed to delete collection. Please try again.");
    res.redirect("/collections");
  }
}

async function collectionsDetail(req, res) {
  const collectionId = parseInt(req.params.id, 10);
  console.log("Accessing collection details for ID:", collectionId);

  if (isNaN(collectionId)) {
    req.flash("danger", "Invalid collection ID.");
    return res.redirect("/collections");
  }

  const query = `
    SELECT collections.id, collections.name, users.username
    FROM collections
    JOIN users ON collections.user_id = users.id
    WHERE collections.id = :collectionId
  `;

  const query2 = `SELECT * FROM tasks WHERE collections_id = :collectionId`;

  try {
    const collectionDetails = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: { collectionId },
    });

    console.log("Collection details result:", collectionDetails);

    if (!collectionDetails.length) {
      req.flash("danger", "Collection not found.");
      return res.redirect("/collections");
    }

    const tasks = await sequelize.query(query2, {
      type: QueryTypes.SELECT,
      replacements: { collectionId },
    });

    console.log("Tasks result:", tasks);

    res.render("collections-detail", {
      collection: collectionDetails[0],
      tasks,
    });
  } catch (error) {
    console.error("Error fetching collection details:", error);
    req.flash(
      "danger",
      "Failed to fetch collection details. Please try again."
    );
    res.redirect("/collections");
  }
}

async function updateTask(req, res) {
  const id = parseInt(req.params.id, 10);
  console.log("Updating task with ID:", id);

  try {
    const query = `SELECT is_done FROM tasks WHERE id = :id`;
    const [task] = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: { id },
    });

    if (!task) {
      req.flash("error", "Task not found");
      return res.redirect("/collections");
    }

    const newIsDone = !task.is_done;

    const query2 = `UPDATE tasks SET is_done = :newIsDone WHERE id = :id`;

    await sequelize.query(query2, {
      type: QueryTypes.UPDATE,
      replacements: { newIsDone, id },
    });

    req.flash("success", "Task updated successfully!");
    res.redirect("back");
  } catch (error) {
    console.log("Error updating task:", error);
    req.flash("error", "Failed to update task. Please try again.");
    res.redirect("back");
  }
}

async function deleteTask(req, res) {
  const id = parseInt(req.params.id, 10);
  console.log("Deleting task with ID:", id);

  const query = `DELETE FROM tasks WHERE id = :id`;

  try {
    await sequelize.query(query, {
      type: QueryTypes.DELETE,
      replacements: { id },
    });

    req.flash("success", "Task deleted successfully!");
    res.redirect("back");
  } catch (error) {
    console.error("Error deleting task:", error);
    req.flash("error", "Failed to delete task. Please try again.");
    res.redirect("back");
  }
}

function addTaskView(req, res) {
  const collectionId = req.params.id;
  res.render("add-task", { collectionId });
}

async function addTask(req, res) {
  if (!req.session.user) {
    req.flash("danger", "You must be logged in to add a task.");
    return res.redirect("/login");
  }

  const { task, is_done, collections_id } = req.body;
  const isDone = is_done === "true";
  console.log("Received data:", req.body);

  if (!collections_id) {
    req.flash("danger", "Collection ID is required.");
    return res.redirect("back");
  }

  const collectionId = parseInt(collections_id, 10);
  if (isNaN(collectionId)) {
    req.flash("danger", "Invalid collection ID.");
    return res.redirect("back");
  }

  const query = `
    INSERT INTO tasks (name, is_done, collections_id)
    VALUES (:task, :isDone, :collectionId)
  `;

  try {
    await sequelize.query(query, {
      type: QueryTypes.INSERT,
      replacements: { task, isDone, collectionId },
    });
    req.flash("success", "Task added successfully!");
    res.redirect(`/collections-detail/${collectionId}`);
  } catch (error) {
    console.error("Error adding task:", error);
    req.flash("danger", "Failed to add task. Please try again.");
    res.redirect(`/collections-detail/add-task/${collectionId}`);
  }
}

function loginView(req, res) {
  res.render("login");
}

async function login(req, res) {
  const { email, password } = req.body;
  const query = `SELECT * FROM users WHERE email = :email`;
  const obj = await sequelize.query(query, {
    type: QueryTypes.SELECT,
    replacements: { email },
  });

  if (!obj.length) {
    req.flash("danger", "Login Failed: Email is wrong!");
    return res.redirect("/login");
  }

  bcrypt.compare(password, obj[0].password, (err, result) => {
    if (err) {
      req.flash("danger", "Login Failed: Internal Server Error");
      return res.redirect("/login");
    }

    if (result) {
      req.session.isLogin = true;
      req.session.user = {
        id: obj[0].id,
        username: obj[0].username,
        email: obj[0].email,
      };
      req.session.save(() => {
        req.flash("success", "Login Successful!");
        res.redirect("/collections");
      });
    } else {
      req.flash("danger", "Login Failed: Password is wrong!");
      res.redirect("/login");
    }
  });
}

async function register(req, res) {
  const { username, email, password } = req.body;
  const crypt = 10;

  bcrypt.hash(password, crypt, async (err, hash) => {
    if (err) throw err;

    const query = `
      INSERT INTO users (username, email, password)
      VALUES (:username, :email, :password)
    `;

    try {
      await sequelize.query(query, {
        type: QueryTypes.INSERT,
        replacements: { username, email, password: hash },
      });

      req.flash("success", "Register Successful!");
      res.redirect("/login");
    } catch (error) {
      console.error("Error registering user:", error);
      req.flash("danger", "Register Failed!");
      res.redirect("/register");
    }
  });
}

function registerView(req, res) {
  res.render("register");
}

function logout(req, res) {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect("/login");
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
