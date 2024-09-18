
let express = require("express");
const app = express();
app.use(express.json());
// Import the book user like model and Sequelize instance from the previously defined paths
let { book } = require("./models/book.model");
let { user } = require("./models/user.model");
let { like } = require("./models/like.model");
let { sequelize } = require("./lib/index");

const port = 3000;
app.listen(port, () => {
  console.log("Server is running on port" + port);
});



let bookData = [
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    genre: 'Fiction',
    year: 1960,
    summary: 'A novel about the serious issues of rape and racial inequality.',
  },
  {
    title: '1984',
    author: 'George Orwell',
    genre: 'Dystopian',
    year: 1949,
    summary: 'A novel presenting a dystopian future under a totalitarian regime.',
  },
  {
    title: 'Moby-Dick',
    author: 'Herman Melville',
    genre: 'Adventure',
    year: 1851,
    summary: 'The narrative of the sailor Ishmael and the obsessive quest of Ahab.',
  },
  {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    genre: 'Romance',
    year: 1813,
    summary: 'A romantic novel that charts the emotional development of the protagonist Elizabeth Bennet.',
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: 'Fiction',
    year: 1925,
    summary: 'A novel about the American dream and the roaring twenties.',
  },
]


let userData = {
  username: 'booklover',
  email: 'booklover@gmail.com',
  password: 'password123',
}


app.get("/", (req, res) => {
  res.status(200).json({ message: "BD5.5 - HW1 Application" });
});



// self - to fetch data from all tables / like only table

// Function to fetch data from all tables
async function getAllData() {
  // Fetch all records from user, book, and like tables
  let userResult = await user.findAll();
  let bookResult = await book.findAll();

  // Return the results
  return {
    user: userResult,
    book: bookResult,
  };
}


// Function to fetch data from like only
async function getAllLikeData() {
  let likeResult = await like.findAll();

  // Return the results
  return {
    like: likeResult
  };
}

//self- endpoint to get all details of like model
app.get("/like", async (req, res) => {
  try {
    let likeData = await getAllLikeData();
    if (!likeData || !likeData.like || likeData.like.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }
    return res.status(200).json(likeData);
  } catch (error) {
    console.log("Error fetching like data", error.message);
    res.status(500).json({
      message: "Error fetching like data",
      error: error.message
    });
  }
});






// end point to see the db
app.get("/seed_db", async (req, res) => {
  try {
    // Synchronize the database, forcing it to recreate the tables if they already exist
    await sequelize.sync({ force: true });

    //The bulkCreate method of Sequelize is intended for creating multiple 
    //records at once and expects an array of objects
    await book.bulkCreate(bookData);

    // to insert just one user,  should  use the create method, 
    await user.create(userData);


    // Fetch all data from the database after seeding
    const allData = await getAllData();
    // Send a 200 HTTP status code and a success message if the database is seeded successfully
    return res.status(200).json({
      message: "Database Seeding successful for book and user",
      dataInDB: allData
    });


  } catch (error) {
    // Send a 500 HTTP status code and an error message if there's an error during seeding

    console.log("Error in seeding db", error.message);
    return res.status(500).json({
      code: 500,
      message: "Error in seeding db",
      error: error.message,
    });
  }
});






/*
Exercise 1: Like a book

Create an endpoint /users/:id/like that will allow a user to like a book.

Use the likeBook  function to handle the liking process.

Extract the userId from the URL parameter and bookId from the query parameter.

API Call

http://localhost:3000/users/1/like?bookId=2

Expected Output

{
  'message': 'Book  liked',
  'newLike': {
    'userId': 1,
    'bookId': 2
  }
}


*/
//function to like a book
async function likeBook(data) {
  try {
    let newLike = await like.create(
      {
        userId: data.userId,
        bookId: data.bookId
      }
    );
    if (!newLike) {
      throw new Error("Error in creating like for book");
    }
    // Return only the necessary attributes
    return {
      message: 'Book liked',
      newLike: {
        userId: newLike.userId,
        bookId: newLike.bookId
      }
    };

  } catch (error) {
    console.log("Error in liking book", error.message);
    throw error;

  }
}

