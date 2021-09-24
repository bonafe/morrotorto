
//jsPanel: Janelas flutuantes
import { jsPanel } from './bibliotecas/jspanel/jspanel.min.js';


export class JanelasView{

    static instancia = undefined;

    static getInstance(){
        if (JanelasView.instancia === undefined){
            JanelasView.instancia = new JanelasView();
        }
        return JanelasView.instancia;
    }

    constructor() {
        this.carregarConfiguracaoJanelas();
    }

    renderizar(){

        document.addEventListener("jspanelresizestop", evento => {
            this.salvarPosicaoPainel(evento.panel);
        });
    
        document.addEventListener("jspanelresize", evento => {
        });

        document.addEventListener("jspaneldragstop", evento => {
            this.salvarPosicaoPainel(evento.panel);
        });
    }

    criarPainel (id, titulo, conteudo){
        let configuracao  = this.paineis[id];

        if (configuracao === undefined){
            configuracao = {
                altura: Math.min(500, this.innerHeight*0.6),
                largura: Math.min(800, this.innerWidth*0.9),
                x: 10,
                y: 10
            };
        }

        let painel = jsPanel.create({
            id: id,
            theme: 'dark',
            headerLogo: '<i class="fad fa-home-heart ml-2"></i>',
            headerTitle: `${titulo}`,
            animateIn: 'jsPanelFadeIn',
            onwindowresize: true,
            content: conteudo
        });

        painel.style.height = configuracao.altura;
        painel.style.width = configuracao.largura;
        painel.style.left = configuracao.x;
        painel.style.top = configuracao.y;

        return painel;
    }

    salvarPosicaoPainel (painel) {

        this.paineis[painel.id] = {
            altura: painel.style.height,
            largura: painel.style.width,
            x: painel.style.left,
            y: painel.style.top
        };

        this.salvarConfiguracaoJanelas();
    }

    salvarConfiguracaoJanelas () {
        localStorage.configuracaoPaineis = JSON.stringify (this.paineis);
    }

    carregarConfiguracaoJanelas (){
        if (localStorage.configuracaoPaineis !== undefined){
            this.paineis = JSON.parse(localStorage.configuracaoPaineis);
        }else{
            this.paineis = {};
        }
    }
}