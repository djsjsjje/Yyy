
import Parser from '../../src/utils/api/parser';

const originalGet = Parser.get;

Parser.get = function(params, oncomplite, onerror) {
  if (params.search) {
    params.search = params.search.replace(/[^a-zA-Z0-9\s]/g, '');
  }
  originalGet.call(this, params, oncomplite, onerror);
};
