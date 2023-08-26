import { SequelizeSingleton } from "../singleton/sequelize";
import { DataTypes, Sequelize } from 'sequelize';

/**
 * Instanziazione della connessione verso il RDBMS
 */
const sequelize: Sequelize = SequelizeSingleton.getConnection();

/**
 * Definizione dell'ORM attraverso il quale effettuare le query su DB.
 * É stata utilizzata la libreria Sequelize che permette di definire un modello per ogni
 * relazione.
*/ 


export const User = sequelize.define('user', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING(30),
        allowNull: false
    },
    surname: {
        type: DataTypes.STRING(30),
        allowNull: false
    },
    role: {
        type: DataTypes.STRING(5),
        allowNull: false
    },
    token: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, 
{
    modelName: 'user',
    timestamps: false,
    freezeTableName: true
});


export const Models = sequelize.define('model', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    alpha: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: false
    },
    created_at: {
        type: DataTypes.INTEGER,
        defaultValue: DataTypes.NOW
    }
}, 
{
    modelName: 'model',
    timestamps: false,
    freezeTableName: true
});


export const Nodes = sequelize.define('node', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    model_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    node_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, 
{
    modelName: 'node',
    timestamps: false,
    freezeTableName: true
});


export const Edges = sequelize.define('edge', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    model_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    source_node_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    target_node_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, 
{
    modelName: 'edge',
    timestamps: false,
    freezeTableName: true
});


export const UpdateRequest = sequelize.define('update_request', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    model_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    source_node_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    target_node_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    new_cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('in attesa', 'approvato', 'respinto'),
        allowNull: false
    },
    created_at: {
        type: DataTypes.INTEGER,
        defaultValue: DataTypes.NOW
    }
}, 
{
    modelName: 'update_request',
    timestamps: false,
    freezeTableName: true
});