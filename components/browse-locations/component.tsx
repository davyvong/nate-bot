'use client';

import DeleteIconSVG from 'assets/images/icons/delete.svg';
import PinIconSVG from 'assets/images/icons/pin.svg';
import classNames from 'classnames';
import Tooltip from 'components/tooltip';
import { FC, Fragment, useCallback, useMemo, useState } from 'react';
import { MDBLocationData } from 'server/models/locations';
import useSWR from 'swr';

import styles from './component.module.css';

const BrowseLocations: FC = () => {
  const [query, setQuery] = useState<string>('');

  const fetchLocations = useCallback(async () => {
    if (!query) {
      return [];
    }
    try {
      const response = await fetch('/api/weather/search?query=' + query, {
        cache: 'no-store',
        method: 'GET',
      });
      return response.json();
    } catch (error: unknown) {
      return [];
    }
  }, [query]);

  const { data: searchResultsData } = useSWR('/api/weather/search?query=' + query, fetchLocations);

  const searchResults = useMemo<MDBLocationData[]>(() => searchResultsData || [], [searchResultsData]);

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

  const savedLocationsMap = useMemo<Map<string, MDBLocationData>>(() => {
    const map = new Map<string, MDBLocationData>();
    for (const savedLocation of savedLocations) {
      map.set(createLocationKey(savedLocation), savedLocation);
    }
    return map;
  }, [createLocationKey, savedLocations]);

  const saveLocation = useCallback(
    async (location: MDBLocationData): Promise<void> => {
      try {
        const response = await fetch('/api/locations', {
          body: JSON.stringify(location),
          cache: 'no-store',
          method: 'POST',
        });
        const responseJson = await response.json();
        mutate(responseJson);
      } catch (error: unknown) {
        console.log(error);
      }
    },
    [mutate],
  );

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
      const isSaved = savedLocationsMap.has(key);
      const name = [location.city, location.state, location.country].filter(Boolean).join(', ');
      return (
        <div className={styles.location} key={key}>
          <div className={styles.info}>
            <div className={styles.name}>{name}</div>
            <div className={styles.coordinates}>
              {location.latitude}, {location.longitude}
            </div>
          </div>
          {isSaved ? (
            <Tooltip renderContent={() => 'Delete'}>
              <button
                className={classNames(styles.ctaButton, styles.ctaButtonDelete)}
                onClick={() => deleteLocation(savedLocationsMap.get(key) as MDBLocationData)}
              >
                <DeleteIconSVG />
              </button>
            </Tooltip>
          ) : (
            <Tooltip renderContent={() => 'Save'}>
              <button className={styles.ctaButton} onClick={() => saveLocation(location)}>
                <PinIconSVG />
              </button>
            </Tooltip>
          )}
        </div>
      );
    },
    [createLocationKey, deleteLocation, saveLocation, savedLocationsMap],
  );

  return (
    <Fragment>
      <input
        className={styles.searchInput}
        onChange={event => setQuery(event.target.value)}
        placeholder="Toronto, Ontario, Canada"
        value={query}
      />
      {searchResults.map(renderLocationCard)}
    </Fragment>
  );
};

export default BrowseLocations;
