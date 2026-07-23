from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from logica.transporte.matriz_transporte import matriz_trasnporte
from logica.transporte.costoMinimo import costoMinimo
from logica.transporte.esquinaNoroeste import esquinaNoroeste
from logica.transporte.voguel import voguel
from copy import deepcopy
from logica.metodo_grafico.metodoGrafico import metodoGrafico

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# @app.get("/")
# def inicio():
#     print("a")
#     return {"mensaje": "Hola desde FastAPI"}

    
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


@app.post("/api/compare")
def comparacion(payload: dict):

    costMinimo = costoMinimo(
        deepcopy(payload["data"]["costs"]),
        deepcopy(payload["data"]["demand"]),
        deepcopy(payload["data"]["supply"])
    )
    resultadoCostoMinimo, costosCostoMinimo = costMinimo.encontrarCostoMinimo()

    esquina = esquinaNoroeste(
        deepcopy(payload["data"]["costs"]),
        deepcopy(payload["data"]["demand"]),
        deepcopy(payload["data"]["supply"])
    )
    resultadoEsquina, costosEsquina = esquina.encontrarEsquinaNoroeste()

    vogel = voguel(
        deepcopy(payload["data"]["costs"]),
        deepcopy(payload["data"]["demand"]),
        deepcopy(payload["data"]["supply"])
    )
    resultadoVoguel, costosVoguel = vogel.encontrarVoguel()

    return {
        "mensaje": "Datos recibidos",
        "resultadoCostoMinimo": resultadoCostoMinimo,
        "costosCostoMinimo": costosCostoMinimo,
        "resultadoEsquina": resultadoEsquina,
        "costosEsquina": costosEsquina,
        "resultadoVoguel": resultadoVoguel,
        "costosVoguel": costosVoguel
    }

@app.post("/api/graphical")
def graphical(payload: dict):

    if len(payload["constraints"]) == 0:
        return {
            "error": "Debe existir al menos una restricción."
        }

    grafico = metodoGrafico(
        payload["objective"],
        payload["constraints"],
        payload["type"]
    )

    return grafico.resolver()