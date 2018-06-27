module.exports = Object.freeze({
  PERMIT: {
    BASE: 'permit',
    EXPORT_COUNTRY: 'export-country',
    IMPORT_COUNTRY: 'import-country',
    TYPE: 'type',
    IMPORTER: 'importer',
    EXPORTER: 'exporter',
    PROCESSED: 'processed',
    ACCEPTED: 'accepted',
    SPECIMENS: 'specimens'
  },

  PARTICIPANT: {
    NAME: 'name',
    STREET: 'street',
    CITY: 'city'
  },

  SPECIMEN: {
    BASE: 'specimen',
    PERMIT_ID: 'permit-id',
    QUANTITY: 'quantity',
    SCIENTIFIC_NAME: 'scientific-name',
    COMMON_NAME: 'common-name',
    DESCRIPTION: 'description',
    ORIGIN_HASH: 'origin-hash',
    RE_EXPORT_HASH: 're-export-hash'
  }
})
