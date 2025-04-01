const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const puerto = 3001;


app.use(cors()); 
app.use(express.json()); 

// Conexión a MongoDB
mongoose.connect("mongodb://localhost:27017/HistorialCiudades", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error de conexión a MongoDB:"));
db.once("open", () => {
  console.log("Conectado a MongoDB");
});

// Esquema y modelo para el historial de ciudades
const HistorialSchema = new mongoose.Schema({
  ciudad: String,
});

const Historial = mongoose.model("Historial", HistorialSchema);

// Ruta para registrar una nueva ciudad en el historial
app.post("/HistorialCiudades", async (req, res) => {
  const { ciudad } = req.body;
  try {
    const nuevaEntrada = new Historial({ ciudad });
    await nuevaEntrada.save();
  } catch (error) {
    console.error("Error al guardar ciudad en historial:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.listen(puerto, () => {
  console.log(`Servidor corriendo en http://localhost:${puerto}`);
});
