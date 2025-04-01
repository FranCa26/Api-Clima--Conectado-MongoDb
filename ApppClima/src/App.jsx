/**
 * Aplicación de clima con historial de búsqueda.
 * Utiliza OpenWeatherMap API y registra las búsquedas en MongoDB.
 */
import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

/**
 * Componente de encabezado con enlaces para cambiar de ciudad.
 * @param {Object} props - Propiedades del componente.
 * @param {Function} props.cambiarCiudad - Función para actualizar la ciudad seleccionada.
 */
const Encabezado = ({ cambiarCiudad }) => (
  <header className="encabezado">
    <h1>Clima</h1>
    <nav className="navegacion">
      <a href="#" onClick={() => cambiarCiudad("Salta")}>Salta</a>
      <a href="#" onClick={() => cambiarCiudad("Tucuman")}>Tucuman</a>
      <a href="#" onClick={() => cambiarCiudad("Argentina")}>Argentina</a>
    </nav>
  </header>
);

/**
 * Barra de búsqueda para ingresar manualmente una ciudad.
 * @param {Object} props - Propiedades del componente.
 * @param {Function} props.buscarCiudad - Función para actualizar la ciudad seleccionada.
 */
const BarraBusqueda = ({ buscarCiudad }) => (
  <div className="barra-busqueda">
    <input
      type="text"
      placeholder="Buscar Ciudad"
      onKeyDown={(e) => {
        if (e.key === "Enter") buscarCiudad(e.target.value);
      }}
    />
  </div>
);

/**
 * Tarjeta que muestra la información del clima.
 * @param {Object} props - Datos meteorológicos.
 * @param {string} props.ciudad - Nombre de la ciudad.
 * @param {number} props.temperatura - Temperatura actual.
 * @param {number} props.minima - Temperatura mínima.
 * @param {number} props.maxima - Temperatura máxima.
 * @param {number} props.humedad - Porcentaje de humedad.
 * @param {string} props.icono - Icono del clima.
 */
const TarjetaClima = ({ ciudad, temperatura, minima, maxima, humedad, icono }) => (
  <div className="tarjeta-clima">
    <h2>{ciudad}</h2>
    <div className="icono-clima">
      <img src={`./iconos/${icono}`} alt="icono clima" />
    </div>
    <div className="info-clima">
      <p><strong>Temperatura:</strong> <strong>{temperatura}</strong></p>
      <p>Mínima: {minima}&deg;C / Máxima: {maxima}&deg;C</p>
      <p>Humedad: {humedad}%</p>
    </div>
  </div>
);

function App() {
  const [ciudad, setCiudad] = useState("Tucuman");
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [historial, setHistorial] = useState([]);
  const API_KEY = "Pon tu api key";
  const URL = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&lang=es&units=metric&appid=${API_KEY}`;

  useEffect(() => { obtenerDatos(); }, [ciudad]);
  useEffect(() => {
    if (historial.length > 0) guardarCiudadEnHistorial(historial[historial.length - 1]);
  }, [historial]);

  /** Obtiene datos del clima desde la API */
  const obtenerDatos = async () => {
    setCargando(true);
    setError(false);
    try {
      const respuesta = await fetch(URL);
      const datos = await respuesta.json();
      if (datos.cod >= 400) {
        setDatos(null);
        setError(true);
      } else {
        setDatos(datos);
        guardarCiudadEnHistorial(ciudad);
      }
    } catch (error) {
      console.error(error);
      setDatos(null);
      setError(true);
    } finally {
      setCargando(false);
    }
  };

  /**
   * Guarda la ciudad buscada en el historial de MongoDB.
   * @param {string} ciudad - Nombre de la ciudad.
   */
  const guardarCiudadEnHistorial = async (ciudad) => {
    try {
      const response = await axios.post("http://localhost:3001/HistorialCiudades", { ciudad });
      console.log("Ciudad guardada en el historial:", response.data);
    } catch (error) {
      console.error("Error al guardar ciudad en historial:", error);
    }
  };

  /**
   * Selecciona el icono adecuado según la descripción meteorológica.
   * @param {string} descripcion - Descripción del clima.
   * @returns {string} Nombre del archivo del icono.
   */
  const seleccionarIcono = (descripcion) => {
    switch (descripcion.toLowerCase()) {
      case "thunderstorm": return "thunderstorms.svg";
      case "drizzle": return "drizzle.svg";
      case "rain": return "rain.svg";
      case "snow": return "snow.svg";
      case "clear": return "clear.svg";
      case "clouds": return "clouds.svg";
      case "mist": return "mist.svg";
      default: return "overcast.svg";
    }
  };

  return (
    <div className="contenedor">
      <Encabezado cambiarCiudad={setCiudad} />
      <main>
        <BarraBusqueda buscarCiudad={setCiudad} />
        {cargando ? (
          <h2>Cargando...</h2>
        ) : error ? (
          <h2>No se encontró la ciudad...</h2>
        ) : datos ? (
          <TarjetaClima
            ciudad={datos.name}
            temperatura={datos.main.temp}
            minima={datos.main.temp_min}
            maxima={datos.main.temp_max}
            humedad={datos.main.humidity}
            icono={seleccionarIcono(datos.weather[0].main)}
          />
        ) : null}
      </main>
    </div>
  );
}

export default App;
