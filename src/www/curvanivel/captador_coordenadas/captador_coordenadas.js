


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

        this.limpar();        
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

        //this.limpar();

        this.estado = CaptadorCoordenadas.EVENTO_CAPTURANDO_COORDENADAS;             

        this.iniciar_gps();
    }

    limpar(){
        this.lista_informacoes_geograficas = [];
        this.centroides = [];
        this.distancias_centroides = [];
        this.dados_geolocation_api_anterior = null;
        this.estado = CaptadorCoordenadas.EVENTO_AGUARDANDO_INICIO;
    }

    nova_posicao_detectada(dados_geolocation_api_atual){          

        window.log(`watch gps: ${dados_geolocation_api_atual.coords.latitude} - ${dados_geolocation_api_atual.coords.longitude}`);

        if (this.estado == CaptadorCoordenadas.EVENTO_CAPTURANDO_COORDENADAS) {

            if (this.dados_geolocation_api_anterior == null) {

                this.adicionar_posicao(dados_geolocation_api_atual);
                this.dados_geolocation_api_anterior = dados_geolocation_api_atual;
            

            } else if ((this.dados_geolocation_api_anterior.coords.latitude != dados_geolocation_api_atual.coords.latitude) || 
                        (this.dados_geolocation_api_anterior.coords.longitude != dados_geolocation_api_atual.coords.longitude)) {                                

                this.adicionar_posicao(dados_geolocation_api_atual);
                this.dados_geolocation_api_anterior = dados_geolocation_api_atual;
            }


            this.dispatchEvent(new CustomEvent(CaptadorCoordenadas.EVENTO_RECEBEU_COORDENADA,{
                    detail: {
                        informacoes_geograficas: this.criar_informacoes_geograficas(dados_geolocation_api_atual) 
                    }
                }
            ));
            

            if (this.posiciao_estavel()){
                
                navigator.geolocation.clearWatch(this.id_watch_position);
                window.log(`removeu watch gps`);

                this.estado = CaptadorCoordenadas.EVENTO_COORDENADAS_ESTABILIZADAS;

                const coordenadas_centroid = this.calcularCentroide(this.lista_informacoes_geograficas);

                let informacoes_geograficas = this.criar_informacoes_geograficas(dados_geolocation_api_atual);

                informacoes_geograficas.latitude = coordenadas_centroid[0];
                informacoes_geograficas.longitude = coordenadas_centroid[1];

                this.dispatchEvent(new CustomEvent(CaptadorCoordenadas.EVENTO_COORDENADAS_ESTABILIZADAS, {                    
                    detail: {
                        informacoes_geograficas: informacoes_geograficas                       
                    }
                }));
            }	
        }            
    }


    criar_informacoes_geograficas(dados_geolocation_api){
        return {
            latitude: dados_geolocation_api.coords.latitude,
            longitude: dados_geolocation_api.coords.longitude,
            altitude: dados_geolocation_api.coords.altitude,
            precisao: dados_geolocation_api.coords.accuracy,
            precisaoAltitude: dados_geolocation_api.coords.altitudeAccuracy,
            direcao: dados_geolocation_api.coords.heading,
            velocidade: dados_geolocation_api.coords.speed,
            momentoRegistro: dados_geolocation_api.timestamp
        }
    }



    dispositivo_movel(){

        //Forma de ver se é dispositivo móvel sem depender da largura da tela
        return navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i);
    }



    posiciao_estavel(){        

        return false;

        let numero_leituras = 0;

        if (this.dispositivo_movel()){            
            numero_leituras = 9;
        }

        //this.playBeep(2, Math.floor((this.distancias_centroides.length / numero_leituras) * 1000));

        //Log leitura x de y
        window.log (`Leitura ${this.lista_informacoes_geograficas.length} de ${numero_leituras} --- ${this.lista_informacoes_geograficas.length % numero_leituras ==  0}`);
        
        return this.lista_informacoes_geograficas.length % numero_leituras ==  0;
    }

    adicionar_posicao(dados_geolocation_api){

        this.lista_informacoes_geograficas.push(this.criar_informacoes_geograficas(dados_geolocation_api));


        this.centroides.push(this.calcularCentroide(this.lista_informacoes_geograficas));

        if (this.centroides.length > 1) {
            

            this.distancias_centroides.push([
                this.centroides.length, 
                this.calcularDistancia(this.centroides[this.centroides.length - 1], this.centroides[this.centroides.length - 2])
            ]);            
        }	    
    }



    calcularCentroide(lista_informacoes_geograficas) {

        let totalPontos = lista_informacoes_geograficas.length;
        let somaX = 0;
        let somaY = 0;        

        // Soma todas as coordenadas x e y
        for (let i = 0; i < totalPontos; i++) {
            somaX += lista_informacoes_geograficas[i].latitude;            
            somaY += lista_informacoes_geograficas[i].longitude;
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