$(() => {
    if ($('#tellerstandIndex').length) TELLERSTAND.init();
    if ($('#overzichtIndex').length) OVERZICHT.init();

});

const OVERZICHT = {
    regexDatum: /^\d{4}(\-)(((0)[0-9])|((1)[0-2]))(\-)([0-2][0-9]|(3)[0-1])$/,
    csrfToken: $('meta[name="csrf-token"]').attr('content'),
   
    init: () => {
       
        $("#tellerstandMenu").show();
    },
}


const TELLERSTAND = {
    regexDatum: /^\d{4}(\-)(((0)[0-9])|((1)[0-2]))(\-)([0-2][0-9]|(3)[0-1])$/,
    csrfToken: $('meta[name="csrf-token"]').attr('content'),
    labels: null,


    init: () => {
       
        $("#tellerstandMenu").show();

        //nieuw-bewerk-verwijder
        $('body').on('click', '.nieuw', function (evt) { TELLERSTAND.bewerk(0, 'nieuw') });
        $('body').on('click', '.bewerk', function (evt) { TELLERSTAND.bewerk($(this).attr('id').split('_')[1], 'bewerk') });
        $('body').on('click', '.verwijder', function (evt) { TELLERSTAND.bewerk($(this).attr('id').split('_')[1], 'verwijder') });
        $('body').on('click', '#tellerstandBewerkBewaar', TELLERSTAND.bewerkBewaar);

        //MODAAL
        $('body').on('click', '#tellerstandBewerkAnnuleer', () => { MODAAL.verberg() });

        TELLERSTAND.tellerstandenOphalen();


    },

    tellerstandenOphalen: () => {
        let frmDta = {};
        
        fetch('/jxTellerstandOverzicht', {
            method: 'post',
            body: JSON.stringify({ 'frmDta': frmDta }),

            headers: {
                'X-CSRF-Token': TELLERSTAND.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => {
            return response.json();
        }).then(res => {
            if (res.succes) {
                TELLERSTAND.tellerstandOverzicht(res);
            }
        }).catch(err => {
            console.log(err);
        })

    },

    tellerstandOverzicht: (res) => {
        let card2use = $('#overzichtpaneel');
        card2use.empty();


        var table = $('<table>').addClass('tellerstandOverzicht');

        var headerRow = $('<tr>');
        headerRow.append('<th>Datum</th>');
        headerRow.append('<th>Dagteller</th>');
        headerRow.append('<th>Nachtteller</th>');
        headerRow.append('<th>Dagafname</th>');
        headerRow.append('<th>Nachtafname</th>');
        headerRow.append('<th>Daginjectie</th>');
        headerRow.append('<th>Nachtinjectie</th>');
        headerRow.append('<th>Zonnepanelen</th>');
        headerRow.append('<th>Water</th>');
        headerRow.append('<th>Gas</th>');
        headerRow.append(`<th><button type="button" class="btn btn-primary nieuw actieButtonsTellerstand">Nieuw</button></th>`); // Using template literals

        table.append(headerRow);

        res.tellerstanden.forEach(tellerstand => {
            var dataRow = $('<tr>');
            dataRow.append($('<td>').addClass('numvalue').html(tellerstand.weergavedatum));
            dataRow.append($('<td>').addClass('numvalue').html(tellerstand.dag));
            dataRow.append($('<td>').addClass('numvalue').html(tellerstand.nacht));
            dataRow.append($('<td>').addClass('numvalue').html(tellerstand.dagteller_in));
            dataRow.append($('<td>').addClass('numvalue').html(tellerstand.nachtteller_in));
            dataRow.append($('<td>').addClass('numvalue').html(tellerstand.dagteller_uit));
            dataRow.append($('<td>').addClass('numvalue').html(tellerstand.nachtteller_uit));
            dataRow.append($('<td>').addClass('numvalue').html(tellerstand.zon));
            dataRow.append($('<td>').addClass('numvalue').html(tellerstand.water));
            dataRow.append($('<td>').addClass('numvalue').html(tellerstand.gas));

            let inhoud = `
                <button class="btn btn-primary bewerk myActionButton" type="button" id="rid_${tellerstand['id']}"><i class="bi bi-pencil-square"></i></button>
                <button class="btn btn-warning verwijder myActionButton" type="button" id="rid_${tellerstand['id']}"><i class="bi bi-scissors"></i></button>
                
            `;

            dataRow.append($('<td>').addClass('actieButtonsTellerstand ').html(inhoud));

            table.append(dataRow);
        });

        card2use.append(table);
    },

    bewerk: (id, mode) => {
        let frmDta = {
            id: id,
            mode: mode
        };

        fetch('/jxTellerstandGet', {
            method: 'post',
            body: JSON.stringify(frmDta),
            headers: {
                "X-CSRF-Token": TELLERSTAND.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            return response.json();
        }).then((res) => {
            if (res.succes) {

                let disabled = '';

                TELLERSTAND.labels = res.labels;
                switch (res.mode) {
                    case 'bewerk':
                        MODAAL.kop(TELLERSTAND.labels.tellerstandBewerkTitelBewerk);
                        break;
                    case 'nieuw':
                        // Create a new date object
                        let currentDate = new Date();
                        // Format the date as yyyy-mm-dd
                        let date2use = formatDate(currentDate);
                        res.tellerstand.datum = date2use;
                        MODAAL.kop(TELLERSTAND.labels.tellerstandBewerkTitelNieuw);
                        break; B
                    case 'verwijder':
                        disabled = 'disabled'
                        MODAAL.kop(TELLERSTAND.labels.tellerstandBewerkTitelVerwijder);
                        break;
                }


                let inhoud = `
                            <div id="tellerstandBewerkBoodschap"></div>
                            <input type="hidden" id="tellerstandBewerkID" value="${res.tellerstand.id}">
                            <input type="hidden" id="tellerstandBewerkMode" value="${res.mode}">

                            <div class="form-group mb-3">
                                <label class="form-label" for="tellerstandBewerkDatum">${TELLERSTAND.labels.tellerstandBewerkDatum}</label>
                                <input input type="date" class="form-control" type="text" id="tellerstandBewerkDatum" value="${res.tellerstand.datum}" ${disabled}>
                            </div>
                            <div class="form-group mb-3">
                                <label class="form-label" for="tellerstandBewerkDag">${TELLERSTAND.labels.tellerstandBewerkDag}</label>
                                <input class="form-control" type="text" id="tellerstandBewerkDag" value="${res.tellerstand.dag}" ${disabled}>
                            </div>
                            <div class="form-group mb-3">
                                <label class="form-label" for="tellerstandBewerkNacht">${TELLERSTAND.labels.tellerstandBewerkNacht}</label>
                                <input class="form-control" type="text" id="tellerstandBewerkNacht" value="${res.tellerstand.nacht}" ${disabled}>
                            </div>
                            <div class="form-group mb-3">
                                <label class="form-label" for="tellerstandBewerkDagtellerIn">${TELLERSTAND.labels.tellerstandBewerkDagtellerIn}</label>
                                <input class="form-control" type="text" id="tellerstandBewerkDagtellerIn" value="${res.tellerstand.dagteller_in}" ${disabled}>
                            </div>
                            <div class="form-group mb-3">
                                <label class="form-label" for="tellerstandBewerkNachttellerIn">${TELLERSTAND.labels.tellerstandBewerkNachttellerIn}</label>
                                <input class="form-control" type="text" id="tellerstandBewerkNachttellerIn" value="${res.tellerstand.nachtteller_in}" ${disabled}>
                            </div>
                            <div class="form-group mb-3">
                                <label class="form-label" for="tellerstandBewerkDagtellerUit">${TELLERSTAND.labels.tellerstandBewerkDagtellerUit}</label>
                                <input class="form-control" type="text" id="tellerstandBewerkDagtellerUit" value="${res.tellerstand.dagteller_uit}" ${disabled}>
                            </div>
                            <div class="form-group mb-3">
                                <label class="form-label" for="tellerstandBewerkNachttellerUit">${TELLERSTAND.labels.tellerstandBewerkNachttellerUit}</label>
                                <input class="form-control" type="text" id="tellerstandBewerkNachttellerUit" value="${res.tellerstand.nachtteller_uit}" ${disabled}>
                            </div>
                            <div class="form-group mb-3">
                                <label class="form-label" for="tellerstandBewerkZon">${TELLERSTAND.labels.tellerstandBewerkZon}</label>
                                <input class="form-control" type="text" id="tellerstandBewerkZon" value="${res.tellerstand.zon}" ${disabled}>
                            </div>
                            <div class="form-group mb-3">
                                <label class="form-label" for="tellerstandBewerkWater">${TELLERSTAND.labels.tellerstandBewerkWater}</label>
                                <input class="form-control" type="text" id="tellerstandBewerkWater" value="${res.tellerstand.water}" ${disabled}>
                            </div>
                            <div class="form-group mb-3">
                                <label class="form-label" for="tellerstandBewerkGas">${TELLERSTAND.labels.tellerstandBewerkGas}</label>
                                <input class="form-control" type="text" id="tellerstandBewerkGas" value="${res.tellerstand.gas}" ${disabled}>
                            </div>
                        `;
                MODAAL.inhoud(inhoud);
                let voet = '';
                if (res.mode === 'verwijder')
                    voet += MODAAL.knop('tellerstandBewerkBewaar', 'primary', 'trash3', TELLERSTAND.labels.tellerstandBewerkVerwijder);
                else
                    voet += MODAAL.knop('tellerstandBewerkBewaar', 'primary', 'check-square', TELLERSTAND.labels.tellerstandBewerkBewaar);
                voet += MODAAL.knop('tellerstandBewerkAnnuleer', 'secondary', 'x-square', TELLERSTAND.labels.tellerstandBewerkAnnuleer);
                MODAAL.voet(voet);
                MODAAL.toon();
            }

        }).catch((error) => {
            console.log(error);

        })
    },

    bewerkBewaar:() => {
        let mode = $('#tellerstandBewerkMode').val();
        let id = $('#tellerstandBewerkID').val();
        let datum = $('#tellerstandBewerkDatum').val();
        let dag = $('#tellerstandBewerkDag').val().trim();
        let nacht = $('#tellerstandBewerkNacht').val().trim();
        let dagteller_in = $('#tellerstandBewerkDagtellerIn').val().trim();
        let dagteller_uit = $('#tellerstandBewerkDagtellerUit').val().trim();
        let nachtteller_in = $('#tellerstandBewerkNachttellerIn').val().trim();
        let nachtteller_uit = $('#tellerstandBewerkNachttellerUit').val().trim();
        let zon = $('#tellerstandBewerkZon').val().trim();
        let water = $('#tellerstandBewerkWater').val().trim();
        let gas = $('#tellerstandBewerkGas').val().trim();

        let frmDta = {
            mode: mode,
            id: id,
            datum: datum,
            dag: dag,
            nacht: nacht,
            dagteller_in: dagteller_in,
            nachtteller_in: nachtteller_in,
            dagteller_uit: dagteller_uit,
            nachtteller_uit: nachtteller_uit,
            zon: zon,
            water: water,
            gas: gas,
        }

        fetch('/jxTellerstandBewaar', {
            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                'X-CSRF-Token': TELLERSTAND.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => {
            return response.json();
        }).then(res => {
            if (res.succes) {
                if (res.succes) {
                    MODAAL.verberg();
                    TELLERSTAND.tellerstandenOphalen();

                }
            }
        }).catch(err => {
            console.log(err);
        })

    }

}

function formatDate(date) {
    console.log(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}