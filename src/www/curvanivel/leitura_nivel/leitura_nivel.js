
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

            const informacoes_geograficas = evento.detail.informacoes_geograficas;

            //Recupera todos elementos de informacoes_geograficas
            const latitude = this.shadow.querySelector("#latitude");
            const longitude = this.shadow.querySelector("#longitude");
            const precisao = this.shadow.querySelector("#precisao");
            const altitude = this.shadow.querySelector("#altitude");
            const velocidade = this.shadow.querySelector("#velocidade");
            const direcao = this.shadow.querySelector("#direcao");
            const momentoRegistro = this.shadow.querySelector("#momento_registro");
        
            
            latitude.textContent = informacoes_geograficas.latitude;
            longitude.textContent = informacoes_geograficas.longitude;
            precisao.textContent = informacoes_geograficas.precisao;
            altitude.textContent = informacoes_geograficas.altitude;
            velocidade.textContent = informacoes_geograficas.velocidade;
            direcao.textContent = informacoes_geograficas.direcao;
            momentoRegistro.textContent = informacoes_geograficas.momentoRegistro;

            
            btnBuscar.style.display = "block";
        });



        btnSalvar.addEventListener('click', () => {
            
            registroNivel.definir_referencia(latitude.textContent, longitude.textContent, alturaReferencia.value, new Date());
        });  
    }
}
customElements.define('leitura-nivel', LeituraNivel);