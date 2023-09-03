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


export const User : any = sequelize.define('user', {
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




export const Models : any = sequelize.define('model', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING(30),
        allowNull: false
    },
    user_email: {
        type: DataTypes.STRING(100), 
        
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('approved'),
        allowNull: false,
        defaultValue: 'approved'
    },
    node: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    edges: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, 
{
    modelName: 'model',
    timestamps: false,
    freezeTableName: true
});


export const UpdateRequest : any = sequelize.define('update_request', {
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
    status_update: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
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