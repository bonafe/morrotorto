let zoomInicial = 12;
let raioInicial = 5;


window.mapa = L.map('mapa').setView([-23.10, -47.18], zoomInicial);




L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiYm9uYWZlIiwiYSI6ImNrajBrNzl6czM2MW4zMGxybWFkbXczZnUifQ.gWW4X_uJDaCRPbHMFbGszQ'
}).addTo(window.mapa);



let bacias = [
    {
        arquivo:'../dados/nascentes_bacia_capivari_mirim.geojson',
        cor:'#3333ff',
        nome:'Bacia Rio Capivari-Mirim'
    },
    {
        arquivo:'../dados/nascentes_bacia_jundiai.geojson',
        cor:'#00b300',
        nome:'Bacia Rio Jundiaí'
    },
    {
        arquivo:'../dados/nascentes_bacia_tiete.geojson',
        cor:'#ff5c33',
        nome:'Bacia Rio Tietê'
    }
];


bacias.forEach(objetoBacia => fetch(objetoBacia.arquivo)
    .then(res => res.text())
    .then(textoArquivoGEOJsonBacia => {

        const jsonBacia = JSON.parse(textoArquivoGEOJsonBacia);
        objetoBacia.layerGeoJSON = L.geoJSON(jsonBacia, {
            pointToLayer: (feature, latlng) => {

              var geojsonMarkerOptions = {
                    radius: raioInicial,
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
                        window.mapa.fitBounds(evento.target.getBounds());
                    }
                });
            }
        });
        window.mapa.addLayer(objetoBacia.layerGeoJSON);
    }));

window.mapa.on('zoomend', () => {
    let nivelZoom = window.mapa.getZoom();
    let raioAtual = raioInicial;

    raioAtual = raioInicial + (nivelZoom - zoomInicial)*4;


    console.log (`Zoom: ${zoomInicial} - ${nivelZoom} --- Raio: ${raioInicial} - ${raioAtual}`);
    bacias.forEach(objetoBacia => {
        if (objetoBacia.layerGeoJSON !== undefined){
            objetoBacia.layerGeoJSON.eachLayer(layer => {
                layer.setStyle({
                    radius: raioAtual
                });
            });
        }
    });
});

//const bounds = layerGeoJSON.getBounds();
//window.mapa.fitBounds(bounds);

let titulo = L.control();

titulo.onAdd = function(mapa) {
    this._div = L.DomUtil.create('div', 'titulo');
    this.atualizar();
    return this._div;
};

titulo.atualizar = function(props) {
    this._div.innerHTML = `
        <h4>Nascentes de Indaiatuba</h4>
        Mapa interativo das nascentes de Indaiatuba - SP
    `;
};

titulo.addTo(window.mapa);


let legenda = L.control({position: 'bottomright'});
legenda.onAdd = mapa => {
    let conteudo = L.DomUtil.create('div', 'legenda');
    bacias.forEach(bacia => {
        conteudo.innerHTML += `
              <i style='background:${bacia.cor}'></i>${bacia.nome}<br>
        `;
    });
    return conteudo;
};
legenda.addTo(window.mapa);

window.redimensionar = () => {
    let cabecalho = document.querySelector("header");
    let alturaRestante = window.innerHeight - cabecalho.clientHeight;
    let mapa = document.querySelector("#mapa");
    mapa.style.height = `${alturaRestante}px`;
    mapa.style.width = "100%";
    window.mapa.invalidateSize();
};

window.onresize = window.redimensionar;
window.onload = window.redimensionar;


if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(function(position) {

        criarMarcaLocalUsuario(position.coords.latitude, position.coords.longitude).addTo(window.mapa);
        window.mapa.setView([position.coords.latitude, position.coords.longitude], 15);
        console.log(`${position.coords.latitude} - ${position.coords.longitude}`);
    });
} else {
    alert("I'm sorry, but geolocation services are not supported by your browser.");
}

function criarMarcaLocalUsuario (latitude, longitude){
    return L.circle([latitude, longitude], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 500
    });
}