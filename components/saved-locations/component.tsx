'use client';

import DeleteIconSVG from 'assets/images/icons/delete.svg';
import classNames from 'classnames';
import browseLocationsStyles from 'components/browse-locations/component.module.css';
import { FC, Fragment, useCallback, useMemo } from 'react';
import { MDBLocationData } from 'server/models/locations';
import useSWR from 'swr';

const SavedLocations: FC = () => {
  const createLocationKey = useCallback((location: MDBLocationData): string => {
    return location.city + location.latitude.toString() + location.longitude.toString();
  }, []);

  const fetchSavedLocations = useCallback(async () => {
    try {
      const response = await fetch('/api/locations', {
        cache: 'no-store',
        method: 'GET',
      });
      return response.json();
    } catch (error: unknown) {
      return [];
    }
  }, []);

  const { data: savedLocationsData, mutate } = useSWR('/api/locations', fetchSavedLocations);

  const savedLocations = useMemo<MDBLocationData[]>(() => savedLocationsData || [], [savedLocationsData]);

  const deleteLocation = useCallback(
    async (location: MDBLocationData): Promise<void> => {
      try {
        const response = await fetch('/api/locations?id=' + location.id, {
          cache: 'no-store',
          method: 'DELETE',
        });
        const responseJson = await response.json();
        mutate(responseJson);
      } catch (error: unknown) {
        console.log(error);
      }
    },
    [mutate],
  );

  const renderLocationCard = useCallback(
    (location: MDBLocationData): JSX.Element => {
      const key = createLocationKey(location);
      const name = [location.city, location.state, location.country].filter(Boolean).join(', ');
      return (
        <div className={browseLocationsStyles.location} key={key}>
          <div className={browseLocationsStyles.info}>
            <div className={browseLocationsStyles.name}>{name}</div>
            <div className={browseLocationsStyles.coordinates}>
              {location.latitude}, {location.longitude}
            </div>
          </div>
          <button
            className={classNames(browseLocationsStyles.ctaButton, browseLocationsStyles.ctaButtonDelete)}
            onClick={() => deleteLocation(location)}
          >
            <DeleteIconSVG />
          </button>
        </div>
      );
    },
    [createLocationKey, deleteLocation],
  );

  return <Fragment>{savedLocations.map(renderLocationCard)}</Fragment>;
};

export default SavedLocations;
