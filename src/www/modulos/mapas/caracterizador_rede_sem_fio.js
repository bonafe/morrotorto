
export class CaracterizadorRedeSemFio extends HTMLElement{


    static get TEMPLATE () {
        if (CaracterizadorRedeSemFio._template === undefined){
            CaracterizadorRedeSemFio._template = document.createElement("template");
            CaracterizadorRedeSemFio._template.innerHTML = `
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-wEmeIV1mKuiNpC+IOBjI7aAzPcEZeedi5yW5f2yOq55WWLwNGmvvx4Um1vskeMj0" crossorigin="anonymous">
                <div class='container-flex'>
                    <div id='containerMapa' style='width:1000px; height:750px;'></div>
                <div>
            `;
        }
        return CaracterizadorRedeSemFio._template;
    }

    constructor(){
        super();

        this._shadowRoot = this;//this.attachShadow({mode:'open'});
        this._shadowRoot.appendChild(CaracterizadorRedeSemFio.TEMPLATE.content.cloneNode(true));

        this.zoomInicial = 12;
        this.raioInicial = 5;
        this.latitudeLongitudeInicial = [-23.10, -47.18];

        this.mapa = L.map(this._shadowRoot.querySelector("#containerMapa")).setView(this.latitudeLongitudeInicial, this.zoomInicial);

        this.criarCamadaTileServer().addTo(this.mapa);

        this.processarLocalDoUsuario();
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

    criarMarcaLocalUsuario (latitude, longitude){
        return L.circle([latitude, longitude], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: 500
        });
    }
}

customElements.define('caracterizador-rede-sem-fio', CaracterizadorRedeSemFio);