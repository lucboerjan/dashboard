$(() => {

    if ($('#rekeningIndex').length) REKENINGEN.init();
    if ($('#transactieIndex').length) TRANSACTIES.init();
    if ($('#samenvattingIndex').length) SAMENVATTING.init();
    if ($('#statistiekIndex').length) STATISTIEK.init();
    if ($('#rekeningstandIndex').length) REKENINGSTAND.init();
    if ($('#transactiejaaroverzichtIndex').length) TRANSACTIEJAAROVERZICHT.init();
    if ($('#beheerOmschrijvingenIndex').length) TRANSACTIEBEHEEROMSCHRIJVINGEN.init();


});

const TRANSACTIEBEHEEROMSCHRIJVINGEN = {
    csrfToken: $('meta[name="csrf-token"]').attr('content'),
    omschrijving2update: '',
    richting:'Uit',

    init: () => {
        // toon het financieel menu
        $("#financieelMenu").show();
        // ophalen lijst omschrijvingen
        TRANSACTIEBEHEEROMSCHRIJVINGEN.omschrijvingenLijst(TRANSACTIEBEHEEROMSCHRIJVINGEN.richting);

        // filterfunctie
        $('#transactieOmschrijvingZoek').on('keyup', () => { TRANSACTIEBEHEEROMSCHRIJVINGEN.transactieOmschrijvingFilter(); });
        $('#transactieOmschrijvingFilter').on('click', () => { TRANSACTIEBEHEEROMSCHRIJVINGEN.transactieOmschrijvingFilter(); });
        $('#transactieOmschrijvingZoekAnnuleer').on('click', () => {
            $('#transactieOmschrijvingZoek').val('');
            TRANSACTIEBEHEEROMSCHRIJVINGEN.transactieOmschrijvingFilter();
        });

        // checkbox
        $('#transactieOmschrijvingLijst').on('click', '.transactieOmschrijvingSelecteer', function (evt) {
            TRANSACTIEBEHEEROMSCHRIJVINGEN.transactieOmschrijvingSelecteer(evt);
        });

        // bewerk
        $('#transactieOmschrijvingLijst').on('click', '.transactieOmschrijvingBewerk', function (evt) {
            TRANSACTIEBEHEEROMSCHRIJVINGEN.transactieOmschrijvingBewerk($(this));
        });

        $('#transactieOmschrijvingLijst').on('click', '.transactieOmschrijvingBewaar', function (evt) {
            let parentElement = this.closest('div');
            let transactieOmschrijvingInput = parentElement.querySelector('.transactieOmschrijving');
            let transactieOmschrijvingValue = transactieOmschrijvingInput.value;
            TRANSACTIEBEHEEROMSCHRIJVINGEN.transactieOmschrijvingBewaar(transactieOmschrijvingValue);
        });

        // merge omschrijvingen
        $('#transactieOmschrijvingMerge').on('click', () => { TRANSACTIEBEHEEROMSCHRIJVINGEN.transactieOmschrijvingMerge() });
        $('body').on('click', '#transactieOmschrijvingMergeOK', () => { TRANSACTIEBEHEEROMSCHRIJVINGEN.transactieOmschrijvingMergeUitvoeren(); });

        // verberg modaal venster
        $('body').on('click', '#verberg', () => { verberg() });

        $('button').on('click', '.btn-group-toggle .btn', function () {
            $(this).siblings().removeClass('active');
            $(this).addClass('active');
        });

        $('body').on('click', '#togglebuttoninkomsten', () => { TRANSACTIEBEHEEROMSCHRIJVINGEN.toggelbuttons() });
        $('body').on('click', '#togglebuttonuitgaven', () => { TRANSACTIEBEHEEROMSCHRIJVINGEN.toggelbuttons() });
    },


    omschrijvingenLijst: (richting) => {
        let frmDta = {
            richting:richting
        }
        fetch('/jxTransactieOmschrijvingenLijst', {
            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                'X-CSRF-Token': TRANSACTIEBEHEEROMSCHRIJVINGEN.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then((response) => {
                return response.json()
            })
            .then((res) => {
                if (res.succes) {
                    $('#transactieOmschrijvingZoek').val('');
                    TRANSACTIEBEHEEROMSCHRIJVINGEN.transactieOmschrijvingenLijstToon(res);
                }
            })
            .catch((err) => {
                console.log(err);
            })
    },

    transactieOmschrijvingenLijstToon: (res) => {
        let transactieOmschrijvingLijst = $('#transactieOmschrijvingLijst');

        transactieOmschrijvingLijst.empty();

        res.omschrijvingen.forEach(
            omschrijving => {
                transactieOmschrijvingLijst.append(TRANSACTIEBEHEEROMSCHRIJVINGEN.transactieOmschrijvingObject(
                    omschrijving.omschrijving,
                    omschrijving.aantal,
                    omschrijving.bedrag,
                    true));
            }
        )

        $('#inhoudFamilieNieuw').prop('disabled', false);

    },


    transactieOmschrijvingSelecteer: (evt) => {
        $('#transactieOmschrijvingMerge').prop('disabled', $('.transactieOmschrijvingSelecteer:checked').length < 2);
    },


    transactieOmschrijvingObject: (omschrijving, aantal, bedrag, status) => {
        let disabled = status ? 'disabled' : '';
        let knoppenStandaard = status ? 'block' : 'none';
        let knoppenVerborgen = status ? 'none' : 'block';

        return `
            <div class="input-group mb-1 transactieOmschrijvingLijstItem d-inline-flex">

                <div class="input-group-text">
                    <input type="checkbox" class="for-check-input transactieOmschrijvingSelecteer">
                </div>

                <div class="badge text-bg-secondary" style="min-width:80px; padding-top: 12px;">${aantal}</div>
                
                <input type="text" class="form-control transactieOmschrijving" value="${omschrijving}" ${disabled}>
                <input type="text" class="form-control bedrag" value="€ ${bedrag}" ${disabled}>

                <button type="button" class="btn btn-primary transactieOmschrijvingBewerk" style="display:${knoppenStandaard};">
                    <i class="bi bi-pencil"></i>
                </button>

                <button type="button" class="btn btn-secondary transactieOmschrijvingVerwijder" style="display:${knoppenStandaard};">
                    <i class="bi bi-trash"></i>
                </button>

                <button type="button" class="btn btn-primary transactieOmschrijvingBewaar" style="display:${knoppenVerborgen};">
                    <i class="bi bi-check"></i>
                </button>

                <button type="button" class="btn btn-secondary transactieOmschrijvingAnnuleer" style="display:${knoppenVerborgen};">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
        `;
    },



    transactieOmschrijvingFilter: () => {
        $('.transactieOmschrijvingSelecteer').prop('checked', false);
        $('#transactieOmschrijvingMerge').prop('disabled', true);

        let filter = $('#transactieOmschrijvingZoek').val().trim().toUpperCase();
        if (filter.length == 0) {
            $('.transactieOmschrijvingLijstItem').removeClass('visually-hidden');
        }
        else {
            $('.transactieOmschrijvingLijstItem').each((ndx, item) => {
                let omschrijving = $(item).find('.transactieOmschrijving').val()
                    .replace(/<[^>]+>/g, '')
                    .replace(/\s+/g, '')
                    .replace('\n', '');

                if (omschrijving.toUpperCase().indexOf(filter) === -1) {
                    $(item).addClass('visually-hidden');
                }
                else {
                    $(item).removeClass('visually-hidden');
                }
            });
        }
    },


    transactieOmschrijvingBewerk: (obj) => {
        TRANSACTIEBEHEEROMSCHRIJVINGEN.toggleControls('bewerk');

        $(obj).parent().find('.transactieOmschrijvingBewerk, .transactieOmschrijvingVerwijder').hide();
        $(obj).parent().find('.transactieOmschrijvingBewaar, .transactieOmschrijvingAnnuleer').show();

        $(obj).parent().find('.transactieOmschrijving').prop('disabled', false);
        TRANSACTIEBEHEEROMSCHRIJVINGEN.omschrijving2update = $(obj).parent().find('.transactieOmschrijving').val();
    },

    transactieOmschrijvingBewaar: (omschrijving) => {
        let frmDta = {
            omschrijving2update: TRANSACTIEBEHEEROMSCHRIJVINGEN.omschrijving2update,
            omschrijving: omschrijving,
            richting:TRANSACTIEBEHEEROMSCHRIJVINGEN.richting
        }

        fetch('/jxTransactiOmschrijvingUpdate', {
            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                'X-CSRF-Token': TRANSACTIEBEHEEROMSCHRIJVINGEN.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then((response) => {
                return response.json()
            })
            .then((res) => {
                if (res.succes) {
                    $('#transactieOmschrijvingZoek').val('');
                    TRANSACTIEBEHEEROMSCHRIJVINGEN.omschrijving2update = '';
                    TRANSACTIEBEHEEROMSCHRIJVINGEN.transactieOmschrijvingenLijstToon(res);
                }
            })
            .catch((err) => {
                console.log(err);
            })
    },

    toggleControls: (mode = '') => {
        // deselecteer alle checkboxes + disable
        $('.transactieOmschrijvingSelecteer').prop('checked', false)
            .prop('disabled', mode == 'nieuw' || mode == 'bewerk');

        // knoppen bewerk, verwijder, bewaar en annuleer
        $('.transactieOmschrijvingBewerk, .transactieOmschrijvingVerwijder').prop('disabled', mode == 'nieuw' || mode == 'bewerk');
        $('.transactieOmschrijvingBewaar, .transactieOmschrijvingAnnuleer').prop('disabled', mode == 'nieuw');

        if (mode != 'bewerk') {
            $('.transactieOmschrijvingBewerk, .transactieOmschrijvingVerwijder').show();
            $('.transactieOmschrijvingBewaar, .transactieOmschrijvingAnnuleer').hide();
        }

        // disable knop nieuw en transactieomschrijvingmerge
        $('#transactieOmschrijvingNieuw').prop('disabled', mode == 'nieuw' || mode == 'bewerk');
        $('#transactieOmschrijvingMerge, .transactieOmschrijvingNaam').prop('disabled', true); querySelector

        // schakel filter functionaliteit uit
        $('#transactieOmschrijvingZoek').val('');
        $('#transactieOmschrijvingZoek, #transactieOmschrijvingFilter, #transactieOmschrijvingZoekAnnuleer').prop('disabled', mode == 'nieuw' || mode == 'bewerk');
    },

    transactieOmschrijvingMerge: () => {
        let omschrijvingen = [];
        $('.transactieOmschrijvingSelecteer:checked').each((ndx, el) => {
            // Find the closest parent div and then find the transactieOmschrijving input within it
            let parentElement = $(el).closest('div');
            let transactieOmschrijvingInput = parentElement.parent().find('.transactieOmschrijving');

            // Get the value of the transactieOmschrijving input field
            let transactieOmschrijvingValue = transactieOmschrijvingInput.val();

            // Push the value to the omschrijvingen array
            omschrijvingen.push(transactieOmschrijvingValue);
        });

        let frmDta = {
            omschrijvingen: omschrijvingen.join(','),
            richting:TRANSACTIEBEHEEROMSCHRIJVINGEN.richting
        }


        fetch('/jxtransactieOmschrijvingenMergeLijst', {
            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                'X-CSRF-Token': TRANSACTIEBEHEEROMSCHRIJVINGEN.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then((response) => {
                return response.json()
            })
            .then((res) => {
                if (res.succes) {
                    TRANSACTIEBEHEEROMSCHRIJVINGEN.transactieOmschrijvingMergeLijst(res);
                }
            })
            .catch((err) => {
                console.log(err);
            })
    },



    transactieOmschrijvingMergeLijst: (res) => {
        let boodschap = {};
        res.boodschap.split(',').forEach(kv => {
            let tmp = kv.split(':');
            boodschap[tmp[0]] = tmp[1];
        });

        MODAAL.kop(boodschap.titel);

        let inhoudTmp = ``;
        res.omschrijvingen.forEach((omschrijving, ndx) => {
            let geselecteerd = ndx == 0 ? 'checked' : '';
            let kleur = omschrijving.aantal == 0 ? 'light' : 'primary';

            inhoudTmp += `
                <li class="list-group-item">
                    <input class="transactieOmschrijvingMerge form-check-input me-1" 
                        type="radio" name="transactieOmschrijvingMerge" id="">
                    ${omschrijving.omschrijving}
                    <span class="badge text-bg-${kleur} rounded-pill float-end me-1">${omschrijving.aantal}</span>
                </li>
            `;
        });

        MODAAL.inhoud(`
            <p>${boodschap.info}</p>
            <ul class="list-group">
                ${inhoudTmp}
            </ul>
        `);

        let voet = ``;
        voet += MODAAL.knop('transactieOmschrijvingMergeOK', 'primary', 'sign-merge-right', boodschap.btnOK);
        voet += MODAAL.knop('verberg', 'secondary', 'x-square', boodschap.btnCa);
        MODAAL.voet(voet);

        MODAAL.toon();
    },

    transactieOmschrijvingMergeUitvoeren: () => {
        let omschrijvingen = [];
        $('.transactieOmschrijvingMerge').each((ndx, el) => {
            let omschrijving = el.nextSibling.nodeValue;
            omschrijvingen.push(omschrijving.trim());
        });
        omschrijvingen = omschrijvingen.join(',');


        let listItem = $('.transactieOmschrijvingMerge:checked');

        let omschrijving2keep = listItem[0].nextSibling.nodeValue.trim();

        let frmDta = {
            omschrijvingen: omschrijvingen,
            omschrijving2keep: omschrijving2keep,
            richting: TRANSACTIEBEHEEROMSCHRIJVINGEN.richting
        }
        fetch('/jxTransactiesOmschrijvingMergeUitvoeren', {
            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                'X-CSRF-Token': TRANSACTIEBEHEEROMSCHRIJVINGEN.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then((response) => {
                return response.json()
            })
            .then((res) => {
                if (res.succes) {
                    TRANSACTIEBEHEEROMSCHRIJVINGEN.transactieOmschrijvingenLijstToon(res);
                    MODAAL.verberg();
                }
            })
            .catch((err) => {
                console.log(err);

            })

    },


    familieAnnuleer: () => {
        if (INHOUDFAMILIE.familieID === 0) {
            $('#familieID_0').remove();
        }

        INHOUDFAMILIE.toggleControls('');
    },

    toggelbuttons: () => {
        $('#togglebuttoninkomsten').toggle();
        $('#togglebuttonuitgaven').toggle();
        TRANSACTIEBEHEEROMSCHRIJVINGEN.richting = $('#togglebuttonuitgaven').css('display') === 'none' ? 'In': 'Uit';
        TRANSACTIEBEHEEROMSCHRIJVINGEN.omschrijvingenLijst(TRANSACTIEBEHEEROMSCHRIJVINGEN.richting);
    }


};

const TRANSACTIEJAAROVERZICHT = {
    csrfToken: $('meta[name="csrf-token"]').attr('content'),
    saldoOverzicht: [],

    init: () => {
        TRANSACTIEJAAROVERZICHT.intitieerSaldoOverzicht();
        $("#financieelMenu").show();
        TRANSACTIEJAAROVERZICHT.toonOverzicht($('#jaarSelectie').val());

        $('body').on('change', '#jaarSelectie', function (evt) { TRANSACTIEJAAROVERZICHT.toonOverzicht($('#jaarSelectie').val()); })
    },

    intitieerSaldoOverzicht: () => {
        for (let i = 1; i <= 13; i++) {
            TRANSACTIEJAAROVERZICHT.saldoOverzicht[i] = 0;
        }

    },

    toonOverzicht: (jaar) => {
        TRANSACTIEJAAROVERZICHT.intitieerSaldoOverzicht();
        let frmDta = {
            jaar: jaar
        }

        fetch('/jxGetTransactieJaarOverzicht', {
            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                'X-CSRF-Token': STATISTIEK.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => {
            return response.json();
        }).then(res => {
            if (res.succes) {
                TRANSACTIEJAAROVERZICHT.transactieJaarOverzichtTabel(res.inkomsten, res.jaar, 'inkomstenTabel');
                TRANSACTIEJAAROVERZICHT.transactieJaarOverzichtTabel(res.uitgaven, res.jaar, 'uitgavenTabel');
                TRANSACTIEJAAROVERZICHT.jaarOverzichtSaldo(TRANSACTIEJAAROVERZICHT.saldoOverzicht, res.jaar, 'saldoTabel');


            }
        }).catch(err => {
            console.log(err);
        });
    },

    transactieJaarOverzichtTabel: (res, jaar, tabelOmTeGebruiken) => {

        const table2use = document.getElementById(tabelOmTeGebruiken);
        //$(table2use).empty();
        const data = res;


        // Extract unique omschrijvingen and periodes
        const omschrijvingen = [...new Set(data.map(item => item.omschrijving))];
        const periodes = [...new Set(data.map(item => item.periode))];

        // Create table2use header
        let omschrijving = tabelOmTeGebruiken === 'inkomstenTabel' ? 'Inkomsten' : 'Uitgaven';
        let idx = 0;
        let thead = `<thead><tr><th class="omschrijving">${omschrijving}</th>`;
        periodes.forEach(periode => {
            idx++;
            thead += `<th class="periode">${periode}</th>`;
        });
        for (let i = idx + 1; i <= 12; i++) {
            let periode = '0' + i;
            let jaar2use = periode.trim().slice(-2) + '-' + jaar;
            thead += `<th class="periode">${jaar2use}</th>`;
        }
        thead += `<th class="periode">TOTAAL</th>`;

        thead += '</tr></thead>';

        // Create table2use body
        let tbody = '<tbody>';

        let maandTotaal = [];
        for (let i = 1; i <= 12; i++) {
            maandTotaal[i] = 0;
        }

        omschrijvingen.forEach(omschrijving => {
            idx = 0;
            let jaarTotaal = 0;
            tbody += `<tr><td class="omschrijving">${omschrijving}</td>`;
            periodes.forEach(periode => {
                idx++;
                const bedrag = data.find(item => item.omschrijving === omschrijving && item.periode === periode)?.bedrag || '';
                tbody += `<td class="bedrag">${bedrag}</td>`;
                if (bedrag.length) {
                    jaarTotaal += parseFloat(bedrag);
                    maandTotaal[idx] += parseFloat(bedrag);
                    if (tabelOmTeGebruiken === 'inkomstenTabel') {
                        TRANSACTIEJAAROVERZICHT.saldoOverzicht[idx] += parseFloat(bedrag);
                    }
                    else {
                        TRANSACTIEJAAROVERZICHT.saldoOverzicht[idx] -= parseFloat(bedrag);

                    }

                }
            });

            for (let i = idx + 1; i <= 12; i++) {
                tbody += `<td class="bedrag"></td>`;
            }
            tbody += `<td class="bedrag">${jaarTotaal.toFixed(2)}</td>`;

            tbody += '</tr>';
        });


        tbody += '</tbody>';

        let tfooter = '<tr><td class="omschrijving">TOTAAL</td>';
        let maandBedrag = 0;
        let jaarBedrag = 0;
        for (let i = 1; i <= 12; i++) {
            if (isNaN(maandTotaal[i])) {
                maandBedrag = '';
            }
            else {
                maandBedrag = maandTotaal[i].toFixed(2);
                jaarBedrag += maandTotaal[i];
            }
            tfooter += `<td class="bedrag">${maandBedrag}</td>`;
        };
        tfooter += `<td class="bedrag">${jaarBedrag.toFixed(2)}</td>`;
        tfooter += '</tr>';

        // Set table content
        $(table2use).html(thead + tbody + tfooter);
    },

    jaarOverzichtSaldo: (res, jaar, tabelOmTeGebruiken) => {
        const table2use = document.getElementById(tabelOmTeGebruiken);
        $(table2use).empty();
        const data = res;

        // Create table2use header
        let idx = 0;
        let thead = '<thead><tr><th class="omschrijving"></th>';
        for (let i = idx + 1; i <= 12; i++) {
            let periode = '0' + i;
            let jaar2use = periode.trim().slice(-2) + '-' + jaar;
            thead += `<th class="periode">${jaar2use}</th>`;
        }
        thead += `<th class="periode">TOTAAL</th>`;

        thead += '</tr></thead>';

        let tbody = '<tbody>';
        tbody += `<tr><td class="omschrijving">Resultaat</td>`;
        let saldo = 0
        for (let i = 1; i <= 12; i++) {
            tbody += `<td class="bedrag">${TRANSACTIEJAAROVERZICHT.saldoOverzicht[i].toFixed(2)}</td>`;
            saldo += TRANSACTIEJAAROVERZICHT.saldoOverzicht[i]
        }
        tbody += `<td class="bedrag">${saldo.toFixed(2)}</td>`;

        $(table2use).html(thead + tbody);
    }

};

const STATISTIEK = {
    maanden: ['jan', 'feb', 'maa', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],

    csrfToken: $('meta[name="csrf-token"]').attr('content'),
    // togglestatus
    jaarToggleStatus: false,
    categorieToggleStatus: false,

    init: () => {
        // toon het financ*ieel menu
        $("#financieelMenu").show();

        // toggle
        $('body').on('click', '#statistiekJaarToggle', STATISTIEK.jaarToggle);
        $('body').on('click', '#statistiekCategorieToggle', STATISTIEK.categorieToggle);

        // toon
        $('body').on('click', '#statistiekToon', STATISTIEK.toon);
        // sluit modaal venster
        $('body').on('click', '#statistiekAnnuleer', STATISTIEK.annuleer);

        STATISTIEK.laadParameters();

    },

    laadParameters: () => {
        let frmDta = {}
        fetch('/jxGetStatistiekParameters', {
            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                'X-CSRF-Token': STATISTIEK.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => {
            return response.json();
        }).then(res => {
            if (res.succes) {
                STATISTIEK.toonParamaters(res);
            }
        }).catch(err => {
            console.log(err);
        });
    },

    toonParamaters: (res) => {

        if (res.categorieen.length === 0) {
            $('#statistiekOpties').append(
                $('<div>').addClass('alert alert-info').append(
                    $('<h4>').addClass('alert-heading')
                        .text('Geen opties beschikbaar voor geselecteerde rekening...')
                )
            );
        }
        else {
            // weergave
            let weergave = $('<div>').addClass('col-lg-4');

            weergave.append($('<h4>').text('Weergave'));
            weergave.append($('<hr>'));

            // overzicht per maand
            $(weergave).append($('<div>').addClass('form-check')
                .append($('<input>').prop('type', 'checkbox').addClass('form-check-input')
                    .prop('id', 'statistiekToonMaand').prop('checked', true))
                .append($('<label>').prop('for', 'statistiekToonMaand')
                    .addClass('form-check-label').text('weergave per maand'))
            );

            // weergave items
            $(weergave).append($('<div>').addClass('form-check')
                .append($('<input>').prop('type', 'checkbox').addClass('form-check-input')
                    .prop('id', 'statistiekToonItems').prop('checked', true))
                .append($('<label>').prop('for', 'statistiekToonItems')
                    .addClass('form-check-label').text('weergave items'))
            );

            // met gemiddelde
            $(weergave).append($('<div>').addClass('form-check')
                .append($('<input>').prop('type', 'checkbox').addClass('form-check-input')
                    .prop('id', 'statistiekToonMean').prop('checked', true))
                .append($('<label>').prop('for', 'statistiekToonMean')
                    .addClass('form-check-label').text('weergave gemiddelde'))
            );

            // met som
            $(weergave).append($('<div>').addClass('form-check')
                .append($('<input>').prop('type', 'checkbox').addClass('form-check-input')
                    .prop('id', 'statistiekToonSom').prop('checked', true))
                .append($('<label>').prop('for', 'statistiekToonSom')
                    .addClass('form-check-label').text('weergave totaal'))
            );

            weergave.append($('<hr>'));

            // weergave getallen
            $(weergave).append($('<div>').addClass('form-check')
                .append($('<input>').prop('type', 'checkbox').addClass('form-check-input')
                    .prop('id', 'statistiekToonCijfers').prop('checked', true))
                .append($('<label>').prop('for', 'statistiekToonCijfers')
                    .addClass('form-check-label').text('weergave waarden'))
            );

            // weergave grafiek
            $(weergave).append($('<div>').addClass('form-check')
                .append($('<input>').prop('type', 'checkbox').addClass('form-check-input')
                    .prop('id', 'statistiekToonGrafiek').prop('checked', true))
                .append($('<label>').prop('for', 'statistiekToonGrafiek')
                    .addClass('form-check-label').text('weergave grafiek'))
            );

            weergave.append($('<hr>'));

            weergave.append($('<button>').prop('type', 'button')
                .addClass('w-100 btn btn-primary').prop('id', 'statistiekToon')
                .html('<i class="bi bi-graph-up"></i> Toon')
            );

            $('#statistiekOpties').append(weergave);

            // jaren
            let jaren = $('<div>').addClass('col-lg-4');

            jaren.append($('<h4>').text('Jaren'));
            jaren.append($('<hr>'));

            // toggle jaren
            $(jaren).append(
                $('<button>').prop('type', 'button').prop('id', 'statistiekJaarToggle')
                    .addClass('btn btn-outline-primary mb-5')
                    .html('<i class="bi bi-toggles"></i> Toggle jaren')
            );

            // checkboxes met jaren
            res.jaren.forEach((jaar, ndx) => {
                $(jaren).append(
                    $('<div>').addClass('form-check')
                        .append(
                            $('<input>').prop('type', 'checkbox').addClass('form-check-input statistiekJaar')
                                .prop('value', jaar.jaar).prop('id', `statistiekJaar_${ndx}`)
                        )
                        .append(
                            $('<label>').prop('for', `statistiekJaar_${ndx}`).addClass('form-check-label')
                                .text(jaar.jaar)
                        )
                );
            });

            $('#statistiekOpties').append(jaren);



            // categorieen
            let categorieen = $('<div>').addClass('col-lg-4');

            categorieen.append($('<h4>').text('Categorieen'));
            categorieen.append($('<hr>'));

            // toggle categorieen
            $(categorieen).append(
                $('<button>').prop('type', 'button').prop('id', 'statistiekCategorieToggle')
                    .addClass('btn btn-outline-primary mb-5')
                    .html('<i class="bi bi-toggles"></i> Toggle categorieen')
            );

            // checkboxes met categorieen
            $(categorieen).append(
                $('<div>').addClass('form-check')
                    .append(
                        $('<input>').prop('type', 'checkbox').addClass('form-check-input statistiekCategorie')
                            .prop('value', 0).prop('id', `statistiekCategorie_0`)
                    )
                    .append(
                        $('<label>').prop('for', `statistiekCategorie_0`).addClass('form-check-label')
                            .text('geen categorie')
                    )
            );

            res.categorieen.forEach((categorie, ndx) => {
                $(categorieen).append(
                    $('<div>').addClass('form-check')
                        .append(
                            $('<input>').prop('type', 'checkbox').addClass('form-check-input statistiekCategorie')
                                .prop('value', categorie.categorie_id).prop('id', `statistiekCategorie_${ndx + 1}`)
                        )
                        .append(
                            $('<label>').prop('for', `statistiekCategorie_${ndx + 1}`).addClass('form-check-label')
                                .text(categorie.omschrijving)
                        )
                );
            });

            $('#statistiekOpties').append(categorieen);
        }




    },


    jaarToggle: () => {
        STATISTIEK.jaarToggleStatus = !STATISTIEK.jaarToggleStatus;
        $('.statistiekJaar').prop('checked', STATISTIEK.jaarToggleStatus);
    },

    categorieToggle: () => {
        STATISTIEK.categorieToggleStatus = !STATISTIEK.categorieToggleStatus;
        $('.statistiekCategorie').prop('checked', STATISTIEK.categorieToggleStatus);
    },

    toon: () => {

        // verzamel geselecteerde jaren
        let jaren = [];
        $('.statistiekJaar:checked').each((ndx, el) => {
            jaren.push($(el).val());
        });

        // verzamel geselecteerde categorieen
        let categorieen = [];
        $('.statistiekCategorie:checked').each((ndx, el) => {
            categorieen.push($(el).val());
        });

        // weergave in maanden
        let maanden = $('#statistiekToonMaand:checked').length;
        // weergave in items
        let items = $('#statistiekToonItems:checked').length;
        // weergave in gemiddelde
        let gemiddelde = $('#statistiekToonMean:checked').length;
        // weergave in som
        let som = $('#statistiekToonSom:checked').length;
        // weergave in cijfers
        let cijfers = $('#statistiekToonCijfers:checked').length;
        // weergave in grafiek
        let grafiek = $('#statistiekToonGrafiek:checked').length;

        if (!(cijfers || grafiek) || jaren.length == 0 || categorieen.length == 0) {
            MODAAL.grootte('');
            MODAAL.kop('statistiek');
            MODAAL.inhoud('Onvoldoende opties geselecteerd om weer te geven...');
            MODAAL.voet(MODAAL.knop('statistiekAnnuleer', 'primary', 'x-square', 'Ok'));
            MODAAL.toon();
            return;
        }

        let frmDta = {
            'maanden': STATISTIEK.maanden,
            'items': items,
            'gemiddelde': gemiddelde,
            'som': som,
            'cijfers': cijfers,
            'grafiek': grafiek,
            'jaren': jaren.join(','),
            'categorieen': categorieen.join(',')
        }
        // todo
        MODAAL.kop('Statistiek');
        MODAAL.spinner('<p>Even geduld... De gevraagde gegevens worden opgehaald</p>');
        MODAAL.toon();

        fetch('/jxStatistiekToon', {
            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                'X-CSRF-Token': STATISTIEK.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => {
            return response.json();
        }).then(res => {
            if (res.succes) {
                STATISTIEK.toonSucces(res);
            }
            else {
                MODAAL.verberg();
            }

        }).catch(err => {
            console.log(err);
        });
    },


    toonSucces: (res) => {

        let gemiddelde = $('#statistiekToonMean:checked').length > 0;
        let som = $('#statistiekToonSom:checked').length > 0;

        // tabbladen genereren
        let html = '';
        html += '<nav class="mb-4">';
        html += '<div id="nav-tab" class="nav nav-tabs" role="tablist">';
        if (res.cijfers) {
            html += `<button
                                    class="nav-link active"
                                    id="nav-cijfers-tab"
                                    data-bs-toggle="tab"
                                    data-bs-target="#nav-waarden"
                                    type="button"
                                    role="tab"
                                    aria-selected="true">Waarden</button>`;
        }
        if (res.grafiek) {
            html += `<button
                                    class="nav-link"
                                    id="nav-grafiek-tab"
                                    data-bs-toggle="tab"
                                    data-bs-target="#nav-grafiek"
                                    type="button"
                                    role="tab"
                                    aria-selected="false">Grafiek</button>`;
        }
        html += '</div>';
        html += '</nav>';

        // tabcontent genereren
        html += '<div id="nav-tabContent" class="tab-content">';
        if (res.cijfers) {
            html += `
                        <div class="tab-pane fade show active"
                        id="nav-waarden"
                        role="tabpanel"
                        aria-labelledby="nav-cijfers-tab"
                        tabindex="0">
                    `;
            html += '<div class="statistiekScroll">';
            html += STATISTIEK.toonCijfers(res.rslt);
            html += '</div>';
            html += '</div>';
        }
        if (res.grafiek) {
            html += `
                        <div class="tab-pane fade show"
                        id="nav-grafiek"
                        role="tabpanel"
                        aria-labelledby="nav-grafiek-tab"
                        tabindex="1">
                    `;
            html += '<div class="statistiekScroll">';
            if (gemiddelde || som) {
                html += `<canvas id="statistiekGrafiek" 
                                        style="width:100%; max-width:100%;"></canvas>`
            } else {
                html += `<div class="alert alert-warning">
                                            <h3>Grafiek kan enkel gemiddelde en totalen weergeven</h3>
                                        </div`
            }
            html += '</div>';
            html += '</div>';
        }
        html += '</div>';

        MODAAL.verberg();
        MODAAL.grootte('modal-xl');
        MODAAL.kop('Statistiek');
        MODAAL.inhoud(html);
        MODAAL.voet(MODAAL.knop('statistiekAnnuleer', 'primary', 'check-square', 'Sluit'));
        MODAAL.toon();

        if (res.grafiek) STATISTIEK.toonGrafiek(res.rslt);


    },

    toonCijfers: (rslt) => {
        let maanden = $('#statistiekToonMaand:checked').length > 0;
        let items = $('#statistiekToonItems:checked').length > 0;
        let gemiddelde = $('#statistiekToonMean:checked').length > 0;
        let som = $('#statistiekToonSom:checked').length > 0;

        let jaar = 0;
        let maand = 0;
        let bedragen = [];

        let html = ``;
        rslt.forEach(dta => {
            // nieuw jaar
            if (dta.jaar != jaar) {
                // gemiddlede/som per jaar indien niet gegroepeerd in maanden
                if (!maanden && bedragen.length > 0) {
                    html += STATISTIEK.toonCijfersGS(gemiddelde, som, bedragen);
                    bedragen = [];
                }
                // gemiddelde/som per maand indien gegroepeerd op maand
                if (maanden && bedragen.length > 0) {
                    html += STATISTIEK.toonCijfersGS(gemiddelde, som, bedragen);
                    bedragen = [];
                }
                // toon jaar
                jaar = dta.jaar;
                html += `<h3 class="bg-primary text-white">${jaar}</h3>`;
            }

            // nieuw maand
            if (maanden & dta.maand != maand) {
                // toon gemiddelde/som per maand
                if (bedragen.length > 0) {
                    html += STATISTIEK.toonCijfersGS(gemiddelde, som, bedragen);
                    bedragen = [];
                }
                // toon maand
                maand = dta.maand;
                html += `<h4 class="bg-primary text-white bg-opacity-50">
                        ${STATISTIEK.maanden[maand - 1]}</h4>`;
            }
            // Items
            if (items) {
                html += `<p class="statistiekLijn">
                            <span class="statistiekLinks">${dta.omschrijving}</span>
                            <span class="statistiekRechts">&euro;${dta.bedrag}</span>
                        </p>`
            }
            // Bedragen
            bedragen.push(parseFloat(dta.bedrag));
        });

        // gemiddelde/som per maand indien gegroepeerd op maand
        if (maanden & bedragen.length > 0) {
            html += STATISTIEK.toonCijfersGS(gemiddelde, som, bedragen);
            bedragen = [];
        }
        return html;
    },

    toonCijfersGS: (gemiddelde, som, bedragen) => {
        let html = ``;
        // js.reduce : loops to add nums in array
        if (gemiddelde) {
            let tmp = bedragen.reduce((a, b) => { return a + b; }, 0);
            tmp = Math.round(tmp / bedragen.length, 2);
            html += `<p class="statistiekLijn gemiddelde">
                        <span class="statistiekLinks">Gemiddelde</span>
                        <span class="statistiekRechts">&euro;${tmp}</span>
                    </p>`
        }
        if (som) {
            let tmp = bedragen.reduce((a, b) => { return a + b; }, 0);
            tmp = Math.round(tmp, 2);
            html += `<p class="statistiekLijn som">
                        <span class="statistiekLinks">Som</span>
                        <span class="statistiekRechts">&euro;${tmp}</span>
                    </p>`
        }
        return html;
    },

    toonGrafiek: (rslt) => {
        let gemiddelde = $('#statistiekToonMean:checked').length > 0;
        let som = $('#statistiekToonSom:checked').length > 0;

        if (!(gemiddelde || som)) return;

        let maanden = $('#statistiekToonMaand:checked').length > 0;

        let jaar = 0;
        let maand = 0;
        let bedragen = [];

        let xWaarden = [];
        let yWaardenGemiddelde = [];
        let yWaardenSom = [];

        rslt.forEach(dta => {
            // nieuw jaar
            if (dta.jaar != jaar) {
                // gemiddlede/som per jaar indien niet gegroepeerd in maanden
                if (!maanden && bedragen.length > 0) {
                    let tmp = STATISTIEK.toonGrafiekGS(bedragen);
                    yWaardenGemiddelde.push(tmp[0]);
                    yWaardenSom.push(tmp[1]);
                    bedragen = [];
                }
                // gemiddelde/som per maand indien gegroepeerd op maand
                if (maanden && bedragen.length > 0) {
                    let tmp = STATISTIEK.toonGrafiekGS(bedragen);
                    yWaardenGemiddelde.push(tmp[0]);
                    yWaardenSom.push(tmp[1]);
                    bedragen = [];
                }
                // toon jaar
                jaar = dta.jaar;
                // jaar toevoegen aan labels xWaarden
                if (!maanden) { xWaarden.push(jaar); }
            }

            // nieuw maand
            if (maanden & dta.maand != maand) {
                // toon gemiddelde/som per maand
                if (bedragen.length > 0) {
                    let tmp = STATISTIEK.toonGrafiekGS(bedragen);
                    yWaardenGemiddelde.push(tmp[0]);
                    yWaardenSom.push(tmp[1]);
                    bedragen = [];
                }
                // toon maand
                maand = dta.maand;
                xWaarden.push(`${maand}-${jaar}`);
            }
            // Bedragen
            bedragen.push(parseFloat(dta.bedrag));
        });

        // gemiddelde/som per maand indien gegroepeerd op maand
        if (maanden & bedragen.length > 0) {
            let tmp = STATISTIEK.toonGrafiekGS(bedragen);
            yWaardenGemiddelde.push(tmp[0]);
            yWaardenSom.push(tmp[1]);
            bedragen = [];
        }
        bedragen = [];

        // --- grafiek
        let renderDta = [];
        if (gemiddelde) {
            renderDta.push({
                label: 'Gemiddelde',
                type: 'line',
                data: yWaardenGemiddelde
            });
        }
        if (som) {
            renderDta.push({
                label: 'Som',
                type: 'bar',
                data: yWaardenSom
            });
        }

        new Chart('statistiekGrafiek', {
            type: 'line',
            data: {
                labels: xWaarden,
                datasets: renderDta
            },
            options: {}
        })
    },

    toonGrafiekGS: (bedragen) => {
        // js.reduce : loops to add nums in array
        let gemiddelde = bedragen.reduce((a, b) => { return a + b; }, 0);
        gemiddelde = Math.round(gemiddelde / bedragen.length, 2);

        let som = bedragen.reduce((a, b) => { return a + b; }, 0);
        som = Math.round(som, 2);
        return [gemiddelde, som];
    },


    annuleer: () => { MODAAL.verberg(); },

}

const SAMENVATTING = {
    csrfToken: $('meta[name="csrf-token"]').attr('content'),

    init: () => {
        // toon het financ*ieel menu
        $("#financieelMenu").show();
        SAMENVATTING.laadOverzicht();
    },

    laadOverzicht: () => {
        let frmDta = {};

        fetch('/jxLaadOverzicht', {
            method: 'post',
            body: JSON.stringify({ 'frmDta': frmDta }),

            headers: {
                'X-CSRF-Token': TRANSACTIES.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => {
            return response.json();
        }).then(res => {
            if (res.succes) {
                SAMENVATTING.toonOverzicht(res);
            }
        }).catch(err => {
            console.log(err);
        })


    },

    toonOverzicht: (res) => {

        var tableContainer = document.getElementById("tableContainer");
        var table = document.createElement("table");

        // Create table header
        var headerRow = table.insertRow();

        var headerCell = headerRow.insertCell();
        headerCell.classList.add("eerste-kolom");
        headerCell.innerHTML = "<th>Rekening</th>";

        for (var i = 0; i < res.periode.length; i++) {
            var maand = res.periode[i];

            headerCell = headerRow.insertCell();
            headerCell.innerHTML = "<th>" + maand.periode + "</th>";
        }

        res.standen.forEach(rekening => {
            var dataRow = table.insertRow();
            let idx = 0;
            for (let key in rekening) {
                if (idx >= 1) {
                    if (rekening.hasOwnProperty(key)) {
                        var cell = dataRow.insertCell();
                        cell.innerHTML = rekening[key];
                    }
                }
                idx += 1;

            }
        });

        var footerRow = table.insertRow();
        var footerCell = footerRow.insertCell();
        footerCell.innerHTML = "Totaal";




        // for (var omschrijving in data.data) {

        //     for (var periode in data.data[omschrijving]) {
        //         cell = row.insertCell();
        //         cell.innerHTML = data.data[omschrijving][periode];
        //     }
        //}

        for (var i = 0; i < res.totaal.length; i++) {
            var maand = res.totaal[i];
            footerCell = footerRow.insertCell();
            footerCell.innerHTML = maand.totaal;

        }
        tableContainer.appendChild(table);

    },

}

const REKENINGEN = {

    csrfToken: $('meta[name="csrf-token"]').attr('content'),


    init: () => {
        // REKENINGEN
        $("#financieelMenu").show();
        REKENINGEN.sorteerInit()
        $('.transactieOverzicht').on('click', function (evt) {
            REKENINGEN.loadTransacties($(this).attr('id').split('_')[1]);
        });
    },

    loadTransacties: (rid) => {

        location.href = "/transactieOverzicht/" + rid;
    },

    sorteerInit:() => {
        if ($('#rekeningOverzichtLijst li').length < 2) {
            $('.rekeningOverzichtSorteer').hide();
            return;
        }

        $('#rekeningOverzichtLijst').sortable({
            axis: 'y',
            handle: '.rekeningOverzichtSorteer',
            cursor: 'grab',
            stop: function(ui, evt) {
                REKENINGEN.sorteer();
            }
        })
    },

    sorteer:() => {
        let lijst = [];
        let vnLijst = [];
        let idLijst = [];
        $('.rekeningOverzichtSorteer').each((ndx, el) => {
            vnLijst.push($(el).closest('li').data('vnr'));
            idLijst.push($(el).closest('li').data('rid'));
        });
        vnLijst.sort((a,b) => {return a-b;});

        vnLijst.forEach((vnr, ndx) => {
            lijst.push(`${vnr},${idLijst[ndx]}`);
        });

        let frmDta = {
            'lijst': lijst.join('|')
        };

        fetch('/jxRekeningOverzichtSorteer', {
            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                'X-CSRF-Token': REKENINGEN.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => {
            return response.json();
        }).then(res => {
            if (res.succes) {
                REKENINGEN.sorteerSucces();

            }
        }).catch(err => {
            console.log(err);
        })
    },

    sorteerSucces: () => {
        window.location.reload();
    },
}


const TRANSACTIES = {
    csrfToken: $('meta[name="csrf-token"]').attr('content'),
    categorien: [],
    boodschappenBewaar: [],
    boodschappenActies: [],
    boodschappenVerwijder: [],
    lijstofzoek: 'lijst',


    init: async () => {
        try {
            // ophalen boodschappen
            // TRANSACTIES.getBoodschappen();

            // ophalen categorien
            TRANSACTIES.getCategorien();

            // Now that getCategorien has finished, proceed with other actions
            TRANSACTIES.lijstTransacties(0);
            TRANSACTIES.detailPanel();
            $("#financieelMenu").show();

        } catch (error) {
            // handle any errors
            console.error('An error occurred:', error);
        }



        //paginering
        $('#overzichtTransacties').on('click', '#paginering a', function (evt) {
            TRANSACTIES.lijstTransacties($(this).data('pagina'));
        });

        $('#overzichtTransacties').on('click', '.transactieBewerk', function (evt) {
            TRANSACTIES.transactieBewerk($(this).attr('id').split('_')[1], 'bewerk');
        });

        $('#overzichtTransacties').on('click', '.transactieDupliceer', function (evt) {
            TRANSACTIES.transactieBewerk($(this).attr('id').split('_')[1], 'dupliceer');
        });

        $('#overzichtTransacties').on('click', '.transactieVerwijder', function (evt) {
            TRANSACTIES.transactieBewerk($(this).attr('id').split('_')[1], 'verwijder');
        });

        $('body').on('click', '#transactieBewaren', function (evt) {
            TRANSACTIES.transactieBewaar();
        });

        $('body').on('click', '#detailsLeegmaken', function (evt) {
            TRANSACTIES.lijstofzoek = 'lijst';
            TRANSACTIES.lijstTransacties(0);
            TRANSACTIES.detailsLeegmaken();
        });

        //transactie verwijderen
        $('body').on('click', '#verwijder', function (evt) {
            TRANSACTIES.verwijderTransactie($('#transactieIDverwijder').val());
        })

        //transacties zoeken
        $('body').on('click', '#transactiesZoeken', () => {
            TRANSACTIES.lijstofzoek = 'zoeken';
            TRANSACTIES.lijstTransacties(0);
        })

        // verberg modaal venster
        $('body').on('click', '#verberg', () => {
            TRANSACTIES.verberg()
        });

        //datum selectors

        $('body').on('click', '.volgende', function (evt) { TRANSACTIES.pasdatumaan(1) });
        $('body').on('click', '.vorige', function (evt) { TRANSACTIES.pasdatumaan(-1) });


    },

    lijstTransacties: (pagina) => {
        let frmDta = {};
        if (TRANSACTIES.lijstofzoek == 'zoeken') {
            frmDta = {
                'rekeningID': $("#rekeningID").text().trim(),
                'categorie': $('#categorie').val().toLowerCase(),
                'omschrijving': $('#omschrijving').val().toLowerCase(),
                'bedrag': $('#bedrag').val(),
                'pagina': pagina,
                'lijstofzoek': TRANSACTIES.lijstofzoek
            };
        }
        else {
            frmDta = {
                'rekeningID': $("#rekeningID").text().trim(),
                'pagina': pagina,
                'lijstofzoek': TRANSACTIES.lijstofzoek
            };

        }

        fetch('/jxLijstTransacties', {
            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                'X-CSRF-Token': TRANSACTIES.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => {
            return response.json();
        }).then(res => {
            if (res.succes) {
                TRANSACTIES.toonLijst(res);

                // bewaar
                res.bewaar.split(',').forEach(boodschap => {
                    let tmp = boodschap.split(':');
                    TRANSACTIES.boodschappenBewaar[tmp[0]] = tmp[1];

                });
                // acties
                res.acties.split(',').forEach(boodschap => {
                    let tmp = boodschap.split(':');
                    TRANSACTIES.boodschappenActies[tmp[0]] = tmp[1];

                });
                // verwijder
                res.verwijder.split(',').forEach(boodschap => {
                    let tmp = boodschap.split(':');
                    TRANSACTIES.boodschappenVerwijder[tmp[0]] = tmp[1];

                });

                //paginering
                if (res.aantalpaginas > 0) {

                    $('#overzichtTransacties').append(
                        $('<div>').css('text-align', 'center')
                            .append(PAGINERING.pagineer(res.pagina, res.knoppen, res.aantalpaginas))
                    );
                }

                if (TRANSACTIES.lijstofzoek == 'lijst') TRANSACTIES.toonRekeningInfo(res);

            }
        }).catch(err => {
            console.log(err);
        })
    },

    detailPanel: () => {

        let boodschappen = TRANSACTIES.boodschappenActies;

        let details = $('#transactieDetails');

        // Create a new date object
        let currentDate = new Date();
        // Format the date as yyyy-mm-dd
        let date2use = formatDate(currentDate);


        fetch('/jxTransactieBoodschappen', {
            method: 'post',
            body: new FormData(),
            headers: {
                "X-CSRF-Token": TRANSACTIES.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            return response.json()
        }).then((res) => {
            if (res.succes) {
                // bewaar
                res.bewaar.split(',').forEach(boodschap => {
                    let tmp = boodschap.split(':');
                    TRANSACTIES.boodschappenBewaar[tmp[0]] = tmp[1];

                });
                // acties
                res.acties.split(',').forEach(boodschap => {
                    let tmp = boodschap.split(':');
                    TRANSACTIES.boodschappenActies[tmp[0]] = tmp[1];

                });
                // verwijder
                res.verwijder.split(',').forEach(boodschap => {
                    let tmp = boodschap.split(':');
                    TRANSACTIES.boodschappenVerwijder[tmp[0]] = tmp[1];

                });


                let inhoud = `

        <div id="actieTitel" class="card-titel"><h5><strong>${boodschappen.nieuw}</strong></h5></div>
        <div class="mb-3">

            <label for="datum">Datum</label>
            <div class="d-flex div_transactiedatum">
                                        

                    <button class="btn btn-primary vorige" style="height:32px;"><i class="bi bi-chevron-double-left"></i></button>
                    <input type="date" class="form-control transactiedatum mb-1" id="datum" value="${date2use}"></input>
                    <button class="btn btn-primary volgende" style="height:32px;"><i class="bi bi-chevron-double-right"></i></button>
       

            </div>
            <div>
                <label for="categorie class="mb-1">Categorie: </label><br>
                <input id="categorie" class="mb-1" style="width:350px;"></input><br>
            </div>
     
            <div>
                <label for="omschrijving" class="mb-1">Omschrijving: </label>
                <input id="omschrijving" class="mb-1" style="width:350px;"></input><br>
            </div>
                <span class="mb-3>
                    <label for="bedrag mb-1">Bedrag: </label>
                    <input id="bedrag" style="width:150px;"></input><br></br>
                </span>
                <span class="mb-3>
                    <label for="id mb-1">Transactie ID: </label>
                    <input id="id" disabled="disabled" style="width:60px;" value="0"></input><br>
                </span>
            
        </div>
        <div class="btn-group mr-2" role="group">
              <button class="btn btn-primary" id="transactieBewaren"><i class="bi bi-save"></i> &nbsp;Bewaren</button>
            <button class="btn btn-warning" id="detailsLeegmaken"><i class="bi bi-recycle"></i> &nbsp;Leegmaken</button>    
            <button class="btn btn-info" id="transactiesZoeken"><i class="bi bi-search"></i> &nbsp;Zoeken</button>    
            
        </div>
  
    
        `;
                $(details).html(inhoud);
            }
        }).catch((err) => {
            console.log(err);
        });
    },

    toonLijst: (res) => {
        let inhoudContainer = $('<div>').addClass('card card-body mb-3');

        let lijst = $('<table class="table transactietabel">');
        lijst.append($('<thead>').append($('<tr>')
            .append($('<th>').html('Datum'))
            .append($('<th>').html('Categorie'))
            .append($('<th>').html('Omschrijving'))
            .append($('<th>').html('Bedrag'))
            .append($('<th>').html(''))
        ));

        let tbody = $('<tbody>');

        res.transacties.forEach(transactie => {
            let tr = $('<tr>');
            tr.append($('<td>').html(transactie.weergavedatum))
                .append($('<td>').html(transactie.omschrijving))
                .append($('<td>').html(transactie.detail))
                .append($('<td>').html(transactie.bedrag))
                .append($('<td>').append($('<div>').addClass('btn-group mr-2').attr('role', 'group')
                    .append($('<button>').addClass('btn btn-primary transactieBewerk').prop('id', 'tid_' + transactie.id).append($('<i>').addClass('bi bi-pencil')))
                    .append($('<button>').addClass('btn btn-warning transactieDupliceer').prop('id', 'tid_' + transactie.id).append($('<i>').addClass('bi bi-stack')))
                    .append($('<button>').addClass('btn btn-danger transactieVerwijder').prop('id', 'tid_' + transactie.id).append($('<i>').addClass('bi bi-scissors')))
                ));

            tbody.append(tr);
        });

        lijst.append(tbody);
        $('#overzichtTransacties').html(inhoudContainer.html(lijst));


    },

    transactieBewerk: (id, mode) => {
        let frmDta = {
            'id': id,
            'mode': mode
        }

        fetch('/jxGetTransactie', {
            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                'X-CSRF-Token': TRANSACTIES.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => {
            return response.json();
        }).then(res => {
            if (res.succes) {

                if (mode == 'verwijder') {
                    let boodschappen = TRANSACTIES.boodschappenVerwijder;
                    MODAAL.grootte('');
                    MODAAL.kop(boodschappen.titel);
                    MODAAL.inhoud(`
                        <div class="alert alert-warning">
                            <strong>
                            Datum : ${res.displaydatum}<br>
                            Categorie : ${res.categorie}<br>
                            Omschrijving : ${res.omschrijving}<br>
                            Bedrag : ${res.bedrag}<br><br>

                            </strong>
                            <h5>${boodschappen.boodschap}</h5>
        
                        <div>  
                        <div style="display:none;">
                        <input id="transactieIDverwijder" value="${res.id}"></input> 
                        </div>
                    `);

                    let voet = '';
                    voet += MODAAL.knop('verwijder', 'danger', 'scissors', boodschappen.btnOk);
                    voet += MODAAL.knop('verberg', 'secondary', 'x-square', boodschappen.btnCa);
                    MODAAL.voet(voet);
                    MODAAL.toon();

                }

                $("#datum").val(res.datum);
                $("#categorie").val(res.categorie);
                $("#omschrijving").val(res.omschrijving);
                $("#bedrag").val(res.bedrag);

                $("#id").val(mode == 'bewerk' ? res.id : 0);
                let boodschappen = TRANSACTIES.boodschappenActies;
                $("#actieTitel").html(mode == 'bewerk' ? '<h5><strong>' + boodschappen.bewerk + '</strong><h5>' : '<strong>' + boodschappen.dupliceer + '</strong>').addClass('h5');
            }

        }).catch(err => {
            console.log(err);
        })
    },

    transactieBewaar: () => {
        let id = $("#id").val() ? $("#id").val() : 0;
        let desiredDescription = $("#categorie").val();
        let desiredId = 0;
        let richting = 'In';

        $.each(TRANSACTIES.categorien, function (index, item) {
            if (item.omschrijving === desiredDescription) {
                desiredId = parseInt(item.id);
                richting = item.richting

                return false;
            }
        });

        let frmDta = {
            'id': id,
            'datum': $("#datum").val(),
            'categorie': $("#categorie").val(),
            'omschrijving': $("#omschrijving").val(),
            'bedrag': $("#bedrag").val(),
            'rekening_id': $("#rekeningID").html(),
            'categorie_id': desiredId,
            'richting': richting,
        }

        if (TRANSACTIES.transactieBewaarValideer(frmDta)) TRANSACTIES.transactieBewaarBewaar(frmDta);

    },


    transactieBewaarBewaar: (frmDta) => {
        fetch('/jxTransactieBewaar', {
            method: 'post',
            body: JSON.stringify({ 'frmDta': frmDta }),

            headers: {
                'X-CSRF-Token': TRANSACTIES.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => {
            return response.json();
        }).then(res => {
            TRANSACTIES.lijstofzoek = 'lijst';
            TRANSACTIES.transactieBewaarSucces(res);
        }).catch(err => {
            console.log(err);
        })

    },

    transactieBewaarValideer: (frmDta) => {
        let boodschappen = TRANSACTIES.boodschappenBewaar;
        let boodschap = [];
        if (frmDta.categorie.length == 0) boodschap.push(`<li>${boodschappen.categorie}</li>`);
        if (frmDta.omschrijving.length == 0) boodschap.push(`<li>${boodschappen.omschrijving}</li>`);
        if (frmDta.bedrag.length == 0 || parseInt(frmDta.bedrag) == 0) boodschap.push(`<li>${boodschappen.bedrag}</li>`);

        if (boodschap.length == 0) {
            return true;
        }
        else {
            MODAAL.grootte('');
            MODAAL.kop(boodschappen.titel);
            MODAAL.inhoud(`
                <div class="alert alert-warning">
                    <h5>${boodschappen.boodschap}</h5>
                    <ul>
                        ${boodschap.join('')}
                    </ul>
                <div>    
            `);
            MODAAL.voet(MODAAL.knop('verberg', 'secondary', 'x-square', boodschappen.btnCa));
            MODAAL.toon();
            return false;
        }

    },

    transactieBewaarSucces: (res) => {
        TRANSACTIES.lijstTransacties(0);
    },

    verwijderTransactie: (transactieID) => {
        let frmDta = {
            'transactieID': transactieID
        };

        fetch('/jxTransactieVerwijder', {
            method: 'post',
            body: JSON.stringify({ 'frmDta': frmDta }),

            headers: {
                'X-CSRF-Token': TRANSACTIES.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => {
            return response.json();
        }).then(res => {
            if (res.succes) {
                MODAAL.verberg();
                TRANSACTIES.lijstTransacties(0);
            }
        }).catch(err => {
            console.log(err);
        })

    },


    toonRekeningInfo: (res) => {
        let rekeninginfoArray = res.rekeninginfo;
        // Check if rekeninginfoArray is not empty and the first element has the referentie property
        if (rekeninginfoArray.length > 0 && rekeninginfoArray[0].referentie !== undefined) {
            let rekeninginfo = rekeninginfoArray[0];
            //rekeninginfo 
            let details = $('#rekeningInfo');
            details.empty();
            let inhoud = `
                <h5>${rekeninginfo.omschrijving} (&euro; ${res.rekeningsaldo})</h5>
                ${rekeninginfo.referentie}
            `;
            details.html(inhoud);
        } else {
            console.log("rekeninginfo or rekeninginfo[0].referentie is undefined");
        }
    },

    getBoodschappen: () => {
        fetch('/jxTransactieBoodschappen', {
            method: 'post',
            body: new FormData(),
            headers: {
                "X-CSRF-Token": TRANSACTIES.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            return response.json()
        }).then((res) => {
            if (res.succes) {
                // bewaar
                res.bewaar.split(',').forEach(boodschap => {
                    let tmp = boodschap.split(':');
                    TRANSACTIES.boodschappenBewaar[tmp[0]] = tmp[1];

                });
                // acties
                res.acties.split(',').forEach(boodschap => {
                    let tmp = boodschap.split(':');
                    TRANSACTIES.boodschappenActies[tmp[0]] = tmp[1];

                });
                // verwijder
                res.verwijder.split(',').forEach(boodschap => {
                    let tmp = boodschap.split(':');
                    TRANSACTIES.boodschappenVerwijder[tmp[0]] = tmp[1];

                });
            }
        }).catch((err) => {
            console.log(err);
        });
    },


    getCategorien: () => {
        let frmDta = {};
        fetch('/jxGetCategorien', {
            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                'X-CSRF-Token': TRANSACTIES.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => {
            return response.json();
        }).then(res => {
            TRANSACTIES.categorien = [];
            $.each(res.categorien, function (idx, categorie) {
                TRANSACTIES.categorien.push({
                    id: categorie.id,
                    omschrijving: categorie.omschrijving,
                    richting: categorie.richting
                });
            });
        }).catch(err => {
            console.log(err);
        })
    },

    transactiesOpzoeken: () => {
        let frmDta = {
            'categorie': $('#categorie').val().toLowerCase(),
            'omschrijving': $('#omschrijving').val().toLowerCase(),
            'bedrag': $('#bedrag').val(),
            'pagina': 0,
            'lijstofzoek': TRANSACTIES.lijstofzoek
        };


        //fetch('/jxTransactiesZoeken', {
        fetch('/jxLijstTransacties', {
            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                "X-CSRF-Token": TRANSACTIES.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            return response.json();
        }).then((res) => {
            TRANSACTIES.toonLijst(res.transacties);
            if (res.aantalpaginas > 0) {

                $('#overzichtTransacties').append(
                    $('<div>').css('text-align', 'center')
                        .append(PAGINERING.pagineer(res.pagina, res.knoppen, res.aantalpaginas))
                );
            }
        });
    },

    detailsLeegmaken: () => {
        let boodschappen = TRANSACTIES.boodschappenActies;
        $('#id').val(0);
        $('#categorie').val('');
        $('#omschrijving').val('');
        $('#bedrag').val(0);
        $("#actieTitel").html('<h5><strong>' + boodschappen.nieuw + '</strong><h5>');
    },

    pasdatumaan: (richting) => {
        let currentDate = new Date($('#datum').val());
        currentDate.setDate(currentDate.getDate() + richting);
        let newDate = currentDate.toISOString().split('T')[0];
        $('#datum').val(newDate);
    },


    verberg: () => {
        MODAAL.verberg();
    }
}

const REKENINGSTAND = {
    csrfToken: $('meta[name="csrf-token"]').attr('content'),

    init: () => {
        let frmDta = {};

        fetch('/standenHistoriek', {
            method: 'post',
            body: JSON.stringify({ 'frmDta': frmDta }),

            headers: {
                'X-CSRF-Token': TRANSACTIES.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => {
            return response.json();
        }).then(res => {
            if (res.succes) {

            }
        }).catch(err => {
            console.log(err);
        })

    }
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function verberg() {
    MODAAL.verberg();
}


