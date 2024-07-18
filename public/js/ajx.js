$(
    () => {
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });

    }
);


const AJX = {
    oAJX: null,
    timeout: 5000,
    cbSucces: null,
    cbFout: null,

    verstuur: (url, type, dta, cbSucces, cbFout) => {
        AJX.cbSucces = cbSucces;
        AJX.cbFout = cbFout;

        AJX.oAJX = $.ajax({
            url : url,
            type: type,
            dataType: 'json',
            data: dta,
            processData: false,
            contentType: false,
            cache: false,
            success: AJX.succes,
            error: AJX.fout,
            timeout: AJX.timeout
        })
    },

    succes: (jqDta) => {
        if (AJX.cbSucces) AJX.cbSucces(jqDta);

        AJX.oAJX = null;
    },

    fout: (jqXHR, jqMsg) => {
        AJX.oAJX.abort();
        AJX.oAJX = null;

        if (AJX.cbFout) AJX.cbFout(jqXHR, jqMsg);
    }
}