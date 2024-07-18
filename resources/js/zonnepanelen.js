$(() => {
    if ($('#zonnepanelenIndex').length) ZONNEPANELEN.init();
});

const ZONNEPANELEN = {
    tellerstandID: null,
    fout: null,
    regexDatum: /^\d{4}(\-)(((0)[0-9])|((1)[0-2]))(\-)([0-2][0-9]|(3)[0-1])$/,
    csrfToken: $('meta[name="csrf-token"]').attr('content'),


    init: () => {
        ZONNEPANELEN.lijst(0);

        // paginering
        $('#overzichtDagelijks').on('click', '#paginering a', function (evt) {
            ZONNEPANELEN.lijst($(this).data('pagina'));

        });


        // toevoegen
        $('body').on('click', '.toevoegen', function (evt) { ZONNEPANELEN.bewerk('nieuw', 0) });

        $('body').on('click', '.bewerken', function (evt) { ZONNEPANELEN.bewerk('bewerk', $(this).attr('id').split('_')[1]) });
        $('body').on('click', '.verwijderen', function (evt) { ZONNEPANELEN.bewerk('verwijder', $(this).attr('id').split('_')[1]) });


        // knoppen dialoogvenster
        $('body').on('click', '#tellerstandBewerkBewaar', ZONNEPANELEN.bewerkBewaar);
        $('body').on('click', '#tellerstandBewerkAnnuleer', () => { MODAAL.verberg(); ZONNEPANELEN.tellerstandID = null; });

    },

    lijst: (pagina) => {
        let frmDta = {
            'pagina': pagina
        };

        fetch('/jxZonnepanelenLijst', {
            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                'X-CSRF-Token': ZONNEPANELEN.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => {
            return response.json();
        }).then(res => {
            if (res.succes) {
                $('#overzichtDagelijks').empty();
                $('#overzichtDagelijks').append(
                    $('<table>').attr('id', 'dagelijkseMeting').append(
                        $('<tr>').append($('<th>').html('Datum'))
                            .append($('<th>').html('Tellerstand'))
                            .append($('<th>').html('Opbrengst'))
                            .append($('<th>').html('<button type="button" class="btn btn-primary toevoegen">Nieuw</button>'))

                    )
                );

                let mijntabel = $('#dagelijkseMeting');

                // Loop through the tellerstanden array
                res.tellerstanden.forEach(tellerstand => {
                    // Create a new row for each tellerstand
                    var dataRow = mijntabel[0].insertRow();

                    // Insert cells into the row and populate them with data
                    var datumCell = dataRow.insertCell();
                    datumCell.innerHTML = tellerstand['sortedDate']; // Assuming 'datum' is a property of tellerstand

                    var meterstandCell = dataRow.insertCell();
                    meterstandCell.innerHTML = tellerstand['tellerstand']; // Assuming 'meterstand' is a property of tellerstand

                    var dagopbrenstCell = dataRow.insertCell();
                    dagopbrenstCell.innerHTML = tellerstand['dagopbrengst']; // Assuming 'dagopbrenst' is a property of tellerstand

                    var actieCell = dataRow.insertCell();
                    let inhoud = `
                        <div class="btn-group mr-2" role="group"> 
                            <button class="btn btn-primary zonnepaneelbtn bewerken" type="button" id="tid_${tellerstand['id']}"><i class="bi bi-pencil-square"></i></button>
                            <button class="btn btn-warning zonnepaneelbtn verwijderen" type="button" id="tid_${tellerstand['id']}"><i class="bi bi-scissors"></i></button>
                        </div>    
                    `;
                    actieCell.innerHTML = inhoud;
                });

                if (res.aantalpaginas > 0) {

                    $(overzichtDagelijks).append(
                        $('<div>').css('text-align', 'center')
                            .addClass('mt-1')
                            .append(PAGINERING.pagineer(res.pagina, res.knoppen, res.aantalpaginas))
                    );
                }

                ZONNEPANELEN.jaarOverzicht(res.jaarOverzicht);
                ZONNEPANELEN.headerOverzicht(parseFloat(res.actuelestand));

            }

        }).catch(err => {
            console.log(err);
        })

    },

    jaarOverzicht: (dta) => {

        $('#jaarOverzicht').empty();
        var tableContainer = document.getElementById("jaarOverzicht");

        var table = document.createElement("table");
        table.id = "tblJaarOverzicht";
        table.classList.add("tblJaarOverzichtZonnepanelen");
        // Create table header
        var headerRow = table.insertRow();

        var headerCell = headerRow.insertCell();
        headerCell.innerHTML = "<th>Jaar</th>";

        headerCell = headerRow.insertCell();
        headerCell.innerHTML = "<th>Jan</th>";
        var headerCell = headerRow.insertCell();
        headerCell.innerHTML = "<th>Feb</th>";
        var headerCell = headerRow.insertCell();
        headerCell.innerHTML = "<th>Maa</th>";
        var headerCell = headerRow.insertCell();
        headerCell.innerHTML = "<th>Apr</th>";
        var headerCell = headerRow.insertCell();
        headerCell.innerHTML = "<th>Mei</th>";
        var headerCell = headerRow.insertCell();
        headerCell.innerHTML = "<th>Jun</th>";
        var headerCell = headerRow.insertCell();
        headerCell.innerHTML = "<th>Jul</th>";
        var headerCell = headerRow.insertCell();
        headerCell.innerHTML = "<th>Aug</th>";
        var headerCell = headerRow.insertCell();
        headerCell.innerHTML = "<th>Sep</th>";
        var headerCell = headerRow.insertCell();
        headerCell.innerHTML = "<th>Okt</th>";
        var headerCell = headerRow.insertCell();
        headerCell.innerHTML = "<th>Nov</th>";
        var headerCell = headerRow.insertCell();
        headerCell.innerHTML = "<th>Dec</th>";
        var headerCell = headerRow.insertCell();
        headerCell.innerHTML = "<th>Totaal</th>";
        var headerCell = headerRow.insertCell();
        headerCell.innerHTML = "<th>YTD</th>";


        dta.forEach(jaarrecord => {
            var dataRow = table.insertRow();
            var cell = dataRow.insertCell();
            cell.innerHTML = jaarrecord['jaar'];

            //let idx=0;
            //for (let key in jaarrecord) {
            //if (idx >=1) {

            for (let idx = 1; idx <= 12; idx++) {
                if (jaarrecord.hasOwnProperty(idx)) {
                    var cell = dataRow.insertCell();
                    cell.innerHTML = jaarrecord[idx];

                }
                else {
                    var cell = dataRow.insertCell();
                    cell.innerHTML = '';
                }
            }
            var cell = dataRow.insertCell();
            cell.innerHTML = jaarrecord[('jaarTotaal')];
            var cell = dataRow.insertCell();
            cell.innerHTML = jaarrecord[('ytd')];

        });

        tableContainer.appendChild(table);



    },


    headerOverzicht: (actueleStand) => {
        // let actueleStand = parseFloat(dta.actuelestand);
        let vorigCertificaat = (Math.floor(actueleStand / 1000) * 1000) + 100;
        let volgendCertificaat = vorigCertificaat + 1000;
        let aantalCertificaten = Math.floor(actueleStand / 1000) - 1;
        let kWhTotCertificaat = 0;
        if (actueleStand < vorigCertificaat && actueleStand < volgendCertificaat) {
            kWhTotCertificaat = vorigCertificaat - actueleStand;
        }
        else {
            kWhTotCertificaat = volgendCertificaat - actueleStand;
        }


        console.log('vorig:', vorigCertificaat, 'volgend:', volgendCertificaat, 'actueel:', actueleStand);

        let kaart = $('#headerOverzicht');
        kaart.empty();
        let inhoud = ``;
        inhoud += `
            <h5><strong>Overzicht opbrengst zonnepanelen</strong></h5><hr>
            Aantal kWh te produceren: ${kWhTotCertificaat.toFixed(1)}<br>
            Aantal certificaten : ${aantalCertificaten}<br>
            Financiële opbrengst :€ ${aantalCertificaten * 330}<br>
        `;
        kaart.html(inhoud);


    },

    //toevoegen-bewerken-verwijderen
    bewerk: (mode, id) => {

        let frmDta = {
            'mode': mode,
            'id': id,
        };

        fetch('/jxtellerstandGet', {
            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                'X-CSRF-Token': ZONNEPANELEN.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => {
            return response.json();
        }).then(res => {
            if (res.succes) ZONNEPANELEN.bewerkSucces(res);



        }).catch(err => {
            console.log(err);
        })
    },
    bewerkSucces: (jqDta) => {
        if (jqDta.succes) {
            let disabled = '';
            // titel dialoogvenster
            console.log(jqDta.mode);
            switch (jqDta.mode) {

                case ('bewerk'):
                    MODAAL.kop('Tellerstand bewerken');
                    break;
                case ('nieuw'):
                    MODAAL.kop('Tellerstand toevoegen');
                    break;
                case ('verwijder'):
                    MODAAL.kop('Tellerstand verwijderen');
                    disabled = 'disabled';
                    break;
            }

            // inhoud dialoogvenster
            let inhoud = `
                    <div id="tellerstandBewerkBoodschap"></div>
                    <input type="hidden" id="tellerstandBewerkID" value="${jqDta.tellerstand.id}">
                   
                    <input type="hidden" id="tellerstandBewerkMode" value="${jqDta.mode}">
                    <div class="mb-3">
                        <label for="datum" class="form-label">Datum</label>
                        <input type="date" class="form-control" id="tellerstandBewerkDatum" name="tellerstandBewerkDatum" value="${jqDta.tellerstand.datum}" ${disabled}>
                    </div>
                        
                    <div class="mb-3">
                        <label for="tellerstandBewerktellerstand" class="form-label">Tellerstand</label>
                        <input type="number" min="0" class="form-control" id="tellerstandBewerktellerstand" name="tellerstandBewerktellerstand" value="${jqDta.tellerstand.tellerstand}" ${disabled}>
                    </div>`
            MODAAL.inhoud(inhoud);


            let voet = '';
            if (jqDta.mode === 'verwijder') voet += MODAAL.knop('tellerstandBewerkBewaar', 'warning', 'trash3', 'Verwijderen');

            else voet += MODAAL.knop('tellerstandBewerkBewaar', 'primary', 'check-square', 'Bewaren');

            voet += MODAAL.knop('tellerstandBewerkAnnuleer', 'secondary', 'x-square', 'Annuleren');

            MODAAL.voet(voet);
            MODAAL.toon();
            $("tellerstandBewerktellerstand").attr('required', true);
        }

    },
    bewerkFout: (jqXHR, jqMsg) => {
        MODAAL.verberg();
    },

    bewerkBewaar: () => {

        let mode = $('#tellerstandBewerkMode').val();

        let tellerstandID = $('#tellerstandBewerkID').val();
        let datum = $('#tellerstandBewerkDatum').val().trim();
        console.log(datum);
        let tellerstand = $('#tellerstandBewerktellerstand').val().trim();

        $('#tellerstandBewerkBoodschap').empty();


        let boodschap = '';
        console.log('regex datum =', datum, " => ", ZONNEPANELEN.regexDatum.test(String(datum)));
        boodschap += ZONNEPANELEN.regexDatum.test(String(datum)) ? `` : `<li>'Controleer de datum</li>`;

        if (boodschap.length != 0) {
            $('#tellerstandBewerkBoodschap').html(`
                    <div class="alert alert-warning">
                        'Tellerstand kan niet bewaard worden'
                        <ul>
                            ${boodschap}
                        </ul>
                    </div>
                `);
        }
        else {

            let frmDta = new FormData();
            frmDta.append('mode', mode);
            frmDta.append('tellerstandID', tellerstandID);
            frmDta.append('datum', datum);
            frmDta.append('tellerstand', tellerstand);

            AJX.verstuur(
                '/jxTellerstandZonnepanelenBewaar',
                'post',
                frmDta,
                ZONNEPANELEN.bewerkBewaarSucces,
                ZONNEPANELEN.bewerkBewaarFout
            )
        }
    },
    bewerkBewaarSucces: (jqDta) => {
        if (jqDta.succes) {
            MODAAL.verberg();
            ZONNEPANELEN.lijst(0);
        }
        else {
            $('#tellerstandBewerkBoodschap').html(`
                    <div class="alert alert-warning">
                        ${jqDta.boodschap}
                    </div>
                `);
            MODAAL.toon();
        }
    },

    bewerkBewaarFout: (jqXHR, jqMsg) => {
        MODAAL.kop(jqDta.tellerstand.id === 0 ? 'Tellerstand toevoegen' : 'Tellerstand bewerken');
        MODAAL.inhoud(`<p>${ZONNEPANELEN.fout}</p>`);
        MODAAL.voet(
            MODAAL.knop('tellerstandBewerkAnnuleer', 'secondary', 'x-square', 'Annuleren')
        );
        MODAAL.toon();
    },
}

