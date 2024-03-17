


export class CaptadorCoordenadas extends EventTarget{

    static EVENTO_AGUARDANDO_INICIO = "aguardando_inicio";
    static EVENTO_CAPTURANDO_COORDENADAS = "capturando_coordenadas";
    static EVENTO_RECEBEU_COORDENADA = "recebeu_coordenada";
    static EVENTO_COORDENADAS_ESTABILIZADAS = "coordenadas_estabilizadas";    
    

    static getInstance(){
        if (CaptadorCoordenadas.instance == null){
            CaptadorCoordenadas.instance = new CaptadorCoordenadas();
        }

        return CaptadorCoordenadas.instance;
    }


    constructor() {
        super();

        this.ultima_posicao = null;
        this.lista_coordenadas = [];

        this.centroides = [];  
        this.distancias_centroides = [];

        this.estado = CaptadorCoordenadas.EVENTO_AGUARDANDO_INICIO;        
    }


    capturando_coordenadas(){
        return this.estado == CaptadorCoordenadas.EVENTO_CAPTURANDO_COORDENADAS;
    }
    

    iniciar_gps(){

        if ("geolocation" in navigator) {
            				
            this.id_watch_position = navigator.geolocation.watchPosition(                
                posicao_atual => {                    

                    //Quando a posição é detectada pelo serviço de GeoLocalização do navegador
                    this.nova_posicao_detectada(posicao_atual); 
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
        this.estado = CaptadorCoordenadas.EVENTO_CAPTURANDO_COORDENADAS;

        //limpar lista de coordenadas
        this.lista_coordenadas = [];
        this.centroides = [];
        this.distancias_centroides = [];        

        this.iniciar_gps();
    }



    nova_posicao_detectada(posicao_atual){          

        window.log(`watch gps: ${posicao_atual.coords.latitude} - ${posicao_atual.coords.longitude}`);

        if (this.estado == CaptadorCoordenadas.EVENTO_CAPTURANDO_COORDENADAS) {

            if (this.ultima_posicao == null) {

                this.adicionar_posicao(posicao_atual);
                this.ultima_posicao = posicao_atual;
            

            } else if ((this.ultima_posicao.coords.latitude != posicao_atual.coords.latitude) || 
                        (this.ultima_posicao.coords.longitude != posicao_atual.coords.longitude)) {                                

                this.adicionar_posicao(posicao_atual);
                this.ultima_posicao = posicao_atual;
            }


            this.dispatchEvent(new CustomEvent(

                CaptadorCoordenadas.EVENTO_RECEBEU_COORDENADA , 

                {
                    detail: {
                        coordenadas: {
                            latitude: this.ultima_posicao.coords.latitude,
                            longitude: this.ultima_posicao.coords.longitude
                        }
                    }
                }
            ));
            

            if (this.posiciao_estavel()){
                
                navigator.geolocation.clearWatch(this.id_watch_position);
                window.log(`removeu watch gps`);

                this.estado = CaptadorCoordenadas.EVENTO_COORDENADAS_ESTABILIZADAS;

                const coordenadas = this.calcularCentroide(this.lista_coordenadas);

                this.dispatchEvent(new CustomEvent(CaptadorCoordenadas.EVENTO_COORDENADAS_ESTABILIZADAS, {detail: {coordenadas: {
                    latitude: coordenadas[0],
                    longitude: coordenadas[1]
                }}}));
            }	
        }            
    }



    dispositivo_movel(){

        //Forma de ver se é dispositivo móvel sem depender da largura da tela
        return navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i);
    }



    posiciao_estavel(){

        let numero_leituras = 0;

        if (this.dispositivo_movel()){            
            numero_leituras = 9;
        }

        //this.playBeep(2, Math.floor((this.distancias_centroides.length / numero_leituras) * 1000));

        //Log leitura x de y
        window.log (`Leitura ${this.lista_coordenadas.length} de ${numero_leituras}`);
        
        return this.lista_coordenadas.length >= numero_leituras;
    }

    adicionar_posicao(posicao){

        this.lista_coordenadas.push([posicao.coords.latitude, posicao.coords.longitude]);


        this.centroides.push(this.calcularCentroide(this.lista_coordenadas));

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

        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = earthRadius * c * 1000; // Distância em metros

        return distance;
    }

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }


    playBeep(tipo=1, frequencia=1000) {

        try{
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
        } catch (e){
            console.log(e);
        }
    }
}