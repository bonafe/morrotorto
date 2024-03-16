


export class CaptadorCoordenadas extends EventTarget{


    constructor() {
        super();

        this.ultima_posicao = null;
        this.coordenadas = [];

        this.centroides = [];  
        this.distancias_centroides = [];

        this.estado = "aguardando_inicio";        
    }


    capturando_coordenadas(){
        return this.estado.localeCompare("capturando_coordenada") == 0;
    }
    

    iniciar_gps(){

        if ("geolocation" in navigator) {
            				
            navigator.geolocation.watchPosition(                
                () => {

                    this.playBeep(4, 1000);

                    //Quando a posição é detectada pelo serviço de GeoLocalização do navegador
                    this.nova_posicao_detectada.bind(this); 
                },

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
        this.estado = "capturando_coordenada";
        this.iniciar_gps();
    }



    nova_posicao_detectada(posicao_atual){          

        if (this.estado.localeCompare("capturando_coordenada") == 0) {

            if (this.ultima_posicao == null) {

                this.adicionar_posicao(posicao_atual);
                this.ultima_posicao = posicao_atual;
            

            }else if ((this.ultima_posicao.coords.latitude != posicao_atual.coords.latitude) || 
                        (this.ultima_posicao.coords.longitude != posicao_atual.coords.longitude)) {
                
                this.adicionar_posicao(posicao_atual);
                this.ultima_posicao = posicao_atual;

                if (this.posiciao_estavel()){

                    this.estado = "capturou_coordenada";                    
                    this.dispatchEvent(new CustomEvent('capturou_coordenada', {detail: {coordenadas: this.calcularCentroide(this.coordenadas)}}));
                }

            }else{

                this.playBeep();
            }					
        }            
    }


    posiciao_estavel(){

        const numero_leituras = 1;

        this.playBeep(2, Math.floor((this.distancias_centroides.length / numero_leituras) * 1000));

        return this.distancias_centroides.length >= numero_leituras;
    }

    adicionar_posicao(posicao){

        console.log(`${posicao.coords.latitude} - ${posicao.coords.longitude}`);

        this.coordenadas.push([posicao.coords.latitude, posicao.coords.longitude]);

        this.centroides.push(this.calcularCentroide(this.coordenadas));

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


    playBeep(tipo=1, frequencia=1000) {

        let audioContext = new AudioContext();

        let oscillator = audioContext.createOscillator();

        let tipos ={
            1: "sine",
            2: "square",
            3: "sawtooth",
            4: "triangle"
        }

        oscillator.type = tipos[tipo];
        oscillator.frequency.setValueAtTime(frequencia, audioContext.currentTime);
        
        oscillator.connect(audioContext.destination);
        
        oscillator.start();

        setTimeout(() => oscillator.stop(), 100);
    }
}