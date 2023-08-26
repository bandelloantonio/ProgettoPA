//Questa tabella tiene traccia degli utenti registrati nel sistema.
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

//Questa tabella tiene traccia dei modelli di ottimizzazione creati dagli utenti.
DROP TABLE IF EXISTS models;

CREATE TABLE models (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    alpha DECIMAL(3, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);


//Questa tabella contiene informazioni sui nodi dei grafi associati ai modelli.
DROP TABLE IF EXISTS nodes;

CREATE TABLE nodes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    model_id INT NOT NULL,
    node_name VARCHAR(50) NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (model_id) REFERENCES models(id)
);

//Questa tabella contiene informazioni sugli archi dei grafi associati ai modelli.
DROP TABLE IF EXISTS edges;

CREATE TABLE edges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    model_id INT NOT NULL,
    source_node_id INT NOT NULL,
    target_node_id INT NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (model_id) REFERENCES models(id),
    FOREIGN KEY (source_node_id) REFERENCES nodes(id),
    FOREIGN KEY (target_node_id) REFERENCES nodes(id)
);


//Questa tabella tiene traccia delle richieste di aggiornamento dei pesi degli archi effettuate dagli utenti
DROP TABLE IF EXISTS update_requests;

CREATE TABLE update_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    model_id INT NOT NULL,
    user_id INT NOT NULL,
    source_node_id INT NOT NULL,
    target_node_id INT NOT NULL,
    new_cost DECIMAL(10, 2) NOT NULL,
    status ENUM('in attesa', 'approvato', 'respinto') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (model_id) REFERENCES models(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (source_node_id) REFERENCES nodes(id),
    FOREIGN KEY (target_node_id) REFERENCES nodes(id)
);

