


import { CurvaNivelDB } from "./curva_nivel_db.js";



export class LeitorCurvaNivelDB extends CurvaNivelDB{



    static getInstance(){

        if (!LeitorCurvaNivelDB.instancia){
            LeitorCurvaNivelDB.instancia = new LeitorCurvaNivelDB();
        }
        return LeitorCurvaNivelDB.instancia;
    }



    constructor(){
        super();
    }



    async projetos(){        
        return this.lerTodosRegistros("projeto");
    }



    async projeto(nome){        
        return this.trazerRegistro(chave, "projeto", "index_nome_projeto");
    }



    async pontos(){        
        return this.lerTodosRegistros("ponto");
    }



    async ponto(nome){        
        return this.trazerRegistro(chave, "ponto", "index_nome_ponto");
    }


    async registros_nivel(){        
        return this.lerTodosRegistros("registro_nivel");
    }



    async registro_nivel(nome){        
        return this.trazerRegistro(chave, "registro_nivel", "index_nome_registro_nivel");
    }
}