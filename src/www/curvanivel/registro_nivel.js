


export class RegistroNivel{


    constructor(){
        this.referencia = null;
        this.leituras = [];
    }

    definir_referencia(latitude, longitude, nivel, data){
        this.referencia = {
            latitudade: latitude,
            longitude: longitude,
            nivel: nivel,
            data: data
        };        
    }

    adicionar_leitura(coordenada, nivel, data){
        this.leituras.push([coordenada, nivel, data]);
    }
}