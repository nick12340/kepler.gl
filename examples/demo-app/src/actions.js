// Copyright (c) 2018 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import {push} from 'react-router-redux';
import {text as requestText, json as requestJson} from 'd3-request';

import {toggleModal} from 'kepler.gl/actions';

import {MAP_CONFIG_URL} from './constants/sample-maps';
// import {getAppUrlPrefix} from './constants/default-settings';

// CONSTANTS
export const INIT = 'INIT';
export const SET_LOADING_METHOD = 'SET_LOADING_METHOD';
export const LOAD_REMOTE_FILE_DATA_SUCCESS = 'LOAD_DATA_SUCCESS';
export const LOAD_MAP_SAMPLE_FILE = 'LOAD_MAP_SAMPLE_FILE';

// ACTIONS
export function setLoadingMethod(method) {
  return {
    type: SET_LOADING_METHOD,
    method
  };
}

export function loadResponseFromRemoteFile(response, config, map) {
  return {
    type: LOAD_REMOTE_FILE_DATA_SUCCESS,
    response,
    config,
    map
  };
}

export function laodMapSampleFile(samples) {
  return {
    type: LOAD_MAP_SAMPLE_FILE,
    samples
  };
}

export function loadSampleMap(sample) {
  return (dispatch) => {
    // const prefix = getAppUrlPrefix();
    // const appendPrefix = prefix !== '' ? `/${getAppUrlPrefix()}/` : '/';
    dispatch(push(`/demo/${sample.id}`));
    dispatch(loadRemoteMap(sample));
    dispatch(toggleModal(null));
  };
}

function loadRemoteMap(sample) {
  return (dispatch) => {
    requestJson(sample.configUrl, (confError, config) => {
      if (confError) {
        console.warn(`Error loading config file ${sample.configUrl}`);
        // dispatch(error)
        return;
      }
      requestText(sample.dataUrl, (dataError, result) => {
        if (dataError) {
          console.warn(`Error loading datafile ${sample.dataUrl}`);
          // dispatch(ERROR)
        } else {
          dispatch(loadResponseFromRemoteFile(result, config, sample));
        }
      });
    })
  }
}

/**
 *
 * @param sampleMapId optional if we pass the sampleMapId, after fetching
 * map sample configurations we are going to load the actual map data if it exists
 * @returns {function(*)}
 */
export function loadSampleConfigurations(sampleMapId = null) {
  return (dispatch) => {
    requestJson(MAP_CONFIG_URL, (error, samples) => {
      if (error) {
        console.warn(`Error loading sample configuration file ${MAP_CONFIG_URL}`);
        // dispatch(ERROR)
      } else {
        dispatch(laodMapSampleFile(samples));
        // Load the specified map
        if (sampleMapId) {
          const map = samples.find(s => s.id === sampleMapId);
          if (map) {
            dispatch(loadRemoteMap(map));
            dispatch(toggleModal(null));
          }
        }
      }
    });
  }
}