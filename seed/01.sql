
DROP TABLE IF EXISTS user;

CREATE TABLE user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email varchar(100) NOT NULL,
  name varchar(30) NOT NULL,
  role varchar(5) NOT NULL,
  token int(11) NOT NULL
  UNIQUE KEY unique_email (email)
);


DROP TABLE IF EXISTS models;

CREATE TABLE models (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome varchar(30) NOT NULL,
    user_email varchar(100) NOT NULL,
    status ENUM('approved') DEFAULT 'approved',
    node INT NOT NULL,
    edges INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_email) REFERENCES user(email)
);


DROP TABLE IF EXISTS update_requests;

CREATE TABLE update_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    model_id INT NOT NULL,
    user_id INT NOT NULL,
    status_update ENUM('pending', 'approved', 'rejected') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (model_id) REFERENCES models(id),
    FOREIGN KEY (user_id) REFERENCES user(id),
);

INSERT INTO user(email, name, surname, role,token) VALUES
('antoniobandello@email.com','Antonio','Bandello','admin',10),
('davideandresani@email.com','Davide','Andresani','admin',10),
('mariorossi@email.com','Mario','Rossi','user',2),
('andreaverdi@email.com','Andrea','Verdi','user',5),
('giovannibianchi@email.com','Giovanni','Bianchi','user',0);

INSERT INTO models(user_email, node, edges) VALUES
('davideandresani@email.com', 10,{"1-2": 1,"1-4": 1,"1-5": 2, "2-3": 1,"2-5": 3, "2-6": 3, "3-6": 2, "3-7": 1, "4-8": 1, "5-6": 4, "5-8": 2, "5-9": 3, "6-9": 3, "6-10": 2, "7-10": 1, "8-9": 1, "9-10": 1});
('antoniobandello@email.com', 10,{"1-4": 1,"1-5": 1,"1-8": 3,"2-5": 3, "2-6": 3, "3-7": 6, "3-9": 1, "3-10": 4, "4-5": 1, "4-8": 2, "5-8": 3, "5-9": 10, "6-9": 3, "7-9": 3 ,"7-10": 2, "9-10": 5});