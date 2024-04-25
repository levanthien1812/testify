CREATE DATABASE testify;
USE testify;

CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `name` NVARCHAR(100),
    `password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(50),
    `photo` VARCHAR(255)
);

CREATE TABLE `tests` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(120) NOT NULL,
    `test_time` DATETIME,
    `level` VARCHAR(50),
    `score` INT,
    `duration` INT,
    `user_id` INT,
    `description` TEXT,
    `multiple_parts` BOOLEAN
);

