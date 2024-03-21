


import { CurvaNivelDB } from "./curva_nivel_db.js";



export class EscritorCurvaNivelDB extends CurvaNivelDB{


    static getInstance(){

        if (!EscritorCurvaNivelDB.instancia){
            EscritorCurvaNivelDB.instancia = new EscritorCurvaNivelDB();
        }
        return EscritorCurvaNivelDB.instancia;
    }



    constructor(){
        super();

        if (!window.indexedDB) {
            window.alert("Seu navegador não suporta uma versão estável do IndexedDB. Alguns recursos não estarão disponíveis.");
        }
    }



    async reiniciarBase(){

        await this.aguardarBanco();

        return new Promise ((resolve, reject) => {

            this.limparObjectStore("projeto")
                .then(() => this.limparObjectStore("ponto"))
                    .then(() => this.limparObjectStore("registro_nivel"))                        
                                .then(() => this.atualizarConfiguracoesPadrao())
                                    .then(()=> resolve(true));
        
        });      
    }


    
    async atualizarProjeto (projeto){      
        return this.atualizarRegistro (projeto, "projeto");    
    }
    
    async atualizarProjetos (projetos){
        return new Promise((resolve, reject) => {            
            Promise.all(projetos.map (projeto => this.atualizarProjeto(projeto))).then(retornos => {
                resolve(true);
            });            
        });
    }    


    async atualizarPonto (ponto){      
        return this.atualizarRegistro (ponto, "ponto");    
    }
    
    async atualizarPontos (pontos){
        return new Promise((resolve, reject) => {            
            Promise.all(pontos.map (ponto => this.atualizarProjeto(ponto))).then(retornos => {
                resolve(true);
            });            
        });
    }   



    async atualizarRegistroNivel (registro_nivel){      
        return this.atualizarRegistro (registro_nivel, "registro_nivel");    
    }
    
    async atualizarRegistrosNivel (registros_nivel){
        return new Promise((resolve, reject) => {            
            Promise.all(registros_nivel.map (registro_nivel => this.atualizarProjeto(registro_nivel))).then(retornos => {
                resolve(true);
            });            
        });
    }
}