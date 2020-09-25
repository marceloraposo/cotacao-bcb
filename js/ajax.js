var templateCotacao = {
    dias: 60,
    init: function () {
      
        templateCotacao.CarregarDados();
        templateCotacao.CarregarTabela();

        google.charts.load('current', {'packages':['line']});
        google.charts.setOnLoadCallback(templateCotacao.CarregarGrafico);
    },
    tbCotacao: null,
    linhasCotacao: [],
    CarregarDados: function () {
        var dataInicial = new Date();
        var dataFinal = new Date();
        dataInicial.setDate(dataInicial.getDate() - templateCotacao.dias);
        templateCotacao.CarregaCotacao(dataFinal,dataInicial);
    },
    CarregaCotacao: function (dataFinal,dataInicial) {
        $.ajax({
            url: "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial='" + templateCotacao.FormatDate(dataInicial) + "',dataFinalCotacao='" + templateCotacao.FormatDate(dataFinal) + "')?format=json",
            type: 'get',
            async: false
        })
            .done(function (msg) {
                for (var previsao in msg.value) {
                    templateCotacao.linhasCotacao.push([msg.value[previsao].dataHoraCotacao.substring(0,10),msg.value[previsao].cotacaoCompra, msg.value[previsao].cotacaoVenda]);
                }
            })
            .fail(function (jqXHR, textStatus, msg) {
                templateCotacao.linhasCotacao = [];
            });
    }, CarregarGrafico: function(){


        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Data');
        data.addColumn('number', 'Compra');
        data.addColumn('number', 'Venda');
  
        //data.addRows(templateCotacao.linhasCotacao);
        for (var cotacaoDia in templateCotacao.linhasCotacao) {
            data.addRow([moment(templateCotacao.linhasCotacao[cotacaoDia][0]).format('DD/MM'),templateCotacao.linhasCotacao[cotacaoDia][1],templateCotacao.linhasCotacao[cotacaoDia][2]]);
        }
  
        var options = {
          chart: {
            title: 'Cotação Dolar',
            subtitle: 'Últimos 60 dias'
          },
          axes: {
            x: {
              0: {side: 'top'}
            }
          }
        };
  
        var chart = new google.charts.Line(document.getElementById('graficoCotacao'));
  
        chart.draw(data, google.charts.Line.convertOptions(options));

    } ,CarregarTabela: function () {

        templateCotacao.tbCotacao = $('#tbCotacao').DataTable({
            data: templateCotacao.linhasCotacao,
            columns: [
                { "title": "Data" },
                { "title": "Compra" },
                { "title": "Venda" }
            ],
            order: [ 0, 'desc' ],
            dom: 'Bfrtip',
            buttons: [],
            autoFill: true,
            colReorder: true,
            select: true,
            keys: true,
            dataSrc: 'group',
            responsive: true,
            language: {
                processing: 'Nenhum registro encontrado',
                search: 'Pesquisar',
                lengthMenu: '_MENU_ resultados por página',
                info: 'Mostrando de _START_ até _END_ de _TOTAL_ registros',
                infoEmpty: 'Mostrando 0 até 0 de 0 registros',
                infoFiltered: '(Filtrados de _MAX_ registros)',
                infoPostFix: '',
                loadingRecords: 'Carregando...',
                zeroRecords: 'Nenhum registro encontrado',
                emptyTable: 'Nenhum registro encontrado',
                paginate: {
                    first: 'Primeiro',
                    previous: 'Anterior',
                    next: 'Próximo',
                    last: 'Último'
                },
                aria: {
                    sortAscending: ' Ordenar colunas de forma ascendente',
                    sortDescending: 'Ordenar colunas de forma descendente'
                },
                select: {
                    rows: {
                        _: 'Você selecionou %d linhas',
                        0: 'Clique em uma linha para selecionar',
                        1: 'Apenas uma linha selecionada'
                    }
                }
            }
        });
        templateCotacao.tbCotacao
            .on('select', function (e, dt, type, indexes) {


                for (var i = 0; i < indexes.length; i++) {
                    templateCotacao.linhasCotacao.push(templateCotacao.tbCotacao.rows(indexes[i]).data().toArray());
                }
            })
            .on('deselect', function (e, dt, type, indexes) {

                for (var i = 0; i < indexes.length; i++) {
                    templateCotacao.linhasCotacao.pop(templateCotacao.tbCotacao.rows(i).data().toArray());
                }
            });


        $("#selectAllCotacao").click(function (e) {
            templateCotacao.tbCotacao.rows().deselect();
            if ($(this).is(':checked'))
                templateCotacao.tbCotacao.rows().select();

            else
                templateCotacao.tbCotacao.rows().deselect();
        });

    }, FormatDate: function (date) {
        var day = date.getDate();
        var month = date.getMonth();
        var year = date.getFullYear();
        return ((month + 1) < 10 ? '0' + (month + 1) : (month + 1)) + '-' + (day < 10 ? '0' + day : day) + '-' + year;
    }
};	