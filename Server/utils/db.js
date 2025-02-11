import mysql from "mysql";
import bcrypt from "bcrypt"; // Used for hashing passwords

// First connect without database to create it if needed
const initialCon = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  port: 3306,
});

const initializeDatabase = () => {
  initialCon.connect((err) => {
    if (err) {
      console.error("❌ Initial connection error:", err);
      return;
    }

    // Create database if not exists
    initialCon.query("CREATE DATABASE IF NOT EXISTS projectms", (err) => {
      if (err) {
        console.error("❌ Error creating database:", err);
        return;
      }
      console.log("✅ Database created or already exists");

      // Close initial connection
      initialCon.end();

      // Connect to the database
      const con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "projectms",
        port: 3306,
      });

      con.connect(async (err) => {
        if (err) {
          console.error("❌ Connection error:", err);
          return;
        }
        console.log("✅ Connected to projectms database");

        // Define Table Creation Queries
        const createAdminTable = `
          CREATE TABLE IF NOT EXISTS admin (
              id INT PRIMARY KEY AUTO_INCREMENT,
              name VARCHAR(50) NOT NULL, 
              email VARCHAR(50) UNIQUE NOT NULL,
              password VARCHAR(255) NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )`;

        const createCategoryTable = `
          CREATE TABLE IF NOT EXISTS category (
              id INT PRIMARY KEY AUTO_INCREMENT,
              name VARCHAR(50) NOT NULL UNIQUE,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )`;

        const createStudentTable = `
          CREATE TABLE IF NOT EXISTS student (
              id INT PRIMARY KEY AUTO_INCREMENT,
              name VARCHAR(50) NOT NULL,
              email VARCHAR(50) UNIQUE NOT NULL,
              password VARCHAR(255) NOT NULL,
              address TEXT,
              registerno VARCHAR(20) UNIQUE,
              image VARCHAR(255),
              category_id INT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE SET NULL
          )`;

        // Execute table creation queries in order
        con.query(createAdminTable, (err) => {
          if (err) {
            console.error("❌ Error creating admin table:", err);
            return;
          }
          console.log("✅ Admin table created or already exists");

          // Hash default admin password
          const defaultPassword = "admin123"; // Change this to a secure default
          bcrypt.hash(defaultPassword, 10, (err, hashedPassword) => {
            if (err) {
              console.error("❌ Error hashing password:", err);
              return;
            }

            // Insert default admin if not exists
            const insertDefaultAdmin = `
              INSERT INTO admin (name, email, password)
              SELECT 'Admin', 'admin@gmail.com', ?
              WHERE NOT EXISTS (SELECT 1 FROM admin WHERE email = 'admin@gmail.com')
            `;

            con.query(insertDefaultAdmin, [hashedPassword], (err) => {
              if (err) {
                console.error("❌ Error inserting default admin:", err);
              } else {
                console.log("✅ Default admin created or already exists");
              }
            });
          });
        });

        con.query(createCategoryTable, (err) => {
          if (err) {
            console.error("❌ Error creating category table:", err);
            return;
          }
          console.log("✅ Category table created or already exists");
        });

        con.query(createStudentTable, (err) => {
          if (err) {
            console.error("❌ Error creating student table:", err);
            return;
          }
          console.log("✅ Student table created or already exists");
        });
      });
    });
  });
};

// Initialize everything
initializeDatabase();

// Export the connection for use in other parts of the application
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "projectms",
  port: 3306,
});

export default con;
