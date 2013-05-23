Application.Nominal = DS.Model.extend({
    forename: DS.attr('string'),
    surname: DS.attr('string'),
    notebook: DS.belongsTo('Application.Notebook')
});