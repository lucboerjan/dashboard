$(() => {
    if ($('#internetlinksIndex').length) INTERNETLINKS.init();

});

const INTERNETLINKS = {
    csrfToken: $('meta[name="csrf-token"]').attr('content'),
    internetGroepen: {},



    init: () => {

        //Internetlinks toevoegen - bewerken - verwijderen
        $('body').on('click', '.bewerk_internetlink', function (evt) {
            INTERNETLINKS.bewerklink($(this).attr('id').split('_')[1], 'bewerk');
        });
        $('body').on('click', '.verwijder_internetlink', function (evt) {
            INTERNETLINKS.bewerklink($(this).attr('id').split('_')[1], 'verwijder');
        });
        $('body').on('click', '.toevoegen_internetlink', function (evt) {
            INTERNETLINKS.bewerklink(0, 'nieuw')
        });
        $('body').on('click', '.initieer_internetlink', function (evt) {
            INTERNETLINKS.launchLink($(this).attr('id').split('_')[1], 'verwijder')
        });


        $('body').on('click', '#internetGroepenAccordeon h3', function (evt) {
            INTERNETLINKS.bewerkgroep($(this).attr('aria-controls').split('_')[1],)
        });

        $('body').on('click', '#internetlinkBewaren', function (evt) {
            INTERNETLINKS.bewaarInternetlink()
        });

        //Internetgroepen
        $('body').on('click', '.internetgroepBewaren', function (evt) {
            INTERNETLINKS.bewaarInternetGroep($(this).attr('id').split('_')[1]);
        });

        $('body').on('click', '.internetgroepDetailsLeegmaken', function (evt) {
            INTERNETLINKS.internetgroepDetailsLeegmaken();
        });
        $('body').on('click', '.internetlinkDetailsLeegmaken', function (evt) {
            INTERNETLINKS.internetlinkDetailsLeegmaken();
        });


        let frmDta = {};

        fetch('/jxInternetGroepen', {
            method: 'post',
            body: JSON.stringify({ 'frmDta': frmDta }),

            headers: {
                'X-CSRF-Token': INTERNETLINKS.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => {
            return response.json();
        }).then(res => {
            if (res.succes) {
                INTERNETLINKS.internetGroepen = {};
                $('#internetGroepenContainer').empty();
                $('#internetGroepenContainer').append($('<h4>').html('Internetlinks').css('font-weight', 'bold'));

                $('#internetGroepenContainer').append($('<div>').attr('id', 'internetGroepenAccordeon'));
                res.internetgroepen.forEach(internetgroep => {
                    $('#internetGroepenAccordeon')
                        .append($('<h3>').html(internetgroep.omschrijving).css('font-weight', 'bold'))
                        .append($('<div>').addClass('container').attr('id', 'internetgroep_' + internetgroep.id).addClass('internetgroepen')
                            .append($('<div>').addClass('row')));

                    INTERNETLINKS.getInternetLinks(internetgroep.id);

                });
                INTERNETLINKS.internetGroepen = res.internetgroepen;
                INTERNETLINKS.internetgroepDetails(INTERNETLINKS.internetGroepen[0].id);
                $("#internetGroepenAccordeon").accordion({ collapsible: true });
            }
        }).catch(err => {
            console.log(err);
        })

    },

    getInternetLinks: (groepID) => {
        let frmDta = {
            'groepID': groepID
        }

        fetch('/jxGetInternetLinks', {
            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                'X-CSRF-Token': INTERNETLINKS.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => {
            return response.json();
        }).then(res => {
            if (res.succes) {
                let card2use = $('#internetgroep_' + groepID);
                card2use.empty();
                card2use.addClass('mb-3');


                var table = $('<table>').addClass('internetLinks');

                var headerRow = $('<tr>');
                headerRow.append('<th>Internet URL</th>');
                headerRow.append(`<th><button type="button" class="btn btn-primary toevoegen_internetlink internetActieButtons" id="internetgroep_${groepID}">Nieuw</button></th>`); // Using template literals

                table.append(headerRow);

                res.internetlinks.forEach(internetlink => {
                    // Create a new table row element
                    var dataRow = $('<tr>');

                    // Define the content for the hyperlink using template literals
                    let inhoud = `<a href="${internetlink.url}" target="_blank">${internetlink.omschrijving}</a>`;

                    // Create a new table data cell, set its class, id, and HTML content, then append it to the table row
                    dataRow.append(
                        $('<td>')
                            .addClass('intenetlinkID')          // Add class 'intenetlinkID'
                            .attr('id', "rid_" + internetlink.id)  // Set the id attribute to 'rid_' followed by internetlink.id
                            .html(inhoud)                         // Set the HTML content to the hyperlink
                    );


                    inhoud = `
                        <div class="btn-group mr-2" role="group"> 
                            <button class="btn btn-success initieer_internetlink type="button" id="rid_${internetlink['id']}"><i class="bi bi-rocket-takeoff"></i></i></button>
                            <button class="btn btn-primary bewerk_internetlink myActionButton" type="button" id="rid_${internetlink['id']}"><i class="bi bi-pencil-square"></i></button>
                            <button class="btn btn-warning verwijder_internetlink myActionButton" type="button" id="rid_${internetlink['id']}"><i class="bi bi-scissors"></i></button>
                        </div>    
                    `;

                    dataRow.append($('<td>').addClass('internetActieButtons').html(inhoud));

                    table.append(dataRow);
                });

                card2use.append(table);
            }

        }).catch(err => {
            console.log(err);
        })
    },


    bewerklink: (linkID, mode) => {
        let frmDta = {
            'id': linkID,
            'groepid': $('#internetgroepBewerkgroepID').val(),
            'mode': mode
        }

        fetch('/jxGetInternetLink', {
            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                "X-CSRF-Token": INTERNETLINKS.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            return response.json()
        }).then((res) => {
            if (res.mode === 'verwijder') {
                INTERNETLINKS.internetlinkVerwijder(res);
            }
            else {
                INTERNETLINKS.internetLinkDetails(res);
            }
        }).catch(err => {
            console.log(err);
        })

        INTERNETLINKS.internetgroepDetails(1);
    },

    bewerkgroep: (groepID) => {

        INTERNETLINKS.internetgroepDetails(groepID);
    },

    internetgroepDetails: (groepID) => {
        let details = $('#internetgroepDetails');
        let omschrijving = INTERNETLINKS.getOmschrijvingForId(groepID);
        details.empty();
        //details.css('height', 'fit-content');
        let inhoud = `

                <div class="mb-3">
                    <label for="internetgroepBewerkgroepID">ID groep</label>
                    <input id="internetgroepBewerkgroepID" disabled="disabled" style="width:50px;" value="${groepID}"></input>
                </div>
                <div>

                    <label for="internetgroepBewerkOmschrijving">Omschrijving</label>
                    <input class="form-control mb-1" id="internetgroepBewerkOmschrijving" value="${omschrijving}"></input>
                </div>

                <div class="btn-group mb-1">
                    <button class="btn btn-primary internetgroepBewaren" id="internetgroepBewaren_${groepID}"><i class="bi bi-save"></i> &nbsp;Bewaren</button>
                    <button class="btn btn-warning internetgroepDetailsLeegmaken" id="internetgroepDetailsLeegmaken"><i class="bi bi-recycle"></i> &nbsp;Leegmaken</button>    
                </div>
                `

        $(details).html(inhoud);
    },

    internetlinkVerwijder:(res) => {
        console.log(res);
        let frmDta = {
            'id': res.id
        }
        fetch('/jxVerwijderInternetLink', {
            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                "X-CSRF-Token": INTERNETLINKS.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            return response.json()
        }).then((res) => {
            console.log(res);


            // Select the <td> element using its ID
            var $td = $('#rid_' + res.id);
    
            // Find the closest <tr> ancestor and hide it
            $td.closest('tr').hide();
        }).catch(err => {
            console.log(err);
        })



    },

    internetLinkDetails: (res) => {
        let details = $('#internetlinkDetails');
        details.empty();

        let inhoud = `

        <div class="mb-3">
            <label for="linkID">ID link</label>
            <input id="linkID" disabled="disabled" style="width:50px;" value="${res.id}"></input>
        </div>

        <div>
            <label for="internetlinkOmschrijving">Omschrijving</label>
            <input class="form-control mb-1" id="internetlinkOmschrijving" value="${res.omschrijving}"></input>
        </div>
        <div>
            <label for="internetlinkUrl">URL-link</label>
            <input class="form-control mb-1" id="internetlinkUrl" value="${res.url}"></input>
        </div>

        <div class="btn-group mb-1">
            <button class="btn btn-primary internetlinkBewaren" id="internetlinkBewaren"><i class="bi bi-save"></i> &nbsp;Bewaren</button>
            <button class="btn btn-warning internetlinkDetailsLeegmaken" id="internetlinkpDetailsLeegmaken"><i class="bi bi-recycle"></i> &nbsp;Leegmaken</button>    
            
        </div>

        `
        $(details).html(inhoud);




    },

    bewaarInternetlink: () => {
        let frmDta = {
            'id': $('#linkID').val(),
            'groepID': $('#internetgroepBewerkgroepID').val(),
            'url': $('#internetlinkUrl').val(),
            'omschrijving': $('#internetlinkOmschrijving').val()
        }

        fetch('/jxBewaarInternetLink', {
            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                "X-CSRF-Token": INTERNETLINKS.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            return response.json()
        }).then((res) => {
            console.log(res);
            let inhoud = `<a href="${res.url}" target="_blank">${res.omschrijving}</a>`;
            $('.internetLinks').find('#rid_' + res.id).html(inhoud);
            INTERNETLINKS.internetlinkDetailsLeegmaken();
            INTERNETLINKS.getInternetLinks(res.groepid);

        }).catch(err => {
            console.log(err);

        })
    },


    bewaarInternetGroep: (groepID) => {
        let frmDta = {
            'groepID': groepID,
            'omschrijving': $('#internetgroepBewerkOmschrijving').val()
        }


        fetch('/jxBewaarInternetGroep', {
            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                "X-CSRF-Token": INTERNETLINKS.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            return response.json()
        }).then((res) => {
            var divId = 'internetgroep_' + res.groepID;
            var $div = $('#' + divId);
            var h3Id = $div.attr('aria-labelledby');
            $('#' + h3Id).text(res.omschrijving);

        }).catch(err => {
            console.log(err);

        })

    },

    internetlinkDetailsLeegmaken: () => {
        $('#linkID').val(0);
        $('#internetlinkOmschrijving').val('');
        $('#internetlinkUrl').val('');

    },
    internetgroepDetailsLeegmaken: () => {
        $('#internetgroepBewerkgroepID').val(0);
        $('#internetgroepBewerkOmschrijving').val('');

    },

    getOmschrijvingForId: (groepID) => {
        for (let i = 0; i < INTERNETLINKS.internetGroepen.length; i++) {
            let id2eval = INTERNETLINKS.internetGroepen[i].id;
            if (id2eval == groepID) {
                return INTERNETLINKS.internetGroepen[i].omschrijving;
            }
        }
        return null;
    },

    launchLink: (linkID) => {
        const linkElement = document.querySelector(`td#rid_${linkID} a`);
        if (linkElement) {
            const url = linkElement.href;
            window.open(url, '_blank');
        } else {
            console.error('Link element not found!');
        }

    }


}