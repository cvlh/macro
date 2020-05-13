'use strict';

import Macro from './macro/macro.js';


let vp = new Macro();

let activity = vp.newCard(10, 845);
    activity.setHeader('ATIVIDADE');

let startField = activity.addField('INICIAR');
let startCard = vp.newCard(326, 19);
    startCard.addField('CONTROLE');
    let cdeField = startCard.addField('CDE M2 V43');
    let cdeCard = vp.newCard(747, 34);
        cdeCard.addField('INICIAR');
        cdeCard.addField('CANCELAR');
    vp.connect(cdeField, cdeCard);

    let centroField = startCard.addField('CD CENTRO RESUL');
    let centroCard = vp.newCard(740, 176);
        centroCard.addField('COLETA DOMICILIAR');
        centroCard.addField('COLETA DIVERSOS');
        centroCard.addField('COLETA SELECTIVA');
    vp.connect(centroField, centroCard);

    startCard.addField('CD UT');
    startCard.addField('CD SETOR');
    startCard.addField('KM INICIAL');
vp.connect(startField, startCard);

let driverField = activity.addField('MOTORISTA');
let driverCard = vp.newCard(531, 437);
driverCard.addField('CÓDIGO MOTORISTA');
vp.connect(driverField, driverCard);

let inspectField = activity.addField('VISTORIA DIÁRIA');
    let inspectCard = vp.newCard(1397, 86);

        let fuelField = inspectCard.addField('COMBUSTIVEL');
        let fuelCard = vp.newCard(2380, 24);
            fuelCard.addField('COMPLETO');
            fuelCard.addField('MEIO TANQUE');
            fuelCard.addField('1/4 de TANQUE');
            fuelCard.addField('RESERVA');
            fuelCard.addField('VAZIO');
        vp.connect(fuelField, fuelCard); 

        let diferencialField = inspectCard.addField('DIFERENCIAL');
        let diferencialCard = vp.newCard(2380, 253);
            diferencialCard.addField('OK');
            diferencialCard.addField('FAZENDO BARULHO');
            diferencialCard.addField('VAZAMENTO DE ÓLEO');
        vp.connect(diferencialField, diferencialCard); 

        let gearboxField = inspectCard.addField('CAIXA DE CAMBIO');
        let gearboxCard = vp.newCard(2380, 417);
            gearboxCard.addField('OK');
            gearboxCard.addField('FAZENDO BARULHO');
            gearboxCard.addField('ESCAPANDO MARCHA');
            gearboxCard.addField('NAO ENTRA MARCHA');
            gearboxCard.addField('VAZAMENTO');
        vp.connect(gearboxField, gearboxCard);

        let engineField = inspectCard.addField('ÓLEO DO MOTOR');
        let engineCard = vp.newCard(2380, 643);
            engineCard.addField('OK');
            engineCard.addField('NÍVEL BAIXO');
        vp.connect(engineField, engineCard);

        let hydraulicField = inspectCard.addField('ÓLEO HIDRAULICO');
        let hydraulicCard = vp.newCard(2380, 779);
            hydraulicCard.addField('OK');
            hydraulicCard.addField('NÍVEL BAIXO');
        vp.connect(hydraulicField, hydraulicCard);

        let greaseField = inspectCard.addField('GRAXA SAPATAS');
        let greaseCard = vp.newCard(2380, 915);
            greaseCard.addField('ENGRAXADO');
            greaseCard.addField('RUIM');
        vp.connect(greaseField, greaseCard);

        let cameraField = inspectCard.addField('CAMERA DE RÉ');
        let cameraCard = vp.newCard(2380, 1051);
            cameraCard.addField('FUNCIONANDO');
            cameraCard.addField('COM PROBLEMAS');
        vp.connect(cameraField, cameraCard);

        let waterField = inspectCard.addField('ÁGUA DO RADIADOR');
        let waterCard = vp.newCard(2380, 1190);
            waterCard.addField('OK');
            waterCard.addField('NÍVEL BAIXO');
            waterCard.addField('VAZAMENTO');
        vp.connect(waterField, waterCard);

    vp.connect(inspectField, inspectCard);


