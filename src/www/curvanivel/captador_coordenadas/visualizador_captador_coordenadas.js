


import { CaptadorCoordenadas } from './captador_coordenadas.js';

//TODO: como importar o chart.js estilo vanilla com ES6?
//import { Chart } from '../bibliotecas/chart.min.js';


export class VisualizadorCaptadorCoordenadas extends HTMLElement{



    constructor(){

        super();
        this.shadow = this.attachShadow({mode: 'open'});
        //this.shadow = this;

        fetch("./captador_coordenadas/visualizador_captador_coordenadas.html").then(resposta => 
            
            resposta.text().then(html => {
            
                const template = document.createElement('template');
                template.innerHTML = html;

                this.shadow.appendChild(template.content.cloneNode(true));            

                //Processa o inicio dos componentes no próximo laço de eventos
                //Isso garante que o chart.js já esteja carregado
                //TODO: Carregar o chart.js via ES6
                //TODO: Retirar responsabilidade do index.html de chamar o chart.js
                setTimeout(() => {
                    this.iniciar_componentes();    
                });
                
            })
        );
    }        



    iniciar_componentes(){   


        //Atualiza os gráficos quando recebe uma nova coordenada do gps
        CaptadorCoordenadas.getInstance().addEventListener(CaptadorCoordenadas.EVENTO_RECEBEU_COORDENADA , (evento) => {            
            this.atualizar_graficos();
        });


        //***********************
        //Carregando a biblioteca do google de gráficos
        //***********************
        google.charts.load('current', {'packages':['corechart']});
        
        google.charts.setOnLoadCallback(()=>{      

            this.criar_graficos();
        });
    }



    criar_graficos(){

        //***********************
        //Gráfico de coordenadas
        //***********************
        //-23.0380275, -47.1805553
        //-23.0621184 - -47.2416256

        this.opcoes_grafico_coordenadas = {
            title: 'Coordenadas',
            hAxis: {title: 'Latitude', viewWindow:{}},            
            vAxis: {title: 'Longitude', viewWindow:{}},            
            legend: 'none',
            series: {
                0: { // Série para as coordenadas (azul)
                    color: 'blue'
                },
                1: { // Série para os centroides (laranja)
                    color: 'orange'
                }
            }
        };

        this.grafico_coordenadas = new google.visualization.ScatterChart(this.shadow.getElementById('coordenadas'));





        //***********************
        //Gráfico de distâncias dos centroides
        //***********************
        this.opcoes_grafico_distancia_centroides = {
            title: 'Centróides',
            hAxis: {title: 'Latitude', viewWindow:{}},
            vAxis: {title: 'Longitude', viewWindow:{}},
            legend: 'none'
        };

        this.grafico_distancias_centroides = new google.visualization.ScatterChart(this.shadow.getElementById('distancias_centroides'));


        this.atualizar_graficos();
    }


    atualizar_grafico(grafico, opcoes_grafico, lista_informacoes_geograficas, centroides){

        let data = new google.visualization.DataTable();

        data.addColumn('number', 'Latitude');
        data.addColumn('number', 'Longitude'); 
        data.addColumn({type: 'string', role: 'style'});

        let array_google_coordenadas = [];

        lista_informacoes_geograficas.forEach(informacoes_geografica => {            

            array_google_coordenadas.push([informacoes_geografica.latitude , informacoes_geografica.longitude, 'point { size: 3; shape-type: circle; fill-color: #4285F4; }']);
        });
        
        centroides.forEach(coordenada => {            

            array_google_coordenadas.push([coordenada[0], coordenada[1], 'point { size: 3; shape-type: circle; fill-color: #DB4437; }']);
        });

        data.addRows(array_google_coordenadas);

        let latitude_minima = Math.min.apply(null, CaptadorCoordenadas.getInstance().lista_informacoes_geograficas.map(c => c.latitude));
        let latitude_maxima = Math.max.apply(null, CaptadorCoordenadas.getInstance().lista_informacoes_geograficas.map(c => c.latitude));
        let longitude_minima = Math.min.apply(null, CaptadorCoordenadas.getInstance().lista_informacoes_geograficas.map(c => c.longitude));
        let longitude_maxima = Math.max.apply(null, CaptadorCoordenadas.getInstance().lista_informacoes_geograficas.map(c => c.longitude));    

        

        opcoes_grafico.hAxis.minValue = latitude_minima;
        opcoes_grafico.hAxis.viewWindow.min = latitude_minima;
        

        opcoes_grafico.hAxis.maxValue = latitude_maxima;
        opcoes_grafico.hAxis.viewWindow.max = latitude_maxima;


        opcoes_grafico.vAxis.minValue = longitude_minima;
        opcoes_grafico.vAxis.viewWindow.min = longitude_minima;

        opcoes_grafico.vAxis.maxValue = longitude_maxima;
        opcoes_grafico.vAxis.viewWindow.max = longitude_maxima;        


        grafico.draw(data, opcoes_grafico);  
    }

    atualizar_graficos(){


        if (CaptadorCoordenadas.getInstance().lista_informacoes_geograficas.length == 0) {
            return;
        }

        
        this.atualizar_grafico(
            this.grafico_coordenadas, 
            this.opcoes_grafico_coordenadas, 
            CaptadorCoordenadas.getInstance().lista_informacoes_geograficas,
            CaptadorCoordenadas.getInstance().centroides);
      
    }



    iniciar_componentes2(){       

        let chartCoordenadas = new Chart(this.shadow.getElementById('coordenadas').getContext('2d'), {
            type: 'scatter',
            data: {
                datasets: [{						
                    data: []
                }]
            },
            options: {
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom'
                    }
                }
            }
        });

        let chartCentroides = new Chart(this.shadow.getElementById('centroides').getContext('2d'), {
            type: 'scatter',
            data: {
                datasets: [{						
                    data: []
                }]
            },
            options: {
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom'
                    }
                }
            }
        });

        let chartDistanciasCentroides = new Chart(this.shadow.getElementById('distancias_centroides').getContext('2d'), {
            type: 'scatter',
            data: {
                datasets: [{						
                    data: []
                }]
            },
            options: {
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom'
                    }
                }
            }
        });
    }
}
customElements.define('visualizador-captador-coordenadas', VisualizadorCaptadorCoordenadas);