//endpoint to like a book

app.get("/users/:userId/like", async (req, res) => {
  try {
    let userId = req.params.userId;
    let bookId = req.query.bookId;
    let result = await likeBook({ userId, bookId });
    return res.status(200).json(result);

  } catch (error) {
    if (error.message === "Error in creting like for book") {
      res.status(400).json({
        code: 404,
        message: 'Error in liking book',
        error: error.message
      });
    } else {
      res.status(500).json({
        code: 500,
        message: 'Error in liking book',
        error: error.message
      });
    }

  }
})



/*
exercise 2: Dislike a book

Create an endpoint /users/:id/dislike that will allow a user to dislike a book.

Use the dislikeBook   function to handle the disliking process.

Extract the userId from the URL parameter and bookId from the query parameter.

API Call

http://localhost:3000/users/1/dislike?bookId=2

Expected Output

{
  'message': 'Book disliked'
}
  
*/

//function to dislike a book
async function dislikeBook(data) {
  try {
    let count = await like.destroy({
      where: {
        userId: data.userId,
        bookId: data.bookId
      }
    })
    if (count === 0) {
      throw new Error("Error in disliking book, records not found");
    }

    return {
      message: 'Book disliked'
    };

  } catch (error) {
    console.log("Error in disliking book", error.message);
    throw error;

  }
}

//endpoint to dislike a book

app.get("/users/:userId/dislike", async (req, res) => {
  try {
    let userId = req.params.userId;
    let bookId = req.query.bookId;
    let result = await dislikeBook({ userId, bookId });
    return res.status(200).json(result);

  } catch (error) {
    if (error.message === "Error in disliking book, records not found") {
      res.status(400).json({
        code: 404,
        message: 'records not found',
        error: error.message
      });
    } else {
      res.status(500).json({
        code: 500,
        message: 'Error in disliking book',
        error: error.message
      });
    }

  }
})

/**
 * Exercise 3: Get All Liked books

Create an endpoint /users/:id/liked that will fetch all liked books of a user.

Use the getAlllikedBooks function to handle fetching liked books.

Extract the userId from the URL parameter.

API Call

http://localhost:3000/users/1/liked

Expected Output

{
  'likedBooks': [
    {
      'id': 1,
      'title': 'To Kill a Mockingbird',
      'author': 'Harper Lee',
      'genre': 'Fiction',
      'year': 1960,
      'summary': 'A novel about the serious issues of rape and racial inequality.'
    },
    // Other liked books (if any)
  ]
}




 */



// function to get  array of all liked bookids from like model using userid

