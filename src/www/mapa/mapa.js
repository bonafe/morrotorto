import { BaciaIndaiatubaSP } from './bacias_indaiatuba_sp.js';

export class MapaNascentes{



    constructor(containerMapa){

        this.zoomInicial = 12;
        this.raioInicial = 150;
        this.latitudeLongitudeInicial = [-23.10, -47.18];

        this.mapa = L.map(containerMapa).setView(this.latitudeLongitudeInicial, this.zoomInicial);

        this.criarCamadaTileServer().addTo(this.mapa);
        this.criarCamadaBaciasHidrograficas();
        this.criarTituloELegendas();
        this.tratarRedimensionamento();
        this.processarLocalDoUsuario();

        this.nascentesMapa = [];
    }



    criarCamadaTileServer(){

        let camadaTileServer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1,
            accessToken: 'pk.eyJ1IjoiYm9uYWZlIiwiYSI6ImNrajBrNzl6czM2MW4zMGxybWFkbXczZnUifQ.gWW4X_uJDaCRPbHMFbGszQ'
        });

        return camadaTileServer;
    }

    cor (nascente){
        let arquivo = nascente.arquivo.toLowerCase() + " " + nascente.bacia;
        arquivo = arquivo.replace("tietê","tiete");
        arquivo = arquivo.replace("jundiaí","jundiai");

        if (arquivo.indexOf("tiete") != -1){
            return '#ff5c33';
        }else if (arquivo.indexOf("capivari") != -1){
            return '#3333ff';
        }else if (arquivo.indexOf("jundiai") != -1){
            return '#00b300';
        }else{
            return "black";
        }
    }

    criarCamadaBaciasHidrograficas(){
        
        this.nascentesMapa = [];

        fetch("../dados/nascentes_indaiatuba.json")
            .then(resposta => resposta.json())
            .then(nascentes => {                
                nascentes.forEach(nascente => {
                    let corPreenchimento = this.cor(nascente);
                    let corContorno = (corPreenchimento.indexOf("black")!= -1?"red":"black");

                    if (corPreenchimento.indexOf("black")!= -1){
                        console.dir(nascente);
                    }

                    let objetoNascente = L.circle([nascente.coordenadas.wgs84.latitude, nascente.coordenadas.wgs84.longitude], {
                        color: corPreenchimento,
                        fillColor: corPreenchimento,
                        fillOpacity: 0.5,
                        radius: this.raioInicial
                    }).addTo(this.mapa);
                    
                    let htmlPopUp = "<ul>"
                    for (const [chave, valor] of Object.entries(nascente)) {                        
                        htmlPopUp += `<li><strong>${chave}:</strong>${valor}</li>`;
                    }
                    htmlPopUp += "</ul>";

                    objetoNascente.bindPopup(htmlPopUp);

                    this.nascentesMapa.push(objetoNascente);
                });
                /*
                objetoBacia.layerGeoJSON = L.geoJSON(jsonBacia, {
                    pointToLayer: (feature, latlng) => {

                      var geojsonMarkerOptions = {
                            radius: this.raioInicial,
                            fillColor: objetoBacia.cor,
                            color: "#000",
                            weight: 1,
                            opacity: 1,
                            fillOpacity: 0.8
                        };
                        return L.circleMarker(latlng,geojsonMarkerOptions);
                    },
                    onEachFeature: (feature, layer) => {
                         layer.on({
                            mouseover: evento => {
                                let layer = evento.target;
                                layer.setStyle({
                                    weight: 5,
                                    color: objetoBacia.cor,
                                    dashArray: '',
                                    fillOpacity: 0.7
                                });

                                if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                                    layer.bringToFront();
                                }
                            },
                            mouseout: evento => {
                                objetoBacia.layerGeoJSON.resetStyle(evento.target);
                            },
                            click: evento => {
                                this.mapa.fitBounds(evento.target.getBounds());
                            }
                        });
                    }
                });
                this.mapa.addLayer(objetoBacia.layerGeoJSON);
                */
            });

        this.mapa.on('zoomend', () => {
            let nivelZoom = this.mapa.getZoom();
            let raioAtual = this.raioInicial;

            raioAtual = this.raioInicial - (nivelZoom - this.zoomInicial) * 20;


            console.log (`Zoom: ${this.zoomInicial} - ${nivelZoom} --- Raio: ${this.raioInicial} - ${raioAtual}`);

            this.nascentesMapa.forEach(objetoNascente => {
                objetoNascente.setRadius(raioAtual);                    
            });
        });
    }



    criarTituloELegendas(){
        let titulo = L.control();

        titulo.onAdd = function(mapa) {
            this._div = L.DomUtil.create('div', 'titulo');
            this.atualizar();
            return this._div;
        };

        titulo.atualizar = function(props) {
            this._div.innerHTML = `
                <h4>Nascentes de Indaiatuba</h4>
            `;
        };

        titulo.addTo(this.mapa);


        let legenda = L.control({position: 'bottomright'});
        legenda.onAdd = mapa => {
            let conteudo = L.DomUtil.create('div', 'legenda');

            BaciaIndaiatubaSP.BACIAS.forEach(bacia => {
                conteudo.innerHTML += `
                      <i style='background:${bacia.cor}'></i>${bacia.nome}<br>
                `;
            });
            return conteudo;
        };
        legenda.addTo(this.mapa);
    }



    tratarRedimensionamento(){

        window.redimensionar = () => {
            let cabecalho = document.querySelector("header");
            let alturaRestante = window.innerHeight - cabecalho.clientHeight;
            let containerMapa = document.querySelector("#mapa");
            containerMapa.style.height = `${alturaRestante}px`;
            containerMapa.style.width = "100%";
            this.mapa.invalidateSize();
        };

        window.onresize = window.redimensionar;
        window.onload = window.redimensionar;
    }



    criarMarcaLocalUsuario (latitude, longitude){
        return L.circle([latitude, longitude], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: 5
        });
    }



    processarLocalDoUsuario(){
        if ("geolocation" in navigator) {

            var altitudes = [];

            //var heat = L.heatLayer([], {radius: 25}).addTo(this.mapa);

            navigator.geolocation.getCurrentPosition( position => {
                this.mapa.setView([position.coords.latitude, position.coords.longitude], 15);
            });

            navigator.geolocation.watchPosition( position => {

                altitudes.push(position.coords.altitude);
                
                let altitude_minima = altitudes.reduce((min, altitude) => altitude < min ? altitude : min, altitudes[0]);
				let altitude_maxima = altitudes.reduce((max, altitude) => altitude > max ? altitude : max, altitudes[0]);
                let amplitude = altitude_maxima - altitude_minima;
                let proporcao_vermelho = (position.coords.altitude - altitude_minima) / amplitude * 255;
                let cor = `rgba(${proporcao_vermelho}, 0, 0, 0.5)`;

                this.criarMarcaLocalUsuario(position.coords.latitude, position.coords.longitude).addTo(this.mapa);                                			

                //this.mapa.setView([position.coords.latitude, position.coords.longitude], 15);
                console.log(`${position.coords.latitude} - ${position.coords.longitude} - ${position.coords.altitude} - ${cor}`);
                
            });
        } else {
            alert("I'm sorry, but geolocation services are not supported by your browser.");
        }
    }
}