$(() => {
    if ($('#vertoningenIndex').length) VERTONINGEN.init();
    if ($('#imdbratingIndex').length) IMDBTABEL.init();
    if ($('#filmLijstIndex').length) FILMLIJST.init();


});

const FILMLIJST = {
    csrfToken: $('meta[name="csrf-token"]').attr('content'),
    filmlijst: [],
    boodschappenFilmlijst: [],
    init: () => {
        $("#filmMenu").show();
        FILMLIJST.filmlijstOverzicht();
        // filterfunctie
        
        $('#filmlijstZoek').on('keyup', () => { FILMLIJST.filmlijstFilter(); });
        $('#filmlijstFilter').on('click', () => { FILMLIJST.filmlijstFilter(); });
        $('#filmlijstFilterAnnuleer').on('click', () => {
            $('#filmlijstZoek').val('');
            FILMLIJST.filmFilter();
        });
    },

    filmlijstOverzicht: () => {
        let frmDta = {
        }

        fetch('/jxFilmlijst', {
            method: 'post',
            body: JSON.stringify(frmDta),
            headers: {
                "X-CSRF-Token": FILMLIJST.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            return response.json();
        }).then((res) => {
            console.log(res);
            FILMLIJST.filmLijstToon(res);
        }).catch((error) => {
            console.log(error);
        })

    },


    filmLijstToon: (res) => {
        let inhoudFilmLijst = $('#inhoudFilmLijst');

        inhoudFilmLijst.empty();

        res.filmlijst.forEach(
            film => {
                inhoudFilmLijst.append(FILMLIJST.filmLijstObject(film.id,
                    film.titel,
                    film.jaar,
                    film.aantal,
                    true));
            }
        )
    },

    filmLijstObject: (id, titel, jaar, aantal, status) => {
        let disabled = status ? 'disabled' : '';
        let knoppenStandaard = status ? 'block' : 'none';
        let knoppenVerborgen = status ? 'none' : 'block';

        return `
            <div class="input-group mb-1 filmlijstItem d-inline-flex" id="filmID_${id}">

                <div class="input-group-text">
                    <input type="checkbox" class="for-check-input inhoudFilmSelecteer">
                </div>

                <div class="badge text-bg-secondary" style="min-width:80px; padding-top: 12px;">${aantal}</div>
                
                <input type="text" class="form-control filmlijstTitel" value="${titel}" ${disabled}>
                <input type="text" class="form-control jaar" value="${jaar}" ${disabled}>

                <button type="button" class="btn btn-primary inhoudFilmBewerk" style="display:${knoppenStandaard};">
                    <i class="bi bi-pencil"></i>
                </button>

                <button type="button" class="btn btn-secondary inhoudFilmBewerk" style="display:${knoppenStandaard};">
                    <i class="bi bi-trash"></i>
                </button>

                <button type="button" class="btn btn-primary inhoudFilmBewaar" style="display:${knoppenVerborgen};">
                    <i class="bi bi-check"></i>
                </button>

                <button type="button" class="btn btn-secondary inhoudFilmAnnuleer" style="display:${knoppenVerborgen};">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
        `;


    },

    filmlijstFilter: ()=> {

        $('.filmlijstSelecteer').prop('checked', false);
        $('#filmlijstMerge').prop('disabled', true);

        let filter = $('#filmlijstZoek').val().trim().toUpperCase();

        if (filter.length == 0) {
            $('.fimlijstItem').removeClass('visually-hidden');
        }
        else {
            $('.filmlijstItem').each((ndx, item) => {
                let naam = $(item).find('.filmlijstTitel').val()
                                                             .replace(/<[^>]+>/g,'')
                                                              .replace(/\s+/g ,'')
                                                             .replace('\n' ,'');

                if (naam.toUpperCase().indexOf(filter) === -1) {
                    $(item).addClass('visually-hidden');
                }
                else {
                    $(item).removeClass('visually-hidden');
                }
            });
        }
    },
}



const VERTONINGEN = {
    labels: null,
    fout: null,
    regexDatum: /^\d{4}(\-)(((0)[0-9])|((1)[0-2]))(\-)([0-2][0-9]|(3)[0-1])$/,
    csrfToken: $('meta[name="csrf-token"]').attr('content'),
    filmlijst: [],
    tvzenders: [],
    imdbratings: [],
    mode: '',

    init: () => {
        $("#filmMenu").show();
        // VERTONINGEN.lijst(0);
        $("#tvvertoningen").tabs({
            active: 0

        });



        //paginering
        $('#overzichtVertoningen').on('click', '#paginering a', function (evt) {
            VERTONINGEN.lijst($(this).data('pagina'));
        });

        $('#overzichtImdbRaitings').on('click', '#paginering a', function (evt) {
            IMDBTABEL.lijst($(this).data('pagina'));
        });


        //bewerken
        $('body').on('click', '.bewerkVertoning', function (evt) {


            var closestRow = $(this).closest('tr');
            var vertoningID = $(this).attr('id').split('_')[1];
            //var vertoningID = $(closestRow).attr('id').split('_')[1];


            var datumValue = closestRow.find('.datum').text();

            var titelValue = closestRow.find('.titel').text();
            var zenderValue = closestRow.find('.zender').text();
            var jaarValue = closestRow.find('.jaar').text();

            var imdbRatingValue = closestRow.find('.imdbrating').text();
            var imdbratingID = closestRow.find('.imdburl').attr("id").split('_')[1];
            VERTONINGEN.vertoningBewerk(vertoningID, datumValue, titelValue, zenderValue, jaarValue, imdbratingID, imdbRatingValue);
        });

        //verwijder vertoning
        $('body').on('click', '.verwijderVertoning', function (evt) {
            let id = $(this).attr('id').split('_')[1];
            VERTONINGEN.vertoningVerwijder($(this).attr('id').split('_')[1]);
        });

        $('body').on('click', '#vertoningBewerkVerwijder', function (evt) { VERTONINGEN.vertoningBewerkVerwijder($('#vertoningID').val()) });

        //bewaren
        $('body').on('keyup change input', '#filmTitel', () => {
            if ($('#filmTitel').val().length >= 2) {
                try {

                    $('#titel2use').val($('#filmTitel').val().split('###')[0].trim());

                    let filmjaar = $('#filmTitel').val().split('###')[1];
                    $('#filmJaar').val(filmjaar.split('(')[0].trim());
                    VERTONINGEN.getImdbID();
                }
                catch (error) { }
            };

            // Execute the copy command
            navigator.clipboard.writeText($('#titel2use').val());
        });

        $('body').on('blur', '#imdbrating', () => { $('.vertoningBewaren').focus() });

        VERTONINGEN.panelDetails();
        VERTONINGEN.mode = 'dagoverzicht';
        VERTONINGEN.lijst(0);



        $('body').on('click', '.vertoningBewaren', function (evt) { VERTONINGEN.vertoningBewaar() });
        $('body').on('click', '.detailsLeegmaken', function (evt) { VERTONINGEN.clearDetailPanel(); $('#tvZender').val(''); });
        $('body').on('change', '#filmJaar', function (evt) { VERTONINGEN.getImdbID() });
        $('body').on('change', '#datum', function (evt) { VERTONINGEN.clearDetailPanel(), VERTONINGEN.lijst(0) });
        $('body').on('click', '.volgende', function (evt) { VERTONINGEN.mode = 'dagoverzicht', VERTONINGEN.pasdatumaan(1) });
        $('body').on('click', '.vorige', function (evt) { VERTONINGEN.mode = 'dagoverzicht', VERTONINGEN.pasdatumaan(-1) });
        $('body').on('click', '#detailImdbRatingAnnuleer', function (evt) { MODAAL.verberg() });
        $('body').on('click', '#VertoningBewerkAnnuleer', function (evt) { MODAAL.verberg() });
        $('body').on('click', '#vertoningZoeken', function (evt) { VERTONINGEN.zoekVertoningen() });

        //tab imdbrating
        // $('body').on('click', '.verwijderImdbRating', function (evt) { IMDBTABEL.verwijderImdbRating($(this).parent().parent().attr('id').split('_')[1]); });
        // $('body').on('click', '.imdbratingVerwijder', function (evt) { IMDBTABEL.imdbratingVerwijder(); });

    },

    lijst: (pagina) => {
        let frmDta = {};
        let function2use = '';

        switch (VERTONINGEN.mode) {
            case 'dagoverzicht':
                frmDta = {
                    'pagina': pagina,
                    'datum': $('#datum').val()
                }
                function2use = 'jxVertoningenOverzicht';
                break;
            case 'zoeken':
                frmDta = {
                    'pagina': pagina,
                    'filmtitel': $('#filmTitel').val()
                }
                function2use = 'jxZoekVertoningen';
                break;
        }

        fetch(function2use, {
            method: 'post',
            body: JSON.stringify(frmDta),
            headers: {
                "X-CSRF-Token": VERTONINGEN.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {

            return response.json();
        }).then((res) => {
            let list2use = res.filmlijst;
            VERTONINGEN.filmlijst = [];
            $.each(list2use, function (idx, film) {
                $.each(film, function (index, filmtitel) {
                    VERTONINGEN.filmlijst.push(filmtitel);
                });
            });

            list2use = res.tvzenders;
            VERTONINGEN.tvzenders = [];
            $.each(list2use, function (idx, tvzenders) {
                $.each(tvzenders, function (index, tvzender) {
                    VERTONINGEN.tvzenders.push(tvzender);
                });
            });
            VERTONINGEN.imdbratings = res.imdbratings;
            VERTONINGEN.overzicht(res);


        }).catch((error) => {
            console.log(error);
        })
    },

    overzicht: (res) => {
        VERTONINGEN.labels = res.labels;
        let lijst = $('#overzichtVertoningen');
        $(lijst).empty();

        let inhoud = '<table class="table table-striped tblFilmOverzicht">';
        inhoud += `<thead  class="table-light">
                        <th style="width:80px;">Datum</th>
                        <th style="width:80px;">Zender</th>
                        <th  style="width:250px;;">titel</th>
                        <th style="width:50px;">Jaar</th>
                        <th style="width:60px;;">Rating</th>
                        <th style="width:60px;;">###</th>
                        <th style="width:125px;;">&nbsp;</th>`

        res.vertoningen.forEach(vertoning => {

            inhoud += `
            <tr id="${'vertoningID_' + vertoning.id}">
                <td class="datum">${vertoning.datumvertoning}</td>
                <td class="zender">${vertoning.naam}</td>
                <td class="titel">${vertoning.titel}</td>
                <td class="jaar">${vertoning.jaar}</td>
                <td class="imdbrating">${vertoning.imdbrating}</td>
                <td class="aantalvertoningen">${vertoning.aantalVertoningen}</td>
                
                <td>
                    <div class="btn-group mr-2" role="group">
                        <button class="btn btn-success imdburl" id="rid_${vertoning.imdbratingID}">
                            <a href="${vertoning.imdburl}" target="_blank" class="text-white" style="text-decoration: none;">
                                <i class="bi bi-link-45deg"></i>
                            </a>
                        </button>
                        <button class="bewerkVertoning btn btn-primary bi bi-pencil-square" id="rid_${vertoning.id}"></button>
                        <button class="verwijderVertoning btn btn-warning bi bi-scissors" id="rid_${vertoning.id}"</button></td>
                   </div>     
            </tr>
            `

        });

        inhoud += '</table>';

        $(lijst).append($('<div>').addClass('card-body mb-1 vertoning').html(inhoud));

        //paginering
        if (res.aantalpaginas > 0) {

            $('#overzichtVertoningen').append(
                $('<div>').css('text-align', 'center')
                    .append(PAGINERING.pagineer(res.pagina, res.knoppen, res.aantalpaginas))
            );
        }

        $("#tvZender").autocomplete({
            source: VERTONINGEN.tvzenders
        });

        $("#filmTitel").autocomplete({
            source: VERTONINGEN.filmlijst
        });


    },


    vertoningBewaar: () => {

        let frmDta = {
            'id': $('#id').val(),
            'datum': $('#datumvertoning').val(),
            'titel': $('#titel2use').val(),
            'tvzender': $('#tvZender').val(),
            'filmjaar': $('#filmJaar').val(),
            'imdbid': $('#imdbid').val(),
            'imdburl': $('#imdburl').val(),
            'imdbrating': $('#imdbrating').val(),
        }

        fetch('jxBewaarVertoning', {
            method: 'post',
            body: JSON.stringify(frmDta),
            headers: {
                "X-CSRF-Token": VERTONINGEN.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {

            return response.json();
        }).then((res) => {
            if (res.succes) {
                VERTONINGEN.clearDetailPanel();
                VERTONINGEN.lijst(0);

                //indien het een film is die werd toegevoegd aan imdb => aan imdbratings toevoegen
                console.log('Film zoeken in VERTONINGEN.imdbratings');

                let targetFilm = VERTONINGEN.imdbratings.find(film => film.titel === res.filmtitel && parseInt(film.jaar) === parseInt(res.filmjaar));
                if (targetFilm) {
                    console.log('Film bestaat reeds VERTONING.imdbratings');
                }
                else {
                    console.log('Film bestaat nog niet VERTONING.imdbratings');

                }

            };

        }).catch((error) => {
            console.log(error);
        })
    },

    getImdbID: () => {
        let filmtitel = $('#titel2use').val().trim();
        let filmjaar = parseInt($('#filmJaar').val().trim());
        $("#imdbid").val(0);
        $("#imdburl").val('');
        $("#imdbrating").val(0);

        let targetFilm = VERTONINGEN.imdbratings.find(film => film.titel === filmtitel && parseInt(film.jaar) === parseInt(filmjaar));

        // Check if the object with the specified titel2use and filmJaar was found
        if (targetFilm) {
            // Access properties of the found object
            let foundId = targetFilm.id;

            $("#imdbid").val(foundId);
            $("#imdburl").val(targetFilm.imdburl);
            $("#imdbrating").val(targetFilm.imdbrating);
        } else {
            console.log('Film not found with filmtitel:', filmtitel, 'and filmjaar:', filmjaar);
        }

    },

    panelDetails: () => {

        let details = $('#detailsVertoningen');

        // Create a new date object
        let currentDate = new Date();
        // Format the date as yyyy-mm-dd
        let date2use = formatDate(currentDate);

        let inhoud = `

            <div class="card card-body datumselector mb-1">
         
        

                    <label for="datum">Kies een datum om de geprogrammeerde films te bekijken</label>
                    <div class="d-flex div_filmdatum">
                   
                        <button class="btn btn-primary vorige" style="height:32px;"><i class="bi bi-chevron-double-left"></i></button>
                        <input type="date" class="form-control filmdatum mb-1" id="datum" value="${date2use}"></input>
                        <button class="btn btn-primary volgende" style="height:32px;"><i class="bi bi-chevron-double-right"></i></button>
                   
                    </div>  

            </div>

            <div class="card card-body" >


                <div class="d-flex align-items-center" style="width: 300px;">
                    <label for="datum" class="me-3">Datum vertoning:</label>
                    <input type="date" class="form-control filmdatum" id="datumvertoning" value="${date2use}"></input>
                </div>

                <div>
                    <label for="filmTitel class="mb-1">Titel van de film: </label><br>
                    <input id="filmTitel" class="mb-1" style="width:350px;"></input><br>
                </div>
                 
                <div>
                    <label for="tvZender class="mb-1">Televisiezender: </label>
                    <input id="tvZender" class="mb-1" style="width:150px;"></input><br>
                </div>
                <div>
                    <span class="mb-3">
                        <label for="filmJaar mb-1">Jaar eerste vertoning: </label>
                        <input id="filmJaar" style="width:50px;"></input><br></br>
                    </span>
                </div>
                <div class="btn-group mb-3">
                    <button class="btn btn-primary vertoningBewaren" id="vertoningBewaren"><i class="bi bi-save"></i> &nbsp;Bewaren</button>
                    <button class="btn btn-warning detailsLeegmaken" id="detailsLeegmaken"><i class="bi bi-recycle"></i> &nbsp;Leegmaken</button>    
                    <button class="btn btn-info vertoningZoeken" id="vertoningZoeken"><i class="bi bi-search"></i> &nbsp;Zoeken</button>    
                </div>
                    
                <br><br><br><br>

                <input id="titel2use" disabled="disabled" style="width:350px;"></input>
                <input id="id" disabled="disabled" style="width:50px;" value="0"></input>
                <input id="imdbid" disabled="disabled" style="width:50px;" value="0"></input>
                <input id="imdburl" type="text" style="width:350px;"></input>
                <input id="imdbrating" style="width:50px;"></input>
            </div>
                    `;
        $(details).html(inhoud);
    },

    pasdatumaan: (richting) => {
        let currentDate = new Date($('#datum').val());
        currentDate.setDate(currentDate.getDate() + richting);
        let newDate = currentDate.toISOString().split('T')[0];
        $('#datum').val(newDate);
        VERTONINGEN.lijst(0);
    },

    vertoningBewerk: (vertoningID, datum, titel, zender, jaar, imdbratingID, imdbrating) => {
        let imdburlValue = '';
        let targetFilm = VERTONINGEN.imdbratings.find(film => film.titel === titel && parseInt(film.jaar) === parseInt(jaar));
        if (targetFilm) {
            imdburlValue = targetFilm.imdburl;
            imdbrating = targetFilm.imdbrating;
            imdbratingID = targetFilm.id;
            console.log('Film found in IMDB table with url:', imdburlValue);

        } else {
            //let imdburlValue = '';
            imdbrating = 0;
            imdbratingID = 0;
        }

        $('#id').val(vertoningID);

        let date2use = datum.split('-');
        date2use = new Date(date2use[2], date2use[1] - 1, date2use[0]);

        $('#datumvertoning').val(formatDate(date2use));
        $('#filmTitel').val(titel);
        $('#tvZender').val(zender);
        $('#filmJaar').val(jaar);
        $('#imdbrating').val(imdbrating);
        $('#imdbid').val(imdbratingID);
        $('#imdburl').val(imdburlValue);
        $('#titel2use').val(titel);
        $('#filmTitel').focus();
    },

    clearDetailPanel: () => {
        $('#filmJaar').val('');
        $('#id').val(0),
            $('#imdburl').val('');
        $('#titel2use').val('');
        $('#imdbid').val(0);
        $('#imdbrating').val(0);
        $('#filmTitel').val('').focus();
    },

    zoekVertoningen: () => {
        let frmDta = {
            'filmtitel': $('#filmTitel').val(),
            'pagina': 0,
        }

        fetch('jxZoekVertoningen', {
            method: 'post',
            body: JSON.stringify(frmDta),
            headers: {
                "X-CSRF-Token": VERTONINGEN.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            return response.json();
        }).then((res) => {
            VERTONINGEN.mode = 'zoeken';
            VERTONINGEN.overzicht(res);

        }).catch((error) => {
            console.log(error);
        })

    },

    vertoningVerwijder: (vertoningID) => {
        let frmDta = {
            'vertoningID': parseInt(vertoningID)
        }

        fetch('jxGetVertoning', {
            method: 'post',
            body: JSON.stringify(frmDta),
            headers: {
                "X-CSRF-Token": VERTONINGEN.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            return response.json();
        }).then((res) => {
            if (res.succes) {
                VERTONINGEN.vertoningVerwijderModaal(res);
            }
            // VERTONINGEN.mode = 'dagoverzicht';
            // VERTONINGEN.lijst(0);

        }).catch((error) => {
            console.log(error);
        })
    },

    vertoningVerwijderModaal: (res) => {
        MODAAL.kop(VERTONINGEN.labels.vertoningBewerkTitelVerwijder);
        let disabled = 'disabled';

        let inhoud = `
        <div id="vertoningVerwijderBoodschap"></div>
        <input type="hidden" id="vertoningID" value="${res.info.id}">
        
        <div class="input-group d-inline-flex align-items-center mb-3">
            <label for="datum" class="form-label">Datum:</label>
            <input type="date" class="form-control" id="vertoningDatum" name="vertoningDatum" value="${res.info.datum}" ${disabled}>
        </div>
        <div class="input-group d-inline-flex align-items-center mb-3">
            <label for="vertoningTitel" class="form-label">Titel:</label>
            <input type="text" class="form-control" id="vertoningTitel" value="${res.info.titel}" ${disabled}>
        </div>
        <div class="input-group d-inline-flex align-items-center mb-3">
            <label for="vertoningJaar" class="form-label">Jaar:</label>
            <input type="text" class="form-control" id="vertoningJaar" value="${res.info.jaar}" ${disabled}>
        </div>
        <div class="input-group d-inline-flex align-items-center mb-3">
            <label for="vertoningZender" class="form-label">Zender:</label>
            <input type="text" class="form-control" id="vertoningZender" value="${res.info.zender}" ${disabled}>
        </div>
        <div class="input-group d-inline-flex align-items-center mb-3">
            <label for="vertoningIMDBRating" class="form-label">IMDB Rating:</label>
            <input type="text" class="form-control" id="vertoningIMDBRatingr" value="${res.info.imdbrating}" ${disabled}>
        </div>
                `;



        MODAAL.inhoud(inhoud);

        let voet = '';
        voet += MODAAL.knop('vertoningBewerkVerwijder', 'warning', 'trash3', 'Verwijder');

        voet += MODAAL.knop('VertoningBewerkAnnuleer', 'secondary', 'x-square', 'Annuleer');

        MODAAL.voet(voet);
        MODAAL.toon();
        $('#modDlgInhoud').addClass('vertoningVerwijder');

    },

    vertoningBewerkVerwijder: (vertoningID) => {
        let frmDta = {
            'vertoningID': parseInt(vertoningID)
        }

        fetch('jxVertoningVerwijder', {
            method: 'post',
            body: JSON.stringify(frmDta),
            headers: {
                "X-CSRF-Token": VERTONINGEN.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            return response.json();
        }).then((res) => {
            if (res.succes) {

                MODAAL.verberg();
                VERTONINGEN.mode = 'dagoverzicht';
                VERTONINGEN.lijst(0);
            }

        }).catch((error) => {
            console.log(error);
        })
    },





}

const IMDBTABEL = {
    csrfToken: $('meta[name="csrf-token"]').attr('content'),
    boodschappenBewaar: [],
    boodschappenActies: [],
    boodschappenVerwijder: [],

    init: () => {

        // boodschappen ophalen
        IMDBTABEL.getBoodschappen();
        IMDBTABEL.lijst(0);



        $('body').on('click', '.bewerkImdbRating', function (evt) {
            ; IMDBTABEL.imdbratingbewerk($(this).parent().parent().attr('id').split('_')[1], 'bewerk');
        });

        $('body').on('click', '.verwijderImdbRating', function (evt) {
            IMDBTABEL.imdbratingbewerk($(this).parent().parent().attr('id').split('_')[1], 'verwijder');
        });

        //imdbratingverwijder 
        $('body').on('click', '#imdbratingverwijder', function (evt) {
            IMDBTABEL.imdbratingverwijder($('#imdbratingIDverwijder').val());
        });
        //imdbRatingDetailsBewaren
        $('body').on('click', '#imdbRatingDetailsBewaren', function (evt) {
            IMDBTABEL.imdbRatingDetailsBewaar($('#imdbratingID').val());
        });
        //

        $('body').on('click', '.infoImdbRating', function (evt) { IMDBTABEL.infoImdbRating($(this).parent().parent().attr('id').split('_')[1]); });

        //IMDBRECORD ZOEKEN
        $('body').on('click', '#imdbRecordZoeken', () => { IMDBTABEL.imdbRecordZoeken() });

        // MODAAL VENSTER
        $('body').on('click', '#verberg', function (evt) { MODAAL.verberg() });
        $('body').on('click', '#imdbRatingDetailsLeegmaken', function (evt) { IMDBTABEL.imdbRatingDetailsLeegmaken() });



    },

    lijst: (pagina) => {
        let frmDta = {
            'pagina': pagina,
        }

        fetch('jxImdbRatingOverzicht', {
            method: 'post',
            body: JSON.stringify(frmDta),
            headers: {
                "X-CSRF-Token": IMDBTABEL.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {

            return response.json();
        }).then((res) => {
            IMDBTABEL.overzicht(res);
        }).catch((error) => {
            console.log(error);
        })
    },

    overzicht: (res) => {

        let lijst = $('#overzichtImdbRaitings');
        $(lijst).empty();

        let inhoud = '<table class="table table-striped tblFilmOverzicht">';
        inhoud += `<thead  class="table-light">
                        <th style="width:300px;">Titel</th>
                        <th style="width:80px;">Jaar</th>
                        <th  style="width:80px;;">Rating</th>
                        <th style="width:700px;">URL</th>
                        <th style="width:250px;"></th>
                        `

        res.imdboverzicht.forEach(imdbrating => {
            inhoud += `
            <tr id="${'imdbratingID_' + imdbrating.id}">
                <td class="titel">${imdbrating.titel}</td>
                <td class="jaar">${imdbrating.jaar}</td>
                <td class="imdbrating">${imdbrating.imdbrating}</td>
                <td class="imdburl"><a href="${imdbrating.imdburl}" target="_blank">${imdbrating.imdburl}</a></td>
                
                <td>
                    <div class="btn-group mr-2" role="group"> 
                        <button class="infoImdbRating btn btn-success"><i class="bi bi-film"></i></button>
                        <button class="bewerkImdbRating btn btn-primary"><i class="bi bi-pencil"></i></button>
                        <button class="verwijderImdbRating btn btn-warning"><i class="bi bi-scissors"></i></button>
                    </div>    
                </td>
            </tr>
            `

        });

        inhoud += '</table>';

        $(lijst).append($('<div>').addClass('card card-body mb-1').html(inhoud));
        IMDBTABEL.panelDetails();

        //paginering
        if (res.aantalpaginas > 0) {

            $('#overzichtImdbRaitings').append(
                $('<div>').css('text-align', 'center')
                    .append(PAGINERING.pagineer(res.pagina, res.knoppen, res.aantalpaginas))
            );
        }

    },

    infoImdbRating: (imdbratingID) => {


        let frmDta = {
            'imdbratingID': imdbratingID,
        }

        fetch('jxGetImdbRatingInfo', {
            method: 'post',
            body: JSON.stringify(frmDta),
            headers: {
                "X-CSRF-Token": IMDBTABEL.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {

            return response.json();
        }).then((res) => {
            IMDBTABEL.detailImdbRating(res);


        }).catch((error) => {
            console.log(error);
        })
    },


    panelDetails: () => {
        // $("#filmTitel").autocomplete({
        //     source: VERTONINGEN.imdbratings
        // });
        let boodschappen = IMDBTABEL.boodschappenActies;


        let inhoud = `
                    <div id="imdbactieTitel" class="card card-body"><h5><strong>${boodschappen.nieuw}</strong></h5>
                  
                        <div>
                            <label for="imdratingbtitel class="mb-1">Titel: </label><br>
                            <input id="imdbratingtitel" class="mb-1" style="width:350px;"></input><br>
                        </div>
                 
                        <div>
                            <span>
                                <label for="imdbratingjaar" class="mb-1">Jaar: </label>
                                <input id="imdbratingjaar" class="mb-1" style="width:80px;"></input><br>
                            </span>

                            <span>
                                <label for="imdbratingrating">IMDB Rating: </label>
                                <input id="imdbratingrating" style="width:80px;"></input><br></br>
                            </span>    
                        </div>

                        <div class="mb-3">
                            <label for="imdbratingurl">IMDB Url: </label>
                            <input id="imdbratingurl" style="width:360px;"></input><br>
                        </div>
                        
                        <div class="mb-3">
                            <label for="imdbratingID">IMDB ID: </label>
                            <input id="imdbratingID" style="width:360px;"></input><br>
                        </div>

                        <div class="btn-group mb-3">
                            <button class="btn btn-primary" id="imdbRatingDetailsBewaren"><i class="bi bi-save"></i> &nbsp;Bewaren</button>
                            <button class="btn btn-warning" id="imdbRatingDetailsLeegmaken"><i class="bi bi-recycle"></i> &nbsp;Leegmaken</button>    
                            <button class="btn btn-info" id="imdbRecordZoeken"><i class="bi bi-search"></i> &nbsp;Zoeken</button>    
                        
                        </div>
                    </div>
                    `;

        $('#detailsImdbRaitings').html(inhoud);

    },

    detailImdbRating: (res) => {

        let targetFilm = VERTONINGEN.imdbratings.find(film => parseInt(film.id) === parseInt(res.imdbratingID));
        MODAAL.kop("Info vertoningen");
        let inhoud = '';

        inhoud += `
        <div class="card mb-3">
            <div class="card-body>
        
                <div class="card-text" style="margin-left:10px;" >
                    <h3>
                        <span class="fw-bolder">
                            Titel: ${targetFilm.titel}<br>
                            Jaar:  ${targetFilm.jaar}<br>
                            IMDB Score: ${targetFilm.imdbrating}</br>
                            Aantal vertoningen : ${res.vertoningen.length}
                        </span>
                    </h3>
                </div>
            </div>`
            ;

        // toon een overzicht met de vertoningen vertoningen
        if (res.vertoningen.length > 0) {

            inhoud += `
            <div class="card">
                <div class="card-body">
                    <div class="card-text">
                    
                        `;

            res.vertoningen.forEach(vertoning => {
                inhoud += `
            
                        <h5>
                            
                            <p style="margin-top:20px;">
                            <span class="fw-bolder">
                                ${vertoning.datumvertoning} (${vertoning.naam})
                            </span>
                            <p>
                        </h5>
                        `
            });
            inhoud += `

                    </div>
                </div>
            </div>

            `;

            inhoud += `
            </div>
            `;
        }


        let inhoudContainer = $('<div>').prop('id', 'modaalScroll')
            .css({ 'overflow-y': 'scroll' })
            .append($('<div>').prop('id', 'modaalScrollInhoud')
                .html(inhoud));
        MODAAL.inhoud(inhoudContainer);
        MODAAL.voet(MODAAL.knop('detailImdbRatingAnnuleer', 'primary', 'x-square', "Annuleren"));
        MODAAL.grootte('modal-xl');
        MODAAL.toon();


    },

    verwijderImdbRating: ($imdbratingID) => {

        let targetFilm = VERTONINGEN.imdbratings.find(film => parseInt(film.id) === parseInt($imdbratingID));

        let details = $('#detailsImdbRaitings');
        details.empty();

        let inhoud =
            $('<div>').addClass('mb-2')
                .append($('<input>').prop('type', 'text').prop('id', 'verwijderimdbratingID').val(targetFilm.id).hide())

                .append($('<label>').addClass('form-label h5').text('Record verwijderen')).append($('<br>')).append($('<hr>'))
                .append($('<label>').addClass('form-label').text('Titel:'))
                .append($('<input>').addClass('form-control mb-1').prop('type', 'text').prop('id', 'titel').val(targetFilm.titel))

                .append($('<label>').addClass('form-label').text('IMDB rating:'))
                .append($('<input>').addClass('form-control mb-1').prop('type', 'text').prop('id', 'imdbrating').val(targetFilm.imdbrating))
                .append($('<label>').addClass('form-label').text('IMDB URL:'))
                .append($('<input>').addClass('form-control mb-3').prop('type', 'text').prop('id', 'imdburl').val(targetFilm.imdburl))


                .append($('<div>').html(`
                        <button type="button" class="btn btn-primary imdbratingVerwijder">
                            <i class="bi bi-scissors"></i>&nbsp;Verwijderen
                        </button>
                        <button type="button" class="btn btn-secondary imdbratingAnnuleer">
                            <i class="bi bi-x-square"></i>&nbsp;Annuleren
                        </button>`));



        $(details).append($('<div>').addClass('card card-body position-relative').html(inhoud));

    },

    imdbratingbewerk: (id, mode) => {
        let frmDta = {
            'id': id,
            'mode': mode
        }

        fetch('/jxGetImdbRating', {
            method: 'post',
            body: JSON.stringify(frmDta),

            headers: {
                'X-CSRF-Token': IMDBTABEL.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => {
            return response.json();
        }).then(res => {
            if (res.succes) {
                let imdbrating = res.imdbrating[0];
                if (res.mode === 'verwijder') {

                    let boodschappen = IMDBTABEL.boodschappenVerwijder;
                    MODAAL.grootte('');
                    MODAAL.kop(boodschappen.titel);
                    MODAAL.inhoud(`
                        <div class="alert alert-warning">
                            <strong>
                            Titel : ${imdbrating.titel}<br>
                            Jaar : ${imdbrating.jaar}<br>
                            URL : ${imdbrating.imdburl}<br>
                            Rating : ${imdbrating.imdbrating}<br><br>

                            </strong>
                            <h5>${boodschappen.boodschap}</h5>
        
                        <div>  
                        <div style="display:none;">
                            <input id="imdbratingIDverwijder" value="${imdbrating.id}"></input> 
                        </div>
                    `);

                    let voet = '';
                    voet += MODAAL.knop('imdbratingverwijder', 'danger', 'scissors', boodschappen.btnOk);
                    voet += MODAAL.knop('verberg', 'secondary', 'x-square', boodschappen.btnCa);
                    MODAAL.voet(voet);
                    MODAAL.toon();

                }

                $("#imdbratingtitel").val(imdbrating.titel);
                $("#imdbratingjaar").val(imdbrating.jaar);
                $("#imdbratingurl").val(imdbrating.imdburl);
                $("#imdbratingrating").val(imdbrating.imdbrating);

                $("#imdbratingID").val(res.mode === 'bewerk' ? imdbrating.id : 0);

            }

        }).catch(err => {
            console.log(err);
        })

    },


    getBoodschappen: () => {
        fetch('/jxImdbRatingBoodschappen', {
            method: 'post',
            body: new FormData(),

            headers: {
                "X-CSRF-Token": IMDBTABEL.csrfToken,
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
                    IMDBTABEL.boodschappenBewaar[tmp[0]] = tmp[1];

                });
                // acties
                res.acties.split(',').forEach(boodschap => {
                    let tmp = boodschap.split(':');
                    IMDBTABEL.boodschappenActies[tmp[0]] = tmp[1];

                });
                // verwijder
                res.verwijder.split(',').forEach(boodschap => {
                    let tmp = boodschap.split(':');
                    IMDBTABEL.boodschappenVerwijder[tmp[0]] = tmp[1];

                });
            }
        }).catch((err) => {
            console.log(err);
        });


    },

    imdbRatingDetailsLeegmaken: () => {
        let boodschappen = IMDBTABEL.boodschappenActies;

        $("#imdbactieTitel").val(boodschappen.nieuw);
        $("#imdbtitel").val("");
        $("#imdbjaar").val("");
        $("#imdbimdburl").val("");
        $("#imdbimdbrating").val(0);
        $("#imdbratingID").val(0);

    },

    imdbRecordZoeken: () => {
        let frmDta = {
            titel2find: $('#imdbratingtitel').val()
        }
        fetch('jxImdbRatingZoek', {
            method: 'post',
            body: JSON.stringify(frmDta),
            headers: {
                "X-CSRF-Token": IMDBTABEL.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {

            return response.json();
        }).then((res) => {
            IMDBTABEL.overzicht(res);
        }).catch((error) => {
            console.log(error);
        })


    },

    imdbratingverwijder: (imdbID) => {
        let frmDta = {
            imdbratingID: imdbID
        }
        fetch('jxVerwijderImdbRatingRecord', {
            method: 'post',
            body: JSON.stringify(frmDta),
            headers: {
                "X-CSRF-Token": IMDBTABEL.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {

            return response.json();
        }).then((res) => {
            if (res.succes) {
                MODAAL.verberg();
                IMDBTABEL.lijst(0);
            };
        }).catch((error) => {
            console.log(error);
        })

    },

    imdbRatingDetailsBewaar: (imdbid) => {

        let frmDta = {
            'imdbratingid': $('#imdbratingID').val(),
            'imdbratingtitel': $('#imdbratingtitel').val(),
            'imdbratingjaar': $('#imdbratingjaar').val(),
            'imdbratingurl': $('#imdbratingurl').val(),
            'imdbratingrating': $('#imdbratingrating').val(),
        }
        fetch('jxBewaarImdbRatingRecord', {
            method: 'post',
            body: JSON.stringify(frmDta),
            headers: {
                "X-CSRF-Token": IMDBTABEL.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {

            return response.json();
        }).then((res) => {
            if (res.succes) {
                console.log(res);
            };
        }).catch((error) => {
            console.log(error);
        })
    }
}


function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