async function getallLikedBooksIds(userId) {
  /* there are two ways to get book id
   **************** way 1 : using raw:true in finalAll ***********************
  - which will return plain js object and we can specify what attributes we want
  - Best used when you need data for display or JSON output, especially in web APIs where you need to send data 
   directly to the client side without further manipulation at the server level.
  
  <write code here for way 1 and output> 

   // Way 1: Fetching book IDs as plain JavaScript objects
    let booksLikedRaw = await like.findAll({
      where: { userId: userId },
      attributes: ['bookId'], // Only fetch the bookId
      raw: true // This tells Sequelize to return results as plain JavaScript objects
    });

    console.log("Way 1 Output:", booksLikedRaw);
    // Expected Output for Way 1:
    // [
    //   { "bookId": 1 },
    //   { "bookId": 2 },
    //   { "bookId": 3 }
    // ]

  
  ***********way 2: without raw in findAll i.e Using Model Instances **************
  
  - which will return instance of model like,
   even if we specify wht atrributes we want it will still return methods
   and metadata associated with the Sequelize model like.
   here we have to again extract bookid from each instance using map or
   ierated over oraay of objects of model returned from finadAll

  -Ideal for situations where the fetched data might need to be manipulated or saved back to the database after some processing. 
   Model methods like .save(), .update(), and relationships can be utilized
  
  <write code here for way 2 and output>

  // Way 2: Fetching book IDs as model instances
    let booksLikedInstances = await like.findAll({
      where: { userId: userId },
      attributes: ['bookId'] // Even specifying attributes, the result includes model metadata
    });

        Model Instance Output:


    [
      likeInstance { dataValues: { bookId: 1 }, ... },
      likeInstance { dataValues: { bookId: 2 }, ... }
    ]

    // Extracting book IDs from model instances for simple array output

    let bookIds = booksLikedInstances.map(instance => instance.bookId);

    Mapping Over Instances: This line uses the .map() method to transform the array of 
    model instances into an array of book IDs. The .bookId property is accessed directly 
    from each instance's dataValues, which is more straightforward because the instances are 
    full-fledged objects with direct property access.


    console.log("Way 2 Output:", bookIds);
    // Expected Output for Way 2:
    // [1, 2, 3]  
  */


  try {
    //way 1 : of geting book id
    let booksLikedRaw = await like.findAll({
      where: { userId: userId },
      attributes: ['bookId'], // Only fetch the bookId,
      raw: true  /*this tells Sequelize to return results as plain JavaScript objects rather than instances of the model. 
        This makes handling the data simpler and more efficient if you don't need model instance methods like save(), update(), etc. */

    });

    // console.log("Way 1 Output using raw :true :", booksLikedRaw);

    //extract the bookId from each object in the array booksLikedRaw
    let bookIds = booksLikedRaw.map((book) => book.bookId); // Extract an array of bookIds from the raw output
    if (bookIds.length === 0) { // Check if the array is empty
      console.log("No books liked by user with id:", userId);
      throw new Error("No books liked by user");
    }
    return bookIds;// array containg bookid

    /*above we obtained the bookIds from the like table using the raw: true option in Sequelize,
     the next step is to use these bookIds to fetch detailed information about each book
     from the book model */

  } catch (error) {
    console.log("error in extracting bookid for user ", error.message)
    throw error;

  }
}

//function to get book details for books liked by user from book model

async function getallLikedBooksDetails(bookids) {
  try {
    let likedBooksDetails = await book.findAll(
      {
        where: { id: bookids },// Use the array of bookIds to filter books
        attributes: ['id', 'title', 'author', 'genre', 'year', 'summary']
      }
    );
    return likedBooksDetails;

  } catch (error) {
    console.error("Error fetching book details:", error);
    throw error;

  }

}
//fucntion to get all liked books details by user
async function getAlllikedBooks(userId) {

  try {
    //extract bookids,which is  array of bookids
    let bookids = await getallLikedBooksIds(userId);
    console.log("liked books id  ", bookids);
    //use bookids array to query the book model and fetch details 
    //for all books that have an ID in this array
    let booksDetails = await getallLikedBooksDetails(bookids);

    return { likedBooks: booksDetails };

  } catch (error) {
    console.error("Error in processing liked books:", error);
    throw error;

  }

}

// endpoint to get all liked books

app.get("/users/:userId/liked", async (req, res) => {
  try {
    let userId = req.params.userId;
    let likedBooks = await getAlllikedBooks(userId);
    return res.status(200).json(likedBooks);

  } catch (error) {
    if (error.message === "No books liked by user") {
      return res.status(404).json({
        code: 404,
        message: "No books liked by user",
        error: error.message
      });

    } else if (error.message === "Error in processing liked books:") {
      return res.status(500).json({
        code: 500,
        message: "Error in processing liked books",
        error: error.message
      });
    } else {
      return res.status(500).json({
        code: 500,
        message: "Internal Server Error",
        error: error.message
      });
    }

  }
})

