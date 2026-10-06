-- Active: 1791115987373@@127.0.0.1@3306@store
CREATE DATABASE Store;

USE Store;
Select * from Products;

CREATE USER 'store_user'@'localhost' IDENTIFIED BY 'password123';
GRANT INSERT, SELECT,UPDATE ON Store.* TO 'store_user'@'localhost';
Show GRANTS FOR 'store_user'@'localhost';

ReVoke UPDATE ON Store.* FROM 'store_user'@'localhost';

Select CURRENT_USER();

GRANT DELETE ON Store.* TO 'store_user'@'localhost';


