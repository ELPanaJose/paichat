CREATE DATABASE paichat_db;

USE paichat_db;
---USERS TABLE--
CREATE TABLE users(
    id INT(11) NOT NULL,
    username VARCHAR(16) NOT NULL,
    ip VARCHAR(9) NOT NULL
);

ALTER TABLE paichat_users 
    ADD PRIMARY KEY (id);

ALTER TABLE users
     MODIFY id INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 2;
    
DESCRIBE paichat_users;

-- PAICHAT TABLE --
CREATE TABLE links (
    token INT(11) NOT NULL,
    nickname VARCHAR(150) NOT NULL,
    message VARCHAR(255) NOT NULL,
    ip TEXT,
    user_id INT(11),
    created_at timestamp NOT NULL DEFAULT current_timestamp,
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id)
);

ALTER TABLE links 
      ADD PRIMARY KEY(id);

ALTER TABLE links 
    MODIFY id INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 2;



