module.exports = Object.freeze({
  PERMIT: {
    BASE: 'CITESPermit',
    PROCESSED: 'processed',
    ACCEPTED: 'accepted'
  },

  HEADER: {
    BASE: 'HeaderExchangedDocument',
    ID: 'ID',
    TYPE: 'TypeCode'
  },

  CONSIGNMENT: {
    BASE: 'SpecifiedSupplyChainConsignment',
    SPECIMENS: 'IncludedSupplyChainConsignmentItems',
    CONSIGNOR: 'ConsignorTradeParty',
    CONSIGNEE: 'ConsigneeTradeParty'
  },

  PARTICIPANT: {
    ID: 'ID',
    NAME: 'Name',
    ADDRESS: {
      BASE: 'PostalTradeAddress',
      STREET: 'StreetName',
      CITY: 'CityName',
      COUNTRY: 'CountryID'
    }
  },

  SPECIMEN: {
    BASE: 'IncludedSupplyChainConsignmentItem',
    ID: 'ID',
    ORIGIN_HASH: 'origin-hash',
    RE_EXPORT_HASH: 're-export-hash',
    TRANSPORT: {
      BASE: 'TransportLogisticsPackage',
      QUANTITY: 'ItemQuantity'
    },
    ITEM: {
      BASE: 'IncludedSupplyChainTradleLineItem',
      PRODUCT: {
        BASE: 'SpecifiedTradeProduct',
        DESCRIPTION: 'Description',
        COMMON_NAME: 'CommonName',
        SCIENTIFIC_NAME: 'ScientificName'
      }
    }
  }
})
