$(() => {
    if ($('#puntentellingIndex').length) PUNTENTELLING.init();
    if ($('#speloverzichtIndex').length) SPELOVERZICHT.init();
});

const SPELOVERZICHT = {
    csrfToken: $('meta[name="csrf-token"]').attr('content'),

    init: () => {
        $("#puntentellingMenu").show();
        SPELOVERZICHT.lijst();

    },

    lijst: () => {
        let frmDta = {};

        fetch('/jxSpelOverzicht', {
            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                "X-CSRF-Token": SPELOVERZICHT.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            return response.json()
        }).then((res) => {
            if (res.succes) SPELOVERZICHT.spelOverzicht(res);
        }).catch(err => {
            console.log(err);
        })
    },

    spelOverzicht: (res) => {
        //maximum aantal spelers uit res.spelinfo berekenen
        const aantalSpelersArray = res.spelinfo.map(spel => spel.aantalSpelers);
        const maxAantalSpelers = Math.max(...aantalSpelersArray);

        //nieuwe arry om de tabel aan te maken
        // Initialiseer een 2D-array met 5 rijen en 10 kolommen
        const rows = res.spelinfo.length;
        const columns = maxAantalSpelers + 3 //spelID, datum, omschrijving, spelersnaam#score ;
        const spelTabel = new Array(rows);

        // Vul elke rij met een nieuwe array van 10 kolommen
        for (let i = 0; i < rows; i++) {
            spelTabel[i] = new Array(columns).fill(''); // Vul elke kolom met de waarde 0 (of een andere gewenste initiële waarde)
        }

        //vul de spelTabel nu met de info uit spelinfo en spelscores
        for (let i = 0; i < res.spelinfo.length; i++) {
            spelTabel[i][0] = res.spelinfo[i].spelID;
            spelTabel[i][1] = res.spelinfo[i].weergavedatum;
            spelTabel[i][2] = res.spelinfo[i].omschrijving;
            let idx = 2;
            for (let j = 0; j < res.spelscores.length; j++) {

                if (res.spelinfo[i].spelID == res.spelscores[j].spelID) {
                    idx += 1;
                    spelTabel[i][idx] = res.spelscores[j].naam + ' (' + res.spelscores[j].score + ')';
                }
            }
        }

        //toon de tabel
         // Maak een tabel element
    const $table = $('<table border="1"></table>');
    
    // Maak de tabel headers
    const headers = ["SpelID", "Datum", "Omschrijving", "Speler 1", "Speler 2", "Speler 3", "Speler 4"];
    const $headerRow = $('<tr></tr>');
    headers.forEach(header => {
        $headerRow.append($('<th></th>').text(header));
    });
    $table.append($headerRow);

    // Voeg de data rijen toe aan de tabel
    spelTabel.forEach(row => {
        const $row = $('<tr></tr>');
        row.forEach(cell => {
            $row.append($('<td></td>').text(cell));
        });
        $table.append($row);
    });
    $table.find('tr').each(function() {
        $(this).find('th:first, td:first').hide();
    });

    // Voeg de tabel toe aan de container
    $('#spellenLijstOverzicht').append($table);
    }


}

