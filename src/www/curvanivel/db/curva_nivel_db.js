


import { DBBase } from './db_base.js';




export class CurvaNivelDB extends DBBase{





    static instancia = undefined;

    static NOME_BANCO = "CurvaNivelDB";

    static VERSAO = 1;




    static getInstance(){

        if (!CurvaNivelDB.instancia){
            CurvaNivelDB.instancia = new CurvaNivelDB();
        }
        return CurvaNivelDB.instancia;
    }




    static funcoesDeUpgradeVersao = [             
        DBBase => {
            console.info ("VERSÃO 1 - Criando ObjectStores iniciais do banco de dados CurvaNivelDB");
            
            //Apaga todas as ObjectStore do banco
            Array.from(DBBase.banco.objectStoreNames).forEach (objectStore => DBBase.banco.deleteObjectStore(objectStore));



            let object_store_projeto = DBBase.banco.createObjectStore("projeto", { keyPath: ["url","nome"] });            
            object_store_projeto.createIndex("index_nome_projeto", "nome", { unique: false});
            object_store_projeto.createIndex("index_descricao_projeto", "descricao", { unique: false});


            let object_store_ponto = DBBase.banco.createObjectStore("ponto", { keyPath: "uuid" });                            
            object_store_ponto.createIndex("index_nome_ponto", "nome", { unique: false});
            object_store_ponto.createIndex("index_descricao_ponto", "descricao", { unique: false});


            let object_store_registro_nivel = DBBase.banco.createObjectStore("registro_nivel", { keyPath: "uuid"});  
            object_store_registro_nivel.createIndex("index_nome_registro_nivel", "nome", { unique: false});                  
            object_store_registro_nivel.createIndex("index_descricao_registro_nivel", "descricao", { unique: false});            
                       

            CurvaNivelDB.criarBases();            
        }
    ];




    static criarBases(){

        
    }




    constructor(){
        super(CurvaNivelDB.NOME_BANCO, CurvaNivelDB.VERSAO, CurvaNivelDB.funcoesDeUpgradeVersao);

        if (!CurvaNivelDB.rotinaInicializacao){
            CurvaNivelDB.rotinaInicializacao = true;
            this.addEventListener(DBBase.EVENTO_BANCO_CARREGADO, this.bancoBaseCarregado);
        }            
    }



    bancoBaseCarregado(evento){

        evento.stopPropagation();
        this.removeEventListener(DBBase.EVENTO_BANCO_CARREGADO, this.bancoBaseCarregado);

        this.atualizarConfiguracoesPadrao().then(() =>{

            this.dispatchEvent (new Event(DBBase.EVENTO_BANCO_CARREGADO));
        });
    }



    atualizarConfiguracoesPadrao(){
        /*
        return new Promise((resolve, reject) => {

            
            let transacao = this.banco.transaction (["projeto", "controladores"], "readwrite")


            let osComponentes = transacao.objectStore ("componentes");   

            //TODO: precisa verificar se já existe e deixar a versão mais nova (talvez poder escolher a versão)
            //TODO: mesmo componente poderá ser adicionado mais de uma vez se estiver no arquivo JSON de configurações do usuário
            ConfiguracoesPadrao.base.componentes.forEach (componente => {
                console.log (`EspacoDB: adicionando componente: ${componente.nome}`);
                osComponentes.put (componente);
            });


            let osControladores = transacao.objectStore ("controladores");   

            //TODO: precisa verificar se já existe e deixar a versão mais nova (talvez poder escolher a versão)
            //TODO: mesmo controlador poderá ser adicionado mais de uma vez se estiver no arquivo JSON de configurações do usuário
            ConfiguracoesPadrao.base.controladores.forEach (controlador => {
                console.log (`EspacoDB: adicionando CONTROLADOR: ${controlador.url}-${controlador.nome_classe}`);
                osControladores.put (controlador);
            });


            transacao.oncomplete = evento => {
                console.info ("EspacoDB: elementos adicionados com sucesso");
                resolve(true);
            }
        });
        */
    }
}