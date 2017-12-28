(() => {
    const TrainDepartureBoardController = ($http, $interval) => {
        const vm = this;
        return Object.assign(vm, {
            dxGridOptions: {
                showBorders: true,
                showRowLines: true,
                rowAlternationEnabled: true,
                headerFilter: {
                  visible: true
                },
                onInitialized: obj => {
                    Object.assign(vm, {dataGrid: obj.component});
                    $interval(vm.dataGrid.refresh, 15000);
                },
                dataSource: new DevExpress.data.DataSource({
                    loadMode: 'raw',
                    load: async () => {
                        let resp, data;

                        try {
                            // use a CORS proxy since the data feed is restricted to the mbta.com domain
                            resp = await $http.get('http://cors-proxy.htmldriven.com/?url=http://developer.mbta.com/lib/gtrtfs/Departures.csv');
                        } catch (err) {
                            throw err.data;
                        }

                        // extract csv data from the response
                        data = resp.data.body.replace(/"/g,'').split('\r\n').map(line => line.split(',')).filter(row => row.length === 8);

                        // display example data if the feed was empty
                        if (data.length < 2) {
                            data = [
                                ["TimeStamp", "Origin", "Trip", "Destination", "ScheduledTime", "Lateness", "Track", "Status"],
                                ["1514431363", "North Station", "431", "Wachusett", "1514432400", "0", "", "On Time"],
                                ["1514431363", "North Station", "181", "Newburyport", "1514433000", "0", "", "On Time"],
                                ["1514431363", "North Station", "345", "Lowell", "1514433300", "0", "", "On Time"],
                                ["1514431363", "North Station", "227", "Haverhill", "1514433600", "0", "", "On Time"],
                                ["1514431363", "North Station", "433", "Wachusett", "1514437800", "0", "", "On Time"],
                                ["1514431363", "North Station", "129", "Rockport", "1514437800", "0", "", "On Time"],
                                ["1514431363", "North Station", "229", "Haverhill", "1514437800", "0", "", "On Time"],
                                ["1514431363", "North Station", "347", "Lowell", "1514438100", "0", "", "On Time"],
                                ["1514431363", "North Station", "183", "Newburyport", "1514438100", "0", "", "On Time"],
                                ["1514431363", "South Station", "029", "Middleboro/Lakeville", "1514431800", "0", "10", "Now Boarding"],
                                ["1514431363", "South Station", "729", "Forge Park / 495", "1514431800", "0", "4", "Now Boarding"],
                                ["1514431363", "South Station", "535", "Worcester / Union Station", "1514431800", "0", "2", "Now Boarding"],
                                ["1514431363", "South Station", "927", "Stoughton", "1514432400", "0", "", "On Time"],
                                ["1514431363", "South Station", "057", "Kingston", "1514432400", "300", "", "Delayed"],
                                ["1514431363", "South Station", "789", "Readville", "1514433600", "0", "", "Bus Substitute"],
                                ["1514431363", "South Station", "837", "Providence", "1514433600", "0", "", "On Time"],
                                ["1514431363", "South Station", "631", "Needham Heights", "1514434800", "0", "", "On Time"],
                                ["1514431363", "South Station", "537", "Worcester / Union Station", "1514435400", "0", "", "On Time"],
                                ["1514431363", "South Station", "731", "Forge Park / 495", "1514436600", "0", "", "On Time"],
                                ["1514431363", "South Station", "839", "Providence", "1514437140", "0", "", "On Time"]
                            ];
                        }

                        // extract headers
                        const headers = data.shift();

                        // convert arrays to objects
                        return data.map(row => row.reduce((obj, col, ind) => Object.assign(obj, {[headers[ind]]: col}), {}));
                    },
                }),
                columns: [
                    {
                        dataField: 'ScheduledTime',
                        calculateCellValue: obj => new Date(parseInt(obj.ScheduledTime, 10) * 1000),
                        caption: 'Time',
                        dataType: 'datetime',
                        format: 'MM-dd-yyyy hh:mm:ss a',
                        allowFiltering: false,
                        sortOrder: 'asc',
                        width: 'auto',
                    }, {
                        dataField: 'Destination',
                        allowFiltering: true,
                        width: 'auto',
                    }, {
                        dataField: 'Trip',
                        caption: 'Train #',
                        alignment: 'right',
                        allowFiltering: false,
                        width: 'auto',
                    }, {
                        calculateCellValue: obj => obj.Track || 'TBD',
                        caption: 'Track #',
                        alignment: 'right',
                        allowFiltering: false,
                        width: 'auto',
                    }, {
                        dataField: 'Status',
                        calculateDisplayValue: obj => obj.Lateness != '0' ? `${obj.Status} ${Math.round(obj.Lateness/60)}m` : obj.Status,
                        allowFiltering: true,
                        headerFilter: {
                            visible: true,
                            dataSource: ["All Aboard", "Arrived", "Arriving", "Bus Substitute", "Cancelled", "Delayed", "Departed", "End", "Hold", "Info to follow", "Late", "Now Boarding", "On Time", "TBD"].map(str => Object.assign({ text: str, value: str })),
                        },
                        width: 'auto',
                    },
                ],
              }
        });
    };

    angular.module(
        'mbta',
        ['dx'] // DevExtreme UI library
    ).controller('TrainDepartureBoardController', TrainDepartureBoardController);
})();