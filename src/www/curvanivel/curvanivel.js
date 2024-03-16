
import { CaptadorCoordenadas } from './captador_coordenadas.js';

import { ConsolidadorRegistrosNivel } from './consolidador_registros_nivel.js';

import { RegistroNivel } from './registro_nivel.js';



//window.load
window.addEventListener('load', () => {

    const captadorCoordenadas = new CaptadorCoordenadas();						

    const botao_iniciar_registro = document.querySelector("#btn_iniciar_registro");


    
    //iniciar registro
    botao_iniciar_registro.addEventListener('click', () => {

        //esconder botão
        botao_iniciar_registro.style.display = "none";



        const registroNivel = new RegistroNivel();



        //criar container para leitura
        const template = document.querySelector("#leitura_nivel");

        const clone = document.importNode(template.content, true);

        const area_leitura = document.querySelector("#area_leitura");
        
        area_leitura.appendChild(clone);

                        
        const btnSalvar = area_leitura.querySelector("#btn_salvar");
        const alturaReferencia = area_leitura.querySelector("#altura_referencia");
        
        const titulo = area_leitura.querySelector("#titulo");
        titulo.innerText = "Registrar Referência";


        const btnBuscar = area_leitura.querySelector("#btn_buscar");

        btnBuscar.addEventListener('click', () => {

            //esconder botão
            btnBuscar.style.display = "none";

            captadorCoordenadas.iniciar_captura_coordenadas();					
        });


        captadorCoordenadas.addEventListener('capturou_coordenada', (evento) => {

            const coordenada = evento.detail;

            const latitude = area_leitura.querySelector("#latitude");
            const longitude = area_leitura.querySelector("#longitude");  
            
            latitude.textContent = coordenada.latitude;
            longitude.textContent = coordenada.longitude;
            
            btnBuscar.style.display = "block";
        });



        btnSalvar.addEventListener('click', () => {
            
            registroNivel.definir_referencia(latitude.textContent, longitude.textContent, alturaReferencia.value, new Date());
        });        
    });
});