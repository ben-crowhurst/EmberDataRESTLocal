Application.Nominal = DS.Model.extend({
    forename: DS.attr('string'),
    surname: DS.attr('string'),
    notebook: DS.belongsTo('Application.Notebook'),
    vehicle: DS.belongsTo('Application.Vehicle')
});

Application.Vehicle = DS.Model.extend({
    vrm: DS.attr('string'),
    nominal: DS.belongsTo('Application.Nominal')
});