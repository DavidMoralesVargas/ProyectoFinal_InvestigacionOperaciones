from fastapi import FastAPI

app = FastAPI()

# Endpoint raíz
@app.get("/")
def inicio():
    return {"mensaje": "Hola desde FastAPI"}

# Endpoint con parámetro
@app.get("/usuarios/{id}")
def obtener_usuario(id: int):
    return {
        "id": id,
        "nombre": "David"
    }

# Endpoint POST
@app.post("/usuarios")
def crear_usuario(nombre: str, edad: int):
    return {
        "mensaje": "Usuario creado",
        "nombre": nombre,
        "edad": edad
    }