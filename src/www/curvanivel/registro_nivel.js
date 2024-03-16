


export class RegistroNivel{


    constructor(){
        this.referencia = null;
        this.leituras = [];
    }

    adicionar_referencia(coordenada, nivel, data){
        this.referencia = coordenada;
    }

    adicionar_leitura(coordenada, nivel, data){
        this.leituras.push([coordenada, nivel, data]);
    }
}