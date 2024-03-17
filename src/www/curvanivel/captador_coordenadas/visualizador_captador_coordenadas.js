


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
            hAxis: {
                title: 'Latitude', 
                minValue: -23.07, 
                maxValue: -23.03, 
                viewWindow: {
                    min: -23.07,
                    max: -23.03
                }
            },
            vAxis: {
                title: 'Longitude', 
                minValue: -47.25, 
                maxValue: -47.18,                 
                viewWindow: {
                    min: -47.25,
                    max: -47.18
                }
            },            
            legend: 'none'
        };

        this.grafico_coordenadas = new google.visualization.ScatterChart(this.shadow.getElementById('coordenadas'));

        
        //***********************
        //Gráfico de centroides
        //***********************
        this.opcoes_grafico_centroides = {
            title: 'Centróides',
            hAxis: {title: 'Latitude'},
            vAxis: {title: 'Longitude'},
            legend: 'none'
        };

        this.grafico_centroides = new google.visualization.ScatterChart(this.shadow.getElementById('centroides'));



        //***********************
        //Gráfico de distâncias dos centroides
        //***********************
        this.opcoes_grafico_distancia_centroides = {
            title: 'Centróides',
            hAxis: {title: 'Latitude'},
            vAxis: {title: 'Longitude'},
            legend: 'none'
        };

        this.grafico_distancias_centroides = new google.visualization.ScatterChart(this.shadow.getElementById('distancias_centroides'));


        this.atualizar_graficos();
    }



    atualizar_graficos(){


        if (CaptadorCoordenadas.getInstance().lista_coordenadas.length == 0) {
            return;
        }

        let array_google_coordenadas = [

            //Primeira linha é o cabeçalho
            ['Latitude','Longitude']                  
        ];

        CaptadorCoordenadas.getInstance().lista_coordenadas.forEach(coordenada => {            
            array_google_coordenadas.push([coordenada[0], coordenada[1]]);
        });


        let latitude_minima = Math.min.apply(null, CaptadorCoordenadas.getInstance().lista_coordenadas.map(c => c[0]));
        let latitude_maxima = Math.max.apply(null, CaptadorCoordenadas.getInstance().lista_coordenadas.map(c => c[0]));
        let longitude_minima = Math.min.apply(null, CaptadorCoordenadas.getInstance().lista_coordenadas.map(c => c[1]));
        let longitude_maxima = Math.max.apply(null, CaptadorCoordenadas.getInstance().lista_coordenadas.map(c => c[1]));    

        

        this.opcoes_grafico_coordenadas.hAxis.minValue = latitude_minima;
        this.opcoes_grafico_coordenadas.hAxis.viewWindow.min = latitude_minima;
        

        this.opcoes_grafico_coordenadas.hAxis.maxValue = latitude_maxima;
        this.opcoes_grafico_coordenadas.hAxis.viewWindow.max = latitude_maxima;


        this.opcoes_grafico_coordenadas.vAxis.minValue = longitude_minima;
        this.opcoes_grafico_coordenadas.vAxis.viewWindow.min = longitude_minima;

        this.opcoes_grafico_coordenadas.vAxis.maxValue = longitude_maxima;
        this.opcoes_grafico_coordenadas.vAxis.viewWindow.max = longitude_maxima;        


        this.grafico_coordenadas.draw(
            
            //Transforma em DataTable do google
            google.visualization.arrayToDataTable(array_google_coordenadas),

            //Opções do gráfico
            this.opcoes_grafico_coordenadas);        

        /**
        chartCentroides.data.datasets[0].data = CaptadorCoordenadas.getInstance().centroides.map(c => {
            return {
                x: c[1],
                y: c[0],						
            };
        });        

        chartDistanciasCentroides.data.datasets[0].data = CaptadorCoordenadas.getInstance().distancias_centroides.map(c => {
            return {
                x: c[0],
                y: c[1],						
            };
        });        
        **/
        
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