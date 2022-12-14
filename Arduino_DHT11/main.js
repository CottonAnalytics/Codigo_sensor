// não altere!
const serialport = require('serialport');
const express = require('express');
const mysql = require('mysql2');
const sql = require('mssql');

// não altere!
const SERIAL_BAUD_RATE = 9600;
const SERVIDOR_PORTA = 3300;

// configure a linha abaixo caso queira que os dados capturados sejam inseridos no banco de dados.
// false -> nao insere
// true -> insere
const HABILITAR_OPERACAO_INSERIR = true;

// altere o valor da variável AMBIENTE para o valor desejado:
// API conectada ao banco de dados remoto, SQL Server -> 'producao'
// API conectada ao banco de dados local, MySQL Workbench - 'desenvolvimento'
const AMBIENTE = 'producao';

const serial = async (
    valoresTemp1,
    valoresTemp2,
    valoresTemp3,
    valoresTemp4,
    valoresTemp5,
    valoresUmi1,
    valoresUmi2,
    valoresUmi3,
    valoresUmi4,
    valoresUmi5
) => {
    let poolBancoDados = ''

    if (AMBIENTE == 'desenvolvimento') {
        poolBancoDados = mysql.createPool(
            {
                // altere!
                // CREDENCIAIS DO BANCO LOCAL - MYSQL WORKBENCH
                host: 'localhost',
                user: 'aluno',
                password: 'sptech',
                database: 'cottonanalytics'
            }
        ).promise();
    } else if (AMBIENTE == 'producao') {
        console.log('Projeto rodando inserindo dados em nuvem. Configure as credenciais abaixo.');
    } else {
        throw new Error('Ambiente não configurado. Verifique o arquivo "main.js" e tente novamente.');
    }


    const portas = await serialport.SerialPort.list();
    const portaArduino = portas.find((porta) => porta.vendorId == 2341 && porta.productId == 43);
    if (!portaArduino) {
        throw new Error('O arduino não foi encontrado em nenhuma porta serial');
    }
    const arduino = new serialport.SerialPort(
        {
            path: portaArduino.path,
            baudRate: SERIAL_BAUD_RATE
        }
    );
    arduino.on('open', () => {
        console.log(`A leitura do arduino foi iniciada na porta ${portaArduino.path} utilizando Baud Rate de ${SERIAL_BAUD_RATE}`);
    });
    arduino.pipe(new serialport.ReadlineParser({ delimiter: '\r\n' })).on('data', async (data) => {
        console.log(data);
        const valores = data.split(';');
        const Temp1 = parseFloat(valores[0]);
        const Temp2 = parseFloat(valores[1]);
        const Temp3 = parseFloat(valores[2]);
        const Temp4 = parseFloat(valores[3]);
        const Temp5 = parseFloat(valores[4]);
        const Umi1 = parseFloat(valores[5]);
        const Umi2 = parseFloat(valores[6]);
        const Umi3 = parseFloat(valores[7]);
        const Umi4 = parseFloat(valores[8]);
        const Umi5 = parseFloat(valores[9]);

        valoresTemp1.push(Temp1);
        valoresTemp2.push(Temp2);
        valoresTemp3.push(Temp3);
        valoresTemp4.push(Temp4);
        valoresTemp5.push(Temp5);

        valoresUmi1.push(Umi1);
        valoresUmi2.push(Umi2);
        valoresUmi3.push(Umi3);
        valoresUmi4.push(Umi4);
        valoresUmi5.push(Umi5);

        if (HABILITAR_OPERACAO_INSERIR) {
            if (AMBIENTE == 'producao') {
                // altere!
                // Este insert irá inserir os dados na tabela "medida"
                // -> altere nome da tabela e colunas se necessário
                // Este insert irá inserir dados de fk_aquario id=1 (fixo no comando do insert abaixo)
                // >> Importante! você deve ter o aquario de id 1 cadastrado.
                sqlquery = `INSERT INTO dadosSensor (fkSensor, umidade, temperatura, dataDado) VALUES (21, ${Umi1}, ${Temp1}, CONVERT(VARCHAR, DATEADD(HOUR, -3, GETDATE()), 120));`;
                
                sqlquery2 = `INSERT INTO dadosSensor (fkSensor, umidade, temperatura, dataDado) VALUES (22, ${Umi2}, ${Temp2}, CONVERT(VARCHAR, DATEADD(HOUR, -3, GETDATE()), 120));`;

                sqlquery3 = `INSERT INTO dadosSensor (fkSensor, umidade, temperatura, dataDado) VALUES (23, ${Umi3}, ${Temp4}, CONVERT(VARCHAR, DATEADD(HOUR, -3, GETDATE()), 120));`;

                sqlquery4 = `INSERT INTO dadosSensor (fkSensor, umidade, temperatura, dataDado) VALUES (24, ${Umi4}, ${Temp5}, CONVERT(VARCHAR, DATEADD(HOUR, -3, GETDATE()), 120));`;
                
                sqlquery5 = `INSERT INTO dadosSensor (fkSensor, umidade, temperatura, dataDado) VALUES (25, ${Umi5}, ${Temp5}, CONVERT(VARCHAR, DATEADD(HOUR, -3, GETDATE()), 120));`;

                sqlquery6 = `INSERT INTO dadosSensor (fkSensor, umidade, temperatura, dataDado) VALUES (26, ${Umi3}, ${Temp2}, CONVERT(VARCHAR, DATEADD(HOUR, -3, GETDATE()), 120));`;

                sqlquery7 = `INSERT INTO dadosSensor (fkSensor, umidade, temperatura, dataDado) VALUES (27, ${Umi4}, ${Temp1}, CONVERT(VARCHAR, DATEADD(HOUR, -3, GETDATE()), 120));`;
                
                sqlquery8 = `INSERT INTO dadosSensor (fkSensor, umidade, temperatura, dataDado) VALUES (28, ${Umi1}, ${Temp3}, CONVERT(VARCHAR, DATEADD(HOUR, -3, GETDATE()), 120));`;

                sqlquery9 = `INSERT INTO dadosSensor (fkSensor, umidade, temperatura, dataDado) VALUES (29, ${Umi2}, ${Temp3}, CONVERT(VARCHAR, DATEADD(HOUR, -3, GETDATE()), 120));`;
                // CREDENCIAIS DO BANCO REMOTO - SQL SERVER
                // Importante! você deve ter criado o usuário abaixo com os comandos presentes no arquivo
                // "script-criacao-usuario-sqlserver.sql", presente neste diretório.
                const connStr = "Server=cotton-analytics.database.windows.net;Database=cottonAnaltics;User Id=cotton;Password=#Gf_grupo10;";
                
                function inserirComando(conn, sqlquery) {
                    conn.query(sqlquery);
                     console.log("valores inseridos no banco: ", Umi1 + ", " + Temp1 + ", " + Umi2 + ", " + Temp2 + ", " + Temp4 + ", " + Umi3 );
                }

                sql.connect(connStr)
                    .then(conn => inserirComando(conn, sqlquery))
                    .catch(err => console.log("erro! " + err));

                sql.connect(connStr)
                    .then(conn => inserirComando(conn, sqlquery2))
                    .catch(err => console.log("erro! " + err));

                    sql.connect(connStr)
                    .then(conn => inserirComando(conn, sqlquery3))
                    .catch(err => console.log("erro! " + err));

                    sql.connect(connStr)
                    .then(conn => inserirComando(conn, sqlquery4))
                    .catch(err => console.log("erro! " + err));

                    sql.connect(connStr)
                    .then(conn => inserirComando(conn, sqlquery5))
                    .catch(err => console.log("erro! " + err));

                    sql.connect(connStr)
                    .then(conn => inserirComando(conn, sqlquery6))
                    .catch(err => console.log("erro! " + err));

                    sql.connect(connStr)
                    .then(conn => inserirComando(conn, sqlquery7))
                    .catch(err => console.log("erro! " + err));

                    sql.connect(connStr)
                    .then(conn => inserirComando(conn, sqlquery8))
                    .catch(err => console.log("erro! " + err));

                    sql.connect(connStr)
                    .then(conn => inserirComando(conn, sqlquery9))
                    .catch(err => console.log("erro! " + err));
            } else if (AMBIENTE == 'desenvolvimento') {

                // altere!
                // Este insert irá inserir os dados na tabela "medida"
                // -> altere nome da tabela e colunas se necessário
                // Este insert irá inserir dados de fk_aquario id=1 (fixo no comando do insert abaixo)
                // >> você deve ter o aquario de id 1 cadastrado.
                await poolBancoDados.execute(
                    // 'INSERT INTO dados (temp1, temp2, temp3, temp4, temp5, umi1, umi2, umi3, umi4, umi5) VALUES (?, ?, ?, ?, ?, ?,?,?,?,?)',
                    // [temp1, temp2, temp3, temp4, temp5, umi1, umi2, umi3, umi4, umi5]
                    'INSERT INTO dadosSensor (fkSensor, umidade, temperatura, dataDado) VALUES (1, ?, ?, now());',
                    [Umi1, Temp1]
                );
                await poolBancoDados.execute(
                    // 'INSERT INTO dados (temp1, temp2, temp3, temp4, temp5, umi1, umi2, umi3, umi4, umi5) VALUES (?, ?, ?, ?, ?, ?,?,?,?,?)',
                    // [temp1, temp2, temp3, temp4, temp5, umi1, umi2, umi3, umi4, umi5]
                    'INSERT INTO dadosSensor (fkSensor, umidade, temperatura, dataDado) VALUES (2, ?, ?, now());',
                    [Umi2, Temp2]
                );
                await poolBancoDados.execute(
                    // 'INSERT INTO dados (temp1, temp2, temp3, temp4, temp5, umi1, umi2, umi3, umi4, umi5) VALUES (?, ?, ?, ?, ?, ?,?,?,?,?)',
                    // [temp1, temp2, temp3, temp4, temp5, umi1, umi2, umi3, umi4, umi5]
                    'INSERT INTO dadosSensor (fkSensor, umidade, temperatura, dataDado) VALUES (3, ?, ?, now());',
                    [Umi3, Temp3]
                );
                // console.log("valores inseridos no banco: ", temp1 + ", " + temp2 + ", " + temp3 + ", " + temp4 + ", " + temp5 +"," + umi1 + ","
                // + umi2 + "," + umi3 + ","+ umi4 + "," + umi5);

            } else {
                throw new Error('Ambiente não configurado. Verifique o arquivo "main.js" e tente novamente.');
            }
        }
    });
    arduino.on('error', (mensagem) => {
        console.error(`Erro no arduino (Mensagem: ${mensagem}`)
    });
}