let workField = activity.addField('EM TRABALHO');
let activityCard = vp.newCard(1042, 650);

    activityCard.addField('INÍCIO COLETA');
    activityCard.addField('FIM COLETA');
    activityCard.addField('TRÂNSITO PARA DESCARGA');
    activityCard.addField('INÍCIO DESCARGA');

let endDischargeField = activityCard.addField('FIM DESCARGA');
let endDischargeCard = vp.newCard(1431, 880);
    endDischargeCard.addField('PESO');
    endDischargeCard.addField('TICKET');
    vp.connect(endDischargeField, endDischargeCard); 

    activityCard.addField('TRÂNSITO LOCAL');
    activityCard.addField('INÍCIO ABASTECIMENTO');

let endFuelField = activityCard.addField('FIM ABASTECIMENTO');
    let endFuelCard = vp.newCard(1450, 1040);
    endFuelCard.addField('LITROS');
    vp.connect(endFuelField, endFuelCard); 

    activityCard.addField('COND LOCAIS');
    activityCard.addField('INÍCIO REFEIÇÃO');
    activityCard.addField('FIM REFEIÇÃO');
    activityCard.addField('CAFÉ');
    activityCard.addField('A DISPOSIÇÃO');
    activityCard.addField('PEDIDO DE SOS');
    activityCard.addField('INÍCIO SOS');
    activityCard.addField('FIM SOS');
    activityCard.addField('FISCALIZAÇÃO');
    activityCard.addField('OBSERVAÇÕES');
    activityCard.addField('TROCA MOTORISTA');
    activityCard.addField('SAIR TRABALHO');
    activityCard.addField('VERIFICA COLETA');
vp.connect(workField, activityCard); 

let changeField = activity.addField('TROCA MOTORISTA');
    let changeCard = vp.newCard(1409, 1613);
    changeCard.addField('SENHA MOTORISTA');
    vp.connect(changeField, changeCard);

let maintenanceField = activity.addField('EM MANUTENÇÃO');
    let maintenanceCard = vp.newCard(1406, 1849);
    maintenanceCard.addField('MANUTENÇÃO DENTRO DO TURNO');
    maintenanceCard.addField('TROCA DE PNEUS');
    maintenanceCard.addField('LAVAGEM');
    maintenanceCard.addField('MANUTENÇÃO FORA DO TURNO');
    maintenanceCard.addField('TROCA DE ÓLEO');
    maintenanceCard.addField('SAIR MANUTENÇÃO');

    vp.connect(maintenanceField, maintenanceCard);

let startworkField = activity.addField('PONTO ELETRÔNICO');
let startworkCard = vp.newCard(855, 1882);
startworkCard.addField('ENTRADA TRABALHO');
startworkCard.addField('SAÍDA INTERVALO');
startworkCard.addField('RETORNO INTERVALO');
startworkCard.addField('SAÍDA TRABALHO');
startworkCard.addField('SAIR PONTO');

vp.connect(startworkField, startworkCard);


let endField = activity.addField('FINALIZAR CDE');
    let endCard = vp.newCard(332, 1974);
        endCard.addField('SIM');
        endCard.addField('NÃO');

    vp.connect(endField, endCard);
    /*let checklist = main.newCard();
    checklist.setHeader('VISTORIA DIÁRIA');

let checklist = main.newCard();
    checklist.setHeader('VISTORIA DIÁRIA');

let checklist = main.newCard();
    checklist.setHeader('VISTORIA DIÁRIA');

let checklist = main.newCard();
    checklist.setHeader('VISTORIA DIÁRIA');

let checklist = main.newCard();
    checklist.setHeader('VISTORIA DIÁRIA');*/




