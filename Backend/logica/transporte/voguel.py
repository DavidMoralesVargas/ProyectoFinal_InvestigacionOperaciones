from logica.transporte.matriz_transporte import matriz_trasnporte


class voguel(matriz_trasnporte):

    def __init__(self, matriz_costom, demanda, oferta):
        super().__init__(matriz_costom, demanda, oferta)

    def calcularPenalizacionFila(self, fila):

        costos = sorted(fila)

        if len(costos) == 1:
            return costos[0]

        return costos[1] - costos[0]

    def calcularPenalizacionColumna(self, columna):

        costos = []

        for i in range(len(self.matriz_costom)):
            costos.append(self.matriz_costom[i][columna])
        costos.sort()

        if len(costos) == 1:
            return costos[0]
        return costos[1] - costos[0]

    def obtenerMayorPenalizacion(self):

        mayor_penalizacion = -1
        tipo = ""
        indice = -1

        for i in range(len(self.matriz_costom)):
            penalizacion = self.calcularPenalizacionFila(
                self.matriz_costom[i]
            )

            if penalizacion > mayor_penalizacion:
                mayor_penalizacion = penalizacion
                tipo = "fila"
                indice = i

        for j in range(len(self.matriz_costom[0])):

            penalizacion = self.calcularPenalizacionColumna(j)

            if penalizacion > mayor_penalizacion:
                mayor_penalizacion = penalizacion
                tipo = "columna"
                indice = j

        return tipo, indice

    def encontrarMenorFila(self, fila):

        menor = self.matriz_costom[fila][0]
        columna = 0

        for j in range(len(self.matriz_costom[fila])):

            if self.matriz_costom[fila][j] < menor:
                menor = self.matriz_costom[fila][j]
                columna = j

        return fila, columna

    def encontrarMenorColumna(self, columna):

        menor = self.matriz_costom[0][columna]
        fila = 0

        for i in range(len(self.matriz_costom)):
            if self.matriz_costom[i][columna] < menor:
                menor = self.matriz_costom[i][columna]
                fila = i

        return fila, columna

    def encontrarVoguel(self):

        self.igualarOfertaDemanda()

        while (
            len(self.matriz_costom) > 0
            and len(self.matriz_costom[0]) > 0
        ):

            tipo, indice = self.obtenerMayorPenalizacion()

            if tipo == "fila":
                fila, columna = self.encontrarMenorFila(indice)
            else:
                fila, columna = self.encontrarMenorColumna(indice)

            cantidad = min(
                self.oferta[fila],
                self.demanda[columna]
            )

            self.lista_resultado.append(cantidad)
            self.lista_costos.append(
                self.matriz_costom[fila][columna]
            )

            self.oferta[fila] -= cantidad
            self.demanda[columna] -= cantidad

            if self.oferta[fila] == 0 and self.demanda[columna] == 0:

                self.eliminarFila(fila)
                self.oferta.pop(fila)

                self.eliminarColumna(columna)
                self.demanda.pop(columna)

            elif self.oferta[fila] == 0:

                self.eliminarFila(fila)
                self.oferta.pop(fila)

            elif self.demanda[columna] == 0:

                self.eliminarColumna(columna)
                self.demanda.pop(columna)

        return (
            self.lista_resultado,
            self.lista_costos
        )