from itertools import combinations


class metodoGrafico:

    def __init__(self, objective, constraints, optimization_type):

        self.objective = objective
        self.constraints = constraints
        self.optimization_type = optimization_type

    def obtenerLineas(self):

        lineas = []

        for restriccion in self.constraints:

            a = restriccion["x"]
            b = restriccion["y"]
            c = restriccion["value"]

            puntos = []

            if a != 0:
                puntos.append([c / a, 0])

            if b != 0:
                puntos.append([0, c / b])

            lineas.append({
                "label": f"{a}x + {b}y = {c}",
                "points": puntos
            })

        return lineas

    def interseccion(self, r1, r2):

        a1 = r1["x"]
        b1 = r1["y"]
        c1 = r1["value"]

        a2 = r2["x"]
        b2 = r2["y"]
        c2 = r2["value"]

        determinante = a1 * b2 - a2 * b1

        if abs(determinante) < 0.000001:
            return None

        x = (c1 * b2 - c2 * b1) / determinante
        y = (a1 * c2 - a2 * c1) / determinante

        return [x, y]

    def obtenerVertices(self):

        vertices = [[0, 0]]

        for restriccion in self.constraints:

            a = restriccion["x"]
            b = restriccion["y"]
            c = restriccion["value"]

            if a != 0:
                vertices.append([c / a, 0])

            if b != 0:
                vertices.append([0, c / b])

        for r1, r2 in combinations(self.constraints, 2):

            punto = self.interseccion(r1, r2)

            if punto is not None:
                vertices.append(punto)

        return vertices

    def esFactible(self, punto):

        x = punto[0]
        y = punto[1]

        if x < 0 or y < 0:
            return False

        for restriccion in self.constraints:

            a = restriccion["x"]
            b = restriccion["y"]
            c = restriccion["value"]

            operador = restriccion["operator"]

            valor = a * x + b * y

            if operador == "<=":
                if valor > c + 0.0001:
                    return False

            elif operador == ">=":
                if valor < c - 0.0001:
                    return False

            elif operador == "=":
                if abs(valor - c) > 0.0001:
                    return False

        return True

    def obtenerVerticesFactibles(self, vertices):

        resultado = []

        for punto in vertices:

            if self.esFactible(punto):

                existe = False

                for guardado in resultado:

                    if (
                        abs(guardado[0] - punto[0]) < 0.0001
                        and
                        abs(guardado[1] - punto[1]) < 0.0001
                    ):
                        existe = True
                        break

                if not existe:
                    resultado.append([
                        round(punto[0], 4),
                        round(punto[1], 4)
                    ])

        return resultado

    def evaluarObjetivo(self, punto):

        return (
            self.objective["x"] * punto[0]
            +
            self.objective["y"] * punto[1]
        )

    def obtenerOptimo(self, vertices):

        mejorPunto = None
        mejorValor = None

        for punto in vertices:

            valor = self.evaluarObjetivo(punto)

            if mejorValor is None:

                mejorValor = valor
                mejorPunto = punto

            else:

                if self.optimization_type == "max":

                    if valor > mejorValor:

                        mejorValor = valor
                        mejorPunto = punto

                else:

                    if valor < mejorValor:

                        mejorValor = valor
                        mejorPunto = punto

        return mejorPunto, round(mejorValor, 4)

    def resolver(self):

        lineas = self.obtenerLineas()

        vertices = self.obtenerVertices()

        verticesFactibles = self.obtenerVerticesFactibles(
            vertices
        )

        puntoOptimo, valorOptimo = self.obtenerOptimo(
            verticesFactibles
        )

        return {
            "constraints": lineas,
            "vertices": verticesFactibles,
            "optimal_point": puntoOptimo,
            "optimal_value": valorOptimo
        }