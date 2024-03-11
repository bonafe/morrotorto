import { ComponenteBase } from './componente_base.js';



export class ExibidorCamera extends ComponenteBase {



    constructor(){
        super({templateURL:"./exibidor_camera.html", shadowDOM:true}, import.meta.url);

        this.video = undefined;        
        this.canvas = undefined;
        this.canvasOpenCV = undefined;
        this.ctx = undefined;
        this.cor = undefined;

        this.addEventListener("carregou", () => {            

            this.cor = this.noRaiz.querySelector("#cor");

            this.cameras = this.noRaiz.querySelector("#cameras");         
            this.video = this.noRaiz.querySelector("#video");

            this.canvasOpenCV = this.noRaiz.querySelector("#canvasOpenCV");

            this.canvas = this.noRaiz.querySelector("#canvas");
            this.ctx = this.canvas.getContext('2d');

            this.downloadGravacao = this.noRaiz.querySelector("#downloadGravacao");
            this.btnGravacao = this.noRaiz.querySelector("#btnGravacao");

            this.cameras.addEventListener("change", ()=>{
                this.iniciarCamera();
                this.mudouEstado();
            });

            this.btnGravacao.addEventListener("click", () =>{                
                if (!this.gravando){                    
                    this.downloadGravacao.classList.add("desabilitado");
                    this.btnGravacao.textContent = "Parar Gravação";                    
                    this.gravar();                
                }else{
                    this.downloadGravacao.classList.remove("desabilitado");
                    this.btnGravacao.textContent = "Gravar";
                    this.pararGravacao();
                }
            });

            this.renderizar();
        });
    }



    static get observedAttributes() {
        return ['dados'];
    }



    attributeChangedCallback(nomeAtributo, valorAntigo, novoValor) {

    
        if (nomeAtributo.localeCompare("dados") == 0){

            this.dados = JSON.parse(novoValor);
            console.log("Dados exibidor cãmera: %o",this.dados);

            if (this.dados.deviceId && this.cameras){
                this.cameras.value = this.dados.deviceId;
                this.iniciarCamera();
            }
        }
    }



    gravar(){
        
        const opcoes = {mimeType: 'video/webm'};
        const pedacosGravados = [];

        this.mediaRecorder = new MediaRecorder(this.video.srcObject, opcoes);

        this.mediaRecorder.addEventListener('dataavailable', evento => {
            if (evento.data.size > 0) {
                pedacosGravados.push(evento.data);
            }            
        });

        this.mediaRecorder.addEventListener('stop', () => {
            this.downloadGravacao.href = URL.createObjectURL(new Blob(pedacosGravados));
            this.downloadGravacao.download = 'gravacao.webm';
            this.gravando = false;
        });

        this.mediaRecorder.start();
        this.gravando = true;
    }

    pararGravacao(){
        this.mediaRecorder.stop();
    }


    renderizar(){
        
        if (super.carregado && !this.renderizado){
            
            this.preencherCamerasDisponiveis().then(()=>{
                this.iniciarCamera();            
            });
        }        
    }



    desenharCanvas(){
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Limpar o canvas

        this.ctx.drawImage(this.video, 0, 0);

        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);



        this.opencv(imageData);

        

        const cor_procurada = this.desenharMiraCor(imageData);

        //const retangulos = this.detectarRectangulos(cor_procurada, imageData, 10);

        //this.desenharRetangulos(retangulos, this.video);        


