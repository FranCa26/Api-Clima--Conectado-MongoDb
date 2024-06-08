import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
//componente 1
const Encabezado = ({ cambiarCiudad }) => (
  <header className="encabezado">
    <h1>Clima</h1>
    <nav className="navegacion">
      <a href="#" onClick={() => cambiarCiudad("Salta")}>
        Salta
      </a>
      <a href="#" onClick={() => cambiarCiudad("Tucuman")}>
        Tucuman
      </a>
      <a href="#" onClick={() => cambiarCiudad("Argentina")}>
        Argentina
      </a>
    </nav>
  </header>
);
//componente 2
const BarraBusqueda = ({ buscarCiudad }) => (
  <div className="barra-busqueda">
    <input
      type="text"
      placeholder="Buscar Ciudad"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          buscarCiudad(e.target.value);
        }
      }}
    />
  </div>
);
//componente 3
const TarjetaClima = ({
  ciudad,
  temperatura,
  minima,
  maxima,
  humedad,
  icono,
}) => (
  <div className="tarjeta-clima">
    <h2>{ciudad}</h2>
    <div className="icono-clima">
      <img src={`./iconos/${icono}`} alt="icono clima" />
    </div>
    <div className="info-clima">
      <p>
        <strong>Temperatura:</strong> <strong>{temperatura}</strong>
      </p>
      <p>
        Mínima: {minima}&deg;C / Máxima: {maxima}&deg;C
      </p>
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

  const API_KEY = "30d38b26954359266708f92e1317dac0";
  const URL = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&lang=es&units=metric&appid=${API_KEY}`;

  useEffect(() => {
    obtenerDatos();
  }, [ciudad]);

  useEffect(() => {
    if (historial.length > 0) {
      guardarCiudadEnHistorial(historial[historial.length - 1]);
    }
  }, [historial]);

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

  const guardarCiudadEnHistorial = async (ciudad) => {
    try {
      const response = await axios.post(
        "http://localhost:3001/HistorialCiudades",
        {
          ciudad: ciudad,
        }
      );
      console.log(
        "Ciudad guardada exitosamente en el historial:",
        response.data
      );
    } catch (error) {
      console.error("Error al guardar ciudad en historial:", error);
    }
  };

  const seleccionarIcono = (descripcion) => {
    switch (descripcion.toLowerCase()) {
      case "thunderstorm":
        return "thunderstorms.svg";
      case "drizzle":
        return "drizzle.svg";
      case "rain":
        return "rain.svg";
      case "snow":
        return "snow.svg";
      case "clear":
        return "clear.svg";
      case "clouds":
        return "clouds.svg";
      case "mist":
        return "mist.svg";
      default:
        return "overcast.svg";
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
