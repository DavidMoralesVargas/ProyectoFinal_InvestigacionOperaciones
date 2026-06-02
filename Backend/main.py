from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from logica.transporte.matriz_transporte import matriz_trasnporte
from logica.transporte.costoMinimo import costoMinimo
from logica.transporte.esquinaNoroeste import esquinaNoroeste
from logica.transporte.voguel import voguel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint raíz
@app.get("/")
def inicio():
    print("a")
    return {"mensaje": "Hola desde FastAPI"}

# Endpoint con parámetro
@app.get("/usuarios/{id}")
def obtener_usuario(id: int):
    return {
        "id": id,
        "nombre": "David"
    }

    
@app.post("/api/min_cost")
def transporte(payload: dict):
    costMinimo = costoMinimo(payload["data"]["costs"], payload["data"]["demand"], payload["data"]["supply"])
    resultado, costos = costMinimo.encontrarCostoMinimo()
    return {"mensaje": "Datos recibidos", "datos": payload["data"]["costs"], "resultado": resultado, "costos": costos}

@app.post("/api/nw_corner")
def transporte(payload: dict):
    esquina = esquinaNoroeste(payload["data"]["costs"], payload["data"]["demand"], payload["data"]["supply"])
    resultado, costos = esquina.encontrarEsquinaNoroeste()
    return {"mensaje": "Datos recibidos", "datos": payload["data"]["costs"], "resultado": resultado, "costos": costos}

@app.post("/api/vogel")
def transporte(payload: dict):
    resultadoVoguel = voguel(payload["data"]["costs"], payload["data"]["demand"], payload["data"]["supply"])
    resultado, costos = resultadoVoguel.encontrarVoguel()
    return {"mensaje": "Datos recibidos", "datos": payload["data"]["costs"], "resultado": resultado, "costos": costos}