/**
 * @file Servidor Express con conexión a MongoDB y almacenamiento de historial de ciudades.
 * @module server
 */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const puerto = 3001;

// Middleware
app.use(cors()); // Habilita CORS para permitir solicitudes desde otros dominios
app.use(express.json()); // Habilita el uso de JSON en las solicitudes

/**
 * Conexión a MongoDB utilizando Mongoose.
 * Base de datos: HistorialCiudades
 */
mongoose.connect("mongodb://localhost:27017/HistorialCiudades", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error de conexión a MongoDB:"));
db.once("open", () => {
  console.log("Conectado a MongoDB");
});

/**
 * Esquema y modelo para el historial de ciudades.
 * @typedef {Object} Historial
 * @property {string} ciudad - Nombre de la ciudad almacenada en el historial.
 */
const HistorialSchema = new mongoose.Schema({
  ciudad: String,
});

const Historial = mongoose.model("Historial", HistorialSchema);

/**
 * Ruta para registrar una nueva ciudad en el historial.
 * @name POST/HistorialCiudades
 * @function
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @returns {void} Responde con un estado HTTP adecuado.
 */
app.post("/HistorialCiudades", async (req, res) => {
  const { ciudad } = req.body;
  try {
    const nuevaEntrada = new Historial({ ciudad });
    await nuevaEntrada.save();
    res.status(201).json({ mensaje: "Ciudad guardada en el historial" });
  } catch (error) {
    console.error("Error al guardar ciudad en historial:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Iniciar el servidor
app.listen(puerto, () => {
  console.log(`Servidor corriendo en http://localhost:${puerto}`);
});
