-- Active: 1791115987373@@127.0.0.1@3306@store
CREATE DATABASE Store;

USE Store;
Select * from Products;

CREATE USER 'store_user'@'localhost' IDENTIFIED BY 'password123';

GRANT SELECT, INSERT, UPDATE
ON Store.*
TO 'store_user'@'localhost';

SHOW GRANTS FOR 'store_user'@'localhost';

REVOKE UPDATE
ON Store.*
FROM 'store_user'@'localhost';

GRANT DELETE
ON Store.Sales
TO 'store_user'@'localhost';

SHOW GRANTS FOR 'store_user'@'localhost';




