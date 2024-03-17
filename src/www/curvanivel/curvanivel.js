
import { ConsolidadorRegistrosNivel } from './consolidador_registros_nivel.js';

import { RegistroNivel } from './registro_nivel.js';

import { LeituraNivel } from './leitura_nivel/leitura_nivel.js';

import { VisualizadorCaptadorCoordenadas } from './captador_coordenadas/visualizador_captador_coordenadas.js';


window.log = mensagem => {
    let ul = document.querySelector("#log");
    let li = document.createElement("li");
    li.appendChild(document.createTextNode(mensagem));
    ul.appendChild(li);
};


//window.load
window.addEventListener('load', () => {



    const botao_iniciar_registro = document.querySelector("#btn_iniciar_registro");

    
    //iniciar registro
    botao_iniciar_registro.addEventListener('click', () => {

        //esconder botão
        botao_iniciar_registro.style.display = "none";


        const registroNivel = new RegistroNivel();

        const leitura_referencia = document.createElement('leitura-nivel');
      
        area_leitura.appendChild(leitura_referencia);
                                      
    });
});