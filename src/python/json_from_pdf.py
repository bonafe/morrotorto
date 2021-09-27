import os
from shutil import copyfile
from datetime import datetime
import re
import json

from io import StringIO

from pdfminer.converter import TextConverter
from pdfminer.layout import LAParams
from pdfminer.pdfdocument import PDFDocument
from pdfminer.pdfinterp import PDFResourceManager, PDFPageInterpreter
from pdfminer.pdfpage import PDFPage
from pdfminer.pdfparser import PDFParser

from pyproj import Proj

from Nascente import Nascente
from sequencia_campos import SequenciaCampos
from CamposBaciasIndaiatuba import CamposBaciasIndaiatuba

diretorio = "../../documentos/prefeitura/"

lista_nascentes = []


conversor_coordenadas_utm_wgs84 = Proj("+proj=utm +zone=23 +south +ellps=WGS84 +datum=WGS84 +units=m +no_defs")


def percorrer_diretorio (diretorio):
    for nomeArquivo in os.listdir(diretorio):
        caminhoCompleto = os.path.join(diretorio, nomeArquivo)
        if os.path.isdir(caminhoCompleto):
            #print (f'\n{caminhoCompleto}')
            percorrer_diretorio(caminhoCompleto)
        if nomeArquivo.lower().endswith(".pdf"):
                processar_pdf (caminhoCompleto)

        else:
            continue



def transformar_coordenada_utc_para_wgs84(str_latitude, str_longitude):
    latitude_utc = int(str_latitude.replace(".",""))
    longitude_utc = int(str_longitude.replace(".", ""))

    longitude_wgs84, latitude_wgs84 = conversor_coordenadas_utm_wgs84(latitude_utc, longitude_utc, inverse=True)
    return {
        'utc': {'latitude': latitude_utc, 'longitude': longitude_utc, 'zona': 23, 'hemisferio':'S'},
        'wgs84': {'latitude': latitude_wgs84, 'longitude': longitude_wgs84}
    }



def processar_pdf(nomeArquivo):

    arquivo = nomeArquivo[nomeArquivo.rfind("/")+1:]
    tamanho_nome_arquivo = len(arquivo)

    if tamanho_nome_arquivo > 20 or nomeArquivo.lower().find("anexo") != -1:
        print(f'********************** Arquivo excluido do processamento: {arquivo}')
    else:
        texto = converter_pdf_em_texto(nomeArquivo)
        quantidade_campos = len(CamposBaciasIndaiatuba.CAMPOS)
        sequencia_campos = SequenciaCampos(CamposBaciasIndaiatuba.CAMPOS, texto, nomeArquivo)

        nascente = Nascente()

        try:
           #print(f'Processando arquivo: {nomeArquivo}')

           nascente.coordenadas = transformar_coordenada_utc_para_wgs84(sequencia_campos.extrairCampo(15),
                                                                        sequencia_campos.extrairCampo(16))

           nascente.arquivo = nomeArquivo

           nascente.numero = sequencia_campos.extrairCampo(0)
           nascente.data = sequencia_campos.extrairCampo(1)
           nascente.endereco = sequencia_campos.extrairCampo(2)
           nascente.bairro = sequencia_campos.extrairCampo(3)
           nascente.localizacao = sequencia_campos.extrairCampo(4)

           nascente.proprietario = sequencia_campos.extrairCampo(5)
           nascente.nome_proprietario = sequencia_campos.extrairCampo(6)
           nascente.telefone_contato = sequencia_campos.extrairCampo(7)

           nascente.corpo_dagua_alimentado = sequencia_campos.extrairCampo(9)
           nascente.bacia = sequencia_campos.extrairCampo(10)
           nascente.sub_bacia = sequencia_campos.extrairCampo(11)
           nascente.tipo_afloramento = sequencia_campos.extrairCampo(12)
           nascente.classificacao = sequencia_campos.extrairCampo(13)

           nascente.elevacao = sequencia_campos.extrairCampo(17)

           nascente.destinacao_propriedade = sequencia_campos.extrairCampo(18)

           nascente.interferencia_antropica = sequencia_campos.extrairCampo(19)
           nascente.tipo_vegetacao = sequencia_campos.extrairCampo(19)

           nascente.observacoes = sequencia_campos.extrairCampo(20)

           lista_nascentes.append(nascente)

        except:
            print(f'********************** CONTEÚDO inválido: {nomeArquivo}')


def converter_pdf_em_texto(arquivo):
    output_string = StringIO()
    with open(arquivo, 'rb') as in_file:
        parser = PDFParser(in_file)
        doc = PDFDocument(parser)
        rsrcmgr = PDFResourceManager()
        device = TextConverter(rsrcmgr, output_string, laparams=LAParams())
        interpreter = PDFPageInterpreter(rsrcmgr, device)
        for page in PDFPage.create_pages(doc):
            interpreter.process_page(page)

    return output_string.getvalue()


percorrer_diretorio(diretorio)
#processar_pdf("../../documentos/prefeitura/cadastro-de-nascentes/tietê/corrego-do-campo-bonito/CαRREGO DO CAMPO BONITO/NP-883.pdf")

with open('../www/dados/nascentes_indaiatuba.json', 'w', encoding='utf8') as json_file:
    json.dump([ob.__dict__ for ob in lista_nascentes], json_file, ensure_ascii=False)