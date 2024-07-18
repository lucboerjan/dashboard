$(() => {
    if ($('#aandelenIndex').length) INDEX.init();

});


const INDEX = {
    csrfToken: $('meta[name="csrf-token"]').attr('content'),
    labels: null,
    geduld: null,
    fout: null,
    id: null,
    fondsNaam: "",
    fondsID: 0,
    regexDatum: /^\d{4}(\-)(((0)[0-9])|((1)[0-2]))(\-)([0-2][0-9]|(3)[0-1])$/,


    init: () => {


        $("#aandelenIndex").tabs({
            active: 0
        });

        INDEX.lijst();

        $('body').on('click', '.toevoegen_aankoop', function (evt) {
            let fondsID = $(this).attr('id').split('_')[1];
            INDEX.bewerk_aankoop(0, 'nieuw', fondsID);
        });
        $('body').on('click', '.bewerken_aankoop', function (evt) {
            let id = $(this).attr('id').split('_')[1];
            let fondsID = $(this).parent().parent().parent().parent().attr('id').split('_')[1];
            INDEX.bewerk_aankoop(id, 'bewerk', fondsID);
        });
        $('body').on('click', '.verwijder_aankoop', function (evt) {
            let id = $(this).attr('id').split('_')[1];
            let fondsID = $(this).parent().parent().parent().parent().attr('id').split('_')[1];
            INDEX.bewerk_aankoop(id, 'verwijder', fondsID);
        });

        $('body').on('click', '.toevoegen_notering', function (evt) {
            let fondsID = $(this).attr('id').split('_')[1];
            INDEX.bewerk_notering(0, 'nieuw', fondsID);
        });
        $('body').on('click', '.bewerk_notering', function (evt) {
            let id = $(this).attr('id').split('_')[1];
            let fondsID = $(this).parent().parent().parent().parent().attr('id').split('_')[1];
            INDEX.bewerk_notering(id, 'bewerk', fondsID);
        });
        $('body').on('click', '.verwijder_notering', function (evt) {
            let id = $(this).attr('id').split('_')[1];
            let fondsID = $(this).parent().parent().parent().parent().attr('id').split('_')[1];
            INDEX.bewerk_notering(id, 'verwijder', fondsID);
        });


        // knoppen dialoogvenster
        $('body').on('click', '#aankoopBewerkBewaar', INDEX.aankoopBewerkBewaar);
        $('body').on('click', '#aankoopBewerkAnnuleer', () => { MODAAL.verberg(); INDEX.id = null; });
        $('body').on('click', '#noteringBewerkBewaar', INDEX.noteringBewerkBewaar);
        $('body').on('click', '#noteringBewerkAnnuleer', () => { MODAAL.verberg(); INDEX.id = null; });
    },

    lijst: () => {
        let frmDta = new FormData();


        fetch('/jxFondsenLijst', {
            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                'X-CSRF-Token': INDEX.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => {
            return response.json();
        }).then(res => {
            if (res.succes) {
                INDEX.lijstSucces(res);
                INDEX.dataVerwerking(res.fondsenLijst);
            }

        }).catch(err => {
            console.log(err);
        })


    },

    lijstSucces: (jqDta) => {

        let fondsen = jqDta.fondsenLijst;

        INDEX.fondsNaam = fondsen[0]['naam'];

        $('#fondenOverzicht').empty();
        $('#fondenOverzicht').append($('<h4>').html('Overzicht beleggingen / pensioensparen').css('font-weight', 'bold'));

        $('#aankopenOverzicht').empty();
        $('#aankopenOverzicht').append($('<h4>').html('Overzicht aankopen').css('font-weight', 'bold'));

        // $('#dagkoersenOverzicht').empty();
        // $('#dagkoersenOverzicht').append($('<h4>').html('Overzicht dagkoersen').css('font-weight', 'bold'));

        var table = $('<table>').attr('id', 'tblFondsenOverzicht').addClass('mb-3');

        var headerRow = $('<tr>');
        headerRow.append('<th>Fondsnaam</th>');
        headerRow.append('<th>Aantal</th>');
        headerRow.append('<th>Aankoopbedrag</th>');
        headerRow.append('<th>Huidige waarde</th>');
        headerRow.append('<th>Min. waarde</th>');
        headerRow.append('<th>Max. waarde</th>');
        headerRow.append('<th>Opbrengst (€)</th>');
        headerRow.append('<th>Opbrengst (%)</th>');
        headerRow.append('<th>Breakeven</th>');
        headerRow.append('<th>Dagkoers</th>');

        table.append(headerRow);

        fondsen.forEach(fonds => {
            let fondsNaam = `<a href="${fonds.url}" target="_blank">${fonds.naam}</a>`;
            var dataRow = $('<tr>');
            dataRow.append($('<td>').html(fondsNaam));
            dataRow.append($('<td>').addClass('numvalue').html(fonds.aantal));
            dataRow.append($('<td>').addClass('numvalue').html(fonds.aankoopbedrag));
            dataRow.append($('<td>').addClass('numvalue').html(fonds.waarde));
            dataRow.append($('<td>').addClass('numvalue').html(fonds.minWaarde));
            dataRow.append($('<td>').addClass('numvalue').html(fonds.maxWaarde));
            dataRow.append($('<td>').addClass('numvalue').html(fonds.opbrengstEuro));
            dataRow.append($('<td>').addClass('numvalue').html(fonds.opbrengstPercent));
            dataRow.append($('<td>').addClass('numvalue').html(fonds.breakEven));
            dataRow.append($('<td>').addClass('numvalue').html(fonds.laatsteKoers));
            table.append(dataRow);
        });

        $('#fondenOverzicht').append(table);






        let samenvatting = jqDta.samenvatting;
        let aandelenHTML = '';
        let pensioenHTML = '';
        let samenvattingHTML = '';

        aandelenHTML += "<div><h4><strong>Resultaat aandelen</strong></h4></div>"
        aandelenHTML += "&nbsp;Waarde aandelen  : € " + (Math.round(samenvatting.aandelenWaarde * 100) / 100).toFixed(2) + "<br>";
        aandelenHTML += "&nbsp;Aankoopwaarde aandelen : € " + + (Math.round(samenvatting.aandelenAankoopWaarde * 100) / 100).toFixed(2) + "<br>";
        aandelenHTML += "&nbsp;Opbrengst aandelen : € " + + (Math.round(samenvatting.aandelenOpbrengst * 100) / 100).toFixed(2) + "<br>";

        pensioenHTML += "<div><h4><strong>Resultaat pensioensparen</strong/h4></div>"
        pensioenHTML += "&nbsp;Waarde pensioensparen  : € " + (Math.round(samenvatting.pensioensparenWaarde * 100) / 100).toFixed(2) + "<br>";
        pensioenHTML += "&nbsp;Aankoopwaarde pensioensparen : € " + + (Math.round(samenvatting.pensioensparenAankoopWaarde * 100) / 100).toFixed(2) + "<br>";
        pensioenHTML += "&nbsp;Opbrengst pensioensparen  : € " + (Math.round(samenvatting.pensioensparenOpbrengst * 100) / 100).toFixed(2) + "<br>";


        samenvattingHTML += "<div><h4><strong>Resultaat beleggingen</strong></h4></div>"
        samenvattingHTML += "&nbsp;Totale opbrengst van de de beleggingen : € " + (Math.round(samenvatting.totaalOpbrengst * 100) / 100).toFixed(2) + "<br>";

        $('#fondenOverzicht').append($('<div>').attr('id', 'aandelen').addClass('card card-body mb-3').html(aandelenHTML));
        $('#fondenOverzicht').append($('<div>').attr('id', 'pensioensparen').addClass('card card-body mb-3').html(pensioenHTML));
        $('#fondenOverzicht').append($('<div>').attr('id', 'pensioensparen').addClass('card card-body mb-3').html(samenvattingHTML));



    },


    dataVerwerking: (fondsen) => {
        $('#dataVerwerking').empty();
        $('#dataVerwerking').append($('<h4>').html('Dataverwerking beleggingen / pensioensparen').css('font-weight', 'bold'));

        $('#dataVerwerking').append($('<div>').attr('id', 'dataVerwerkingAccordeon'));
        fondsen.forEach(fonds => {
            $('#dataVerwerkingAccordeon')
                .append($('<h3>').html(fonds.naam + ' (' + fonds.isin + ')').css('font-weight', 'bold'))
                .append($('<div>').addClass('container').attr('id', 'fonds_' + fonds.id).addClass('aandelenAankopen')
                    .append($('<div>').addClass('row')
                        .append($('<div>').addClass('col-5 card card-body me-1').attr('id', 'aankopenFonds_' + fonds.id))
                        .append($('<div>').addClass('col-3 card card-body').attr('id', 'dagkoersenFonds_' + fonds.id))));

            INDEX.lijstAankopen(fonds.id);
            INDEX.lijstDagkoersen(fonds.id);

        });

        
        //dagkoersen
        // $("#dagkoersenAccordion").accordion({ collapsible: true, active: false} );
        // $("#dagkoersenAccordion").accordion("option", "active", 0);
        $("#dataVerwerkingAccordeon").accordion({ collapsible: true, active: false} );
        $("#dataVerwerkingAccordeon").accordion("option", "active", 0);


    },

    lijstAankopen(fondsID) {
        let frmDta = {
            'fondsID': fondsID
        };


        fetch('/jxAankopenPerFonds', {
            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                'X-CSRF-Token': INDEX.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => {
            return response.json();
        }).then(res => {

            if (res.succes) {
                let card2use = $('#aankopenFonds_' + res.fondsID);
                card2use.empty();


                var table = $('<table>').addClass('aandelenAankopen');

                var headerRow = $('<tr>');
                headerRow.append('<th>Datum</th>');
                headerRow.append('<th>Aantal</th>');
                headerRow.append('<th>Aankoopprijs</th>');
                headerRow.append('<th>Aankoopbedrag</th>');
                headerRow.append(`<th><button type="button" class="btn btn-primary toevoegen_aankoop" id="fondsID_${res.fondsID}">Nieuw</button></th>`); // Using template literals

                table.append(headerRow);

                res.aankopen.forEach(aankoop => {
                    var dataRow = $('<tr>');
                    dataRow.append($('<td>').addClass('numvalue').html(aankoop.weergavedatum));
                    dataRow.append($('<td>').addClass('numvalue').html(aankoop.aantal));
                    dataRow.append($('<td>').addClass('numvalue').html(aankoop.aankoopprijs));
                    let aankoopbedrag = aankoop.aankoopprijs * aankoop.aantal;
                    dataRow.append($('<td>').addClass('numvalue').html(aankoopbedrag.toFixed(2)));

                    let inhoud = `
                        <button class="btn btn-primary bewerk_aankoop myActionButton" type="button" id="rid_${aankoop['id']}"><i class="bi bi-pencil-square"></i></button>
                        <button class="btn btn-warning verwijder_aankoop myActionButton" type="button" id="rid_${aankoop['id']}"><i class="bi bi-scissors"></i></button>
                    `;

                    dataRow.append($('<td>').addClass('actieButtons').html(inhoud));

                    table.append(dataRow);
                });

                card2use.append(table);

            }




        }).catch(err => {
            console.log(err);
        })

        //        return ('hier komen de aankopen voor:' + fondsID);

    },

    lijstDagkoersen(fondsID) {
        let frmDta = {
            'fondsID': fondsID
        };


        fetch('/jxDagkoersenPerFonds', {
            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                'X-CSRF-Token': INDEX.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => {
            return response.json();
        }).then(res => {

            if (res.succes) {
                let card2use = $('#dagkoersenFonds_' + res.fondsID);
                card2use.empty();


                var table = $('<table>').addClass('aandelenAankopen');

                var headerRow = $('<tr>');
                headerRow.append('<th>Datum</th>');
                headerRow.append('<th>Dagkoers</th>');
                headerRow.append(`<th><button type="button" class="btn btn-primary toevoegen_notering" id="fondsID_${res.fondsID}">Nieuw</button></th>`); // Using template literals

                table.append(headerRow);

                res.dagkoersen.forEach(dagkoers => {
                    var dataRow = $('<tr>');
                    dataRow.append($('<td>').addClass('numvalue').html(dagkoers.weergavedatum));
                    dataRow.append($('<td>').addClass('numvalue').html(dagkoers.dagkoers));

                    let inhoud = `
                        <button class="btn btn-primary bewerk_notering myActionButton" type="button" id="rid_${dagkoers['id']}"><i class="bi bi-pencil-square"></i></button>
                        <button class="btn btn-warning verwijder_notering myActionButton" type="button" id="rid_${dagkoers['id']}"><i class="bi bi-scissors"></i></button>
                    `;

                    dataRow.append($('<td>').addClass('actieButtons').html(inhoud));

                    table.append(dataRow);
                });

                card2use.append(table);

            }




        }).catch(err => {
            console.log(err);
        })


    },

    //acties aankopen
    bewerk_aankoop: (id, mode, fondsID) => {
        let frmDta = new FormData();
        frmDta.append('id', id);
        frmDta.append('mode', mode);
        frmDta.append('fondsID', fondsID);
        AJX.verstuur(
            '/jxAandeelAankoopGet',
            'post',
            frmDta,
            INDEX.bewerkSucces,
            INDEX.bewerkFout
        )
    },

    bewerkSucces: (jqDta) => {
        console.log(jqDta);

        INDEX.labels = jqDta.labels;
        INDEX.geduld = jqDta.geduld;


        if (jqDta.succes) {
            let disabled = '';
            // titel dialoogvenster
            switch (jqDta.mode) {
                case ('bewerk'):
                    MODAAL.kop(INDEX.labels.aandeelAankoopBewerkTitelBewerk);
                    break;
                case ('nieuw'):
                    MODAAL.kop(INDEX.labels.aandeelAankoopBewerkTitelNieuw);
                    break;
                case ('verwijder'):
                    MODAAL.kop(INDEX.labels.aandeelAankoopBewerkTitelVerwijder);
                    disabled = 'disabled';
                    break;
            }

            // inhoud dialoogvenster

            let inhoud = `
                <div id="aankoopBewerkBoodschap"></div>
                <input type="hidden" id="aankoopBewerkID" value="${jqDta.aankoop.id}">
                <input type="hidden" id="aankoopBewerkFondsID" value="${jqDta.fondsID}">
                <input type="hidden" id="aankoopBewerkMode" value="${jqDta.mode}">
                <input type="hidden" id="aankoopBewerkFondsNaam" value="${jqDta.fondsInfo['naam']}">

                <div class="modal-title">
                    <label class="btn btn-warning" style="width:-moz-available;">${jqDta.fondsInfo.naam} (${jqDta.fondsInfo.isin})</label>
                </div>

                <div class="mb-3">
                    <label for="datum" class="form-label">${INDEX.labels.aandeelAankoopBewerkDatum}</label>
                    <input type="date" class="form-control" id="aankoopBewerkDatum" name="aankoopBewerkDatum" value="${jqDta.aankoop.datum}" ${disabled}>
                </div>
                
                <div class="mb-3">
                    <label for="aankoopBewerkAantal" class="form-label">${INDEX.labels.aandeelAankoopBewerkAantal}</label>
                    <input type="number" min="0" class="form-control" id="aankoopBewerkAantal" name="aankoopBewerkAantal" value="${jqDta.aankoop.aantal}" ${disabled}>
                </div>
                        
                <div class="mb-3">
                    <label for="aankoopBewerkKoers" class="form-label">${INDEX.labels.aandeelAankoopBewerkKoers}</label>
                    <input type="number" min="0" class="form-control" id="aankoopBewerkKoers" name="aankoopBewerkKoers" value="${jqDta.aankoop.aankoopprijs}" ${disabled}>
                </div>`

            MODAAL.inhoud(inhoud);

            let voet = '';
            if (jqDta.mode === 'verwijder') voet += MODAAL.knop('aankoopBewerkBewaar', 'warning', 'trash3', INDEX.labels.aandeelAankoopBewerkVerwijder);
            else voet += MODAAL.knop('aankoopBewerkBewaar', 'primary', 'check-square', INDEX.labels.aandeelAankoopBewerkBewaar);

            voet += MODAAL.knop('aankoopBewerkAnnuleer', 'secondary', 'x-square', INDEX.labels.aandeelAankoopBewerkAnnuleer);

            MODAAL.voet(voet);
            MODAAL.toon();
        }

    },

    bewerkFout: (jqXHR, jqMsg) => {
        MODAAL.verberg();
    },

    aankoopBewerkBewaar: () => {
        let mode = $('#aankoopBewerkMode').val();
        let id = $('#aankoopBewerkID').val();
        let datum = $('#aankoopBewerkDatum').val();
        let aantal = $('#aankoopBewerkAantal').val();
        let koers = $('#aankoopBewerkKoers').val();
        let fondsID = $('#aankoopBewerkFondsID').val();
        let fondsNaam = $('#aankoopBewerkFondsNaam').val();
        $('#aankoopBewerkBoodschap').empty();

        let boodschap = '';
        boodschap += INDEX.regexDatum.test(String(datum)) ? `` : `<li>${INDEX.labels.tankbeurtBewerkDatum}</li>`;

        if (boodschap.length != 0) {
            $('#aankoopBewerkBoodschap').html(`
                <div class="alert alert-warning">
                    ${INDEX.labels.aankoopBewerkBoodschap}
                    <ul>
                        ${boodschap}
                    </ul>
                </div>
            `);
        }
        else {

            let frmDta = new FormData();
            frmDta.append('mode', mode);
            frmDta.append('id', id);
            frmDta.append('datum', datum);
            frmDta.append('aantal', aantal);
            frmDta.append('koers', koers);
            frmDta.append('fondsID', fondsID);
            frmDta.append('fondsNaam', fondsNaam);

            AJX.verstuur(
                '/jxAandeelAankoopBewaar',
                'post',
                frmDta,
                INDEX.aandeelAankoopBewerkBewaarSucces,
                INDEX.aandeelAankoopBewerkBewaarFout
            )

        }
    },

    aandeelAankoopBewerkBewaarSucces: (jqDta) => {
        if (jqDta.succes) {
            MODAAL.verberg();
            INDEX.lijst();
            INDEX.aandelenAankopen();
        }
        else {
            $('#aankoopBewerkBoodschap').html(`
                    <div class="alert alert-warning">
                        ${jqDta.boodschap}
                    </div>
                `);
            MODAAL.toon();
        }
    },

    aandeelAankoopBewerkBewaarFout: (jqXHR, jqMsg) => {
        MODAAL.kop(jqDta.tankbeurt.id === 0 ? INDEX.labels.tankbeurtBewerkTitelNieuw : INDEX.labels.tankbeurtBewerkTitelBewerk);
        MODAAL.inhoud(`<p>${INDEX.fout}</p>`);
        MODAAL.voet(
            MODAAL.knop('tankbeurtBewerkAnnuleer', 'secondary', 'x-square', INDEX.labels.tankbeurtBewerkAnnuleer)
        );
        MODAAL.toon();
    },

    bewerk_notering: (id, mode, fondsID, fondsNaam) => {
        let frmDta = new FormData();
        frmDta.append('id', id);
        frmDta.append('mode', mode);
        frmDta.append('fondsID', fondsID);
        frmDta.append('fondsNaam', fondsNaam);
        AJX.verstuur(
            '/jxAandeelNoteringGet',
            'post',
            frmDta,
            INDEX.noteringBewerkSucces,
            INDEX.noteringBewerkFout
        )
    },

    noteringBewerkSucces: (jqDta) => {

        INDEX.labels = jqDta.labels;
        INDEX.geduld = jqDta.geduld;
        INDEX.fondsID = jqDta.fondsID;
        INDEX.fondsNaam = jqDta.fondsNaam;
        if (jqDta.succes) {
            let disabled = '';
            // titel dialoogvenster
            switch (jqDta.mode) {
                case ('bewerk'):
                    MODAAL.kop(INDEX.labels.aandeelNoteringBewerkTitelBewerk);
                    break;
                case ('nieuw'):
                    MODAAL.kop(INDEX.labels.aandeelNoteringBewerkTitelNieuw);
                    break;
                case ('verwijder'):
                    MODAAL.kop(INDEX.labels.aandeelNoteringBewerkTitelVerwijder);
                    disabled = 'disabled';
                    break;
            }

            // inhoud dialoogvenster
            let inhoud = `
                <div id="noteringBewerkBoodschap"></div>
                    <input type="hidden" id="noteringBewerkID" value="${jqDta.notering.id}">
                    <input type="hidden" id="noteringBewerkFondsID" value="${jqDta.fondsID}">
                    <input type="hidden" id="noteringBewerkMode" value="${jqDta.mode}">
                    <input type="hidden" id="noteringBewerkFondsNaam" value="${jqDta.fondsNaam}">

                    <div class="modal-title">
                    <label class="btn btn-warning" style="width:-moz-available;">${jqDta.fondsInfo.naam} (${jqDta.fondsInfo.isin})</label>
                    </div>

                 <div class="mb-3">
                     <label for="datum" class="form-label">${INDEX.labels.aandeelNoteringBewerkDatum}</label>
                     <input type="date" class="form-control" id="noteringBewerkDatum" name="noteringBewerkDatum" value="${jqDta.notering.datum}" ${disabled}>
                 </div>
                
                 <div class="mb-3">
                     <label for="aandeelNoteringBewerkKoers" class="form-label">${INDEX.labels.aandeelNoteringBewerkKoers}</label>
                     <input type="number" min="0" class="form-control" id="noteringBewerkKoers" name="noteringBewerkKoers" value="${jqDta.notering.dagkoers}" ${disabled}>
                 </div>
            </div>`

            MODAAL.inhoud(inhoud);

            let voet = '';
            if (jqDta.mode === 'verwijder') voet += MODAAL.knop('noteringBewerkBewaar', 'warning', 'trash3', INDEX.labels.aandeelNoteringBewerkVerwijder);
            else voet += MODAAL.knop('noteringBewerkBewaar', 'primary', 'check-square', INDEX.labels.aandeelNoteringBewerkBewaar);

            voet += MODAAL.knop('noteringBewerkAnnuleer', 'secondary', 'x-square', INDEX.labels.aandeelNoteringBewerkAnnuleer);

            MODAAL.voet(voet);
            MODAAL.toon();
        }
    },


    noteringBewerkFout: (jqXHR, jqMsg) => {
        MODAAL.verberg();
    },

    noteringBewerkBewaar: () => {
        let mode = $('#noteringBewerkMode').val();
        let id = $('#noteringBewerkID').val();
        let datum = $('#noteringBewerkDatum').val();
        let koers = $('#noteringBewerkKoers').val();
        let fondsID = $('#noteringBewerkFondsID').val();
        //let fondsNaam = $('#noteringBewerkFondsNaam').val();
        $('#noteringBewerkBoodschap').empty();

        let boodschap = '';
        boodschap += INDEX.regexDatum.test(String(datum)) ? `` : `<li>${INDEX.labels.noteringBewerkDatum}</li>`;

        if (boodschap.length != 0) {
            $('#noteringBewerkBoodschap').html(`
                <div class="alert alert-warning">
                    ${INDEX.labels.noteringBewerkBoodschap}
                    <ul>
                        ${boodschap}
                    </ul>
                </div>
            `);
        }
        else {

            let frmDta = new FormData();
            frmDta.append('mode', mode);
            frmDta.append('id', id);
            frmDta.append('datum', datum);
            frmDta.append('koers', koers);
            frmDta.append('fondsID', fondsID);
            //frmDta.append('fondsNaam', fondsNaam);

            AJX.verstuur(
                '/jxAandeelNoteringBewaar',
                'post',
                frmDta,
                INDEX.aandeelNoteringBewerkBewaarSucces,
                INDEX.aandeelNoteringBewerkBewaarFout
            )

        }
    },

    aandeelNoteringBewerkBewaarSucces: (jqDta) => {
        if (jqDta.succes) {
            MODAAL.verberg();
            //INDEX.aandelenNoteringen();
            INDEX.lijst();
        }
        else {
            $('#noteringBewerkBoodschap').html(`
                    <div class="alert alert-warning">
                        ${jqDta.boodschap}
                    </div>
                `);
            MODAAL.toon();
        }
    },

    aandeelNoteringBewerkBewaarFout: (jqXHR, jqMsg) => {
        MODAAL.kop(jqDta.aandeel.id === 0 ? INDEX.labels.aandeelNoteringBewerkTitelNieuw : INDEX.labels.aandeelNoteringBewerkTitelBewerk);
        MODAAL.inhoud(`<p>${INDEX.fout}</p>`);
        MODAAL.voet(
            MODAAL.knop('aandeelNoteringBewerkAnnuleer', 'secondary', 'x-square', INDEX.labels.aandeelNoteringBewerkAnnuleer)
        );
        MODAAL.toon();
    },
}

function formatUrl(val, row) {
    return '<a href="' + row.url + ' " target ="_blank">' + val + '</a>';
}




