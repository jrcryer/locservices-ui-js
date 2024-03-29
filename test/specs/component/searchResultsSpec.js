/*global describe, beforeEach, afterEach, it:false*/

define([
  'locservices/ui/component/search_results',
  'locservices/ui/translations/en',
  'locservices/core/api',
  'jquery',
  'fixtures/multiple-results',
  'fixtures/more-multiple-results',
  'fixtures/single-result'
],
  function(SearchResults, En, API, $, responseMultiple, responseMultipleMore, responseWithSingleResult) {

  describe('The search-results', function() {
    'use strict';

    var searchResults, container;

    beforeEach(function() {
      container = $('<div />');
      searchResults = new SearchResults({
        translations: new En(),
        container: container,
        api: new API()
      });
    });

    afterEach(function() {
      container.remove();
    });

    describe('constructor()', function() {

      it('should set this.componentId to "search_results"', function() {
        expect(searchResults.componentId).toBe('search_results');
      });

      it('should set this.eventNamespace to "locservices:ui:component:search_results"', function() {
        expect(searchResults.eventNamespace).toBe('locservices:ui:component:search_results');
      });

      it('should listen for search results event and call render()', function() {
        var stub;
        stub = sinon.stub(searchResults, 'render');
        $.emit('locservices:ui:component:search:results', [responseMultiple.results, responseMultiple.metadata]);
        expect(stub.calledOnce).toBe(true);
      });

      it('should trigger: locservices:ui:component:search-results:location for single location returned via search', function() {
        var spy = sinon.spy($, 'emit');
        $.emit('locservices:ui:component:search:results', [responseWithSingleResult.results, responseWithSingleResult.metadata]);
        expect(spy.getCall(1).args[0]).toEqual('locservices:ui:component:search_results:location');
        $.emit.restore();
      });

    });

    describe('setup()', function() {

      it('should call setup when SearchResults is created via the constructor', function() {
        var setup = sinon.spy(SearchResults.prototype, 'setup');
        new SearchResults({
          translations: new En(),
          container: container,
          api: new API()
        });
        expect(setup.calledOnce).toBe(true);
        SearchResults.prototype.setup.restore();
      });

      it('should add a moreResults to the search_results component', function() {
        expect(searchResults.moreResults).toBeDefined();
      });

      it('should add a list to the search_results component', function() {
        expect(searchResults.list).toBeDefined();
      });

    });

    describe('render()', function() {

      it('should render results to unordered list', function() {
        searchResults.render(responseMultiple.results, responseMultiple.metadata);
        expect(container.find('li').length).toEqual(responseMultiple.results.length);
      });

      // @todo Test the label includes name and container

      // @todo Test the <li> contains a link (and locationId)

    });

    describe('events', function() {

      it('should trigger: locservices:ui:component:search-results:location for single location returned via search', function() {
        var spy = sinon.spy($, 'emit');

        new SearchResults({
          translations: new En(),
          container: $('#search-results'),
          api: new API()
        });

        $.emit('locservices:ui:component:search:results', [responseWithSingleResult.results, responseWithSingleResult.metadata]);

        expect(spy.getCall(1).args[0]).toEqual('locservices:ui:component:search_results:location');

        $.emit.restore();
      });

      it('should trigger: locservices:ui:component:search-results:location when a search result is clicked', function() {
        var spy = sinon.spy($, 'emit');

        var results = new SearchResults({
          translations: new En(),
          container: $('#search-results'),
          api: new API()
        });

        $.emit('locservices:ui:component:search:results', [responseMultiple.results, responseMultiple.metadata]);

        results.list.find('a').trigger('click');
        var lastCall = spy.callCount - 1;
        expect(spy.getCall(lastCall).args[0]).toEqual('locservices:ui:component:search_results:location');

        $.emit.restore();
      });

      it('should trigger: locservices:ui:component:search_results:results when displaying list of results', function() {
        var spy = sinon.spy($, 'emit');

        $.emit('locservices:ui:component:search:results', [responseMultiple.results, responseMultiple.metadata]);

        var lastCall = spy.callCount - 1;
        expect(spy.getCall(lastCall).args[0]).toEqual('locservices:ui:component:search_results:results');

        $.emit.restore();
      });

      it('should send results data when triggering locservices:ui:component:search_results:results', function() {
        var spy = sinon.spy($, 'emit');

        $.emit('locservices:ui:component:search:results', [responseMultiple.results, responseMultiple.metadata]);

        var lastCall = spy.callCount - 1;
        expect(spy.getCall(lastCall).args[1]).toEqual({ searchTerm:'Cardiff',offset:0,totalResults:84 });

        $.emit.restore();
      });

    });

    describe('more results', function() {

      it('should add new results to list', function() {
        $.emit('locservices:ui:component:search:results', [responseMultiple.results, responseMultiple.metadata]);
        expect(searchResults.list.children().length).toEqual(10);

        $.emit('locservices:ui:component:search:results', [responseMultipleMore.results, responseMultipleMore.metadata]);
        expect(searchResults.list.children().length).toEqual(20);
      });

      it('should not display more results button if less than 10 results', function() {
        $.emit('locservices:ui:component:search:results', [[], { search: 'test', totalResults: 9 }]);
        expect(searchResults.moreResults.hasClass('ls-ui-comp-search_results-active')).toBe(false);
      });

      it('should not display more results button if offset + 10 is grater than totalResults', function() {
        $.emit('locservices:ui:component:search:results', [[], { search: 'test', start: 80, totalResults: 84 }]);
        expect(searchResults.moreResults.hasClass('ls-ui-comp-search_results-active')).toBe(false);
      });

    });

    describe('_data', function() {

      it('should be empty when SearchResults object is instantiated', function() {
        expect(searchResults._data).toEqual({});
      });

      it('should store results data against the id', function() {
        searchResults._data = {};

        var locations = [{
          id: 123,
          name: 'Cardiff',
          placeType: 'settlement'
        }, {
          id: 456,
          name: 'Swansea',
          placeType: 'region'
        }];

        $.emit('locservices:ui:component:search:results', [locations, { search: 'test', totalResults: 2 }]);

        expect(searchResults._data[123].name).toEqual('Cardiff');
        expect(searchResults._data[123].placeType).toEqual('settlement');
        expect(searchResults._data[456].name).toEqual('Swansea');
        expect(searchResults._data[456].placeType).toEqual('region');
      });

    });

    describe('clear()', function() {

      it('should clear out the SearchResults container', function() {
        searchResults.clear();
        expect(searchResults.list.children().length).toEqual(0);
        expect(searchResults.moreResults.hasClass('ls-ui-comp-search_results-active')).toBe(false);
      });

      it('should clear the stored data', function() {
        searchResults.clear();
        expect(searchResults._data).toEqual({});
      });

      it('should clear results when auto complete rendered', function() {
        searchResults._data['123'] = {
          id: 123,
          name: 'Cardiff',
          placeType: 'settlement'
        };
        $.emit('locservices:ui:component:auto_complete:render');

        expect(searchResults._data).toEqual({});
      });

    });

  });
});
