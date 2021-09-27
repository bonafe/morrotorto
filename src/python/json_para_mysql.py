import json
import pymysql

connection = pymysql.connect(host='localhost',
                             user='root',
                             password='',
                             database='nascentes',
                             charset='utf8mb4',
                             cursorclass=pymysql.cursors.DictCursor)


arquivo_json = open('../www/dados/nascentes_indaiatuba.json',)
nascentes = json.load(arquivo_json)

with connection:
    with connection.cursor() as cursor:
        sql = "INSERT INTO `nascente` (`arquivo`, `numero`,`data`,`observacoes`,`corpo_dagua_alimentado`,`bacia`," \
              "`sub_bacia`,`tipo_afloramento`,`classificacao`,`fluxo`,`interferencia_antropica`,`tipo_vegetacao`," \
              "`proprietario`,`nome_proprietario`,`telefone_contato`,`destinacao_propriedade`,`endereco`,`bairro`," \
              "`localizacao`,`latitude`,`longitude`,`elevacao`) VALUES (%s, %s, %s, %s, %s, %s, %s, %s ,%s, %s, %s, " \
              "%s, %s, %s, %s, %s, %s, %s ,%s, %s, %s, %s)"

        for nascente in nascentes:
            print(nascente)
            cursor.execute(sql, (nascente['arquivo'], nascente['numero'], nascente['data'], nascente['observacoes'],
                                 nascente['corpo_dagua_alimentado'], nascente['bacia'], nascente['sub_bacia'],
                                 nascente['tipo_afloramento'], nascente['classificacao'], nascente['fluxo'],
                                 nascente['interferencia_antropica'], nascente['tipo_vegetacao'],
                                 nascente['proprietario'], nascente['nome_proprietario'], nascente['telefone_contato'],
                                 nascente['destinacao_propriedade'], nascente['endereco'], nascente['bairro'],
                                 nascente['localizacao'], nascente['coordenadas']['wgs84']['latitude'], nascente['coordenadas']['wgs84']['longitude'],
                                 nascente['elevacao']))
    
    connection.commit()

arquivo_json.close()
