class matriz_trasnporte:

    def __init__(self, matriz_costom, demanda, oferta):
        self.matriz_costom = matriz_costom
        self.demanda = demanda
        self.oferta = oferta

        self.lista_resultado = []
        self.lista_costos = []

    def eliminarFila(self, fila):
        self.matriz_costom.pop(fila)
        return self.matriz_costom

    def eliminarColumna(self, columna):
        for i in range(len(self.matriz_costom)):
            self.matriz_costom[i].pop(columna)

        return self.matriz_costom

    def igualarOfertaDemanda(self):
        
        sumDemanda = sum(self.demanda)
        sumOferta = sum(self.oferta)
        
        if sumOferta < sumDemanda:
            self.matriz_costom.append([0, 0, 0])
            self.oferta.append(sumDemanda - sumOferta)
        elif sumOferta > sumDemanda:
            for i in range(len(self.matriz_costom)):
                self.matriz_costom[i].append(0)
            self.demanda.append(sumOferta - sumDemanda)