export class MenuView extends HTMLElement{

    static get TEMPLATE () {
        if (MenuView._template === undefined){
            MenuView._template = document.createElement("template");
            MenuView._template.innerHTML = `
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-wEmeIV1mKuiNpC+IOBjI7aAzPcEZeedi5yW5f2yOq55WWLwNGmvvx4Um1vskeMj0" crossorigin="anonymous">
                <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
                    <a class="navbar-brand" href="../inicio/">
                        <img src="../../imagens/logo_morro_torto.png" width="30" height="30" class="d-inline-block align-top"
                             alt="" loading="lazy"></img>
                        Área Ambiental do Morro Torto
                    </a>
                    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav"
                            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav mr-auto">
                            <li class="nav-item">
                                <a class="nav-link" href="../sobre/">Sobre nós</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="../mapa/">Mapa de Nascentes</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="../contato/">Contato</a>
                            </li>
                        </ul>
                    </div>
                </nav>
            `;
        }
        return MenuView._template;
    }

    constructor(){
        super();
        this._shadowRoot = this.attachShadow({mode:'open'});
        this._shadowRoot.appendChild(MenuView.TEMPLATE.content.cloneNode(true));
        this.carregarMenu();
    }

    carregarMenu(){
        //fetch(this.getAttribute("src")).then(resposta => resposta.json(
        //    menu => ))
    }
}
customElements.define('menu-view', MenuView);