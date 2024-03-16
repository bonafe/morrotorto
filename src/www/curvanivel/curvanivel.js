
import { ConsolidadorRegistrosNivel } from './consolidador_registros_nivel.js';

import { RegistroNivel } from './registro_nivel.js';

import { LeituraNivel } from './leitura_nivel/leitura_nivel.js';


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