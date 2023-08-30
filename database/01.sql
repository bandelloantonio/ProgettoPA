
DROP TABLE IF EXISTS user;

CREATE TABLE user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email varchar(100) NOT NULL,
  name varchar(30) NOT NULL,
  surname varchar(30) NOT NULL,
  role varchar(5) NOT NULL,
  token int(11) NOT NULL
  UNIQUE KEY unique_email (email)
);


DROP TABLE IF EXISTS models;

CREATE TABLE models (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name varchar(30) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL,
    node INT NOT NULL,
    edges INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);


DROP TABLE IF EXISTS update_requests;

CREATE TABLE update_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    model_id INT NOT NULL,
    user_id INT NOT NULL,
    source_node_id INT NOT NULL,
    target_node_id INT NOT NULL,
    new_cost DECIMAL(10, 2) NOT NULL,
    status_update ENUM('pending', 'approved', 'rejected') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (model_id) REFERENCES models(id),
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (source_node_id) REFERENCES nodes(id),
    FOREIGN KEY (target_node_id) REFERENCES nodes(id)
);

INSERT INTO user(email, name, surname, role,token) VALUES
('antoniobandello@email.com','Antonio','Bandello','admin',10),
('davideandresani@email.com','Davide','Andresani','admin',10),
('mariorossi@email.com','Mario','Rossi','user',2),
('andreaverdi@email.com','Andrea','Verdi','user',5),
('giovannibianchi@email.com','Giovanni','Bianchi','user',0);

