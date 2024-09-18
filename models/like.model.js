// Import Sequelize ORM and DataTypes object to define model attributes
const { DataTypes, sequelize } = require("../lib/index");

// Import user and book models to establish relationships
let { user } = require("./user.model");
let { book } = require("./book.model");

// Define the 'like' model to represent a many-to-many relationship between users and books
let like = sequelize.define("like", {
    userId: {
        type: DataTypes.INTEGER, // Specifies the data type for the userId
        references: {
            model: user, // Establishes a foreign key relationship with the 'user' model
            key: "id"    // Specifies that the userId will reference the 'id' column in the 'user' model
        }
    },
    bookId: {
        type: DataTypes.INTEGER, // Specifies the data type for the bookId
        references: {
            model: book, // Establishes a foreign key relationship with the 'book' model
            key: "id"     // Specifies that the bookId will reference the 'id' column in the 'book' model
        }
    }
});

// Set up a many-to-many relationship through the 'like' junction table
user.belongsToMany(book, { through: like }); // Indicates that a user can like many books
book.belongsToMany(user, { through: like }); // Indicates that a book can be liked by many users

// Export the 'like' model to be available in other parts of the application
module.exports = { like };
