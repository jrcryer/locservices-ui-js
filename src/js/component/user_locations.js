/*global define */

define([
  'jquery',
  'locservices/ui/component/component',
  'locservices/core/recent_locations',
  'locservices/core/preferred_location'
],
function(
  $,
  Component,
  RecentLocations,
  PreferredLocation
) {

  'use strict';

  /**
   * User Locations constructor
   *
   * @param {Object} options
   */
  function UserLocations(options) {
    var self = this;
    options = options || {};
    options.componentId = 'user_locations';
    this.setComponentOptions(options);

    this.preferredLocation = new PreferredLocation();
    this.recentLocations = new RecentLocations();

    // @todo inject container as an option
    // @todo test this
    this.container.append('<div class="ls-ui-user_locations"></div>');
    this.element = this.container.find('.ls-ui-user_locations');

    this.element.on('click', function(e) {
      var target;
      var locationId;
      e.preventDefault();
      target = $(e.target);
      if (target.hasClass('ls-ui-user_locations-remove')) {
        locationId = target.parent().attr('href').split('=')[1];
        self.removeLocationById(locationId);
      }

      // @todo handle clicking on the prefer link

    });

    // @todo test this call
    this.render();
 
  }

  UserLocations.prototype = new Component();
  UserLocations.prototype.constructor = UserLocations;

  /**
   * Remove a location from the list
   *
   * @param {String} locationId
   */
  UserLocations.prototype.setPreferredLocationById = function(locationId) {
    var location;
    var locations;
    var locationIndex;
    var noOfLocations;
    locations = this.getLocations();
    noOfLocations = locations.length;
    for (locationIndex = 0; locationIndex < noOfLocations; locationIndex++) {
      if (locationId === locations[locationIndex].id) {
        location = locations[locationIndex];
      }
    }

    // @todo push the previous preferred location to the top
    // of recents ???

    if (location) {
      this.preferredLocation.set(location);
      this.render();
    }
  };

  /**
   * Remove a location from the list
   *
   * @param {String} locationId
   */
  UserLocations.prototype.removeLocationById = function(locationId) {
    this.recentLocations.remove(locationId);

    // @todo what happens if the removed location is also the
    // preferred location ???

    this.render();
  };

  /**
   * Render a list of locations
   */
  UserLocations.prototype.render = function() {
    var html = '';
    var locations;
    var location;
    var noOfLocations;
    var locationIndex;
    var label;

    // @todo render the prefer link
    // @todo render the active prefer link

    locations = this.getLocations();
    noOfLocations = locations.length;
    if (0 < noOfLocations) {
      html = '<ul>';
      for (locationIndex = 0; locationIndex < noOfLocations; locationIndex++) {
        location = locations[locationIndex];
        label = location.name;
        if (location.container) {
          label += ', ' + location.container;
        }
        html += '<li><a href="?locationId=' + location.id + '">' +
          label +
          '<span class="ls-ui-user_locations-remove">remove</span>' +
          '</a></li>';
      }
      html += '</ul>';
    }
    this.element.html(html);
  };

  /**
   * Get a list of up to 5 user locations. Can include both a
   * preferred location and recents.
   *
   * @return {Array} The array of 0 to 5 locations
   */
  UserLocations.prototype.getLocations = function() {
    var locations = [];
    var noOfLocationsRemaining = 5;
    var preferredLocation;
    var recentLocations;
    var noOfRecentLocations;
    var recentLocation;
    var recentLocationIndex;

    if (this.preferredLocation.isSet()) {
      noOfLocationsRemaining--;
      preferredLocation = this.preferredLocation.get();
      locations.push(preferredLocation);
    }

    if (this.recentLocations.isSupported()) {
      recentLocations = this.recentLocations.all();
      noOfRecentLocations = recentLocations.length;
      if (0 < noOfRecentLocations) {
        for (recentLocationIndex = 0; recentLocationIndex < noOfRecentLocations; recentLocationIndex++) {
          recentLocation = recentLocations[recentLocationIndex];
          if (0 < noOfLocationsRemaining &&
            (
              !preferredLocation ||
              (preferredLocation && preferredLocation.id !== recentLocation.id)
            )
          ) {
            noOfLocationsRemaining--;
            locations.push(recentLocation);
          }
          if (0 === noOfLocationsRemaining) {
            break;
          }
        }
      }
    }

    return locations;
  };

  return UserLocations;

});