        window.requestAnimationFrame(this.desenharCanvas.bind(this));
    }
    
    opencv(imageData){
        
        let src = new cv.Mat(this.canvas.height, this.canvas.width, cv.CV_8UC4);                
        
        src.data.set(imageData.data);

        if (false){
            let dst = new cv.Mat(this.canvas.height, this.canvas.width, cv.CV_8UC1);
            cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
            cv.imshow(this.canvasOpenCV, dst);

            dst.delete();
        }

        if (true){
            let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
            cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
            cv.threshold(src, src, 120, 200, cv.THRESH_BINARY);
            let contours = new cv.MatVector();
            let hierarchy = new cv.Mat();
            // You can try more different parameters
            cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
            
            for (let i = 0; i < contours.size(); ++i) {

                let cnt = contours.get(i);            
                //let x1,y1 = cnt[0][0];
                let approx = new cv.Mat();
                cv.approxPolyDP(cnt, approx, 0.01*cv.arcLength(cnt, true), true);

                //if (approx.length() == 4){

                    let x, y, w, h = cv.boundingRect(cnt);
                    let ratio = w/h;

                    if (ratio >= 0.9 && ratio <= 1.1){

                        //dst = cv.drawContours(dst, [cnt], -1, (0,255,255), 3);
                        //cv.putText(dst, 'Square', (x1, y1), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2);

                    }else{   

                       // cv.putText(dst, 'Rectangle', (x, y), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2);
                        //dst = cv.drawContours(dst, [cnt], -1, (0,255,0), 3);
                    }
                //}

                approx.delete();
            }


            // draw contours with random Scalar
            for (let i = 0; i < contours.size(); ++i) {
                let color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
                                        Math.round(Math.random() * 255));
                cv.drawContours(dst, contours, i, color, 1, cv.LINE_8, hierarchy, 100);
            }
            cv.imshow(this.canvasOpenCV, dst);

            dst.delete();
            contours.delete(); 
            hierarchy.delete();
        }

        src.delete();        
    }

    retangulo_mira(){
        let largura_mira = 100;
        let altura_mira = 100;
        let x = (this.canvas.width / 2) - (largura_mira / 2);
        let y = (this.canvas.height) / 2 - (altura_mira / 2);
        return [x, y, largura_mira, altura_mira];
    }

    desenharMiraCor(imageData){

        const width = imageData.width;
        const height = imageData.height;
        const pixels = imageData.data;

        const [x_mira, y_mira, largura_mira, altura_mira] = this.retangulo_mira();
        
        let cor_media_retangulo_mira = {r: 0, g: 0, b: 0};
        let total_pixels = 0;

        //Percorre os pixels do retangulo da mira
        for (let y = y_mira; y < (y_mira + altura_mira); y++) {
            for (let x = x_mira; x < (x_mira + largura_mira); x++) {

              const index = (y * width + x) * 4;
              const red = pixels[index];
              const green = pixels[index + 1];
              const blue = pixels[index + 2];

                cor_media_retangulo_mira.r += red;
                cor_media_retangulo_mira.g += green;
                cor_media_retangulo_mira.b += blue;
                total_pixels++;

            }
        }

        cor_media_retangulo_mira.r = cor_media_retangulo_mira.r / total_pixels;
        cor_media_retangulo_mira.g = cor_media_retangulo_mira.g / total_pixels;
        cor_media_retangulo_mira.b = cor_media_retangulo_mira.b / total_pixels;

        let string_cor_media_retangulo_mira = `rgb(${cor_media_retangulo_mira.r}, ${cor_media_retangulo_mira.g}, ${cor_media_retangulo_mira.b})`;

        this.cor.style.backgroundColor = string_cor_media_retangulo_mira;
              

        this.ctx.strokeStyle = string_cor_media_retangulo_mira;
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        this.ctx.rect(x_mira, y_mira, largura_mira, altura_mira);
        this.ctx.stroke();

        return cor_media_retangulo_mira;
    }


    detectarRectangulos(cor_procurada, imageData, tolerancia) {
        const minRectSize = 50; // Tamanho mínimo do retângulo
      
        const pixels = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
      
        const redRectangles = [];
      
        // Iterar através dos pixels da imagem
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const red = pixels[index];
            const green = pixels[index + 1];
            const blue = pixels[index + 2];
      
            // Verificar a diferença entre as cores usando a distância euclidiana
            const diff = Math.sqrt(
              Math.pow(red - cor_procurada.r, 2) +
              Math.pow(green - cor_procurada.g, 2) +
              Math.pow(blue - cor_procurada.b, 2)
            );
      
            // Verificar se a diferença está dentro da tolerância
            if (diff <= tolerancia) {
              // Encontrou um pixel próximo o suficiente à cor procurada, iniciar a detecção do retângulo
              const rectangle = this.detectarRetangulo(x, y, width, height, pixels, cor_procurada, minRectSize, tolerancia);
      
              if (rectangle) {
                redRectangles.push(rectangle);
              }
            }
          }
        }
      
        return redRectangles;
      }

      detectarRetangulo(startX, startY, width, height, pixels, cor_procurada, minRectSize, tolerancia) {
        // Inicializar variáveis para as coordenadas do retângulo
        let minX = width;
        let minY = height;
        let maxX = -1;
        let maxY = -1;
      
        // Função recursiva para expansão do retângulo
        function expandirRetangulo(x, y) {
          // Verificar se o pixel está dentro dos limites da imagem
          if (x >= 0 && x < width && y >= 0 && y < height) {
            const index = (y * width + x) * 4;
            const red = pixels[index];
            const green = pixels[index + 1];
            const blue = pixels[index + 2];
      
            // Verificar a diferença entre as cores usando a distância euclidiana
            const diff = Math.sqrt(
              Math.pow(red - cor_procurada.r, 2) +
              Math.pow(green - cor_procurada.g, 2) +
              Math.pow(blue - cor_procurada.b, 2)
            );
      
            // Verificar se a diferença está dentro da tolerância
            if (diff <= tolerancia) {
              // Atualizar as coordenadas do retângulo
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
      
              // Marcar o pixel como visitado para evitar repetições
              pixels[index] = 0;
              pixels[index + 1] = 0;
              pixels[index + 2] = 0;
      
              // Expandir o retângulo nas quatro direções
              expandirRetangulo(x + 1, y);
              expandirRetangulo(x - 1, y);
              expandirRetangulo(x, y + 1);
              expandirRetangulo(x, y - 1);
            }
          }
        }
      
        // Expandir o retângulo a partir das coordenadas iniciais
        expandirRetangulo(startX, startY);
      
        // Verificar se o retângulo atende ao tamanho mínimo
        const rectWidth = maxX - minX + 1;
        const rectHeight = maxY - minY + 1;
        if (rectWidth >= minRectSize && rectHeight >= minRectSize) {
          return [minX, minY, rectWidth, rectHeight];
        } else {
          return null; // Retângulo não atende ao tamanho mínimo
        }
      }

    

    desenharRetangulos(rectangles, videoElement) {        
                        
        // Definir a cor e o estilo do retângulo
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = 2;
        
        // Iterar através dos retângulos
        rectangles.forEach(rectangle => {
          const { x, y, width, height } = rectangle;
          
          // Desenhar o retângulo no canvas
          this.ctx.beginPath();
          this.ctx.rect(x, y, width, height);
          this.ctx.stroke();
        });
      }
      

    iniciarCamera(){

        return new Promise((resolve, reject) => {
            if (this.video.srcObject) {
                this.stopMediaTracks(this.video.srcObject);
            }

            if (this.cameras.value != '') {
            
                const constraints = {
                    video:{
                        deviceId: {
                            exact: this.cameras.value
                        }
                    },
                    audio:false
                };     

                navigator.mediaDevices
                    .getUserMedia(constraints)
                        .then(stream => {                
                            this.video.srcObject = stream; 
                            this.video.play();                            
                            this.video.onloadeddata = () => {
                                this.canvas.width = this.video.videoWidth;
                                this.canvas.height = this.video.videoHeight;
                                this.canvasOpenCV.width = this.video.videoWidth;
                                this.canvasOpenCV.height = this.video.videoHeight;
                                this.desenharCanvas();
                            };
                            resolve(true);               
                        })        
                        .catch(error => {
                            console.error(error);
                            this.interromperDesenhoCanvas
                            reject();
                        });
            }        
        });
    }



    preencherCamerasDisponiveis(){
        return new Promise((resolve, reject) => {
            navigator.mediaDevices.enumerateDevices().then( dispositivos => {
        
                this.cameras.innerHTML = '';

                let count = 1;

                dispositivos.forEach( dispositivo => {

                    if (dispositivo.kind === 'videoinput') {
                        const option = document.createElement('option');
                        option.value = dispositivo.deviceId;
                        const label = dispositivo.label || `Câmera ${count++}`;
                        const textNode = document.createTextNode(label);
                        option.appendChild(textNode);
                        this.cameras.appendChild(option);
                    }
                });

                if (this.dados && this.dados.deviceId){
                    this.cameras.value = this.dados.deviceId;
                }

                this.renderizado = true;
                resolve(true);
            });
        });
    }



    stopMediaTracks(stream) {
        stream.getTracks().forEach(track => {
            track.stop();
        });
    }


    mudouEstado(){
        console.log(`Salvando câmera: ${this.cameras.value}`);
        this.dados = {deviceId: this.cameras.value};
        this.dispatchEvent(new CustomEvent("change", {detail:this.dados}));
    }
}
customElements.define('exibidor-camera', ExibidorCamera);