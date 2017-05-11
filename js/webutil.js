function getUrlParameters() {
    return location.search.substr(1).split("&").reduce(function(result, nameAndValueString) {
      var nameAndValue = nameAndValueString.split("=");
      if (nameAndValue.length == 2) {
        result[nameAndValue[0]] = decodeURIComponent(nameAndValue[1]);
      }
      return result;
    }, {});
}