// não altere!
const servidor = (
    valoresTemp1,
    valoresTemp2,
    valoresTemp3,
    valoresTemp4,
    valoresTemp5,
    valoresUmi1,
    valoresUmi2,
    valoresUmi3,
    valoresUmi4,
    valoresUmi5
) => {
    const app = express();
    app.use((request, response, next) => {
        response.header('Access-Control-Allow-Origin', '*');
        response.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
        next();
    });
    app.listen(SERVIDOR_PORTA, () => {
        console.log(`API executada com sucesso na porta ${SERVIDOR_PORTA}`);
    });
    app.get('/sensores/dht11/temp1', (_, response) => {
        return response.json(valoresTemp1);
    });
    app.get('/sensores/dht11/temp2', (_, response) => {
        return response.json(valoresTemp2);
    });
    app.get('/sensores/dht11/temp3', (_, response) => {
        return response.json(valoresTemp3);
    });
    app.get('/sensores/dht11/temp4', (_, response) => {
        return response.json(valoresTemp4);
    });
    app.get('/sensores/dht11/temp5', (_, response) => {
        return response.json(valoresTemp5);
    });
    app.get('/sensores/dht11/umi1', (_, response) => {
        return response.json(valoresUmi1);
    });
    app.get('/sensores/dht11/umi2', (_, response) => {
        return response.json(valoresUmi2);
    });
    app.get('/sensores/dht11/umi3', (_, response) => {
        return response.json(valoresUmi3);
    });
    app.get('/sensores/dht11/umi4', (_, response) => {
        return response.json(valoresUmi4);
    });
    app.get('/sensores/dht11/umi5', (_, response) => {
        return response.json(valoresUmi5);
    });
}

(async () => {
    const valoresTemp1 = [];
    const valoresTemp2 = [];
    const valoresTemp3 = [];
    const valoresTemp4= [];
    const valoresTemp5 = [];
    const valoresUmi1 = [];
    const valoresUmi2 = [];
    const valoresUmi3 = [];
    const valoresUmi4 = [];
    const valoresUmi5 = [];
    await serial(
        valoresTemp1,
        valoresTemp2,
        valoresTemp3,
        valoresTemp4,
        valoresTemp5,
        valoresUmi1,
        valoresUmi2,
        valoresUmi3,
        valoresUmi4,
        valoresUmi5
    );
    servidor(
        valoresTemp1,
        valoresTemp2,
        valoresTemp3,
        valoresTemp4,
        valoresTemp5,
        valoresUmi1,
        valoresUmi2,
        valoresUmi3,
        valoresUmi4,
        valoresUmi5
    );
})();
