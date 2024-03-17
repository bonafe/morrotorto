
import { CaptadorCoordenadas } from '../captador_coordenadas/captador_coordenadas.js';


export class LeituraNivel extends HTMLElement{

    constructor(){
        super();
        this.shadow = this.attachShadow({mode: 'open'});

        fetch("./leitura_nivel/leitura_nivel.html").then(resposta => 
            
            resposta.text().then(html => {
            
                const template = document.createElement('template');
                template.innerHTML = html;

                this.shadow.appendChild(template.content.cloneNode(true));            

                this.iniciar_componentes();
            })
        );
    }        

    iniciar_componentes(){

        const btnSalvar = this.shadow.querySelector("#btn_salvar");
        const alturaReferencia = this.shadow.querySelector("#altura_referencia");
        
        const titulo = this.shadow.querySelector("#titulo");
        titulo.innerText = "Registrar Referência";


        const btnBuscar = this.shadow.querySelector("#btn_buscar");

        btnBuscar.addEventListener('click', () => {

            //esconder botão
            btnBuscar.style.display = "none";

            CaptadorCoordenadas.getInstance().iniciar_captura_coordenadas();					
        });


        CaptadorCoordenadas.getInstance().addEventListener(CaptadorCoordenadas.EVENTO_COORDENADAS_ESTABILIZADAS, (evento) => {

            const coordenadas = evento.detail.coordenadas;

            const latitude = this.shadow.querySelector("#latitude");
            const longitude = this.shadow.querySelector("#longitude");  
            
            latitude.textContent = coordenadas.latitude;
            longitude.textContent = coordenadas.longitude;
            
            btnBuscar.style.display = "block";
        });



        btnSalvar.addEventListener('click', () => {
            
            registroNivel.definir_referencia(latitude.textContent, longitude.textContent, alturaReferencia.value, new Date());
        });  
    }
}
customElements.define('leitura-nivel', LeituraNivel);