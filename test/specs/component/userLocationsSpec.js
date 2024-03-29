/*global describe, beforeEach, it:false*/

define([
  'jquery',
  'locservices/ui/component/user_locations',
  'locservices/ui/translations/en'
],
function(
    $,
    UserLocations,
    En
  )
{

  describe('The User Locations module', function() {
    'use strict';

    var container;
    var userLocations;
    var api;
    var translations;

    var testLocations = [
      { id: '0', name: 'Location 0', placeType: 'settlement', country: 'GB' },
      { id: '1', name: 'Location 1', placeType: 'settlement', country: 'GB' },
      { id: '2', name: 'Location 2', placeType: 'settlement', country: 'GB' },
      { id: '3', name: 'Location 3', placeType: 'settlement', country: 'GB' },
      { id: '4', name: 'Location 4', placeType: 'settlement', country: 'GB' },
      { id: '5', name: 'Location 5', placeType: 'settlement', country: 'GB' },
      { id: '6', name: 'Location 6', placeType: 'settlement', country: 'GB' }
    ];

    beforeEach(function() {
      container = $('<div/>');
      api = {};
      translations = new En();
      userLocations = new UserLocations({
        api: api,
        translations: translations,
        container: container
      });
    });

    describe('constructor()', function() {

      it('should set this.componentId to "user_locations"', function() {
        expect(userLocations.componentId).toBe('user_locations');
      });

      it('throws an error when an api is not present in options', function() {
        var fn = function() {
          userLocations = new UserLocations({
            container: container,
            translations: translations
          });
        };

        expect(fn).toThrow();
      });

      it('calls this.selectLocationById location event when clicking on a location name', function() {
        var stub;
        stub = sinon.stub(userLocations, 'selectLocationById');

        userLocations.element.empty();
        userLocations.element.append(
          '<li><a class="ls-ui-comp-user_locations-name" href="#' + testLocations[0].id + '" data-id="' + testLocations[0].id + '" data-action="location">Location</a></li>'
        );
        userLocations.element.find('.ls-ui-comp-user_locations-name').trigger('click');

        expect(stub.callCount).toBe(1);
        expect(stub.calledWith(testLocations[0].id)).toBe(true);
      });

      it('calls this.removeLocationById with expected ID when clicking on remove', function() {
        var stub;
        stub = sinon.stub(userLocations, 'removeLocationById');

        userLocations.element.append(
          '<li><a class="ls-ui-comp-user_locations-action-remove" href="#' + testLocations[0].id + '" data-id="' + testLocations[0].id + '" data-action="remove">Location</a></li>'
        );
        userLocations.element.find('.ls-ui-comp-user_locations-action-remove').trigger('click');

        expect(stub.callCount).toBe(1);
        expect(stub.calledWith(testLocations[0].id)).toBe(true);
      });

      it('calls this.setPreferredLocationById with expected ID when clicking on prefer', function() {
        var stub;
        stub = sinon.stub(userLocations, 'setPreferredLocationById');

        userLocations.element.append(
          '<li><a class="ls-ui-comp-user_locations-action-prefer" href="#' + testLocations[0].id + '" data-id="' + testLocations[0].id + '" data-action="prefer">Location</a></li>'
        );
        userLocations.element.find('.ls-ui-comp-user_locations-action-prefer').trigger('click');

        expect(stub.callCount).toBe(1);
        expect(stub.calledWith(testLocations[0].id)).toBe(true);
      });

      it('calls this.addRecentLocation on search_results location event', function() {
        var stub;
        var expectedLocation;
        expectedLocation = 'foo';
        stub = sinon.stub(userLocations, 'addRecentLocation');
        $.emit('locservices:ui:component:search_results:location', [expectedLocation]);
        expect(stub.calledOnce).toBe(true);
        expect(stub.calledWith(expectedLocation)).toBe(true);
      });

      it('calls this.addRecentLocation on geolocation location event', function() {
        var stub;
        var expectedLocation;
        expectedLocation = 'foo';
        stub = sinon.stub(userLocations, 'addRecentLocation');
        $.emit('locservices:ui:component:geolocation:location', [expectedLocation]);
        expect(stub.calledOnce).toBe(true);
        expect(stub.calledWith(expectedLocation)).toBe(true);
      });

      it('calls this.addRecentLocation on auto_complete location event', function() {
        var stub;
        var expectedLocation;
        expectedLocation = 'foo';
        stub = sinon.stub(userLocations, 'addRecentLocation');
        $.emit('locservices:ui:component:auto_complete:location', [expectedLocation]);
        expect(stub.calledOnce).toBe(true);
        expect(stub.calledWith(expectedLocation)).toBe(true);
      });

    });

    describe('selectLocationById()', function() {

      it('emits location event with expected location', function() {
        var spy = sinon.spy($, 'emit');
        userLocations._locations = {};
        userLocations._locations[testLocations[0].id] = testLocations[0];
        userLocations.selectLocationById(testLocations[0].id);
        expect(spy.getCall(0).args[0]).toEqual('locservices:ui:component:user_locations:location');
        expect(spy.getCall(0).args[1][0]).toEqual(testLocations[0]);
        $.emit.restore();
      });

      it('does not emit location event with invalid location id', function() {
        var spy = sinon.spy($, 'emit');
        userLocations._locations = {};
        userLocations.selectLocationById('foo');
        expect(spy.callCount).toEqual(0);
        $.emit.restore();
      });

    });

    describe('setPreferredLocationById()', function() {

      var expectedLocation;

      beforeEach(function() {
        expectedLocation = {
          id: '1234',
          placeType: 'settlement',
          country: 'GB'
        };
        userLocations._locations[expectedLocation.id] = expectedLocation;
        userLocations._locations[testLocations[0].id] = testLocations[0];
      });

      it('calls this.preferredLocation.set() with the expected location id', function() {
        var stub;
        stub = sinon.stub(userLocations.preferredLocation, 'set');
        sinon.stub(userLocations, 'render');
        userLocations.setPreferredLocationById(expectedLocation.id);
        expect(stub.calledOnce).toEqual(true);
        expect(stub.args[0][0]).toEqual(expectedLocation.id);
      });

      it('does not call this.preferredLocation.set() if the location is not preferrable', function() {
        var stub;
        stub = sinon.stub(userLocations.preferredLocation, 'set');
        sinon.stub(userLocations.preferredLocation, 'isValidLocation').returns(false);
        sinon.stub(userLocations, 'render');
        userLocations.setPreferredLocationById(expectedLocation.id);
        expect(stub.callCount).toEqual(0);
      });

      // ensure that the locaiton is preferrable

      it('adds the current preferredLocation to the recent locations list', function() {
        var stub;
        stub = sinon.stub(userLocations.recentLocations, 'add');
        sinon.stub(userLocations.preferredLocation, 'set');
        sinon.stub(userLocations.preferredLocation, 'isSet').returns(true);
        sinon.stub(userLocations.preferredLocation, 'get').returns(expectedLocation);
        sinon.stub(userLocations, 'render');
        userLocations.setPreferredLocationById(testLocations[0].id);
        expect(stub.calledOnce).toEqual(true);
        expect(stub.args[0][0]).toEqual(expectedLocation);
      });

      it('calls this.render() if location is valid', function() {
        var stub;
        userLocations.preferredLocation.set = function(id, options) {
          options.success({});
        };
        sinon.stub(userLocations, 'getRecentLocations').returns(testLocations);
        stub = sinon.stub(userLocations, 'render');
        userLocations.setPreferredLocationById(expectedLocation.id);
        expect(stub.calledOnce).toEqual(true);
      });

      it('does not call this.render() if location is invalid', function() {
        var stub;
        sinon.stub(userLocations.preferredLocation, 'set');
        sinon.stub(userLocations, 'getRecentLocations').returns(testLocations);
        stub = sinon.stub(userLocations, 'render');
        userLocations.setPreferredLocationById('foo');
        expect(stub.callCount).toEqual(0);
      });

    });

    describe('addRecentLocation()', function() {

      var expectedLocation;

      beforeEach(function() {
        expectedLocation = {
          id: '1234'
        };
      });

      it('calls this.recentLocations.add()', function() {
        var stub;
        stub = sinon.stub(userLocations.recentLocations, 'add');

        userLocations.addRecentLocation(expectedLocation);
        expect(stub.args[0][0]).toEqual(expectedLocation);
      });

      it('returns true if location is added to recents', function() {
        var result;
        sinon.stub(userLocations.recentLocations, 'add');

        result = userLocations.addRecentLocation(expectedLocation);
        expect(result).toBe(true);
      });

      it('returns false if location is not added to recents', function() {
        var result;
        result = userLocations.addRecentLocation(expectedLocation);
        expect(result).toBe(false);
      });

    });

    describe('removeLocationById()', function() {

      var expectedLocation;

      beforeEach(function() {
        expectedLocation = {
          id: '1234'
        };
        userLocations._locations[expectedLocation.id] = expectedLocation;
      });

      it('calls this.preferredLocation.unset() if location is preferred', function() {
        var stub;
        stub = sinon.stub(userLocations.preferredLocation, 'unset');
        sinon.stub(userLocations, 'render');

        expectedLocation.isPreferred = true;
        
        userLocations.removeLocationById(expectedLocation.id);
        expect(stub.calledOnce).toEqual(true);
      });

      it('calls this.recentLocations.remove() with locationId if location is recent', function() {
        var stub;
        stub = sinon.stub(userLocations.recentLocations, 'remove');
        sinon.stub(userLocations, 'render');
        userLocations.removeLocationById(expectedLocation.id);
        expect(stub.calledOnce).toEqual(true);
        expect(stub.calledWith(expectedLocation.id)).toEqual(true);
      });

      it('calls this.render() if locationId is valid', function() {
        var stub;
        sinon.stub(userLocations.recentLocations, 'remove');
        stub = sinon.stub(userLocations, 'render');
        userLocations.removeLocationById(expectedLocation.id);
        expect(stub.calledOnce).toEqual(true);
      });

    });

    describe('render()', function() {

      var stubPreferredLocationIsSet;
      var stubPreferredLocationGet;
      var stubGetRecentLocations;

      beforeEach(function() {
        stubPreferredLocationIsSet = sinon.stub(userLocations.preferredLocation, 'isSet');
        stubPreferredLocationGet = sinon.stub(userLocations.preferredLocation, 'get');
        stubGetRecentLocations = sinon.stub(userLocations, 'getRecentLocations');
      });

      // @todo test that this._locations is populated correctly

      it('renders no preferred location if not set', function() {
        stubPreferredLocationIsSet.returns(false);
        stubGetRecentLocations.returns([]);
        userLocations.render();
        expect(container.find('ul.ls-ui-comp-user_locations-preferred li').length).toEqual(0);
      });

      it('adds a no-location class to preferred location ul if no preferred location if set', function() {
        var expectedLocation = {
          id: 'CF5',
          name: 'CF5',
          isPreferable: true
        };

        stubPreferredLocationIsSet.returns(true);
        stubPreferredLocationGet.returns(expectedLocation);
        stubGetRecentLocations.returns([]);
        userLocations.render();
        expect(container.find('ul.ls-ui-comp-user_locations-preferred-no-location').length).toEqual(1);
      });

      it('renders a single preferred location if set', function() {
        var expectedLocation = {
          id: 'CF5',
          name: 'CF5',
          isPreferable: true
        };

        stubPreferredLocationIsSet.returns(true);
        stubPreferredLocationGet.returns(expectedLocation);
        stubGetRecentLocations.returns([]);
        var expectedHtml = '<li class="ls-ui-comp-user_locations-location-preferred ls-ui-comp-user_locations-location-preferable">' +
          '<a class="ls-ui-comp-user_locations-action" href="#CF5" data-id="CF5" data-action="none">Prefer</a>' +
          '<a class="ls-ui-comp-user_locations-name" href="#CF5" data-id="CF5" data-action="location"><strong>CF5</strong></a>' +
          '<a class="ls-ui-comp-user_locations-remove" href="#CF5" data-id="CF5" data-action="remove">Remove</a>' +
          '</li>';
        userLocations.render();
        expect(container.find('ul.ls-ui-comp-user_locations-preferred').html()).toEqual(expectedHtml);
      });

      it('renders the expected number of recents locations', function() {
        stubPreferredLocationIsSet.returns(false);
        stubGetRecentLocations.returns([testLocations[0], testLocations[1]]);
        userLocations.render();
        expect(container.find('ul.ls-ui-comp-user_locations-recent li').length).toEqual(2);
      });

      it('renders a recent location with container', function() {
        var expectedLocation = {
          id: '1234',
          name: 'Llandaff',
          container: 'Cardiff'
        };
        stubPreferredLocationIsSet.returns(false);
        stubGetRecentLocations.returns([expectedLocation]);
        var expectedHtml = '<strong>' + expectedLocation.name + '</strong>, ' +
          expectedLocation.container;
        userLocations.render();
        expect(container.find('.ls-ui-comp-user_locations-name').html()).toEqual(expectedHtml);
      });

      it('renders a recent location without container', function() {
        var expectedLocation = {
          id: '1234',
          name: 'Llandaff'
        };
        stubPreferredLocationIsSet.returns(false);
        stubGetRecentLocations.returns([expectedLocation]);
        var expectedHtml = '<strong>' + expectedLocation.name + '</strong>';
        userLocations.render();
        expect(container.find('.ls-ui-comp-user_locations-name').html()).toEqual(expectedHtml);
      });

      it('renders a preferable location with expected class and link', function() {
        var expectedLocation = {
          id: '1234',
          name: 'Llandaff',
          isPreferable: true
        };
        stubPreferredLocationIsSet.returns(false);
        stubGetRecentLocations.returns([expectedLocation]);
        userLocations.render();
        expect(
          container.find('ul.ls-ui-comp-user_locations-recent li.ls-ui-comp-user_locations-location-preferable').length
        ).toEqual(1);
        expect(
          container.find('ul.ls-ui-comp-user_locations-recent li.ls-ui-comp-user_locations-location-preferable a.ls-ui-comp-user_locations-action').length
        ).toEqual(1);
      });

    });

    describe('getRecentLocations()', function() {

      var stubPreferredLocationIsSet;
      var stubPreferredLocationGet;
      var stubRecentLocationsIsSupported;
      var stubRecentLocationsAll;

      beforeEach(function() {
        stubPreferredLocationIsSet = sinon.stub(userLocations.preferredLocation, 'isSet');
        stubPreferredLocationGet = sinon.stub(userLocations.preferredLocation, 'get');
        stubRecentLocationsIsSupported = sinon.stub(userLocations.recentLocations, 'isSupported');
        stubRecentLocationsAll = sinon.stub(userLocations.recentLocations, 'all');
      });

      it('returns an empty array if no locations are available', function() {
        expect(userLocations.getRecentLocations()).toEqual([]);
      });

      it('returns at most 4 recent locations if a preferred location is set', function() {
        var locations;
        stubPreferredLocationIsSet.returns(true);
        stubRecentLocationsIsSupported.returns(true);
        stubRecentLocationsAll.returns(testLocations);
        locations = userLocations.getRecentLocations();
        expect(locations.length).toEqual(4);
      });

      it('returns at most 5 recent locations if no preferred location is set', function() {
        var locations;
        stubRecentLocationsIsSupported.returns(true);
        stubRecentLocationsAll.returns(testLocations);
        locations = userLocations.getRecentLocations();
        expect(locations.length).toEqual(5);
      });

      it('sets a recent locations isPreferable via this.preferredLocation.isValidLocation', function() {
        var locations;
        var stub;
        var expectedValue;
        expectedValue = 'foo';
        stubPreferredLocationIsSet.returns(false);
        stubRecentLocationsIsSupported.returns(true);
        stubRecentLocationsAll.returns([testLocations[0]]);
        stub = sinon.stub(userLocations.preferredLocation, 'isValidLocation');
        stub.returns(expectedValue);
        locations = userLocations.getRecentLocations();
        expect(stub.calledOnce).toEqual(true);
        expect(locations[0].isPreferable).toEqual(expectedValue);
      });

      it('does not include recent if same id as preferred', function() {
        var locations;
        var preferredLocation = { id: '2', name: 'Preferred' };
        stubPreferredLocationIsSet.returns(true);
        stubPreferredLocationGet.returns(preferredLocation);
        stubRecentLocationsIsSupported.returns(true);
        stubRecentLocationsAll.returns(testLocations);
        locations = userLocations.getRecentLocations();
        expect(locations.length).toEqual(4);
        expect(locations[0]).toEqual(testLocations[0]);
        expect(locations[1]).toEqual(testLocations[1]);
        expect(locations[2]).toEqual(testLocations[3]);
        expect(locations[3]).toEqual(testLocations[4]);
      });

    });

  });

});