const PUNTENTELLING = {
    csrfToken: $('meta[name="csrf-token"]').attr('content'),
    aantalSpelers: 0,
    aantalSpelletjes: 0,
    labels: null,

    init: () => {
        $("#puntentellingMenu").show();
        PUNTENTELLING.toonSpelmainInfo();


        $('body').on('click', '.initieer_spelmain ', function (evt) {
            PUNTENTELLING.verwijderKlasse();
            $(this).parent().parent().addClass('geselecteerd');
            PUNTENTELLING.getMainInfo($(this).attr('id').split('_')[1]);
        })

        // TOEVOEGEN - BEWERKEN - VERWIJDEREN Spelronde
        $('body').on('click', '.toevoegen_spelronde ', function (evt) { PUNTENTELLING.bewerkSpelronde('nieuw', 0); })
        $('body').on('click', '.bewerk_spelronde ', function (evt) { PUNTENTELLING.bewerkSpelronde('bewerk', $(this).attr('id').split('_')[1]); })
        $('body').on('click', '.verwijder_spelronde ', function (evt) { PUNTENTELLING.bewerkSpelronde('verwijder', $(this).attr('id').split('_')[1]); })

        //modaal bewerk spelronde
        $('body').on('click', '#spelrondeBewerkAnnuleer', () => { MODAAL.verberg(); })
        $('body').on('click', '#spelrondeBewerkBewaar', function (evt) { PUNTENTELLING.spelrondeBewerkBewaarBewaar(); })

        // TOEVOEGEN - BEWERKEN - VERWIJDEREN Spelmain
        $('body').on('click', '.toevoegen_spelmain ', function (evt) { PUNTENTELLING.bewerkSpelMain('nieuw', 0); })
        $('body').on('click', '.bewerk_spelmain ', function (evt) {
            PUNTENTELLING.verwijderKlasse();
            $(this).parent().parent().addClass('geselecteerd');
            PUNTENTELLING.bewerkSpelMain('bewerk', $(this).attr('id').split('_')[1]);
        }
        )
        $('body').on('click', '.verwijder_spelmain ', function (evt) {
            PUNTENTELLING.verwijderKlasse();
            $(this).parent().parent().addClass('geselecteerd');
            PUNTENTELLING.bewerkSpelMain('verwijder', $(this).attr('id').split('_')[1]);
        })

        //modaal bewerk spelronde
        $('body').on('click', '#spelmainBewerkAnnuleer', () => { MODAAL.verberg(); })
        $('body').on('click', '#spelmainBewerkBewaar', function (evt) { PUNTENTELLING.spelMainBewerkBewaarBewaar(); })
        //modaal speler (de)selecteren
        $('body').on('click', '.inhoudSpelerSelecteren', function (evt) { PUNTENTELLING.selecteerSpeler($(this).parent().attr('id').split('_')[1]); })
        $('body').on('click', '.inhoudSpelerDeselecteren', function (evt) { PUNTENTELLING.deselecteerSpeler($(this).parent().attr('id').split('_')[1]); })

        //SCORES VERBERGEN
        $('body').on('click', '.sluit_spelmain', function (evt) {
            $('#spellenLijstOverzicht').css('display', 'block');
            $('#spelInfo').css('display', 'none');
        })

        //speler toevoegen
        $('body').on('keyup', '#inhoudSpelerBewerkNaam', function (evt) {

            console.log($(this).val());
            if ($(this).val().length >= 3) {
                $('.inhoudSpelerBewerkNieuw').prop('disabled', false);
            } else {
                $('.inhoudSpelerBewerkNieuw').prop('disabled', true);
            }
            PUNTENTELLING.spelersFilter();
        });

        $('body').on('click', '.inhoudSpelerBewerkNieuw', function (evt) {
            PUNTENTELLING.voegSpelerToe();
        });
    },

    toonSpelmainInfo: () => {
        let frmDta = {
        }

        fetch('/jxSpelInfoMainOverzicht', {
            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                "X-CSRF-Token": PUNTENTELLING.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            return response.json()
        }).then((res) => {
            if (res.succes) PUNTENTELLING.spelmainOverzicht(res);
        }).catch(err => {
            console.log(err);
        })
    },

    spelmainOverzicht: (res) => {
        let div2use = $('#spellenLijstOverzicht');
        div2use.empty();
        var table = $('<table>').addClass('spelmainOverzicht');

        var headerRow = $('<tr>');
        //headerRow.append('<th>ID</th>');
        headerRow.append('<th>Datum</th>');
        headerRow.append('<th>Omschrijving</th>');
        headerRow.append('<th>Aantal\nspelers</th>');
        headerRow.append('<th>Aantal\nspellen</th>');
        headerRow.append(`<th class="toevoegen_spelmain"><button type="button" class="btn btn-primary">Spel toevoegen</button></th>`);
        table.append(headerRow);
        res.spelmain.forEach(spel => {
            let disabled = spel.aantalSpelletjes > 0 ? 'disabled' : '';

            var dataRow = $('<tr>');
            //dataRow.append($('<td>').addClass('spelmaintd').html(spel.spelID));
            dataRow.append($('<td>').addClass('spelmaintd').html(spel.weergavedatum));
            dataRow.append($('<td>').addClass('spelmaintd').html(spel.omschrijving));
            dataRow.append($('<td>').addClass('spelmaintd').html(spel.aantalSpelers));
            dataRow.append($('<td>').addClass('spelmaintd').html(spel.aantalSpelletjes));

            let inhoud = `
            <div class="btn-group mr-2" role="group"> 
                <button class="btn btn-primary bewerk_spelmain" type="button" id="rid_${spel['spelID']}" ${disabled}><i class="bi bi-pencil-square"></i></button>
                <button class="btn btn-warning verwijder_spelmain type="button" id="rid_${spel['spelID']}"><i class="bi bi-scissors"></i></button>
                <button class="btn btn-success initieer_spelmain type="button" id="rid_${spel['spelID']}"><i class="bi bi-rocket-takeoff"></i></i></button>
            </div>
                `;
            dataRow.append($('<td>').addClass('internetActieButtons').html(inhoud));

            table.append(dataRow);
        });
        div2use.append(table);
    },

    getMainInfo: (spelID) => {
        let frmDta = {
            spelID: spelID,
            mode: 'initieer'
        }
        fetch('/jxGetSpelInfo', {

            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                "X-CSRF-Token": PUNTENTELLING.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            return response.json()
        }).then((res) => {
            if (res.succes) PUNTENTELLING.spelInfo(res);
        }).catch(err => {
            console.log(err);
        })
    },

    spelInfo: (res) => {

        let spelerslijst = []; // Initialize as an empty array
        res.spelersPerSpel.forEach(speler => {
            spelerslijst.push(speler.naam); // Pushing to the array
        });

        try {
            PUNTENTELLING.aantalSpelers = res.spelmainInfo.aantalSpelers;
        } catch (error) {
            console.log('error: ', error);
            PUNTENTELLING.aantalSpelers = res.spelmainInfo.aantalSpelers;
        }


        PUNTENTELLING.aantalSpelletjes = res.spelRondes.length / res.spelmainInfo.aantalSpelers;

        let rows = PUNTENTELLING.aantalSpelletjes;
        let columns = PUNTENTELLING.aantalSpelers;
        let spelletjesArray = PUNTENTELLING.createArray(rows, columns);

        let div2use = $('#spelInfo');
        div2use.empty();
        div2use.append($('<div>').addClass('mb-1'))
            .append($('<input>').attr({ id: 'active_spelmainID', type: 'hidden' }).val(res.spelmainID))
            .append($('<input>').attr({ id: 'active_spelerID', type: 'hidden' }).val(res.spelerID))
            .append($('<input>').attr({ id: 'active_spelID', type: 'hidden' }).val(res.spelID));

        let kant2use = 'links';
        let inhoud = ``;
        res.spelInfo.forEach(spelDetail => {

            inhoud += `
                <div class="form-group card card-body scoretegel">
                <div class="spelrondeNaam">${spelDetail.naam}</div><div class="spelrondeScore">${spelDetail.totalScore}</div>
                </div> 
            `;
            if (kant2use == 'rechts') {
                div2use.append($('<div class="scoreContainer">').html(inhoud));
                kant2use = 'links';
                inhoud = ``;
            }
            else kant2use = 'rechts';
        });

        if (res.spelInfo.length % 2 === 1 && kant2use === 'rechts') {
            div2use.append($('<div class="scoreContainer">').html(inhoud));
        }


        inhoud = `
            <div class="badge text-bg-primary sluit_spelmain d-flex justify-content-center mt-3">
                <button class="btn btn-primary type="button">Spel afsluiten</button>
            </div>    
        `;

        div2use.append(inhoud);

        // GOUD-ZILVER-BRONS
        res.spelInfo.sort((a, b) => {
            return parseInt(a.totalScore) - parseInt(b.totalScore);
        });

        let idx = 0;
        res.spelInfo.forEach(spelDetail => {
            idx += 1;
            switch (idx) {
                case 1:
                    $('.spelrondeNaam').each(function () {
                        if ($(this).text().trim() === spelDetail.naam) {
                            $(this).closest('.scoretegel').addClass('rankGold');
                        }
                    });
                    break;
                case 2:
                    $('.spelrondeNaam').each(function () {
                        if ($(this).text().trim() === spelDetail.naam) {
                            $(this).closest('.scoretegel').addClass('rankSilver');
                        }
                    });
                    break;
                case 3:
                    $('.spelrondeNaam').each(function () {
                        if ($(this).text().trim() === spelDetail.naam) {
                            $(this).closest('.scoretegel').addClass('rankBronze');
                        }
                    });

                default:
                    break;

            }
        });





        //spelresultaten in tabel gieten
        div2use = $('#spelrondeOverzicht');
        div2use.empty();

        div2use.append($('<div>').addClass('card card-body ml-1 mt-0 mb-3').html(`<h4>We spelen ${res.spelmainInfo.omschrijving} met ${res.spelmainInfo.aantalSpelers} spelers </h4>`));

        var table = $('<table>').addClass('spelrondeOverzicht');

        var headerRow = $('<tr>');
        headerRow.append('<th>Spel#</th>');
        for (let i = 0; i < spelerslijst.length; i++) {
            headerRow.append(`<th>${spelerslijst[i]}</th>`); // Correct interpolation
        }

        headerRow.append(`<th><button type="button" class="btn btn-primary toevoegen_spelronde">Spelronde toevoegen</button></th>`);
        table.append(headerRow);

        div2use.append(table);


        res.spelRondes.forEach(spel => {

            let row = parseInt(spel.spelrondespelID);

            //bepalen op welke plaats de speler in de array zit
            let col = spelerslijst.indexOf(spel.naam) + 1;

            spelletjesArray[row - 1][col] = spel.score;
            spelletjesArray[row - 1][0] = spel.spelrondespelID;

        });
        spelletjesArray.sort((a, b) => b[0] - a[0]); //aflopend sorteren

        for (let i = 0; i < rows; i++) {
            var dataRow = $('<tr>');
            for (let j = 0; j <= columns; j++) {
                dataRow.append($('<td>').addClass('rondetd').html(spelletjesArray[i][j]));
            }
            let inhoud = `

            <button class="btn btn-primary bewerk_spelronde" type="button" id="rid_${spelletjesArray[i][0]}"><i class="bi bi-pencil-square"></i></button>
            <button class="btn btn-warning verwijder_spelronde type="button" id="rid_${spelletjesArray[i][0]}"><i class="bi bi-scissors"></i></button>
            `;
            dataRow.append($('<td>').addClass('actieButtons').html(inhoud));
            table.append(dataRow);
        };

        //spellenlijst verbergen zodat de scores boven blijven
        $('#spellenLijstOverzicht').css('display', 'none');
        $('#spelInfo').css('display', 'block');


    },

    bewerkSpelronde: (mode, spelrondeSpelID) => {
        let frmDta = {
            spelID: $('#active_spelID').val(),
            spelrondeSpelID: spelrondeSpelID,
            mode: mode
        };
        fetch('/jxBewerkspelronde', {

            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                "X-CSRF-Token": PUNTENTELLING.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            return response.json()
        }).then((res) => {
            if (res.succes) PUNTENTELLING.bewerkSpelRondeInfo(res);
        }).catch(err => {
            console.log(err);
        })
    },

    bewerkSpelRondeInfo: (res) => {
        PUNTENTELLING.labels = res.labels;
        let disabled = '';

        //titel dialoogvenster
        switch (res.mode) {
            case ('bewerk'):
                MODAAL.kop(PUNTENTELLING.labels.spelrondeBewerkTitelBewerk);
                break;
            case ('nieuw'):
                MODAAL.kop(PUNTENTELLING.labels.spelrondeBewerkTitelNieuw);
                break;
            case ('verwijder'):
                MODAAL.kop(PUNTENTELLING.labels.spelrondeBewerkTitelVerwijder);
                disabled = 'disabled';
                break;

        }
        // inhoud dialoogvenster

        let inhoud = `
                        <div id="spelrondeBewerkBoodschap"></div>
                        <input type="hidden" id="spelrondeBewerkID" value="${res.spelrondespelID}">
                        <input type="hidden" id="spelID" value="${res.spelID}">
                        <input type="hidden" id="spelrondeBewerkMode" value="${res.mode}">
                    `


        let rslt = (PUNTENTELLING.aantalSpelletjes + 1) % PUNTENTELLING.aantalSpelers;
        if (rslt == 0 && res.spelrondespelID == 0) rslt = PUNTENTELLING.aantalSpelers;

        res.spelrondes.forEach((spelronde, idx) => {


            let isDeler = rslt == spelronde.volgorde ? 'isDeler' : 'isgeenDeler';
            let obj = PUNTENTELLING.createSpelrondeObj(spelronde.spelerID, spelronde.naam, spelronde.spelrondeID, spelronde.score, disabled, isDeler);
            inhoud += '<div id="spelrondeinfo">' + obj + '</div>';
        });



        MODAAL.inhoud(inhoud);

        let voet = '';
        if (res.mode === 'verwijder') voet += MODAAL.knop('spelrondeBewerkBewaar', 'warning', 'trash3', PUNTENTELLING.labels.spelrondeBewerkVerwijder);

        else
            voet += MODAAL.knop('spelrondeBewerkBewaar', 'primary', 'check-square', PUNTENTELLING.labels.spelrondeBewerkBewaar);
        voet += MODAAL.knop('spelrondeBewerkAnnuleer', 'secondary', 'x-square', PUNTENTELLING.labels.spelrondeBewerkAnnuleer);

        MODAAL.voet(voet);
        MODAAL.toon();
        $('#modDlg').css('padding-left', '200px');



    },

    createSpelrondeObj: (spelerID, naam, spelrondeID, score, disabled, isDeler) => {
        let obj = `

        <div class="form-group mb-3 spelronde ${isDeler}" id="spelronde_${spelerID}_${spelrondeID}">
            <label for="score" class="form-label ${isDeler}">${naam}</label>
            <input type="number" min="0" class="form-control ${isDeler}" id="score" name="score" value="${score}" ${disabled}>
         </div>
            `
        return obj;

    },

    spelrondeBewerkBewaarBewaar: () => {

        if ($('#spelrondeBewerkMode').val() == 'verwijder') {
            let frmDta = {
                mode: $('#spelrondeBewerkMode').val(),
                spelID: $('#spelID').val(),
                spelrondespelID: $('#spelrondeBewerkID').val()
            }

            fetch('/jxBewerkVerwijderSpelronde', {

                method: 'post',
                body: JSON.stringify(frmDta),

                headers: {
                    "X-CSRF-Token": PUNTENTELLING.csrfToken,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then((response) => {
                return response.json()
            }).then((res) => {
                if (res.succes) {
                    MODAAL.verberg();
                    PUNTENTELLING.getMainInfo($('#active_spelID').val());
                }
            }).catch(err => {
                console.log(err);
            })

            return;
        }



        let spelerTeller = 0;
        $('#spelrondeinfo .spelronde').each(function () {
            spelerTeller++;
            let spelerID = $(this).closest('div').attr('id').split('_')[1];
            let spelrondeID = $(this).closest('div').attr('id').split('_')[2];
            let score = $(this).find('input').val();

            let frmDta = {
                spelrondeID: spelrondeID,
                spelerID: spelerID,
                score: score,
                mode: $('#spelrondeBewerkMode').val(),
                spelrondespelID: $('#spelrondeBewerkID').val()
            }

            fetch('/jxBewerkBewaarSpelronde', {

                method: 'post',
                body: JSON.stringify(frmDta),

                headers: {
                    "X-CSRF-Token": PUNTENTELLING.csrfToken,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then((response) => {
                return response.json()
            }).then((res) => {
                if (res.succes) {
                    if (spelerTeller >= PUNTENTELLING.aantalSpelers) {
                        MODAAL.verberg();

                        PUNTENTELLING.getMainInfo($('#active_spelID').val());

                    }
                }
            }).catch(err => {
                console.log(err);
            })


        });
    },

    bewerkSpelMain: (mode, spelID) => {
        let frmDta = {
            spelID: spelID,
            mode: mode
        };
        fetch('/jxGetSpelInfo', {

            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                "X-CSRF-Token": PUNTENTELLING.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            return response.json()
        }).then((res) => {
            if (res.succes) PUNTENTELLING.spelMainInfo(res);
        }).catch(err => {
            console.log(err);
        })
    },

    spelMainInfo: (res) => {
        PUNTENTELLING.labels = res.labels;
        let disabled = '';

        //titel dialoogvenster
        let spelersTitel = '';
        let spelersSelecteren = '';
        let spelersToevoegenZoeken = '';

        switch (res.mode) {

            case ('bewerk'):
                MODAAL.kop(PUNTENTELLING.labels.spelmainBewerkTitelBewerk);
                spelersSelecteren = PUNTENTELLING.labels.spelmainBewerkSpelersBewerk;
                spelersToevoegenZoeken = PUNTENTELLING.labels.spelmainBerkSpelerToevoegenZoeken;
                break;
            case ('nieuw'):
                MODAAL.kop(PUNTENTELLING.labels.spelmainBewerkTitelNieuw);
                spelersSelecteren = PUNTENTELLING.labels.spelmainBewerkSpelersBewerk;
                spelersToevoegenZoeken = PUNTENTELLING.labels.spelmainBerkSpelerToevoegenZoeken;
                break;
            case ('verwijder'):
                MODAAL.kop(PUNTENTELLING.labels.spelmainBewerkTitelVerwijder);
                spelersSelecteren = PUNTENTELLING.labels.spelmainBewerkSpelersVerwijderdBewerk;
                spelersTitel = PUNTENTELLING.labels.spelmainBerkSpelerToevoegenZoeken;
                disabled = 'disabled';
                break;

        }

        // inhoud dialoogvenster


        let inhoud = `
                <div id="spelmainBewerkBoodschap"></div>
                <input type="hidden" id="spelrondeBewerkID" value="${res.spelmainInfo.spelID}">
                <input type="hidden" id="spelrondeBewerkMode" value="${res.mode}">

                
                <div class="input-group d-inline-flex align-items-center mb-3">
                    <label for="datum" class="form-label">Datum:</label>
                    <input type="date" class="form-control spelmain" id="spelmainBewerkDatum" name="spelmainBewerkDatum" value="${res.spelmainInfo.datum}" ${disabled}>
                </div>
                <div class="input-group d-inline-flex align-items-center mb-3">
                    <label for="datum" class="form-label">Omschrijving:</label>
                    <input type="text" class="form-control spelmain" id="spelmainBewerkOmschrijving" value="${res.spelmainInfo.omschrijving}" ${disabled}>
                </div><hr>
                <h5>${spelersToevoegenZoeken}</h5>
                 <div class="input-group d-inline-flex align-items-center mb-3">      `;


        if (res.mode !== 'verwijder') {
            inhoud += `
                <div class="form-group d-inline-flex align-items-center mb-3">
                <label for="datum" class="form-label">Naam:</label>
                <input type="text" class="form-control spelmain" id="inhoudSpelerBewerkNaam" value="" ${disabled}</input>
                <button type="button" class="btn btn-primary inhoudSpelerBewerkNieuw" disabled>
                    <i class="bi bi-person-add"></i>
                </button>
                </div>
            `
        };

        inhoud += `
            <div id = "#spelerslijst" class="mt-3">
            <div class="input-group d-inline-flex align-items-center mb-3"><h5>${spelersSelecteren}</h5></div> 
        `;



        res.spelers.forEach(speler => {
            let isVerwijderen = res.mode === 'verwijder' ? 'disabled' : '';
            let toonSpeler = (res.mode === 'verwijder' && speler.selecteerbaar == 1) ? 'none' : 'block';

            if (res.mode === 'verwijder') {
                if (speler.selecteerbaar == 0) {
                    inhoud += `
                        
                    <div class="input-group mb-1 spelersLijstItem d-inline-flex" id="spelerID_${speler.spelerID}" >
                        <input type="text" class="form-control inhoudNaam" Value="${speler.naam}" ${disabled}>

                            

                    </div>
        `

                }
            }
            else {

                let knoppenStandaard = speler.selecteerbaar == 1 ? 'block' : 'none';
                let knoppenVerborgen = speler.selecteerbaar == 1 ? 'none' : 'block';
                inhoud += `
                        
                            <div class="input-group mb-1 spelersLijstItem d-xl-inline-flex" id="spelerID_${speler.spelerID}" style="display:${toonSpeler};" >
                                <input type="text" class="form-control inhoudNaam" Value="${speler.naam}" ${disabled}>
                                    <button type="button" class="btn btn-primary inhoudSpelerSelecteren" style="display:${knoppenStandaard};" ${isVerwijderen}>
                                        <i class="bi bi-check2-circle"></i>
                                    </button>
                                    <button type="button" class="btn btn-warning inhoudSpelerDeselecteren" style="display:${knoppenVerborgen};" ${isVerwijderen}>
                                        <i class="bi bi-x-circle"></i>
                                    </button>

                            </div>
               `
            }

        });
        inhoud += `</div></div>`;




        MODAAL.inhoud(inhoud);


        let voet = '';
        if (res.mode === 'verwijder') voet += MODAAL.knop('spelmainBewerkBewaar', 'warning', 'trash3', PUNTENTELLING.labels.spelmainBewerkVerwijder);

        else
            voet += MODAAL.knop('spelmainBewerkBewaar', 'primary', 'check-square', PUNTENTELLING.labels.spelmainBewerkBewaar);
        voet += MODAAL.knop('spelmainBewerkAnnuleer', 'secondary', 'x-square', PUNTENTELLING.labels.spelmainBewerkAnnuleer);

        MODAAL.voet(voet);
        MODAAL.toon();

    },

    selecteerSpeler: (spelerID) => {
        let frmDta = {
            spelerID: spelerID,
            spelID: $('#spelrondeBewerkID').val(),
        };
        fetch('/jxSelecteerSpeler', {

            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                "X-CSRF-Token": PUNTENTELLING.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            return response.json()
        }).then((res) => {
            if (res.succes) {

                const spelerDiv = $(`#spelerID_${spelerID} `);
                spelerDiv.find('.inhoudSpelerSelecteren').hide();
                spelerDiv.find('.inhoudSpelerDeselecteren').show();
            };
        }).catch(err => {
            console.log(err);
        })

    },

    deselecteerSpeler: (spelerID) => {

        let frmDta = {
            spelerID: spelerID,
            spelID: $('#spelrondeBewerkID').val(),
        };
        fetch('/jxDeselecteerSpeler', {

            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                "X-CSRF-Token": PUNTENTELLING.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            return response.json()
        }).then((res) => {
            if (res.succes) {

                const spelerDiv = $(`#spelerID_${spelerID} `);
                spelerDiv.find('.inhoudSpelerSelecteren').show();
                spelerDiv.find('.inhoudSpelerDeselecteren').hide();
            };
        }).catch(err => {
            console.log(err);
        })

    },

    spelMainBewerkBewaarBewaar: () => {

        if ($('#spelrondeBewerkMode').val() == 'verwijder') {
            let frmDta = {
                spelID: $('#spelrondeBewerkID').val(),
                mode: $('#spelrondeBewerkMode').val()
            }
            PUNTENTELLING.spelmainBewaar(frmDta);
            return;
        }
        else {
            let frmDta = {
                spelID: $('#spelrondeBewerkID').val(),
                mode: $('#spelrondeBewerkMode').val(),
                datum: $('#spelmainBewerkDatum').val(),
                omschrijving: $('#spelmainBewerkOmschrijving').val(),
                aantalspelers: $('.spelersLijstItem').filter(function () {
                    return $(this).find('.inhoudSpelerDeselecteren').css('display') === 'block';
                }).length
            };

            if (PUNTENTELLING.spelmainBewaarValideer(frmDta)) PUNTENTELLING.spelmainBewaar(frmDta);
        }
    },

    spelmainBewaar: (frmDta) => {
        fetch('/jxSpelmainBewaar', {

            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                "X-CSRF-Token": PUNTENTELLING.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            return response.json()
        }).then((res) => {
            if (res.succes) {
                MODAAL.verberg();
                PUNTENTELLING.toonSpelmainInfo();

            };
        }).catch(err => {
            console.log(err);
        })
    },

    spelmainBewaarValideer: (frmDta) => {
        let boodschap = [];
        if (frmDta.omschrijving.length == 0) boodschap.push(`< li > Omschrijving is een verplicht veld</li > `);

        if (boodschap.length == 0) {
            return true;
        }
        else {
            let div2use = $('#spelmainBewerkBoodschap');
            div2use.html(boodschap)
        }

    },

    voegSpelerToe: () => {

        let frmDta = {
            naam: $('#inhoudSpelerBewerkNaam').val(),
            spelID: $('#spelrondeBewerkID').val(),
            mode: $('#spelrondeBewerkMode').val()
        }

        fetch('/jxVoegSpelerToe', {

            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                "X-CSRF-Token": PUNTENTELLING.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            return response.json()
        }).then((res) => {
            if (res.succes) {
                //speler werd toegevoegd aan tabel, spelinfo ophalen
                PUNTENTELLING.bewerkSpelMain(res.mode, res.spelID)


            };
        }).catch(err => {
            console.log(err);
        })
    },

    spelersFilter: () => {
        let filter = $('#inhoudSpelerBewerkNaam').val().toUpperCase();

        $('.spelersLijstItem').each((ndx, item) => {
            let naam = $(item).find('.inhoudNaam').val()
                .replace(/<[^>]+>/g, '')
                .replace(/\s+/g, '')
                .replace('\n', '');

            if (naam.toUpperCase().indexOf(filter) === -1) {
                $(item).addClass('visually-hidden');
            }
            else {
                $(item).removeClass('visually-hidden');
            }
        });


    },


    createArray: (rows, columns) => {
        let newArray = [];
        for (let i = 0; i < rows; i++) {
            newArray.push([]);
            for (let j = 0; j < columns; j++) {
                newArray[i].push(0); // Initialize with zeros, you can change this as needed
            }
        }
        return newArray;
    },

    verwijderKlasse: () => {
        $('#spelmainOverzicht .geselecteerd').each(function () {
            $(this).removeClass('geselecteerd');
        });
        $('.internetActieButtons').each(function () {
            $(this).removeClass('geselecteerd');
        });

    }


}