from logica.transporte.matriz_transporte import matriz_trasnporte

class esquinaNoroeste (matriz_trasnporte):
    def __init__(self, matriz_costom, demanda, oferta):
        super().__init__(matriz_costom, demanda, oferta)


    def encontrarEsquinaNoroeste(self):
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