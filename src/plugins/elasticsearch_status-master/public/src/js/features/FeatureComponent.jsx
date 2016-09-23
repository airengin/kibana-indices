//This contains the extra features like
//Import data, Export Data, Add document, Pretty Json
var AddDocument = require('./AddDocument.jsx');
var ImportData = require('./ImportData.jsx');
var ExportData = require('./ExportData.jsx');
var Pretty = require('./Pretty.jsx');
var SignalCircle = require('./SignalCircle.jsx');
var RemoveFilterButton = require('./RemoveFilterButton.jsx');
var UpdateDocument = require('./UpdateDocument.jsx');
var DeleteDocument = require('./DeleteDocument.jsx');
var ErrorModal = require('./ErrorModal.jsx');
var ExportasJson = require('./ExportasJson.jsx');

var FeatureComponent = {
    AddDocument: AddDocument,
    ImportData: ImportData,
    ExportData: ExportData,
    Pretty: Pretty,
    SignalCircle: SignalCircle,
    RemoveFilterButton: RemoveFilterButton,
    UpdateDocument: UpdateDocument,
    DeleteDocument: DeleteDocument,
    ErrorModal: ErrorModal,
    ExportasJson: ExportasJson
};

module.exports = FeatureComponent;
