from logica.transporte.matriz_transporte import matriz_trasnporte


class costoMinimo(matriz_trasnporte):

    def __init__(self, matriz_costom, demanda, oferta):
        super().__init__(matriz_costom, demanda, oferta)

    def encontrarMenor(self, matriz_costom):

        numeroMenor = matriz_costom[0][0]
        fila = 0
        columna = 0

        for i in range(len(matriz_costom)):
            for j in range(len(matriz_costom[i])):

                if matriz_costom[i][j] < numeroMenor:
                    numeroMenor = matriz_costom[i][j]
                    fila = i
                    columna = j

        return fila, columna, numeroMenor

    def encontrarCostoMinimo(self):
        self.igualarOfertaDemanda()
        print(self.matriz_costom, self.demanda, self.oferta)
        
        while(len(self.matriz_costom) > 0 and len(self.matriz_costom[0]) > 0):
            self.lista_costos.append(self.matriz_costom[0][0])
            if self.demanda[0] < self.oferta[0]:
                self.lista_resultado.append(self.demanda[0])
                self.oferta[0] -= self.demanda[0]
                self.eliminarColumna(0)
                self.demanda.pop(0)
            else:
                self.lista_resultado.append(self.oferta[0])
                self.demanda[0] -= self.oferta[0]
                self.eliminarFila(0)
                self.oferta.pop(0)
        
        return (
            self.lista_resultado,
            self.lista_costos
        )