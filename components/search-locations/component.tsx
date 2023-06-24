'use client';

import { FC, Fragment, useCallback, useMemo, useState } from 'react';
import { MDBLocationData } from 'server/models/locations';
import useSWR from 'swr';

import styles from './component.module.css';

const SearchLocations: FC = () => {
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

  const saveLocation = useCallback(async (location: MDBLocationData): Promise<MDBLocationData[]> => {
    try {
      const response = await fetch('/api/locations', {
        body: JSON.stringify(location),
        cache: 'no-store',
        method: 'POST',
      });
      return response.json();
    } catch (error: unknown) {
      return [];
    }
  }, []);

  const deleteLocation = useCallback(async (location: MDBLocationData): Promise<MDBLocationData[]> => {
    try {
      const response = await fetch('/api/locations?id=' + location.id, {
        cache: 'no-store',
        method: 'DELETE',
      });
      return response.json();
    } catch (error: unknown) {
      return [];
    }
  }, []);

  const renderLocationCard = useCallback(
    (result: MDBLocationData): JSX.Element => {
      const key = createLocationKey(result);
      const isSaved = savedLocationsMap.has(key);
      const location = [result.city, result.state, result.country].filter(Boolean).join(', ');
      return (
        <div className={styles.result} key={key}>
          <div className={styles.info}>
            <div className={styles.location}>{location}</div>
            <div className={styles.coordinates}>
              {result.latitude}, {result.longitude}
            </div>
          </div>
          {isSaved ? (
            <button
              onClick={async () => {
                const savedResult = savedLocationsMap.get(key) as MDBLocationData;
                const updatedSavedLocations = await deleteLocation(savedResult);
                mutate(updatedSavedLocations);
              }}
            >
              Delete
            </button>
          ) : (
            <button
              onClick={async () => {
                const updatedSavedLocations = await saveLocation(result);
                mutate(updatedSavedLocations);
              }}
            >
              Save
            </button>
          )}
        </div>
      );
    },
    [createLocationKey, deleteLocation, mutate, saveLocation, savedLocationsMap],
  );

  return (
    <Fragment>
      {savedLocations.map(renderLocationCard)}
      <div className={styles.header}>Search</div>
      <input onChange={event => setQuery(event.target.value)} placeholder="Toronto, Ontario, Canada" value={query} />
      {searchResults.map(renderLocationCard)}
    </Fragment>
  );
};

export default SearchLocations;
