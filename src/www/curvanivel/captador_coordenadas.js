


class CaptadorCoordenadas {


    constructor() {
        this.ultima_posicao = null;
        this.coordenadas = [];
        this.centroides = [];  
        this.distancias_centroides = [];
        this.estado = "capturando_posicao";
        this.iniciar_gps();
    }



    iniciar_gps(){

        if ("geolocation" in navigator) {
            				
            navigator.geolocation.watchPosition(

                //Quando a posição é detectada pelo serviço de GeoLocalização do navegador
                this.nova_posicao_detectada.bind(this), 

                //Quando ocorre um erro ao tentar detectar a posição
                erro_possicao => {
                    console.log(erro_possicao);
                },
    
                //Opções para o serviço de GeoLocalização
                {
                    enableHighAccuracy: true,
                    timeout: 500,
                    maximumAge: 0
                }	
            );

        } else {
            alert("I'm sorry, but geolocation services are not supported by your browser.");
        }    
    }
    

    iniciar_captura_coordenadas(){
        this.estado = "capturando_posicao";
    }



    nova_posicao_detectada(posicao_atual){          

        if (this.estado.localeCompare("capturando_posicao") == 0) {

            if (this.ultima_posicao == null) {

                this.adicionar_posicao(posicao_atual);
                this.ultima_posicao = posicao_atual;
            

            }else if ((this.ultima_posicao.coords.latitude != posicao_atual.coords.latitude) || 
                        (this.ultima_posicao.coords.longitude != posicao_atual.coords.longitude)) {
                
                this.adicionar_posicao(posicao_atual);
                this.ultima_posicao = posicao_atual;

                if (this.posiciao_esta)
            }						
        }            
    }



    adicionar_posicao(posicao){

        console.log(`${posicao.coords.latitude} - ${posicao.coords.longitude}`);

        this.coordenadas.push([posicao.coords.latitude, posicao.coords.longitude]);

        this.centroides.push(this.calcularCentroide(coordenadas));

        if (this.centroides.length > 1) {
            
            this.distancias_centroides.push([
                this.centroides.length, 
                this.calcularDistancia(this.centroides[this.centroides.length - 1], this.centroides[this.centroides.length - 2])
            ]);            
        }					        	
    }



    calcularCentroide(coordenadas) {

        let totalPontos = coordenadas.length;
        let somaX = 0;
        let somaY = 0;

        // Soma todas as coordenadas x e y
        for (let i = 0; i < totalPontos; i++) {
            somaX += coordenadas[i][0];
            somaY += coordenadas[i][1];
        }

        // Calcula as médias das coordenadas x e y
        let mediaX = somaX / totalPontos;
        let mediaY = somaY / totalPontos;

        // Retorna as coordenadas do centroide
        return [mediaX, mediaY];
    }


    calcularDistancia(coord1, coord2) {
        const earthRadius = 6371; // Raio médio da Terra em quilômetros
        const lat1 = coord1[0];
        const lon1 = coord1[1];
        const lat2 = coord2[0];
        const lon2 = coord2[1];

        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = earthRadius * c * 1000; // Distância em metros

        return distance;
    }

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
}