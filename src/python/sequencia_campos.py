
class SequenciaCampos:

    def __init__(self, campos, texto, caminho_arquivo):
        self.caminho_arquivo = caminho_arquivo
        self.campos = campos
        self.texto = texto.replace("Sub-bacia", "Sub bacia")

    def extrairCampo (self, iCampo):
        try:
            campo = self.campos[iCampo]
            proximoCampo = self.campos[iCampo+1]

            indiceCampo = self.texto.find(campo)
            if indiceCampo == -1:
                return f'Campo não encontrado: {campo}'

            indiceProximoCampo = self.texto.find(proximoCampo)
            if indiceProximoCampo == -1:
                indiceProximoCampo = self.texto.find(self.campos[iCampo+2])
                if indiceProximoCampo == -1:
                    raise Exception(f'Campo não encontrado: {proximoCampo}')

            if indiceProximoCampo < indiceCampo:
                raise Exception(f'Campo fora de ordem: "{proximoCampo}"-{indiceProximoCampo} está antes do campo "{campo}"-{indiceCampo}')

            return self.texto[indiceCampo+len(campo):indiceProximoCampo].strip().replace("\n","")
        except Exception as e:
            print(f'Arquivo: {self.caminho_arquivo}')
            print(f'------------- Excecao: {str(e)}')
            return f'Erro de processamento: {str(e)}'
