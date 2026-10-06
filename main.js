const mysql = require("mysql2/promise");
const express = require("express");

const app = express();
const port = 3000;

app.use(express.json());

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  port: 3306,
  password: "123456",
  database: "Store",
  waitForConnections: true,
  connectionLimit: 10,
});
/* async function testUser() {
  const [result] = await pool.execute(
    "SELECT USER() AS user, CURRENT_USER() AS currentUser",
  );

  console.log(result);
}

testUser();*/


async function testConnection() {
  try {
    const connection = await pool.getConnection();

    console.log("Connected to the database");

    connection.release();
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

testConnection();
// API endpoints for creating tables, adding columns, dropping columns, updating columns, and setting NOT NULL constraints
app.post("/create-tables", async (req, res) => {
  const queries = [
    `CREATE TABLE Suppliers (
    SupplierID INT AUTO_INCREMENT PRIMARY KEY,
    SupplierName VARCHAR(100) NOT NULL,
    ContactNumber VARCHAR(20) 
);`,
    `CREATE TABLE Products (
    ProductID INT AUTO_INCREMENT PRIMARY KEY,
    ProductName VARCHAR(100),
    Price DECIMAL(10,2) NOT NULL check (Price >= 0),
    StockQuantity INT default 0 check (StockQuantity >= 0),
    SupplierID INT NOT NULL,
    FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID) on DELETE CASCADE on UPDATE CASCADE
);`,
    `CREATE TABLE Sales (
    SaleID INT AUTO_INCREMENT PRIMARY KEY,
    ProductID INT NOT NULL,
    QuantitySold INT NOT NULL check (QuantitySold >= 0),
    SaleDate DATE DEFAULT (CURRENT_DATE),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID) on DELETE CASCADE on UPDATE CASCADE
);`,
  ];
  try {
    for (const query of queries) {
      await pool.execute(query);
    }
    res.status(200).json({ message: "Tables created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error creating tables" });
  }
});
app.post("/add-columns", async (req, res) => {
  const query = `ALTER TABLE Products ADD COLUMN Category VARCHAR(100);`;
  try {
    await pool.execute(query);
    res.status(200).json({ message: "Column added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error adding column" });
  }
});
app.delete("/drop-column", async (req, res) => {
  const query = `ALTER TABLE Products DROP COLUMN Category;`;
  try {
    await pool.execute(query);
    res.status(200).json({ message: "Column dropped successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error dropping column" });
  }
});
app.post("/update-column", async (req, res) => {
  const query = `ALTER TABLE Suppliers MODIFY COLUMN ContactNumber VARCHAR(15);`;
  try {
    await pool.execute(query);
    res.status(200).json({ message: "Column updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error updating column" });
  }
});
app.post("/set-not-null", async (req, res) => {
  const query = `ALTER TABLE Products MODIFY COLUMN ProductName VARCHAR(100) NOT NULL;`;
  try {
    await pool.execute(query);
    res.status(200).json({ message: "Column updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error updating column" });
  }
});
// creations of products, suppliers, and sales records
app.post("/create-product", async (req, res) => {
  const { ProductName, Price, StockQuantity, SupplierID } = req.body;
  if (ProductName === undefined || Price === undefined || StockQuantity === undefined || SupplierID === undefined) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const query = `INSERT INTO Products (ProductName, Price, StockQuantity, SupplierID) VALUES (?, ?, ?, ?);`;
  try {
    await pool.execute(query, [ProductName, Price, StockQuantity, SupplierID]);
    res.status(200).json({ message: "Product created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error creating product" });
  }
});
app.post("/create-supplier", async (req, res) => {
  const { SupplierName, ContactNumber } = req.body;
  const query = `INSERT INTO Suppliers (SupplierName, ContactNumber) VALUES (?, ?);`;
  try {
    await pool.execute(query, [SupplierName, ContactNumber]);
    res.status(200).json({ message: "Supplier created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error creating supplier" });
  }
});
app.post("/create-sale", async (req, res) => {
  const { ProductID, QuantitySold, SaleDate } = req.body;
  const query = `INSERT INTO Sales (ProductID, QuantitySold, SaleDate) VALUES (?, ?, ?);`;
  try {
    await pool.execute(query, [ProductID, QuantitySold, SaleDate]);
    res.status(200).json({ message: "Sale created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error creating sale" });
  }
});
// retrieval of products, suppliers, and sales records
app.get("/products", async (req, res) => {
  const query = `SELECT * FROM Products;`;
  try {
    const [result] = await pool.execute(query);
    if (result.length === 0) {
      return res.status(404).json({ error: "No products found" });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving products" });
  }
});
app.get("/suppliers", async (req, res) => {
  const query = `SELECT * FROM Suppliers;`;
  try {
    const [result] = await pool.execute(query);
    if (result.length === 0) {
        return res.status(404).json({ error: "No suppliers found" });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving suppliers" });
  }
});
app.get("/sales", async (req, res) => {
  const query = `SELECT * FROM Sales;`;
  try {
    const [result] = await pool.execute(query);
    if (result.length === 0) {
        return res.status(404).json({ error: "No sales records found" });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving sales" });
  }
});
// retrieval of sales records by product ID
app.get("/sales-by-product/:productId", async (req, res) => {
  const { productId } = req.params;
  const query = `SELECT * FROM Sales WHERE ProductID = ?;`;  
  try {
    const [result] = await pool.execute(query, [productId]);
    if (result.length === 0) {
      return res.status(404).json({ error: "No sales records found for this product" });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving sales by product" });
  }
});
// retrieval of product by id
app.get("/product-by-id/:productId", async (req, res) => {
    const { productId } = req.params;
    const query = `SELECT * FROM Products WHERE ProductID = ?;`;
    try {
      const [result] = await pool.execute(query, [productId]);
      if (result.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: "Error retrieving product by ID" });
    }
})
// update product by id
app.patch("/update-product/:productId", async (req, res) => {
    const { productId } = req.params;

    const { ProductName, Price, StockQuantity, SupplierID } = req.body;
    if (ProductName=== undefined || Price=== undefined || StockQuantity=== undefined || SupplierID=== undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const query = `UPDATE Products SET ProductName = ?, Price = ?, StockQuantity = ?, SupplierID = ? WHERE ProductID = ?;`;
    try {
     const [result] = await pool.execute(query, [ProductName, Price, StockQuantity, SupplierID, productId]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(200).json({ message: "Product updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Error updating product" });
    }
  });
// delete product by id
app.delete("/delete-product/:productId", async (req, res) => {
    const { productId } = req.params;
    const query = `DELETE FROM Products WHERE ProductID = ?;`;
    try {
        const [result] = await pool.execute(query, [productId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting product" });
    }  
});
// delete supplier by id
app.delete("/delete-supplier/:supplierId", async (req, res) => {
    const { supplierId } = req.params;
    const query = `DELETE FROM Suppliers WHERE SupplierID = ?;`;
    try {
        const [result] = await pool.execute(query, [supplierId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Supplier not found" });
        }
        res.status(200).json({ message: "Supplier deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting supplier" });
    }
});
// update supplier by id
app.patch("/update-supplier/:supplierId", async (req, res) => {
    const { supplierId } = req.params;

    const { SupplierName, ContactNumber } = req.body;
    if (!SupplierName || !ContactNumber) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const query = `UPDATE Suppliers SET SupplierName = ?, ContactNumber = ? WHERE SupplierID = ?;`;
    try {
     const [result] = await pool.execute(query, [SupplierName, ContactNumber, supplierId]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Supplier not found" });
      }
      res.status(200).json({ message: "Supplier updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Error updating supplier" });
    }
  });

// api inzilitation
app.post("/init", async (req, res) => {
    const query = `INSERT INTO Suppliers (SupplierName, ContactNumber) VALUES('FreshFoods','01001234567')`;
    try{
        await pool.execute(query);
        const [result]=await pool.execute(`select SupplierID from Suppliers where SupplierName='FreshFoods'`);
        const supplierId=result[0].SupplierID;
        await pool.execute(
          `INSERT INTO Products (ProductName, Price, StockQuantity, SupplierID) VALUES('Milk', 15.00, 50, ${supplierId})`,
        );
        await pool.execute(
          `INSERT INTO Products (ProductName, Price, StockQuantity, SupplierID) VALUES('Bread', 10.00, 30, ${supplierId})`,
        );
        await pool.execute(
          `INSERT INTO Products (ProductName, Price, StockQuantity, SupplierID) VALUES('Eggs', 20.00, 40, ${supplierId})`
        );
        const [productResult] = await pool.execute(`SELECT ProductID FROM Products WHERE ProductName='Milk'`);
        const milkProductId = productResult[0].ProductID;
        await pool.execute(
          `INSERT INTO Sales (ProductID, QuantitySold, SaleDate) VALUES(${milkProductId}, 2, '2025-05-20')`
        );
        res.status(200).json({ message: "Database initialized successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error creating Database initialization" });
    }
});
// update price of bread
app.patch("/update-bread-price", async (req, res) => {
    const query = `UPDATE Products SET Price = 25.00 WHERE ProductName = 'Bread';`;
    try {
      await pool.execute(query);
      
      res.status(200).json({ message: "Bread price updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Error updating bread price" });
    }
  });
// delete eggs
app.delete("/delete-eggs", async (req, res) => {
    const query = `DELETE FROM Products WHERE ProductName = 'Eggs';`;
    try {
      const [result] = await pool.execute(query);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Eggs not found" });
      }

      res.status(200).json({ message: "Eggs deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Error deleting eggs" });
    }
});
// retrieval of total quantity sold for each product
app.get("/total-quantity-sold", async (req, res) => {
    const query = `SELECT SUM(QuantitySold) AS TotalQuantitySold, ProductID FROM Sales GROUP BY ProductID;`;
    try {
        const [result] = await pool.execute(query);
        if (result.length === 0) {
            return res.status(404).json({ error: "No sales records found" });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: "Error fetching total quantity sold" });
    }
});
// retrieval product with the highest stock quantity
app.get("/highest-stock-product", async (req, res) => { 
    const query = `SELECT * FROM Products ORDER BY StockQuantity DESC LIMIT 1;`;
    try {
        const [result] = await pool.execute(query);
        if (result.length === 0) {
            return res.status(404).json({ error: "No products found" });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: "Error fetching highest stock product" });
    }
});
app.get("/supplier-with-startname-f", async (req, res) => {
    const query = `SELECT * FROM Suppliers WHERE SupplierName LIKE 'F%';`;
    try {
        const [result] = await pool.execute(query);
        if (result.length === 0) {
            return res.status(404).json({ error: "No suppliers found with name starting with 'F'" });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: "Error fetching supplier with name starting with 'F'" });
    }
});
app.get("/unsold-products", async (req, res) => {
    const query = `SELECT p.ProductID, p.ProductName
        FROM Products p
        LEFT JOIN Sales s
        ON p.ProductID = s.ProductID
        WHERE s.ProductID IS NULL`;
    try {
        const [result] = await pool.execute(query);
        if (result.length === 0) {
            return res.status(404).json({ error: "No unsold products found" });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: "Error fetching unsold products" });
    }
});
//sales report
app.get("/sales-report", async (req, res) => {
  const query = `
        SELECT 
            p.ProductName,
            s.QuantitySold,
            s.SaleDate
        FROM Products p
        JOIN Sales s
        ON p.ProductID = s.ProductID
    `;

  try {
    const [result] = await pool.execute(query);
    if (result.length === 0) {
      return res.status(404).json({ error: "No sales records found" });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      error: "Error fetching sales report",
    });
  }
});

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
