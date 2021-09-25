import { BaciaIndaiatubaSP } from './bacias_indaiatuba_sp.js';

export class MapaNascentes{



    constructor(containerMapa){

        this.zoomInicial = 12;
        this.raioInicial = 5;
        this.latitudeLongitudeInicial = [-23.10, -47.18];

        this.mapa = L.map(containerMapa).setView(this.latitudeLongitudeInicial, this.zoomInicial);

        this.criarCamadaTileServer().addTo(this.mapa);
        this.criarCamadaBaciasHidrograficas();
        this.criarTituloELegendas();
        this.tratarRedimensionamento();
        //this.processarLocalDoUsuario();
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



    criarCamadaBaciasHidrograficas(){
        BaciaIndaiatubaSP.BACIAS.forEach(objetoBacia => fetch(objetoBacia.arquivo)
            .then(res => res.text())
            .then(textoArquivoGEOJsonBacia => {

                const jsonBacia = JSON.parse(textoArquivoGEOJsonBacia);
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
            }));

        this.mapa.on('zoomend', () => {
            let nivelZoom = this.mapa.getZoom();
            let raioAtual = this.raioInicial;

            raioAtual = this.raioInicial + (nivelZoom - this.zoomInicial) * 4;


            console.log (`Zoom: ${this.zoomInicial} - ${nivelZoom} --- Raio: ${this.raioInicial} - ${raioAtual}`);

            BaciaIndaiatubaSP.BACIAS.forEach(objetoBacia => {
                if (objetoBacia.layerGeoJSON !== undefined){
                    objetoBacia.layerGeoJSON.eachLayer(layer => {
                        layer.setStyle({
                            radius: raioAtual
                        });
                    });
                }
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
            radius: 500
        });
    }



    processarLocalDoUsuario(){
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition( position => {

                this.criarMarcaLocalUsuario(position.coords.latitude, position.coords.longitude).addTo(this.mapa);
                this.mapa.setView([position.coords.latitude, position.coords.longitude], 15);
                console.log(`${position.coords.latitude} - ${position.coords.longitude}`);
            });
        } else {
            alert("I'm sorry, but geolocation services are not supported by your browser.");
        }
    }
}