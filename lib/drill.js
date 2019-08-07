module.exports = {
  rawTableData(table) {
    try {
      var data = [];
      var headers = [];
      for (var i = 0; i < table[0].rows[0].cells.length; i++) {
        headers[i] = table[0].rows[0].cells[i].innerHTML
          .toLowerCase()
          .replace(/ /gi, "");
      }
      for (var i = 1; i < table[0].rows.length; i++) {
        var tableRow = table[0].rows[i];
        var rowData = {};
        for (var j = 0; j < tableRow.cells.length; j++) {
          rowData[headers[j]] = tableRow.cells[j].innerHTML
            .replace("&nbsp;", "")
            .replace(/[,\/]/g, "")
            .split(" ")[0]
            .split("(")[0];
        }
        data.push(rowData);
      }
      return data;
    } catch (err) {
      throw err;
    }
  }
};
